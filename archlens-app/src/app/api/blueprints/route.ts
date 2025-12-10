import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/analysisService';
import { BlueprintType, BlueprintComplexity, BlueprintCategory } from '@/types/blueprint';
import { BlueprintQuery, BlueprintResponse } from '@/types/blueprint';
import { getEmbeddingService } from '@/services/embeddingService';
import { blueprintAnalysisService } from '@/services/blueprintAnalysisService';
import { createLLMClientFromEnv } from '@/lib/llm-factory';
import { smartOptimizeImage } from '@/services/imageOptimizer';
import Blueprint from '@/models/Blueprint';
import BlueprintAnalysis from '@/models/BlueprintAnalysis';

// No mock data - all data comes from MongoDB

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    
    const query: BlueprintQuery = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      search: searchParams.get('search') || undefined,
      type: searchParams.get('type') as BlueprintType || undefined,
      category: searchParams.get('category') as BlueprintCategory || undefined,
      cloudProvider: searchParams.get('cloudProvider') || undefined,
      complexity: searchParams.get('complexity') as BlueprintComplexity || undefined,
      isPublic: searchParams.get('isPublic') === 'true' ? true : undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      sortBy: (searchParams.get('sortBy') as 'name' | 'createdAt' | 'downloadCount' | 'rating') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    };

    // Fetch blueprints from MongoDB only
    let filteredBlueprints;
    try {
      const dbBlueprints = await Blueprint.find({}).lean();
      console.log(`📊 Found ${dbBlueprints.length} blueprints in MongoDB`);
      filteredBlueprints = dbBlueprints;
    } catch (dbError) {
      console.error('Failed to fetch blueprints from MongoDB:', dbError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch blueprints from database',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filteredBlueprints = filteredBlueprints.filter(blueprint =>
        blueprint.name.toLowerCase().includes(searchLower) ||
        blueprint.description.toLowerCase().includes(searchLower) ||
        blueprint.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (query.type) {
      filteredBlueprints = filteredBlueprints.filter(blueprint => blueprint.type === query.type);
    }

    if (query.category) {
      filteredBlueprints = filteredBlueprints.filter(blueprint => blueprint.category === query.category);
    }

    if (query.cloudProvider) {
      filteredBlueprints = filteredBlueprints.filter(blueprint => 
        blueprint.cloudProviders.includes(query.cloudProvider!)
      );
    }

    if (query.complexity) {
      filteredBlueprints = filteredBlueprints.filter(blueprint => blueprint.complexity === query.complexity);
    }

    if (query.isPublic !== undefined) {
      filteredBlueprints = filteredBlueprints.filter(blueprint => blueprint.isPublic === query.isPublic);
    }

    if (query.tags && query.tags.length > 0) {
      filteredBlueprints = filteredBlueprints.filter(blueprint =>
        query.tags!.some(tag => blueprint.tags.includes(tag))
      );
    }

    // Sort blueprints
    if (query.sortBy) {
      filteredBlueprints.sort((a, b) => {
        let aValue: string | number | Date = a[query.sortBy as keyof typeof a] as string | number | Date;
        let bValue: string | number | Date = b[query.sortBy as keyof typeof b] as string | number | Date;

        if (query.sortBy === 'createdAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (query.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    // Pagination
    const totalCount = filteredBlueprints.length;
    const totalPages = Math.ceil(totalCount / query.limit!);
    const skip = (query.page! - 1) * query.limit!;
    const paginatedBlueprints = filteredBlueprints.slice(skip, skip + query.limit!);

    const response: BlueprintResponse = {
      blueprints: paginatedBlueprints as Blueprint[],
      pagination: {
        page: query.page!,
        limit: query.limit!,
        totalCount,
        totalPages,
        hasNextPage: query.page! < totalPages,
        hasPrevPage: query.page! > 1
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Blueprints API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch blueprints',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    await connectToDatabase();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as BlueprintType;
    const category = formData.get('category') as BlueprintCategory;
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const isPublic = formData.get('isPublic') === 'true';
    const complexity = formData.get('complexity') as BlueprintComplexity;
    const cloudProviders = JSON.parse(formData.get('cloudProviders') as string || '[]');
    const estimatedCost = formData.get('estimatedCost') ? parseInt(formData.get('estimatedCost') as string) : undefined;
    const deploymentTime = formData.get('deploymentTime') as string;

    if (!file || !name || !description || !type || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create LLM client for component extraction
    const llmClient = createLLMClientFromEnv();
    if (!llmClient) {
      return NextResponse.json({ error: 'No LLM provider configured' }, { status: 500 });
    }

    // STEP 1: Extract components and detect providers from blueprint file
    console.log('📋 Step 1: Extracting components and detecting providers from blueprint file...');
    
    let fileContent: string;
    let fileType: 'image' | 'iac' | 'text';
    let optimizationInfo: {
      original_size_kb: number;
      optimized_size_kb: number;
      compression_ratio: number;
      dimensions?: [number, number];
      fallback_used?: boolean;
    } | null = null;
    
    let originalFileData: string | null = null; // Store original for database
    
    if (file.type.startsWith('image/')) {
      const fileBuffer = await file.arrayBuffer();
      const originalBase64 = Buffer.from(fileBuffer).toString('base64');
      const originalSizeKB = Math.round(fileBuffer.byteLength / 1024);
      
      // Store original image for database (for viewing/downloading later)
      originalFileData = originalBase64;
      
      console.log(`🖼️ Original image size: ${originalSizeKB}KB`);
      console.log(`💾 Storing original image for later viewing/download`);
      
      // Create optimized/scaled-down version for LLM processing (saves tokens and improves speed)
      const optimizationResult = await smartOptimizeImage(originalBase64, {
        quality: originalSizeKB > 1000 ? 50 : 70,
        maxWidth: 1024, // Increased from 512 for better LLM analysis while still being efficient
        maxHeight: 1024
      });
      
      if (optimizationResult.success && optimizationResult.optimized_base64) {
        // Use optimized version for LLM processing
        fileContent = `Base64 Image Data: ${optimizationResult.optimized_base64}`;
        optimizationInfo = {
          original_size_kb: originalSizeKB,
          optimized_size_kb: Math.round((optimizationResult.optimized_size_bytes || 0) / 1024),
          compression_ratio: optimizationResult.compression_ratio_percent || 0,
          dimensions: optimizationResult.optimized_dimensions
        };
        console.log(`✅ Image optimized for LLM: ${optimizationInfo.compression_ratio}% compression`);
        console.log(`📊 Using optimized image (${optimizationInfo.optimized_size_kb}KB) for analysis, original (${originalSizeKB}KB) stored for viewing`);
      } else {
        // Fallback to original if optimization fails (but still store original separately)
        console.warn('⚠️ Image optimization failed, using original for LLM');
        fileContent = `Base64 Image Data: ${originalBase64}`;
        optimizationInfo = {
          original_size_kb: originalSizeKB,
          optimized_size_kb: originalSizeKB,
          compression_ratio: 0,
          fallback_used: true
        };
      }
      fileType = 'image';
    } else {
      const fileText = await file.text();
      fileContent = fileText;
      fileType = fileContent.includes('resource') || fileContent.includes('provider') || 
                 fileContent.includes('apiVersion') || fileContent.includes('kind') ? 'iac' : 'text';
      
      // Store original file data for database
      originalFileData = Buffer.from(fileText).toString('base64');
    }

    // Extract components and detect providers using LLM
    const extractionPrompt = `You are an expert cloud architect. Analyze this ${fileType === 'image' ? 'blueprint architecture diagram' : 'infrastructure code blueprint'} and extract ALL architectural components, connections, and metadata with 100% accuracy.

${fileType === 'image' ? 
  'This is a base64-encoded architecture blueprint diagram. Analyze the visual components, connections, and labels to understand the cloud architecture. CRITICAL: Prioritize component LABELS and TEXT over icons/images. Only use visual icons as a secondary reference if labels are unclear.' :
  'This is infrastructure code blueprint. Parse all resources, services, and their configurations to understand the complete architecture. Identify cloud providers from resource types, service names, and provider configurations.'
}

CRITICAL: Return ONLY valid JSON with proper array structures. Do NOT stringify arrays or use newlines in JSON values.

CLOUD PROVIDER DETECTION RULES - FOLLOW THESE STRICTLY:

1. PRIMARY SOURCE: Component labels, text annotations, and explicit naming
   - ALWAYS check the label/text first before considering any visual elements
   - Look for explicit service names, provider names, or resource identifiers in text
   - Icons/images should ONLY be used as a last resort if no text/label is available

2. STRICT EVIDENCE REQUIREMENT - NO ASSUMPTIONS:
   - ONLY assign a cloud provider if you find EXPLICIT, UNAMBIGUOUS evidence in labels/text
   - REQUIRED: Component label MUST contain explicit provider name (AWS, Azure, GCP) or specific service name (EC2, S3, App Service, etc.)
   - FORBIDDEN: Do NOT assign cloud provider based on:
     * Generic icons or shapes (server icon, database icon, etc.)
     * Generic terms like "Server", "Database", "Load Balancer" without provider context
     * Visual patterns that could be from any provider
     * Assumptions or guesses
   - If evidence is insufficient or ambiguous, you MUST:
     * Set cloudProvider to null or "on-premises"
     * Set deployedEnvironment to "ONPREM" or "UNKNOWN"
     * Set detectionConfidence to "low"
   - When in doubt, ALWAYS default to "on-premises" - NEVER assume a public cloud provider

3. PROVIDER TYPE DETECTION:
   - "public-cloud": AWS, Azure, GCP, or other public cloud services (only if explicitly named)
   - "private-cloud": Private cloud infrastructure (OpenStack, VMware Cloud, etc. - only if explicitly named)
   - "on-premises": Traditional on-premises infrastructure, self-hosted, or when no cloud provider is identified
   - If no clear indication exists, default to "on-premises"

4. DETECTION PRIORITY ORDER:
   a) Component label/text with explicit provider/service name (HIGHEST PRIORITY)
   b) Resource type or configuration indicating provider
   c) Context clues from surrounding components
   d) Visual icons/images (LOWEST PRIORITY - only if no text available)

ENHANCED CLOUD PROVIDER DETECTION - Look for these specific indicators in LABELS and TEXT:

AWS Services & Patterns:
- Compute: EC2, Lambda, ECS, EKS, Fargate, Batch, Lightsail, Auto Scaling
- Storage: S3, EBS, EFS, FSx, Glacier, Storage Gateway
- Database: RDS, DynamoDB, ElastiCache, Redshift, Neptune, DocumentDB, Timestream
- Networking: VPC, CloudFront, Route53, API Gateway, ELB, ALB, NLB, Direct Connect, Transit Gateway
- Security: IAM, KMS, Secrets Manager, Certificate Manager, WAF, Shield, GuardDuty
- Patterns: aws-*, amazon-*, *.amazonaws.com, arn:aws:*

Azure Services & Patterns:
- Compute: Virtual Machines, App Service, Functions, Container Instances, AKS, Batch, Service Fabric
- Storage: Blob Storage, File Storage, Queue Storage, Table Storage, Disk Storage, Archive Storage
- Database: SQL Database, Cosmos DB, Database for MySQL/PostgreSQL, Redis Cache, Synapse Analytics
- Networking: Virtual Network, Load Balancer, Application Gateway, CDN, DNS, ExpressRoute, VPN Gateway
- Security: Azure AD, Key Vault, Security Center, Sentinel, DDoS Protection, WAF
- Patterns: azure-*, microsoft-*, *.azure.com, *.windows.net, /subscriptions/

GCP Services & Patterns:
- Compute: Compute Engine, App Engine, Cloud Functions, GKE, Cloud Run, Batch, Preemptible VMs
- Storage: Cloud Storage, Persistent Disk, Filestore, Cloud SQL, Spanner, Firestore, Bigtable
- Networking: VPC, Cloud Load Balancing, Cloud CDN, Cloud DNS, Cloud Interconnect, Cloud NAT
- Security: Cloud IAM, Secret Manager, Security Command Center, Cloud Armor, Identity Platform
- Patterns: gcp-*, google-*, *.googleapis.com, *.gcp.com, projects/

Kubernetes & Container Platforms:
- Managed Services: EKS (AWS), AKS (Azure), GKE (GCP), OpenShift, Rancher
- Resources: Pods, Services, Deployments, ConfigMaps, Secrets, Ingress, PersistentVolumes
- Patterns: apiVersion: v1, kind: Pod/Service/Deployment, kubernetes.io/, k8s.io/

CRITICAL DETECTION RULES - FOLLOW IN ORDER:
1. FIRST: Examine component LABELS and TEXT for explicit cloud provider/service names
2. SECOND: Check for provider-specific naming conventions in text (e.g., "AWS S3", "Azure App Service")
3. THIRD: Look for resource types or configuration patterns in text/code
4. LAST RESORT: Only if no text/label exists, consider visual icons (with low confidence)
5. DEFAULT: If no clear cloud provider is found in text/labels, mark as "on-premises"
6. NEVER assume a cloud provider based solely on generic shapes or icons
7. For each component, explicitly state your confidence level:
   - HIGH: Explicit provider name in label/text
   - MEDIUM: Strong indicators in text (service names, resource types)
   - LOW: Only visual indicators (use sparingly)
   - DEFAULT: No indicators found → mark as "on-premises"

COMPONENT CLASSIFICATION RULES - STRICT EVIDENCE REQUIRED:

ONLY classify if label/text contains EXPLICIT provider/service names:

✅ HIGH CONFIDENCE (Explicit provider/service name in label):
- Label contains "AWS", "Amazon", "EC2", "S3", "Lambda", "RDS", "VPC", "CloudFront", etc.
  → cloudProvider: "aws", deployedEnvironment: "AWS", providerType: "public-cloud", detectionConfidence: "high"

- Label contains "Azure", "Microsoft", "App Service", "Blob Storage", "SQL Database", "Virtual Network", etc.
  → cloudProvider: "azure", deployedEnvironment: "AZURE", providerType: "public-cloud", detectionConfidence: "high"

- Label contains "GCP", "Google Cloud", "Compute Engine", "Cloud Storage", "Cloud SQL", "BigQuery", etc.
  → cloudProvider: "gcp", deployedEnvironment: "GCP", providerType: "public-cloud", detectionConfidence: "high"

- Label contains "Kubernetes", "K8s", "EKS", "AKS", "GKE", "OpenShift"
  → cloudProvider: "kubernetes", deployedEnvironment: "KUBERNETES", providerType: "public-cloud" or "private-cloud", detectionConfidence: "high"

- Label contains "OCP", "OpenShift Container Platform"
  → deployedEnvironment: "OCP", providerType: "private-cloud", detectionConfidence: "high"

- Label contains "VMware", "OpenStack", "Private Cloud"
  → deployedEnvironment: "PRIVATE", providerType: "private-cloud", detectionConfidence: "high"

❌ DO NOT CLASSIFY (Insufficient evidence):
- Generic terms: "Server", "Database", "Load Balancer", "API Gateway" (without provider name)
- Generic icons: Server icon, database icon, network icon (without text labels)
- Ambiguous terms: "Cloud", "Storage", "Compute" (without provider context)
- If label is unclear or missing → deployedEnvironment: "ONPREM" or "UNKNOWN", cloudProvider: "on-premises", detectionConfidence: "low"

TERRAFORM CATEGORY CLASSIFICATION:
Each component MUST be classified into one of these standard Terraform categories:

1. "Foundational Services / Landing Zones" - Landing zones, account structures, organizational units
2. "Foundational Services / Networking" - VPCs, subnets, load balancers, CDN, DNS, VPN, peering, gateways
3. "Foundational Services / Storage" - Object storage, file storage, block storage, backup storage
4. "Identity & Access Management" - IAM roles, policies, users, groups, authentication, authorization, SSO
5. "Policy" - Resource policies, compliance policies, governance, guardrails, service control policies
6. "Observability" - Monitoring, logging, alerting, dashboards, metrics, tracing, APM tools
7. "Data Protection" - Encryption, key management, secrets management, backup, disaster recovery, data loss prevention
8. "Platform Services / Compute" - Virtual machines, containers, serverless functions, auto-scaling, compute instances
9. "Platform Services / Middleware Integration" - Message queues, event buses, API gateways, service mesh, integration platforms
10. "Platform Services / Database" - Relational databases, NoSQL databases, data warehouses, in-memory databases
11. "Platform Services / Analytics AI-ML" - Data analytics, machine learning, AI services, data processing, BI tools
12. "Platform Services / Miscellaneous" - Other platform services not fitting above categories

Return ONLY valid JSON without any prefix or suffix:

{
  "metadata": {
    "architectureType": "microservices|monolith|serverless|hybrid|multi-cloud",
    "cloudProviders": ["aws", "azure", "gcp", "on-premises", "kubernetes"],
    "hybridCloudModel": "single-cloud|multi-cloud|hybrid-cloud|on-premises-only",
    "primaryCloudProvider": "aws|azure|gcp|on-premises|multi-cloud",
    "estimatedComplexity": "low|medium|high",
    "primaryPurpose": "web application|api|data processing|ml-ai|iot|other",
    "environmentType": "development|staging|production",
    "deploymentModel": "public-cloud|private-cloud|hybrid-cloud|multi-cloud|edge-computing"
  },
  "components": [
    {
      "id": "component1",
      "name": "Web Application",
      "type": "compute",
      "terraformCategory": "Platform Services / Compute",
      "cloudProvider": "azure",
      "cloudService": "Azure App Service",
      "providerType": "public-cloud",
      "deployedEnvironment": "AZURE",
      "cloudRegion": "East US",
      "detectionConfidence": "high",
      "description": "Hosts the main web application"
    }
  ],
  "connections": [
    {
      "id": "connection1",
      "source": "component1",
      "target": "component2",
      "type": "api_call",
      "protocol": "http",
      "port": 80,
      "description": "API calls from web application to API Gateway"
    }
  ],
  "summary": "Comprehensive description of the complete blueprint architecture"
}

IMPORTANT: 
- components must be an array of objects, not a string
- connections must be an array of objects, not a string  
- Use proper JSON format with double quotes
- Do not include newlines or escaped characters in JSON values

File: ${file.name}
Content: ${fileContent}`;

    console.log('🔍 Extracting components from blueprint file...');
    const extractionResponse = await llmClient.callLLM(extractionPrompt);
    
    // Parse extraction response
    const extractionMatch = extractionResponse.match(/\{[\s\S]*\}/);
    if (!extractionMatch) {
      console.warn('⚠️ Failed to extract components from blueprint, using defaults');
    }
    
    let extractedData: {
      metadata?: {
        architectureType?: string;
        cloudProviders?: string[];
        hybridCloudModel?: string;
        primaryCloudProvider?: string;
        estimatedComplexity?: string;
        primaryPurpose?: string;
        environmentType?: string;
        deploymentModel?: string;
      };
      components?: any[];
      connections?: any[];
      summary?: string;
    } = {
      metadata: {},
      components: [],
      connections: [],
      summary: description
    };

    if (extractionMatch) {
      try {
        const rawExtractedData = JSON.parse(extractionMatch[0]);
        extractedData = {
          metadata: rawExtractedData.metadata || {},
          components: Array.isArray(rawExtractedData.components) ? rawExtractedData.components : [],
          connections: Array.isArray(rawExtractedData.connections) ? rawExtractedData.connections : [],
          summary: rawExtractedData.summary || description
        };
        console.log(`✅ Extracted ${extractedData.components?.length || 0} components and ${extractedData.connections?.length || 0} connections`);
      } catch (parseError) {
        console.warn('⚠️ Failed to parse extraction response, using defaults:', parseError);
      }
    }

    // Trust LLM results - only ensure required fields exist and collect providers for metadata
    const detectedProviders = new Set<string>(cloudProviders || []);
    if (extractedData.metadata?.cloudProviders) {
      extractedData.metadata.cloudProviders.forEach((p: string) => detectedProviders.add(p));
    }
    
    // Trust the LLM's classification - it follows strict prompts
    // Only ensure required fields have defaults if missing
    extractedData.components?.forEach((component: any) => {
      // Ensure deployedEnvironment exists (LLM should set this, but provide fallback)
      if (!component.deployedEnvironment) {
        if (component.cloudProvider === 'aws') {
          component.deployedEnvironment = 'AWS';
        } else if (component.cloudProvider === 'azure') {
          component.deployedEnvironment = 'AZURE';
        } else if (component.cloudProvider === 'gcp') {
          component.deployedEnvironment = 'GCP';
        } else if (component.cloudProvider === 'kubernetes') {
          component.deployedEnvironment = 'KUBERNETES';
        } else {
          component.deployedEnvironment = component.cloudProvider === 'on-premises' ? 'ONPREM' : 'UNKNOWN';
        }
      }
      
      // Ensure providerType exists (LLM should set this, but provide fallback)
      if (!component.providerType) {
        if (['aws', 'azure', 'gcp'].includes(String(component.cloudProvider || ''))) {
          component.providerType = 'public-cloud';
        } else if (component.cloudProvider === 'kubernetes') {
          component.providerType = 'private-cloud'; // Default, LLM can override if EKS/AKS/GKE
        } else {
          component.providerType = 'on-premises';
        }
      }
      
      // Ensure detectionConfidence exists (LLM should set this, but provide fallback)
      if (!component.detectionConfidence) {
        component.detectionConfidence = component.cloudProvider && component.cloudProvider !== 'on-premises' ? 'medium' : 'low';
      }
      
      // Ensure cloudProvider has a value
      if (!component.cloudProvider) {
        component.cloudProvider = 'on-premises';
      }
      
      // Collect providers for metadata (trust LLM's classification)
      if (component.cloudProvider && component.cloudProvider !== 'on-premises') {
        detectedProviders.add(String(component.cloudProvider));
      }
    });

    const finalCloudProviders = Array.from(detectedProviders);
    if (finalCloudProviders.length > 0) {
      console.log(`✅ Detected cloud providers: ${finalCloudProviders.join(', ')}`);
    }

    // Save the file to cloud storage (AWS S3, Azure Blob, etc.)
    // For now, we'll simulate file storage
    const fileUrl = `/uploads/blueprints/${Date.now()}-${file.name}`;
    
    // Store metadata in MongoDB with extracted data
    const newBlueprint = {
      id: Date.now().toString(),
      name,
      description: extractedData.summary || description,
      type,
      category,
      tags,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl, // Store the file URL
      // Store original file data for viewing/downloading
      originalFile: originalFileData ? {
        name: file.name,
        size: file.size,
        type: file.type,
        data: originalFileData,
        mimeType: file.type
      } : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Current User', // This would come from auth context
      isPublic,
      downloadCount: 0,
      rating: 0,
      version: '1.0.0',
      cloudProviders: finalCloudProviders.length > 0 ? finalCloudProviders : cloudProviders,
      complexity: extractedData.metadata?.estimatedComplexity || complexity,
      metadata: {
        components: extractedData.components?.length || 0,
        connections: extractedData.connections?.length || 0,
        estimatedCost: estimatedCost || 0,
        deploymentTime: deploymentTime || 'Unknown',
        architectureType: extractedData.metadata?.architectureType,
        hybridCloudModel: extractedData.metadata?.hybridCloudModel,
        primaryCloudProvider: extractedData.metadata?.primaryCloudProvider,
        primaryPurpose: extractedData.metadata?.primaryPurpose,
        environmentType: extractedData.metadata?.environmentType,
        deploymentModel: extractedData.metadata?.deploymentModel,
        // Store extracted components and connections for reference
        extractedComponents: extractedData.components || [],
        extractedConnections: extractedData.connections || [],
        // Image optimization info if applicable
        ...(optimizationInfo && { imageOptimization: optimizationInfo })
      },
      // Embedding-related fields
      embeddingId: undefined as string | undefined,
      hasEmbedding: false,
      embeddingGeneratedAt: undefined as Date | undefined,
      // Analysis-related fields
      hasAnalysis: false,
      lastAnalysisId: undefined as string | undefined,
      lastAnalysisDate: undefined as Date | undefined,
      analysisScores: undefined as {
        security: number;
        resiliency: number;
        costEfficiency: number;
        compliance: number;
        scalability: number;
        maintainability: number;
      } | undefined,
      componentCount: extractedData.components?.length || 0,
      architecturePatterns: undefined as string[] | undefined,
      technologyStack: undefined as string[] | undefined
    };

    // Store metadata in MongoDB
    let savedBlueprint;
    try {
      savedBlueprint = await Blueprint.create(newBlueprint);
      console.log(`✅ Blueprint metadata stored in MongoDB: ${savedBlueprint._id}`);
      // Update the blueprint with the MongoDB _id for consistency
      (newBlueprint as any)._id = savedBlueprint._id;
    } catch (dbError) {
      console.error('Failed to store blueprint in MongoDB:', dbError);
      console.error('DB Error details:', dbError);
      return NextResponse.json(
        { 
          error: 'Failed to save blueprint to database',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // STEP 2: Generate and store blueprint embedding in Qdrant
    console.log(`📊 Step 2: Generating blueprint embedding from extracted content...`);
    try {
      const embeddingService = getEmbeddingService();
      console.log(`📊 Embedding service available: ${embeddingService.isAvailable()}`);
      
      if (embeddingService.isAvailable()) {
        console.log(`🔄 Generating embedding for blueprint: ${newBlueprint.name}`);
        console.log(`📝 Blueprint content includes: ${extractedData.components?.length || 0} components, ${extractedData.connections?.length || 0} connections`);
        
        // Create enriched blueprint content for embedding (includes extracted components)
        const enrichedBlueprint = {
          ...newBlueprint,
          extractedComponents: extractedData.components || [],
          extractedConnections: extractedData.connections || []
        };
        
        const embeddingResult = await embeddingService.processBlueprintEmbedding(enrichedBlueprint);
        console.log(`📊 Embedding result:`, embeddingResult);
        
        if (embeddingResult.success) {
          console.log(`✅ Blueprint embedding generated and stored in Qdrant: ${embeddingResult.vectorId}`);
          
          // Update the blueprint with embedding info
          newBlueprint.embeddingId = embeddingResult.vectorId;
          newBlueprint.hasEmbedding = true;
          newBlueprint.embeddingGeneratedAt = new Date();
          
          // Update in MongoDB
          await Blueprint.findOneAndUpdate(
            { id: newBlueprint.id },
            {
              embeddingId: embeddingResult.vectorId,
              hasEmbedding: true,
              embeddingGeneratedAt: new Date()
            }
          );
        } else {
          console.warn(`⚠️ Failed to generate blueprint embedding: ${embeddingResult.error}`);
          newBlueprint.hasEmbedding = false;
        }
      } else {
        console.warn('⚠️ Embedding service not available - blueprint uploaded without embedding');
        newBlueprint.hasEmbedding = false;
      }
    } catch (error) {
      console.error('❌ Failed to process blueprint embedding:', error);
      newBlueprint.hasEmbedding = false;
      // Don't fail the upload if embedding generation fails
    }

    // STEP 3: Perform automatic blueprint analysis with extracted components
    console.log(`📊 Step 3: Performing blueprint analysis with extracted components...`);
    try {
      const analysisResult = await blueprintAnalysisService.analyzeBlueprint(
        newBlueprint,
        extractedData.components,
        extractedData.connections
      );
      console.log(`✅ Blueprint analysis completed for: ${newBlueprint.name}`);
      console.log(`📊 Analysis scores:`, {
        security: analysisResult.scores.security,
        resiliency: analysisResult.scores.resiliency,
        costEfficiency: analysisResult.scores.costEfficiency,
        compliance: analysisResult.scores.compliance,
        scalability: analysisResult.scores.scalability,
        maintainability: analysisResult.scores.maintainability
      });
      
      // Save analysis to database
      const savedAnalysis = await BlueprintAnalysis.create(analysisResult);
      console.log(`✅ Blueprint analysis saved to database: ${savedAnalysis.analysisId}`);
      
      // Update blueprint with analysis metadata
      await Blueprint.findOneAndUpdate(
        { id: newBlueprint.id },
        {
          hasAnalysis: true,
          lastAnalysisId: analysisResult.analysisId,
          lastAnalysisDate: new Date(),
          analysisScores: analysisResult.scores,
          componentCount: analysisResult.components.length,
          architecturePatterns: analysisResult.architecturePatterns,
          technologyStack: analysisResult.technologyStack
        }
      );
      
      console.log(`✅ Blueprint analysis metadata updated in MongoDB`);
    } catch (analysisError) {
      console.error('❌ Failed to perform automatic blueprint analysis:', analysisError);
      console.error('Analysis error details:', analysisError);
      // Don't fail the upload if analysis fails
      newBlueprint.hasAnalysis = false;
    }

    // Calculate processing time
    const processingTime = Math.round((Date.now() - startTime) / 1000 * 100) / 100;

    // Return comprehensive response
    return NextResponse.json({
      ...newBlueprint,
      _id: savedBlueprint._id,
      extractedData: {
        components: extractedData.components || [],
        connections: extractedData.connections || [],
        metadata: extractedData.metadata || {}
      },
      processingTime,
      hasEmbedding: newBlueprint.hasEmbedding,
      hasAnalysis: newBlueprint.hasAnalysis
    }, { status: 201 });
  } catch (error) {
    console.error('Blueprint upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload blueprint',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
