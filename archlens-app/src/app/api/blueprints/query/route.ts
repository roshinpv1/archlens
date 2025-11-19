import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/analysisService';
import { getEmbeddingService } from '@/services/embeddingService';
import { getSimilarityService } from '@/services/similarityService';
import { createLLMClientFromEnv } from '@/lib/llm-factory';
import { getVectorStore } from '@/lib/vector-store';
import Blueprint from '@/models/Blueprint';
import BlueprintAnalysis from '@/models/BlueprintAnalysis';
import { cleanMarkdown } from '@/utils/cleanMarkdown';

/**
 * Query blueprints using natural language
 * Uses vector store (Qdrant or FAISS) for similarity search and LLM for intelligent responses
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { query, limit = 5, threshold = 0.7 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    console.log(`🔍 Processing blueprint query: "${query}"`);

    // Step 1: Generate embedding for the query
    const embeddingService = getEmbeddingService();
    if (!embeddingService.isAvailable()) {
      return NextResponse.json(
        { error: 'Embedding service not available' },
        { status: 500 }
      );
    }

    console.log('📊 Generating query embedding...');
    const queryEmbeddingResult = await embeddingService.generateEmbeddingFromText(query);
    
    if (!queryEmbeddingResult.success || !queryEmbeddingResult.embedding) {
      return NextResponse.json(
        { error: 'Failed to generate query embedding', details: queryEmbeddingResult.error },
        { status: 500 }
      );
    }

    // Step 2: Search vector store for similar blueprints
    console.log('🔍 Searching vector store for similar blueprints...');
    const similarityService = getSimilarityService();
    const vectorStore = await getVectorStore();
    
    // Search both blueprint embeddings and analysis embeddings
    const blueprintSearchResult = await vectorStore.searchSimilarBlueprints(
      queryEmbeddingResult.embedding,
      limit,
      threshold
    );

    const analysisSearchResult = await vectorStore.searchSimilarAnalysis(
      queryEmbeddingResult.embedding,
      limit,
      threshold
    );

    // Combine and deduplicate results
    const allResults = [...blueprintSearchResult, ...analysisSearchResult];
    const uniqueResults = allResults.reduce((acc, current) => {
      const existing = acc.find(item => item.blueprint.id === current.blueprint.id);
      if (!existing) {
        acc.push(current);
      } else if (current.score > existing.score) {
        const index = acc.indexOf(existing);
        acc[index] = current;
      }
      return acc;
    }, [] as typeof allResults);

    // Sort by score and limit
    const topResults = uniqueResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    console.log(`✅ Found ${topResults.length} similar blueprints`);

    // Step 3: Fetch full blueprint and analysis data from MongoDB
    const blueprintIds = topResults.map(r => r.blueprint.id);
    const blueprints = await Blueprint.find({ id: { $in: blueprintIds } }).lean();
    const blueprintAnalyses = await BlueprintAnalysis.find({ 
      blueprintId: { $in: blueprintIds } 
    }).lean();

    // Create a map for quick lookup
    const blueprintMap = new Map(blueprints.map(bp => [bp.id, bp]));
    const analysisMap = new Map(blueprintAnalyses.map(analysis => [analysis.blueprintId, analysis]));

    // Step 4: Prepare context for LLM
    const contextBlueprints = topResults.map(result => {
      const blueprint = blueprintMap.get(result.blueprint.id);
      const analysis = analysisMap.get(result.blueprint.id);
      
      return {
        blueprint: blueprint || null,
        analysis: analysis || null,
        similarityScore: result.score
      };
    }).filter(item => item.blueprint !== null);

    // Step 5: Use LLM to process query with context
    const llmClient = createLLMClientFromEnv();
    if (!llmClient) {
      return NextResponse.json(
        { error: 'LLM client not available' },
        { status: 500 }
      );
    }

    // Build context string
    const contextString = contextBlueprints.map((item, index) => {
      const bp = item.blueprint!;
      const analysis = item.analysis;
      
      let context = `
Blueprint ${index + 1} (Similarity: ${(item.similarityScore * 100).toFixed(1)}%):
- Name: ${bp.name}
- Description: ${bp.description}
- Type: ${bp.type}
- Category: ${bp.category}
- Cloud Providers: ${bp.cloudProviders?.join(', ') || 'Unknown'}
- Complexity: ${bp.complexity}
- Tags: ${bp.tags?.join(', ') || 'None'}
- Components: ${bp.metadata?.components || 0}
- Connections: ${bp.metadata?.connections || 0}
`;

      if (analysis) {
        context += `
- Analysis Scores:
  * Security: ${analysis.scores?.security || 0}/100
  * Resiliency: ${analysis.scores?.resiliency || 0}/100
  * Cost Efficiency: ${analysis.scores?.costEfficiency || 0}/100
  * Compliance: ${analysis.scores?.compliance || 0}/100
  * Scalability: ${analysis.scores?.scalability || 0}/100
  * Maintainability: ${analysis.scores?.maintainability || 0}/100
- Architecture Patterns: ${analysis.architecturePatterns?.join(', ') || 'None'}
- Technology Stack: ${analysis.technologyStack?.join(', ') || 'None'}
- Key Insights: ${analysis.insights?.slice(0, 3).join('; ') || 'None'}
`;
      }

      return context;
    }).join('\n');

    const llmPrompt = `You are an expert cloud architect assistant. Answer the user's question about blueprints using the context provided below.

USER QUESTION: ${query}

AVAILABLE BLUEPRINTS (found via similarity search):
${contextString}

INSTRUCTIONS:
1. Analyze the user's question carefully
2. Use the blueprint information provided above to answer the question
3. If the question asks about specific blueprints, reference them by name and similarity score
4. If the question asks for recommendations, suggest relevant blueprints from the context
5. If the question asks about patterns, technologies, or best practices, extract insights from the blueprint analyses
6. Be specific and cite which blueprints support your answer
7. If no relevant information is found in the context, say so clearly

Provide a comprehensive, helpful answer based on the blueprint context provided.`;

    console.log('🤖 Processing query with LLM...');
    const llmResponse = await llmClient.callLLM(llmPrompt, {
      temperature: 0.7,
      maxTokens: 2000
    });

    // Clean markdown from LLM response
    const cleanAnswer = cleanMarkdown(llmResponse);

    // Step 6: Return response
    return NextResponse.json({
      success: true,
      query,
      answer: cleanAnswer,
      relevantBlueprints: contextBlueprints.map(item => ({
        blueprint: {
          id: item.blueprint!.id,
          name: item.blueprint!.name,
          description: item.blueprint!.description,
          type: item.blueprint!.type,
          category: item.blueprint!.category,
          cloudProviders: item.blueprint!.cloudProviders,
          complexity: item.blueprint!.complexity,
          tags: item.blueprint!.tags
        },
        analysis: item.analysis ? {
          scores: item.analysis.scores,
          architecturePatterns: item.analysis.architecturePatterns,
          technologyStack: item.analysis.technologyStack,
          insights: item.analysis.insights?.slice(0, 3)
        } : null,
        similarityScore: item.similarityScore
      })),
      totalResults: topResults.length,
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

