import { NextRequest, NextResponse } from 'next/server';
import { getEmbeddingService } from '@/services/embeddingService';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing embedding service...');
    
    // Check environment variables
    const envVars = {
      EMBEDDINGS_PROVIDER: process.env.EMBEDDINGS_PROVIDER,
      EMBEDDINGS_MODEL: process.env.EMBEDDINGS_MODEL,
      EMBEDDINGS_BASE_URL: process.env.EMBEDDINGS_BASE_URL,
      EMBEDDINGS_API_KEY: process.env.EMBEDDINGS_API_KEY ? '***SET***' : 'NOT_SET',
      EMBEDDINGS_DIMENSIONS: process.env.EMBEDDINGS_DIMENSIONS,
      QDRANT_URL: process.env.QDRANT_URL,
      QDRANT_API_KEY: process.env.QDRANT_API_KEY ? '***SET***' : 'NOT_SET'
    };
    
    console.log('📊 Environment variables:', envVars);
    
    // Test embedding service
    const embeddingService = getEmbeddingService();
    const isAvailable = embeddingService.isAvailable();
    
    console.log(`📊 Embedding service available: ${isAvailable}`);
    
    // Test with a simple blueprint
    const testBlueprint = {
      id: 'test-123',
      name: 'Test Blueprint',
      description: 'This is a test blueprint for embedding generation',
      type: 'architecture' as const,
      category: 'e-commerce' as const,
      tags: ['test', 'blueprint'],
      cloudProviders: ['AWS'],
      complexity: 'medium' as const,
      metadata: {
        components: 3,
        connections: 2,
        estimatedCost: 100,
        deploymentTime: '1 day'
      }
    };
    
    let embeddingResult = null;
    if (isAvailable) {
      try {
        console.log('🔄 Testing embedding generation...');
        embeddingResult = await embeddingService.processBlueprintEmbedding(testBlueprint);
        console.log('📊 Embedding result:', embeddingResult);
      } catch (error) {
        console.error('❌ Embedding generation failed:', error);
        embeddingResult = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    
    return NextResponse.json({
      status: 'success',
      environment: envVars,
      embeddingService: {
        available: isAvailable,
        result: embeddingResult
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
