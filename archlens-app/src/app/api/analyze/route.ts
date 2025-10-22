import { NextRequest, NextResponse } from 'next/server';
import { createLLMClientFromEnv } from '../../../../llm-factory';
import { saveAnalysis } from '../../../services/analysisService';
import { getChecklistItems } from '../../../services/checklistService';
import { ArchitectureAnalysis } from '../../../types/architecture';
import { LLMResponseData } from '../../../types/llm';
import { smartOptimizeImage } from '../../../services/imageOptimizer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const appId = formData.get('appId') as string;
    const componentName = formData.get('componentName') as string;
    const description = formData.get('description') as string;
    const environment = formData.get('environment') as string;
    const version = formData.get('version') as string;

    // Debug: Log the received form data
    console.log('📝 Received form data:');
    console.log('appId:', appId);
    console.log('componentName:', componentName);
    console.log('description:', description);
    console.log('environment:', environment);
    console.log('version:', version);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Create LLM client
    const llmClient = createLLMClientFromEnv();
    if (!llmClient) {
      return NextResponse.json({ error: 'No LLM provider configured' }, { status: 500 });
    }

    // STAGE 1: Extract architecture components from the file
    const startTime = Date.now();
    
    // Read and optimize file content for Stage 1 analysis
    let fileContent: string;
    let fileType: 'image' | 'iac' | 'text';
    let optimizationInfo: {
      original_size_kb: number;
      optimized_size_kb: number;
      compression_ratio: number;
      dimensions?: [number, number];
      fallback_used?: boolean;
    } | null = null;
    
    if (file.type.startsWith('image/')) {
      // For images, use compression-based optimization
      const fileBuffer = await file.arrayBuffer();
      const originalBase64 = Buffer.from(fileBuffer).toString('base64');
      const originalSizeKB = Math.round(fileBuffer.byteLength / 1024);
      
      console.log(`🖼️ Original image size: ${originalSizeKB}KB`);
      
      // Optimize image using Sharp (JavaScript)
      const optimizationResult = await smartOptimizeImage(originalBase64, {
        quality: originalSizeKB > 1000 ? 50 : 70, // Lower quality for larger images
        maxWidth: 512,
        maxHeight: 512
      });
      
      if (optimizationResult.success && optimizationResult.optimized_base64) {
        fileContent = `Base64 Image Data: ${optimizationResult.optimized_base64}`;
        optimizationInfo = {
          original_size_kb: originalSizeKB,
          optimized_size_kb: Math.round((optimizationResult.optimized_size_bytes || 0) / 1024),
          compression_ratio: optimizationResult.compression_ratio_percent || 0,
          dimensions: optimizationResult.optimized_dimensions
        };
        console.log(`✅ Image optimized: ${optimizationInfo.compression_ratio}% compression`);
      } else {
        // Fallback to original if optimization fails
        console.warn('⚠️ Image optimization failed, using original:', optimizationResult.error);
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
      // For text files (IAC, YAML, JSON, etc.), read f ull content
      fileContent = await file.text();
      fileType = fileContent.includes('resource') || fileContent.includes('provider') || 
                 fileContent.includes('apiVersion') || fileContent.includes('kind') ? 'iac' : 'text';
    }
    
    // Stage 1: Complete extraction from original file content
    const extractionPrompt = `You are an expert cloud architect with deep expertise in multi-cloud environments. Analyze this ${fileType === 'image' ? 'architecture diagram' : 'infrastructure code'} and extract ALL architectural components, connections, and metadata with 100% accuracy.

${fileType === 'image' ? 
  'This is a base64-encoded architecture diagram. Analyze the visual components, connections, and labels to understand the cloud architecture. Look for cloud provider logos, service names, and architectural patterns.' :
  'This is infrastructure code. Parse all resources, services, and their configurations to understand the complete architecture. Identify cloud providers from resource types, service names, and provider configurations.'
}

CRITICAL: Return ONLY valid JSON with proper array structures. Do NOT stringify arrays or use newlines in JSON values.

ENHANCED CLOUD PROVIDER DETECTION - Look for these specific indicators:

AWS Services & Patterns:
- Compute: EC2, Lambda, ECS, EKS, Fargate, Batch, Lightsail, Auto Scaling
- Storage: S3, EBS, EFS, FSx, Glacier, Storage Gateway
- Database: RDS, DynamoDB, ElastiCache, Redshift, Neptune, DocumentDB, Timestream
- Networking: VPC, CloudFront, Route53, API Gateway, ELB, ALB, NLB, Direct Connect, Transit Gateway
- Security: IAM, KMS, Secrets Manager, Certificate Manager, WAF, Shield, GuardDuty
- Analytics: Kinesis, EMR, Athena, QuickSight, CloudWatch, X-Ray
- AI/ML: SageMaker, Rekognition, Comprehend, Polly, Lex, Personalize
- Management: CloudFormation, CloudTrail, Config, Systems Manager, OpsWorks
- Developer Tools: CodeCommit, CodeBuild, CodeDeploy, CodePipeline, X-Ray
- Patterns: aws-*, amazon-*, *.amazonaws.com, arn:aws:*

Azure Services & Patterns:
- Compute: Virtual Machines, App Service, Functions, Container Instances, AKS, Batch, Service Fabric
- Storage: Blob Storage, File Storage, Queue Storage, Table Storage, Disk Storage, Archive Storage
- Database: SQL Database, Cosmos DB, Database for MySQL/PostgreSQL, Redis Cache, Synapse Analytics
- Networking: Virtual Network, Load Balancer, Application Gateway, CDN, DNS, ExpressRoute, VPN Gateway
- Security: Azure AD, Key Vault, Security Center, Sentinel, DDoS Protection, WAF
- Analytics: Data Factory, Stream Analytics, HDInsight, Databricks, Power BI, Monitor
- AI/ML: Cognitive Services, Machine Learning, Bot Service, Computer Vision, Speech Services
- Management: Resource Manager, Policy, Blueprints, Cost Management, Advisor
- Developer Tools: DevOps, App Configuration, Service Bus, Event Grid, Logic Apps
- Patterns: azure-*, microsoft-*, *.azure.com, *.windows.net, /subscriptions/

GCP Services & Patterns:
- Compute: Compute Engine, App Engine, Cloud Functions, GKE, Cloud Run, Batch, Preemptible VMs
- Storage: Cloud Storage, Persistent Disk, Filestore, Cloud SQL, Spanner, Firestore, Bigtable
- Networking: VPC, Cloud Load Balancing, Cloud CDN, Cloud DNS, Cloud Interconnect, Cloud NAT
- Security: Cloud IAM, Secret Manager, Security Command Center, Cloud Armor, Identity Platform
- Analytics: BigQuery, Dataflow, Dataproc, Pub/Sub, Cloud Composer, Data Studio, Monitoring
- AI/ML: AI Platform, AutoML, Vision API, Speech-to-Text, Translation API, Dialogflow
- Management: Cloud Resource Manager, Deployment Manager, Cloud Console, Cloud Shell
- Developer Tools: Cloud Build, Container Registry, Artifact Registry, Cloud Source Repositories
- Patterns: gcp-*, google-*, *.googleapis.com, *.gcp.com, projects/

Kubernetes & Container Platforms:
- Managed Services: EKS (AWS), AKS (Azure), GKE (GCP), OpenShift, Rancher
- Resources: Pods, Services, Deployments, ConfigMaps, Secrets, Ingress, PersistentVolumes
- Patterns: apiVersion: v1, kind: Pod/Service/Deployment, kubernetes.io/, k8s.io/

Hybrid & Multi-Cloud Patterns:
- On-Premises: VMware, Hyper-V, Bare Metal, Private Cloud, Data Center
- Multi-Cloud: Cross-cloud connections, data replication, disaster recovery
- Edge Computing: CDN, Edge Locations, IoT Gateways, 5G Networks
- Patterns: hybrid, on-premises, private-cloud, multi-cloud, edge

CRITICAL DETECTION RULES:
1. Examine EVERY component for cloud provider indicators
2. Look for provider-specific naming conventions and resource types
3. Check for provider-specific configuration patterns and metadata
4. Identify cross-cloud connections and hybrid architectures
5. Detect container orchestration platforms (Kubernetes, Docker Swarm)
6. Recognize serverless and managed service patterns
7. Identify networking and security service providers
8. Look for provider-specific monitoring and management tools

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
      "cloudProvider": "azure",
      "cloudService": "Azure App Service",
      "cloudRegion": "East US",
      "cloudAvailabilityZone": "East US 1",
      "isManagedService": true,
      "isServerless": false,
      "configuration": {
        "instanceType": "Standard_B1s",
        "region": "East US",
        "availabilityZone": "East US 1",
        "tags": {},
        "customProperties": {}
      },
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
      "crossCloud": false,
      "crossRegion": false,
      "isPrivate": false,
      "description": "API calls from web application to API Gateway"
    }
  ],
  "networkTopology": {
    "vpcs": [],
    "subnets": [],
    "securityGroups": [],
    "loadBalancers": []
  },
  "summary": "Comprehensive description of the complete architecture"
}

IMPORTANT: 
- components must be an array of objects, not a string
- connections must be an array of objects, not a string  
- Use proper JSON format with double quotes
- Do not include newlines or escaped characters in JSON values

File: ${file.name}
Content: ${fileContent}`;

    console.log('Stage 1: Extracting components from file...');
    const extractionResponse = await llmClient.callLLM(extractionPrompt);
    
    // Helper function to parse stringified arrays with newlines
    const parseIfStringified = (value: unknown) => {
      if (typeof value === 'string') {
        // Handle stringified JSON with escaped newlines and quotes
        if (value.includes('\\n') || value.startsWith('[') || value.startsWith('{')) {
          try {
            // First try to parse as-is
            return JSON.parse(value);
          } catch {
            try {
              // Clean up the string: handle escaped newlines and fix JSON format
              let cleaned = value
                .replace(/\\n/g, '') // Remove literal \n
                .replace(/\\'/g, "'") // Unescape single quotes
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();
              
              // If it looks like JavaScript object literal, convert to JSON
              if (cleaned.startsWith('[') && cleaned.includes("'")) {
                // Convert JavaScript object notation to JSON
                cleaned = cleaned
                  .replace(/(\w+):/g, '"$1":') // Quote property names
                  .replace(/'/g, '"') // Replace single quotes with double quotes
                  .replace(/,\s*}/g, '}') // Remove trailing commas
                  .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
              }
              
              // Try to parse the cleaned version
              return JSON.parse(cleaned);
            } catch {
              // If it's still a stringified array, try eval (safely)
              if (value.startsWith('[') && value.endsWith(']')) {
                try {
                  // Replace single quotes with double quotes for proper JSON
                  const jsonString = value.replace(/'/g, '"');
                  return JSON.parse(jsonString);
                } catch {
                  console.warn('Failed to parse stringified value:', value.substring(0, 100) + '...');
                  return [];
                }
              }
              return value;
            }
          }
        }
      }
      return value;
    };

    // Parse extraction response
    const extractionMatch = extractionResponse.match(/\{[\s\S]*\}/);
    if (!extractionMatch) {
      throw new Error('Failed to extract components from file');
    }
    
    const rawExtractedData = JSON.parse(extractionMatch[0]);
    
    // Apply aggressive array parsing to Stage 1 data
    const ensureArrayStage1 = (value: unknown, fallback: unknown[] = []) => {
      const parsed = parseIfStringified(value);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return [parsed]; // Wrap single objects in array
      console.warn('Stage 1: Failed to convert to array:', typeof parsed);
      return fallback;
    };

    const extractedData = {
      ...rawExtractedData,
      components: ensureArrayStage1(rawExtractedData.components, []),
      connections: ensureArrayStage1(rawExtractedData.connections, []),
      summary: rawExtractedData.summary || ''
    };

    // ENHANCED CLOUD PROVIDER VALIDATION
    console.log('🔍 Validating cloud provider detection accuracy...');
    
    // Function to detect cloud provider from component details
    const detectCloudProviderFromComponent = (component: Record<string, unknown>): string[] => {
      const providers: string[] = [];
      const name = String(component.name || '').toLowerCase();
      const type = String(component.type || '').toLowerCase();
      const cloudService = String(component.cloudService || '').toLowerCase();
      const description = String(component.description || '').toLowerCase();
      const config = component.configuration || {};
      
      // AWS Detection
      const awsPatterns = [
        'ec2', 's3', 'lambda', 'rds', 'vpc', 'cloudfront', 'route53', 'iam', 'kms',
        'elastic', 'dynamodb', 'sns', 'sqs', 'api gateway', 'elb', 'alb', 'nlb',
        'cloudformation', 'cloudtrail', 'config', 'systems manager', 'sagemaker',
        'rekognition', 'comprehend', 'polly', 'lex', 'personalize', 'kinesis',
        'emr', 'athena', 'quicksight', 'cloudwatch', 'x-ray', 'codecommit',
        'codebuild', 'codedeploy', 'codepipeline', 'fargate', 'eks', 'ecs',
        'batch', 'lightsail', 'ebs', 'efs', 'fsx', 'glacier', 'storage gateway',
        'elasticache', 'redshift', 'neptune', 'documentdb', 'timestream',
        'direct connect', 'transit gateway', 'secrets manager', 'certificate manager',
        'waf', 'shield', 'guardduty', 'aws-', 'amazon-', 'amazonaws.com', 'arn:aws:'
      ];
      
      // Azure Detection
      const azurePatterns = [
        'app service', 'blob storage', 'functions', 'sql database', 'virtual network',
        'load balancer', 'application gateway', 'cdn', 'dns', 'expressroute',
        'vpn gateway', 'azure ad', 'key vault', 'security center', 'sentinel',
        'ddos protection', 'waf', 'data factory', 'stream analytics', 'hdinsight',
        'databricks', 'power bi', 'monitor', 'cognitive services', 'machine learning',
        'bot service', 'computer vision', 'speech services', 'resource manager',
        'policy', 'blueprints', 'cost management', 'advisor', 'devops',
        'app configuration', 'service bus', 'event grid', 'logic apps',
        'container instances', 'aks', 'batch', 'service fabric', 'file storage',
        'queue storage', 'table storage', 'disk storage', 'archive storage',
        'cosmos db', 'database for mysql', 'database for postgresql', 'redis cache',
        'synapse analytics', 'azure-', 'microsoft-', 'azure.com', 'windows.net',
        '/subscriptions/'
      ];
      
      // GCP Detection
      const gcpPatterns = [
        'compute engine', 'app engine', 'cloud functions', 'gke', 'cloud run',
        'batch', 'preemptible vms', 'cloud storage', 'persistent disk', 'filestore',
        'cloud sql', 'spanner', 'firestore', 'bigtable', 'vpc', 'cloud load balancing',
        'cloud cdn', 'cloud dns', 'cloud interconnect', 'cloud nat', 'cloud iam',
        'secret manager', 'security command center', 'cloud armor', 'identity platform',
        'bigquery', 'dataflow', 'dataproc', 'pub/sub', 'cloud composer', 'data studio',
        'monitoring', 'ai platform', 'automl', 'vision api', 'speech-to-text',
        'translation api', 'dialogflow', 'cloud resource manager', 'deployment manager',
        'cloud console', 'cloud shell', 'cloud build', 'container registry',
        'artifact registry', 'cloud source repositories', 'gcp-', 'google-',
        'googleapis.com', 'gcp.com', 'projects/'
      ];
      
      // Kubernetes Detection
      const k8sPatterns = [
        'kubernetes', 'k8s', 'pod', 'service', 'deployment', 'configmap', 'secret',
        'ingress', 'persistentvolume', 'statefulset', 'daemonset', 'job', 'cronjob',
        'namespace', 'rbac', 'network policy', 'pod security policy', 'admission controller',
        'kubernetes.io/', 'k8s.io/', 'apiVersion:', 'kind:', 'eks', 'aks', 'gke',
        'openshift', 'rancher'
      ];
      
      // Check all patterns
      const allText = `${name} ${type} ${cloudService} ${description} ${JSON.stringify(config)}`.toLowerCase();
      
      if (awsPatterns.some(pattern => allText.includes(pattern))) {
        providers.push('aws');
      }
      if (azurePatterns.some(pattern => allText.includes(pattern))) {
        providers.push('azure');
      }
      if (gcpPatterns.some(pattern => allText.includes(pattern))) {
        providers.push('gcp');
      }
      if (k8sPatterns.some(pattern => allText.includes(pattern))) {
        providers.push('kubernetes');
      }
      
      return providers;
    };
    
    // Validate and enhance cloud provider detection
    const detectedProviders = new Set<string>();
    extractedData.components.forEach((component: Record<string, unknown>) => {
      const componentProviders = detectCloudProviderFromComponent(component);
      componentProviders.forEach(provider => detectedProviders.add(provider));
    });
    
    // Additional file content analysis for missed providers
    if (fileType !== 'image') {
      const fileContentLower = fileContent.toLowerCase();
      
      // AWS patterns in file content
      if (fileContentLower.includes('aws:') || fileContentLower.includes('amazon:') || 
          fileContentLower.includes('provider "aws"') || fileContentLower.includes('provider "amazon"') ||
          fileContentLower.includes('arn:aws:') || fileContentLower.includes('amazonaws.com')) {
        detectedProviders.add('aws');
      }
      
      // Azure patterns in file content
      if (fileContentLower.includes('azure:') || fileContentLower.includes('microsoft:') ||
          fileContentLower.includes('provider "azurerm"') || fileContentLower.includes('provider "azure"') ||
          fileContentLower.includes('azure.com') || fileContentLower.includes('windows.net') ||
          fileContentLower.includes('/subscriptions/')) {
        detectedProviders.add('azure');
      }
      
      // GCP patterns in file content
      if (fileContentLower.includes('google:') || fileContentLower.includes('gcp:') ||
          fileContentLower.includes('provider "google"') || fileContentLower.includes('provider "gcp"') ||
          fileContentLower.includes('googleapis.com') || fileContentLower.includes('gcp.com') ||
          fileContentLower.includes('projects/')) {
        detectedProviders.add('gcp');
      }
      
      // Kubernetes patterns in file content
      if (fileContentLower.includes('apiVersion:') || fileContentLower.includes('kind:') ||
          fileContentLower.includes('kubernetes.io/') || fileContentLower.includes('k8s.io/') ||
          fileContentLower.includes('metadata:') || fileContentLower.includes('spec:')) {
        detectedProviders.add('kubernetes');
      }
    }
    
    // Update metadata with enhanced detection
    if (detectedProviders.size > 0) {
      const detectedProvidersArray = Array.from(detectedProviders);
      extractedData.metadata = {
        ...extractedData.metadata,
        cloudProviders: detectedProvidersArray,
        primaryCloudProvider: detectedProvidersArray[0] || 'unknown',
        hybridCloudModel: detectedProvidersArray.length > 1 ? 'multi-cloud' : 
                          detectedProvidersArray.includes('kubernetes') ? 'hybrid-cloud' : 'single-cloud'
      };
      
      console.log(`✅ Enhanced cloud provider detection: ${detectedProvidersArray.join(', ')}`);
    } else {
      console.log('⚠️ No cloud providers detected from components or file content, using LLM detection');
    }
    
    console.log('Stage 1 complete: Extracted', extractedData.components?.length || 0, 'components');
    console.log('Stage 1 components type:', typeof extractedData.components, 'isArray:', Array.isArray(extractedData.components));
    
    // Fetch active checklist items for evaluation criteria
    console.log('Fetching active checklist items for evaluation...');
    const activeChecklistItems = await getChecklistItems();
    const enabledItems = activeChecklistItems.filter(item => item.enabled);
    console.log(`Found ${enabledItems.length} active checklist items across ${new Set(enabledItems.map(item => item.category)).size} categories`);
    
    // STAGE 2: Comprehensive analysis
    const analysisPrompt = `Analyze this architecture and provide comprehensive security, risk, and compliance assessment with enhanced cloud provider awareness.

Context: App "${componentName}" in ${environment} environment.

ENHANCED CLOUD PROVIDER CONTEXT:
- Primary Cloud Provider: ${extractedData.metadata?.primaryCloudProvider || 'unknown'}
- Hybrid Cloud Model: ${extractedData.metadata?.hybridCloudModel || 'unknown'}
- Deployment Model: ${extractedData.metadata?.deploymentModel || 'unknown'}
- Cloud Providers Used: ${extractedData.metadata?.cloudProviders?.join(', ') || 'unknown'}
- Architecture Type: ${extractedData.metadata?.architectureType || 'unknown'}
- Estimated Complexity: ${extractedData.metadata?.estimatedComplexity || 'unknown'}

CLOUD PROVIDER-SPECIFIC ANALYSIS:
Based on the detected cloud providers, focus your analysis on provider-specific best practices:

${extractedData.metadata?.cloudProviders?.includes('aws') ? `
AWS-SPECIFIC CONSIDERATIONS:
- Security: IAM policies, S3 bucket policies, VPC security groups, NACLs, WAF rules, KMS encryption
- Compliance: AWS Config, CloudTrail, GuardDuty, Security Hub, Well-Architected Framework
- Cost: Reserved Instances, Spot Instances, S3 storage classes, CloudWatch costs
- Reliability: Multi-AZ deployments, Auto Scaling, ELB health checks, RDS backups
- Performance: CloudFront, ElastiCache, RDS read replicas, EBS optimization
` : ''}

${extractedData.metadata?.cloudProviders?.includes('azure') ? `
AZURE-SPECIFIC CONSIDERATIONS:
- Security: Azure AD RBAC, NSG rules, Key Vault, Security Center, Sentinel, DDoS Protection
- Compliance: Azure Policy, Blueprint, Compliance Manager, Security Center recommendations
- Cost: Reserved Instances, Spot VMs, Storage tiers, Cost Management, Advisor recommendations
- Reliability: Availability Sets, Load Balancer, SQL Database geo-replication, Backup Vault
- Performance: CDN, Redis Cache, SQL Database read replicas, Premium Storage
` : ''}

${extractedData.metadata?.cloudProviders?.includes('gcp') ? `
GCP-SPECIFIC CONSIDERATIONS:
- Security: Cloud IAM, VPC firewall rules, Secret Manager, Security Command Center, Cloud Armor
- Compliance: Cloud Asset Inventory, Security Command Center, Cloud Audit Logs, Policy Intelligence
- Cost: Committed Use Discounts, Preemptible VMs, Storage classes, Cost Management, Recommender
- Reliability: Managed Instance Groups, Load Balancing, Cloud SQL replicas, Persistent Disk snapshots
- Performance: Cloud CDN, Memorystore, Cloud SQL read replicas, SSD persistent disks
` : ''}

${extractedData.metadata?.cloudProviders?.includes('kubernetes') ? `
KUBERNETES-SPECIFIC CONSIDERATIONS:
- Security: RBAC, Network Policies, Pod Security Policies, Admission Controllers, Secrets management
- Compliance: CIS Kubernetes Benchmark, Pod Security Standards, Network segmentation
- Cost: Resource requests/limits, Horizontal Pod Autoscaler, Cluster autoscaling, Node optimization
- Reliability: Pod disruption budgets, Health checks, Rolling updates, StatefulSets
- Performance: Resource optimization, Service mesh, Ingress controllers, Storage classes
` : ''}

${extractedData.metadata?.hybridCloudModel === 'multi-cloud' || extractedData.metadata?.hybridCloudModel === 'hybrid-cloud' ? `
MULTI-CLOUD/HYBRID CONSIDERATIONS:
- Security: Cross-cloud identity federation, data encryption in transit, network connectivity
- Compliance: Data sovereignty, cross-border data transfer, unified compliance monitoring
- Cost: Cross-cloud cost optimization, data transfer costs, vendor lock-in mitigation
- Reliability: Disaster recovery across clouds, data replication, failover strategies
- Performance: Cross-cloud latency, data synchronization, network optimization
` : ''}

Architecture Data:
${JSON.stringify(extractedData, null, 2)}

EVALUATION CRITERIA - Active Checklist Items:
${enabledItems.map(item => `
Category: ${item.category}
Item: ${item.item}
Description: ${item.description}
Recommended Action: ${item.recommendedAction}
Owner: ${item.owner}
Priority: ${item.priority}
`).join('\n')}

INSTRUCTIONS:
1. Evaluate the architecture against each active checklist item above
2. Identify which checklist items are properly implemented, partially implemented, or missing
3. Generate specific risks, compliance gaps, and recommendations based on the checklist evaluation
4. For recommendations, use the "issue" field to describe the checklist item that's missing/insufficient
5. For recommendations, use the "fix" field to provide the specific action from the checklist item
6. Map recommendations to checklist categories (security, reliability, performance, cost, compliance)
7. Provide realistic scores (0-100) based on compliance with the checklist items
8. Focus on high-priority items first, then medium-priority items
9. Count how many checklist items are fully implemented vs missing to calculate scores

CLOUD PROVIDER-SPECIFIC ANALYSIS:
- For AWS: Focus on IAM policies, VPC security, S3 bucket policies, CloudTrail logging, Config rules
- For Azure: Focus on RBAC, NSG rules, Storage account security, Azure Policy, Security Center
- For GCP: Focus on IAM bindings, VPC firewall rules, Cloud Storage IAM, Cloud Audit Logs, Security Command Center
- For Multi-Cloud: Focus on cross-cloud security, data governance, identity federation, network connectivity
- For Hybrid Cloud: Focus on on-premises integration, data sovereignty, network segmentation, compliance boundaries
- For Kubernetes: Focus on RBAC, network policies, pod security policies, admission controllers, secrets management

CRITICAL: Return ONLY valid JSON with proper array structures. Do NOT stringify arrays or use newlines in JSON values.

Expected JSON Schema:
{
  "components": [
    {
      "id": "component1",
      "name": "Web Application",
      "type": "compute",
      "cloudProvider": "azure",
      "cloudService": "Azure App Service",
      "configuration": {
        "instanceType": "Standard_B1s",
        "region": "East US",
        "availabilityZone": null,
        "tags": {},
        "customProperties": {}
      },
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
      "crossCloud": false,
      "crossRegion": false,
      "isPrivate": false,
      "description": "API calls from web application to API Gateway"
    }
  ],
  "risks": [
    {
      "id": "risk1",
      "title": "Security Risk",
      "description": "Detailed risk description",
      "severity": "high|medium|low",
      "category": "security|performance|cost|compliance",
      "impact": "Detailed impact description"
    }
  ],
  "complianceGaps": [
    {
      "id": "gap1",
      "framework": "SOC2|ISO27001|PCI-DSS|HIPAA|GDPR|CIS",
      "requirement": "Specific compliance requirement (e.g., 'Data encryption at rest', 'Access logging', 'Data retention policy')",
      "description": "Detailed gap description explaining what is missing",
      "severity": "high|medium|low",
      "affectedComponents": ["component1", "component2"],
      "remediation": "Specific steps to fix this compliance gap"
    }
  ],
  "costIssues": [
    {
      "id": "cost1",
      "title": "Cost Issue",
      "description": "Detailed cost issue description",
      "category": "overprovisioning|unused_resources|inefficient_services",
      "estimatedSavings": 1000,
      "recommendation": "How to optimize costs"
    }
  ],
  "recommendations": [
    {
      "id": "rec1",
      "issue": "Network segmentation not implemented (checklist item: Network segmentation)",
      "fix": "Implement VPC/VNet per environment; use subnets, NSGs, security groups, private endpoints and service endpoints",
      "impact": "high",
      "effort": "medium",
      "priority": 1,
      "category": "security"
    },
    {
      "id": "rec2", 
      "issue": "Encryption at rest not enforced (checklist item: Encryption at rest)",
      "fix": "Enforce provider-managed or customer-managed KMS encryption for storage, DBs, buckets. Audit key policies",
      "impact": "high",
      "effort": "low",
      "priority": 2,
      "category": "security"
    },
    {
      "id": "rec3",
      "issue": "Strong authentication not implemented (checklist item: Strong authentication)",
      "fix": "Enforce MFA for all accounts, require FIDO2/2FA for admins. Remove unused root/owner keys",
      "impact": "high",
      "effort": "medium",
      "priority": 3,
      "category": "security"
    }
  ],
  "resiliencyScore": 75,
  "securityScore": 80,
  "costEfficiencyScore": 70,
  "complianceScore": 65,
  "summary": "Architecture analysis completed",
  "architectureDescription": "Detailed architecture analysis"
}

IMPORTANT: 
- components must be an array of objects, not a string
- connections must be an array of objects, not a string
- risks, complianceGaps, costIssues, recommendations must be arrays, not strings
- recommendations must be objects with: id, issue, fix, impact, effort, priority, category
- complianceGaps must have: id, framework, requirement, description, severity, remediation, components
- requirement field must be specific (e.g., "Data encryption at rest", "Access logging", "Data retention policy")
- framework field must be one of: "SOC2", "ISO27001", "PCI-DSS", "HIPAA", "GDPR", "CIS"
- remediation field must provide specific steps to fix the gap
- impact values: "low" | "medium" | "high"
- effort values: "low" | "medium" | "high" 
- category values: "security" | "reliability" | "performance" | "cost" | "compliance"
- Use proper JSON format with double quotes
- Do not include newlines or escaped characters in JSON values

Return ONLY valid JSON with detailed analysis including risks, compliance gaps, cost optimizations, recommendations, and realistic scores (0-100).`;

    console.log('Stage 2: Performing detailed analysis...');
    const response = await llmClient.callLLM(analysisPrompt);

    // Parse response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('LLM did not return valid JSON');
    }

    const rawParsed = JSON.parse(jsonMatch[0]);
    console.log('Stage 2 complete: Analysis finished');
    
    // Debug: Log the complete raw response structure
    console.log('Complete LLM response keys:', Object.keys(rawParsed));
    console.log('Raw LLM response preview:', JSON.stringify(rawParsed, null, 2).substring(0, 500));
    
    // Debug: Log raw parsed data types
    console.log('Raw parsed data types:', {
      components: typeof rawParsed.components,
      connections: typeof rawParsed.connections,
      componentsPreview: typeof rawParsed.components === 'string' ? rawParsed.components.substring(0, 100) : 'not string'
    });
    
    // Clean up the parsed data with AGGRESSIVE array enforcement
    const ensureArray = (value: unknown, fallback: unknown[] = []) => {
      const parsed = parseIfStringified(value);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return [parsed]; // Wrap single objects in array
      console.warn('Failed to convert to array:', typeof parsed, parsed);
      return fallback;
    };

    const parsed: LLMResponseData = {
      ...rawParsed,
      components: ensureArray(rawParsed.components, extractedData.components || []),
      connections: ensureArray(rawParsed.connections, extractedData.connections || []),
      risks: ensureArray(rawParsed.risks, []),
      complianceGaps: ensureArray(rawParsed.complianceGaps, []),
      costIssues: ensureArray(rawParsed.costIssues, []),
      recommendations: ensureArray(rawParsed.recommendations, []),
      summary: rawParsed.summary || extractedData.summary || 'Architecture analysis completed',
      architectureDescription: rawParsed.architectureDescription || extractedData.summary || 'Detailed architecture analysis'
    };
    
    // Debug: Log final parsed data
    console.log('Final parsed components type:', typeof parsed.components, 'isArray:', Array.isArray(parsed.components));
    console.log('Final parsed connections type:', typeof parsed.connections, 'isArray:', Array.isArray(parsed.connections));

    // Debug: Check the final parsed data types before creating analysis
    console.log('Final data before analysis creation:');
    console.log('parsed.components type:', typeof parsed.components, 'isArray:', Array.isArray(parsed.components));
    console.log('parsed.connections type:', typeof parsed.connections, 'isArray:', Array.isArray(parsed.connections));
    console.log('extractedData.components type:', typeof extractedData.components, 'isArray:', Array.isArray(extractedData.components));
    console.log('extractedData.connections type:', typeof extractedData.connections, 'isArray:', Array.isArray(extractedData.connections));

    // Ensure we use proper arrays, not strings - FINAL SAFETY CHECK
    let finalComponents = Array.isArray(parsed.components) ? parsed.components :
                         Array.isArray(extractedData.components) ? extractedData.components : [];
    let finalConnections = Array.isArray(parsed.connections) ? parsed.connections :
                          Array.isArray(extractedData.connections) ? extractedData.connections : [];

    // FINAL ASSERTION: Force arrays if anything went wrong
    if (!Array.isArray(finalComponents)) {
      console.error('🚨 CRITICAL: finalComponents is not an array!', typeof finalComponents);
      finalComponents = [];
    }
    if (!Array.isArray(finalConnections)) {
      console.error('🚨 CRITICAL: finalConnections is not an array!', typeof finalConnections);
      finalConnections = [];
    }

    // Final safety check - if we still have strings, try to parse them one more time
    if (typeof finalComponents === 'string') {
      console.warn('⚠️ Components is still a string, attempting final parse...');
      try {
        const parseAttempt = JSON.parse(finalComponents);
        if (Array.isArray(parseAttempt)) {
          finalComponents = parseAttempt;
        }
      } catch (e) {
        console.error('Failed final parse of components:', e);
        finalComponents = []; // Fallback to empty array
      }
    }

    if (typeof finalConnections === 'string') {
      console.warn('⚠️ Connections is still a string, attempting final parse...');
      try {
        const parseAttempt = JSON.parse(finalConnections);
        if (Array.isArray(parseAttempt)) {
          finalConnections = parseAttempt;
        }
      } catch (e) {
        console.error('Failed final parse of connections:', e);
        finalConnections = []; // Fallback to empty array
      }
    }

    console.log('Final components to use:', typeof finalComponents, 'isArray:', Array.isArray(finalComponents), 'length:', finalComponents.length);
    console.log('Final connections to use:', typeof finalConnections, 'isArray:', Array.isArray(finalConnections), 'length:', finalConnections.length);
    
    // Debug: Log the scores from LLM response
    console.log('🔍 LLM Response Scores:');
    console.log('resiliencyScore:', parsed.resiliencyScore, 'type:', typeof parsed.resiliencyScore);
    console.log('securityScore:', parsed.securityScore, 'type:', typeof parsed.securityScore);
    console.log('costEfficiencyScore:', parsed.costEfficiencyScore, 'type:', typeof parsed.costEfficiencyScore);
    console.log('complianceScore:', parsed.complianceScore, 'type:', typeof parsed.complianceScore);

    // Prepare original file data for storage
    let originalFileData: string | null = null;
    if (file.type.startsWith('image/')) {
      // For images, we already have the original base64 from earlier
      const fileBuffer = await file.arrayBuffer();
      originalFileData = Buffer.from(fileBuffer).toString('base64');
    } else {
      // For text files (IAC), read the content
      const fileText = await file.text();
      originalFileData = Buffer.from(fileText).toString('base64');
    }

    // Create analysis object with enhanced data from both stages
    const analysis: ArchitectureAnalysis = {
      id: `analysis-${Date.now()}`,
      timestamp: new Date(),
      fileName: file.name,
      fileType: fileType,
      // Store original file data
      originalFile: {
        name: file.name,
        size: file.size,
        type: file.type,
        data: originalFileData,
        mimeType: file.type
      },
      appId,
      componentName,
      description,
      environment,
      version,
      // Use the properly validated arrays
      components: finalComponents,
      connections: finalConnections,
      risks: parsed.risks || [],
      complianceGaps: parsed.complianceGaps || [],
      costIssues: parsed.costIssues || [],
      recommendations: parsed.recommendations || [],
      // Enhanced scoring from Stage 2
      resiliencyScore: parsed.resiliencyScore || 0,
      securityScore: parsed.securityScore || 0,
      costEfficiencyScore: parsed.costEfficiencyScore || 0,
      complianceScore: parsed.complianceScore || 0,
      estimatedSavingsUSD: parsed.costIssues?.reduce((sum: number, opt: { estimatedSavings?: number }) => sum + (opt.estimatedSavings || 0), 0) || 0,
      summary: parsed.summary || extractedData.summary || '',
      architectureDescription: parsed.architectureDescription || extractedData.summary || '',
      processingTime: Math.round((Date.now() - startTime) / 1000 * 100) / 100, // Convert to seconds with 2 decimal places
      llmProvider: llmClient.getConfig().provider,
      llmModel: llmClient.getConfig().model || 'unknown',
      // Image optimization metadata (if applicable)
      ...(optimizationInfo && {
        imageOptimization: optimizationInfo
      })
    };

    // Debug: Log the final analysis scores before saving
    console.log('🔍 Final Analysis Scores Before Save:');
    console.log('resiliencyScore:', analysis.resiliencyScore, 'type:', typeof analysis.resiliencyScore);
    console.log('securityScore:', analysis.securityScore, 'type:', typeof analysis.securityScore);
    console.log('costEfficiencyScore:', analysis.costEfficiencyScore, 'type:', typeof analysis.costEfficiencyScore);
    console.log('complianceScore:', analysis.complianceScore, 'type:', typeof analysis.complianceScore);

    // Save to database
    const savedAnalysis = await saveAnalysis(analysis);

    return NextResponse.json({
      ...analysis,
      _id: savedAnalysis._id
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
