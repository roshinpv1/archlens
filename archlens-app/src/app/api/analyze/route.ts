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
    const extractionPrompt = `You are an expert cloud architect. Analyze this ${fileType === 'image' ? 'architecture diagram' : 'infrastructure code'} and extract ALL architectural components, connections, and metadata.

${fileType === 'image' ? 
  'This is a base64-encoded architecture diagram. Analyze the visual components, connections, and labels to understand the cloud architecture. Look for cloud provider logos, service names, and architectural patterns.' :
  'This is infrastructure code. Parse all resources, services, and their configurations to understand the complete architecture. Identify cloud providers from resource types, service names, and provider configurations.'
}

CRITICAL: Return ONLY valid JSON with proper array structures. Do NOT stringify arrays or use newlines in JSON values.

IMPORTANT: For cloud provider detection, look for:
- AWS: EC2, S3, Lambda, RDS, VPC, CloudFront, Route53, IAM, etc.
- Azure: App Service, Blob Storage, Functions, SQL Database, Virtual Network, CDN, DNS, etc.
- GCP: Compute Engine, Cloud Storage, Cloud Functions, Cloud SQL, VPC, Cloud CDN, etc.
- Hybrid: On-premises components, private clouds, multi-cloud connections
- Kubernetes: EKS, AKS, GKE, or generic Kubernetes deployments

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
    
    console.log('Stage 1 complete: Extracted', extractedData.components?.length || 0, 'components');
    console.log('Stage 1 components type:', typeof extractedData.components, 'isArray:', Array.isArray(extractedData.components));
    
    // Fetch active checklist items for evaluation criteria
    console.log('Fetching active checklist items for evaluation...');
    const activeChecklistItems = await getChecklistItems();
    const enabledItems = activeChecklistItems.filter(item => item.enabled);
    console.log(`Found ${enabledItems.length} active checklist items across ${new Set(enabledItems.map(item => item.category)).size} categories`);
    
    // STAGE 2: Comprehensive analysis
    const analysisPrompt = `Analyze this architecture and provide comprehensive security, risk, and compliance assessment.

Context: App "${componentName}" in ${environment} environment.

CLOUD PROVIDER CONTEXT:
- Primary Cloud Provider: ${extractedData.metadata?.primaryCloudProvider || 'unknown'}
- Hybrid Cloud Model: ${extractedData.metadata?.hybridCloudModel || 'unknown'}
- Deployment Model: ${extractedData.metadata?.deploymentModel || 'unknown'}
- Cloud Providers Used: ${extractedData.metadata?.cloudProviders?.join(', ') || 'unknown'}

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
    console.log('resiliencyScore:', parsed.scores?.resiliencyScore, 'type:', typeof parsed.scores?.resiliencyScore);
    console.log('securityScore:', parsed.scores?.securityScore, 'type:', typeof parsed.scores?.securityScore);
    console.log('costEfficiencyScore:', parsed.scores?.costEfficiencyScore, 'type:', typeof parsed.scores?.costEfficiencyScore);
    console.log('complianceScore:', parsed.scores?.complianceScore, 'type:', typeof parsed.scores?.complianceScore);

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
      resiliencyScore: parsed.scores?.resiliencyScore || 0,
      securityScore: parsed.scores?.securityScore || 0,
      costEfficiencyScore: parsed.scores?.costEfficiencyScore || 0,
      complianceScore: parsed.scores?.complianceScore || 0,
      estimatedSavingsUSD: parsed.costIssues?.reduce((sum: number, opt: { estimatedSavings?: number }) => sum + (opt.estimatedSavings || 0), 0) || 0,
      summary: parsed.summary || extractedData.summary || '',
      architectureDescription: parsed.architectureDescription || extractedData.summary || '',
      processingTime: Date.now() - startTime,
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
