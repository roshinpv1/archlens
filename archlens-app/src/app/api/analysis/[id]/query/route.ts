import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/analysisService';
import { createLLMClientFromEnv } from '@/lib/llm-factory';
import Analysis from '@/models/Analysis';
import { cleanMarkdown } from '@/utils/cleanMarkdown';

/**
 * Query a specific architecture analysis using natural language
 * Uses LLM to answer questions about the analysis, components, risks, and recommendations
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const resolvedParams = await params;
    const analysisId = resolvedParams.id;
    
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Processing query for analysis ${analysisId}: "${query}"`);

    // Fetch analysis
    const analysis = await Analysis.findById(analysisId).lean();
    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Create LLM client
    const llmClient = createLLMClientFromEnv();
    if (!llmClient) {
      return NextResponse.json(
        { error: 'LLM client not available' },
        { status: 500 }
      );
    }

    // Build comprehensive context
    const contextParts = [];

    // Analysis basic info
    const analysisIdStr = (analysis as any)._id?.toString() || (analysis as any).id || analysisId;
    contextParts.push(`
**ARCHITECTURE ANALYSIS INFORMATION:**
- Analysis ID: ${analysisIdStr}
- Component Name: ${analysis.componentName || 'Unknown'}
- App ID: ${analysis.appId || 'Unknown'}
- Description: ${analysis.description || 'No description'}
- Environment: ${analysis.environment || 'Unknown'}
- Version: ${analysis.version || 'Unknown'}
- Timestamp: ${analysis.timestamp ? new Date(analysis.timestamp).toISOString() : 'Unknown'}
`);

    // Metadata
    if (analysis.metadata) {
      contextParts.push(`
**METADATA:**
- Architecture Type: ${analysis.metadata.architectureType || 'Unknown'}
- Cloud Providers: ${Array.isArray(analysis.metadata.cloudProviders) ? analysis.metadata.cloudProviders.join(', ') : 'Unknown'}
- Hybrid Cloud Model: ${analysis.metadata.hybridCloudModel || 'Unknown'}
- Primary Cloud Provider: ${analysis.metadata.primaryCloudProvider || 'Unknown'}
- Estimated Complexity: ${analysis.metadata.estimatedComplexity || 'Unknown'}
- Primary Purpose: ${analysis.metadata.primaryPurpose || 'Unknown'}
- Environment Type: ${analysis.metadata.environmentType || 'Unknown'}
- Deployment Model: ${analysis.metadata.deploymentModel || 'Unknown'}
`);
    }

    // Components
    if (analysis.components && analysis.components.length > 0) {
      contextParts.push(`
**COMPONENTS (${analysis.components.length}):**
${analysis.components.map((comp: any, idx: number) => 
  `${idx + 1}. ${comp.name || comp.id || 'Component'} (${comp.type || 'unknown'})
     - Cloud Provider: ${comp.cloudProvider || 'Unknown'}
     - Cloud Service: ${comp.cloudService || 'Unknown'}
     - Region: ${comp.cloudRegion || 'Unknown'}
     - Terraform Category: ${comp.terraformCategory || 'Uncategorized'}
     ${comp.description ? `- Description: ${comp.description}` : ''}
     ${comp.isManagedService !== undefined ? `- Managed Service: ${comp.isManagedService}` : ''}
     ${comp.isServerless !== undefined ? `- Serverless: ${comp.isServerless}` : ''}`
).join('\n\n')}
`);
    }

    // Connections
    if (analysis.connections && analysis.connections.length > 0) {
      contextParts.push(`
**CONNECTIONS (${analysis.connections.length}):**
${analysis.connections.map((conn: any, idx: number) => 
  `${idx + 1}. ${conn.source || 'Unknown'} → ${conn.target || 'Unknown'}
     - Type: ${conn.type || 'Unknown'}
     - Protocol: ${conn.protocol || 'Unknown'}
     ${conn.crossCloud !== undefined ? `- Cross-Cloud: ${conn.crossCloud}` : ''}
     ${conn.crossRegion !== undefined ? `- Cross-Region: ${conn.crossRegion}` : ''}
     ${conn.isPrivate !== undefined ? `- Private: ${conn.isPrivate}` : ''}
     ${conn.description ? `- Description: ${conn.description}` : ''}`
).join('\n\n')}
`);
    }

    // Scores
    contextParts.push(`
**ANALYSIS SCORES (0-100):**
- Security Score: ${(analysis as any).securityScore || 0}
- Resiliency Score: ${(analysis as any).resiliencyScore || 0}
- Cost Efficiency Score: ${(analysis as any).costEfficiencyScore || 0}
- Compliance Score: ${(analysis as any).complianceScore || 0}
`);

    // Risks
    if (analysis.risks && analysis.risks.length > 0) {
      contextParts.push(`
**RISKS (${analysis.risks.length}):**
${analysis.risks.map((risk: any, idx: number) => 
  `${idx + 1}. [${risk.severity || 'Unknown'} severity] ${risk.title || 'Risk'}
     - Category: ${risk.category || 'Unknown'}
     - Impact: ${risk.impact || 'Unknown'}
     ${risk.description ? `- Description: ${risk.description}` : ''}
     ${risk.recommendation ? `- Recommendation: ${risk.recommendation}` : ''}
     ${risk.components && risk.components.length > 0 ? `- Affected Components: ${risk.components.join(', ')}` : ''}`
).join('\n\n')}
`);
    }

    // Compliance Gaps
    if (analysis.complianceGaps && analysis.complianceGaps.length > 0) {
      contextParts.push(`
**COMPLIANCE GAPS (${analysis.complianceGaps.length}):**
${analysis.complianceGaps.map((gap: any, idx: number) => 
  `${idx + 1}. ${gap.framework || 'Unknown Framework'}
     - Requirement: ${gap.requirement || 'Unknown'}
     - Severity: ${gap.severity || 'Unknown'}
     ${gap.description ? `- Description: ${gap.description}` : ''}
     ${gap.remediation ? `- Remediation: ${gap.remediation}` : ''}
     ${gap.components && gap.components.length > 0 ? `- Affected Components: ${gap.components.join(', ')}` : ''}`
).join('\n\n')}
`);
    }

    // Cost Issues
    if (analysis.costIssues && analysis.costIssues.length > 0) {
      contextParts.push(`
**COST ISSUES (${analysis.costIssues.length}):**
${analysis.costIssues.map((issue: any, idx: number) => 
  `${idx + 1}. ${issue.title || 'Cost Issue'}
     - Severity: ${issue.severity || 'Unknown'}
     - Estimated Savings: $${issue.estimatedSavingsUSD || 0}
     ${issue.description ? `- Description: ${issue.description}` : ''}
     ${issue.recommendation ? `- Recommendation: ${issue.recommendation}` : ''}
     ${issue.components && issue.components.length > 0 ? `- Affected Components: ${issue.components.join(', ')}` : ''}`
).join('\n\n')}
`);
    }

    // Recommendations
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      contextParts.push(`
**RECOMMENDATIONS (${analysis.recommendations.length}):**
${analysis.recommendations.map((rec: any, idx: number) => 
  `${idx + 1}. [Priority: ${rec.priority || 'medium'}] ${rec.issue || 'Recommendation'}
     - Category: ${rec.category || 'Unknown'}
     - Impact: ${rec.impact || 'Unknown'}
     - Effort: ${rec.effort || 'Unknown'}
     ${rec.fix ? `- Fix: ${rec.fix}` : ''}`
).join('\n\n')}
`);
    }

    // Similar Blueprints
    if (analysis.similarBlueprints && analysis.similarBlueprints.length > 0) {
      contextParts.push(`
**SIMILAR BLUEPRINTS (${analysis.similarBlueprints.length}):**
${analysis.similarBlueprints.map((bp: any, idx: number) => 
  `${idx + 1}. ${bp.name || 'Blueprint'} (Similarity: ${bp.similarity ? (bp.similarity * 100).toFixed(0) + '%' : 'Unknown'})
     ${bp.description ? `- Description: ${bp.description}` : ''}`
).join('\n\n')}
`);
    }

    // Blueprint Insights
    if (analysis.blueprintInsights && analysis.blueprintInsights.length > 0) {
      contextParts.push(`
**BLUEPRINT INSIGHTS:**
${analysis.blueprintInsights.map((insight: any, idx: number) => 
  `${idx + 1}. ${insight.title || 'Insight'}
     ${insight.description ? `- ${insight.description}` : ''}`
).join('\n\n')}
`);
    }

    const context = contextParts.join('\n');

    // Generate LLM prompt
    const llmPrompt = `You are an expert cloud architect assistant. Answer the user's question about this specific architecture analysis using the comprehensive information provided below.

USER QUESTION: ${query}

ARCHITECTURE ANALYSIS CONTEXT:
${context}

INSTRUCTIONS:
1. Answer the user's question using ONLY the information provided in the architecture analysis context above
2. Be specific and cite exact values, components, risks, or recommendations when relevant
3. If the question asks about components, reference them by name and provide details
4. If the question asks about scores or metrics, provide the exact numbers
5. If the question asks for recommendations, list them with priorities
6. If the question asks about risks, list them with severity levels
7. If the question asks about compliance gaps, provide the standards and requirements
8. If the question asks about cost issues, provide the estimated impact and savings
9. If the question asks about architecture patterns or technology stack, provide the exact information
10. If the information is not available in the context, say so clearly
11. Be concise but comprehensive in your answer

Provide a helpful, accurate answer based on the architecture analysis information provided.`;

    console.log('🤖 Processing query with LLM...');
    const llmResponse = await llmClient.callLLM(llmPrompt, {
      temperature: 0.7,
      maxTokens: 2000
    });

    // Clean markdown from LLM response
    const cleanAnswer = cleanMarkdown(llmResponse);

    return NextResponse.json({
      success: true,
      query,
      answer: cleanAnswer,
      analysisId: analysisIdStr,
      componentName: analysis.componentName,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Architecture analysis query failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process architecture analysis query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

