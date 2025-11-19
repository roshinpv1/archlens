import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/analysisService';
import { getEmbeddingService } from '@/services/embeddingService';
import { createLLMClientFromEnv } from '@/lib/llm-factory';
import Blueprint from '@/models/Blueprint';
import BlueprintAnalysis from '@/models/BlueprintAnalysis';
import { cleanMarkdown } from '@/utils/cleanMarkdown';

/**
 * Query a specific blueprint using natural language
 * Uses LLM to answer questions about the blueprint and its analysis
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const resolvedParams = await params;
    const blueprintId = resolvedParams.id;
    
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    if (!blueprintId) {
      return NextResponse.json(
        { error: 'Blueprint ID is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Processing query for blueprint ${blueprintId}: "${query}"`);

    // Fetch blueprint and analysis
    const blueprint = await Blueprint.findOne({ id: blueprintId }).lean();
    if (!blueprint) {
      return NextResponse.json(
        { error: 'Blueprint not found' },
        { status: 404 }
      );
    }

    const analysis = await BlueprintAnalysis.findOne({ blueprintId }).lean();

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

    // Blueprint basic info
    contextParts.push(`
**BLUEPRINT INFORMATION:**
- Name: ${blueprint.name}
- Description: ${blueprint.description}
- Type: ${blueprint.type}
- Category: ${blueprint.category}
- Complexity: ${blueprint.complexity}
- Cloud Providers: ${blueprint.cloudProviders?.join(', ') || 'None'}
- Tags: ${blueprint.tags?.join(', ') || 'None'}
- Version: ${blueprint.version}
- Created: ${blueprint.createdAt}
- Updated: ${blueprint.updatedAt}
`);

    // Metadata
    if (blueprint.metadata) {
      const metadata = blueprint.metadata as any;
      contextParts.push(`
**METADATA:**
- Components Count: ${metadata.components || 0}
- Connections Count: ${metadata.connections || 0}
- Estimated Cost: $${metadata.estimatedCost || 0}/month
- Deployment Time: ${metadata.deploymentTime || 'Unknown'}
- Architecture Type: ${metadata.architectureType || 'Unknown'}
- Hybrid Cloud Model: ${metadata.hybridCloudModel || 'Unknown'}
- Primary Cloud Provider: ${metadata.primaryCloudProvider || 'Unknown'}
- Primary Purpose: ${metadata.primaryPurpose || 'Unknown'}
- Environment Type: ${metadata.environmentType || 'Unknown'}
- Deployment Model: ${metadata.deploymentModel || 'Unknown'}
`);
    }

    // Extracted components
    const metadata = blueprint.metadata as any;
    const extractedComponents = metadata?.extractedComponents || [];
    if (extractedComponents.length > 0) {
      contextParts.push(`
**EXTRACTED COMPONENTS (${extractedComponents.length}):**
${extractedComponents.map((comp: any, idx: number) => 
  `${idx + 1}. ${comp.name || comp.id || 'Component'} (${comp.type || 'unknown'})${comp.cloudProvider ? ` - ${comp.cloudProvider}` : ''}${comp.cloudService ? ` - ${comp.cloudService}` : ''}${comp.description ? `: ${comp.description}` : ''}`
).join('\n')}
`);
    }

    // Extracted connections
    const extractedConnections = metadata?.extractedConnections || [];
    if (extractedConnections.length > 0) {
      contextParts.push(`
**EXTRACTED CONNECTIONS (${extractedConnections.length}):**
${extractedConnections.map((conn: any, idx: number) => 
  `${idx + 1}. ${conn.source || 'unknown'} → ${conn.target || 'unknown'} (${conn.type || conn.protocol || 'connection'})${conn.description ? `: ${conn.description}` : ''}`
).join('\n')}
`);
    }

    // Analysis data
    if (analysis) {
      contextParts.push(`
**ANALYSIS RESULTS:**

Scores (0-100):
- Security: ${analysis.scores?.security || 0}
- Resiliency: ${analysis.scores?.resiliency || 0}
- Cost Efficiency: ${analysis.scores?.costEfficiency || 0}
- Compliance: ${analysis.scores?.compliance || 0}
- Scalability: ${analysis.scores?.scalability || 0}
- Maintainability: ${analysis.scores?.maintainability || 0}

Architecture Patterns: ${analysis.architecturePatterns?.join(', ') || 'None'}
Technology Stack: ${analysis.technologyStack?.join(', ') || 'None'}

Component Complexity:
- Total Components: ${analysis.componentComplexity?.totalComponents || 0}
- Critical Components: ${analysis.componentComplexity?.criticalComponents || 0}
- High Coupling Components: ${analysis.componentComplexity?.highCouplingComponents || 0}
- Scalability Bottlenecks: ${analysis.componentComplexity?.scalabilityBottlenecks?.join(', ') || 'None'}
- Integration Points: ${analysis.componentComplexity?.integrationPoints || 0}
`);

      // Analysis components
      if (analysis.components && analysis.components.length > 0) {
        contextParts.push(`
**ANALYZED COMPONENTS (${analysis.components.length}):**
${analysis.components.map((comp: any, idx: number) => 
  `${idx + 1}. ${comp.name} (${comp.type})
     - Technology: ${comp.technology}
     - Criticality: ${comp.criticality}
     - Scalability: ${comp.scalability}
     - Security Level: ${comp.securityLevel}
     - Cost Impact: ${comp.costImpact}
     ${comp.description ? `- Description: ${comp.description}` : ''}
     ${comp.dependencies && comp.dependencies.length > 0 ? `- Dependencies: ${comp.dependencies.join(', ')}` : ''}`
).join('\n\n')}
`);
      }

      // Component relationships
      if (analysis.componentRelationships && analysis.componentRelationships.length > 0) {
        contextParts.push(`
**COMPONENT RELATIONSHIPS (${analysis.componentRelationships.length}):**
${analysis.componentRelationships.map((rel: any, idx: number) => 
  `${idx + 1}. ${rel.source} ${rel.relationship} ${rel.target} (strength: ${rel.strength})${rel.dataFlow ? ` - ${rel.dataFlow}` : ''}${rel.protocol ? ` via ${rel.protocol}` : ''}`
).join('\n')}
`);
      }

      // Recommendations
      if (analysis.recommendations && analysis.recommendations.length > 0) {
        contextParts.push(`
**RECOMMENDATIONS (${analysis.recommendations.length}):**
${analysis.recommendations.map((rec: any, idx: number) => 
  `${idx + 1}. [${rec.priority || 'medium'} priority] ${rec.component || 'General'}: ${rec.issue}
     Recommendation: ${rec.recommendation}
     Impact: ${rec.impact}, Effort: ${rec.effort}, Confidence: ${(rec.confidence * 100).toFixed(0)}%`
).join('\n\n')}
`);
      }

      // Insights
      if (analysis.insights && analysis.insights.length > 0) {
        contextParts.push(`
**KEY INSIGHTS:**
${analysis.insights.map((insight: string, idx: number) => `${idx + 1}. ${insight}`).join('\n')}
`);
      }

      // Best practices
      if (analysis.bestPractices && analysis.bestPractices.length > 0) {
        contextParts.push(`
**BEST PRACTICES:**
${analysis.bestPractices.map((bp: string, idx: number) => `${idx + 1}. ${bp}`).join('\n')}
`);
      }

      // Industry standards
      if (analysis.industryStandards && analysis.industryStandards.length > 0) {
        contextParts.push(`
**INDUSTRY STANDARDS:**
${analysis.industryStandards.map((std: string, idx: number) => `${idx + 1}. ${std}`).join('\n')}
`);
      }
    }

    const context = contextParts.join('\n');

    // Generate LLM prompt
    const llmPrompt = `You are an expert cloud architect assistant. Answer the user's question about this specific blueprint using the comprehensive information provided below.

USER QUESTION: ${query}

BLUEPRINT CONTEXT:
${context}

INSTRUCTIONS:
1. Answer the user's question using ONLY the information provided in the blueprint context above
2. Be specific and cite exact values, components, or recommendations when relevant
3. If the question asks about components, reference them by name and provide details
4. If the question asks about scores or metrics, provide the exact numbers
5. If the question asks for recommendations, list them with priorities
6. If the question asks about architecture patterns or technology stack, provide the exact information
7. If the information is not available in the context, say so clearly
8. Be concise but comprehensive in your answer

Provide a helpful, accurate answer based on the blueprint information provided.`;

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
      blueprintId,
      blueprintName: blueprint.name,
      hasAnalysis: !!analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Blueprint query failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process blueprint query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

