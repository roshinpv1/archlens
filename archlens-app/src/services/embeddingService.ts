/**
 * Embedding Service for blueprint vector generation and management
 */

import { createEmbeddingsClientFromEnv, EmbeddingsClient } from '../lib/embeddings-client';
import { getQdrantClient, BlueprintVector } from '../lib/qdrant-client';
import { Blueprint } from '../types/blueprint';

export interface EmbeddingResult {
  success: boolean;
  vectorId?: string;
  embedding?: number[];
  error?: string;
}

export interface BlueprintContent {
  name: string;
  description: string;
  type: string;
  category: string;
  cloudProvider: string;
  complexity: string;
  tags: string[];
  components?: string[];
  connections?: string[];
  metadata?: Record<string, unknown>;
}

export class EmbeddingService {
  private embeddingsClient: EmbeddingsClient | null = null;
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      console.log('🔄 Initializing embedding service...');
      console.log('📊 Environment variables:', {
        EMBEDDINGS_PROVIDER: process.env.EMBEDDINGS_PROVIDER,
        EMBEDDINGS_MODEL: process.env.EMBEDDINGS_MODEL,
        EMBEDDINGS_BASE_URL: process.env.EMBEDDINGS_BASE_URL,
        EMBEDDINGS_API_KEY: process.env.EMBEDDINGS_API_KEY ? '***SET***' : 'NOT_SET',
        EMBEDDINGS_DIMENSIONS: process.env.EMBEDDINGS_DIMENSIONS
      });
      
      this.embeddingsClient = createEmbeddingsClientFromEnv();
      if (!this.embeddingsClient) {
        console.warn('⚠️ No embeddings client available - check environment variables');
        return;
      }

      if (!this.embeddingsClient.isAvailable()) {
        console.warn('⚠️ Embeddings client not available - check Ollama/Qdrant services');
        return;
      }

      this.initialized = true;
      console.log('✅ Embedding service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize embedding service:', error);
    }
  }

  isAvailable(): boolean {
    return this.initialized && this.embeddingsClient?.isAvailable() === true;
  }

  /**
   * Generate embedding for blueprint content
   */
  async generateBlueprintEmbedding(blueprint: Blueprint): Promise<EmbeddingResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Embedding service not available'
      };
    }

    try {
      const content = this.extractBlueprintContent(blueprint);
      const embedding = await this.embeddingsClient!.generateEmbedding(content);
      
      return {
        success: true,
        embedding
      };
    } catch (error) {
      console.error('Failed to generate blueprint embedding:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Store blueprint embedding in Qdrant
   */
  async storeBlueprintEmbedding(
    blueprint: Blueprint,
    embedding: number[]
  ): Promise<EmbeddingResult> {
    try {
      const qdrantClient = await getQdrantClient();
      const vectorId = `blueprint_${blueprint.id}`;
      
      const blueprintVector: BlueprintVector = {
        id: vectorId,
        vector: embedding,
        payload: {
          blueprintId: blueprint.id,
          name: blueprint.name,
          type: 'blueprint', // Mark as blueprint embedding
          blueprintType: blueprint.type, // Original blueprint type
          category: blueprint.category,
          cloudProvider: blueprint.cloudProviders.join(', '),
          complexity: blueprint.complexity,
          tags: blueprint.tags,
          content: this.extractBlueprintContent(blueprint),
          createdAt: blueprint.createdAt ? new Date(blueprint.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      await qdrantClient.upsertBlueprint(blueprintVector);
      
      return {
        success: true,
        vectorId
      };
    } catch (error) {
      console.error('Failed to store blueprint embedding:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate and store blueprint embedding in one operation
   */
  async processBlueprintEmbedding(blueprint: Blueprint): Promise<EmbeddingResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Embedding service not available'
      };
    }

    try {
      // Generate embedding
      const embeddingResult = await this.generateBlueprintEmbedding(blueprint);
      if (!embeddingResult.success || !embeddingResult.embedding) {
        return embeddingResult;
      }

      // Store embedding
      const storeResult = await this.storeBlueprintEmbedding(blueprint, embeddingResult.embedding);
      return storeResult;
    } catch (error) {
      console.error('Failed to process blueprint embedding:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update blueprint embedding when blueprint is modified
   */
  async updateBlueprintEmbedding(blueprint: Blueprint): Promise<EmbeddingResult> {
    try {
      // Generate new embedding
      const embeddingResult = await this.generateBlueprintEmbedding(blueprint);
      if (!embeddingResult.success || !embeddingResult.embedding) {
        return embeddingResult;
      }

      // Update in Qdrant
      const qdrantClient = await getQdrantClient();
      const vectorId = `blueprint_${blueprint.id}`;
      
      const blueprintVector: BlueprintVector = {
        id: vectorId,
        vector: embeddingResult.embedding,
        payload: {
          blueprintId: blueprint.id,
          name: blueprint.name,
          type: 'blueprint', // Mark as blueprint embedding
          blueprintType: blueprint.type, // Original blueprint type
          category: blueprint.category,
          cloudProvider: blueprint.cloudProviders.join(', '),
          complexity: blueprint.complexity,
          tags: blueprint.tags,
          content: this.extractBlueprintContent(blueprint),
          createdAt: blueprint.createdAt ? new Date(blueprint.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      await qdrantClient.upsertBlueprint(blueprintVector);
      
      return {
        success: true,
        vectorId
      };
    } catch (error) {
      console.error('Failed to update blueprint embedding:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete blueprint embedding
   */
  async deleteBlueprintEmbedding(blueprintId: string): Promise<EmbeddingResult> {
    try {
      const qdrantClient = await getQdrantClient();
      const vectorId = `blueprint_${blueprintId}`;
      
      await qdrantClient.deleteBlueprint(vectorId);
      
      return {
        success: true,
        vectorId
      };
    } catch (error) {
      console.error('Failed to delete blueprint embedding:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Extract comprehensive content from blueprint for embedding
   */
  private extractBlueprintContent(blueprint: Blueprint & { extractedComponents?: any[]; extractedConnections?: any[] }): string {
    // Check for extracted components first, then fall back to metadata
    const componentsArray = (blueprint as any).extractedComponents || 
                           blueprint.metadata?.extractedComponents || 
                           blueprint.metadata?.components || 
                           [];
    
    const connectionsArray = (blueprint as any).extractedConnections || 
                             blueprint.metadata?.extractedConnections || 
                             blueprint.metadata?.connections || 
                             [];
    
    const components = Array.isArray(componentsArray)
      ? componentsArray.map(c => {
          if (typeof c === 'string') return c;
          const comp = c as any;
          return `${comp.name || comp.id || 'component'} (${comp.type || 'unknown'})${comp.cloudProvider ? ` - ${comp.cloudProvider}` : ''}${comp.cloudService ? ` - ${comp.cloudService}` : ''}`;
        }).join('; ')
      : '';
    
    const connections = Array.isArray(connectionsArray)
      ? connectionsArray.map(c => {
          if (typeof c === 'string') return c;
          const conn = c as any;
          return `${conn.source || 'unknown'} → ${conn.target || 'unknown'} (${conn.type || conn.protocol || 'connection'})`;
        }).join('; ')
      : '';

    // Include metadata information
    const metadataInfo = blueprint.metadata ? `
Architecture Type: ${blueprint.metadata.architectureType || 'Unknown'}
Hybrid Cloud Model: ${blueprint.metadata.hybridCloudModel || 'Unknown'}
Primary Cloud Provider: ${blueprint.metadata.primaryCloudProvider || 'Unknown'}
Primary Purpose: ${blueprint.metadata.primaryPurpose || 'Unknown'}
Environment Type: ${blueprint.metadata.environmentType || 'Unknown'}
Deployment Model: ${blueprint.metadata.deploymentModel || 'Unknown'}
` : '';

    return `
Name: ${blueprint.name}
Description: ${blueprint.description}
Type: ${blueprint.type}
Category: ${blueprint.category}
Cloud Providers: ${blueprint.cloudProviders.join(', ')}
Complexity: ${blueprint.complexity}
Tags: ${blueprint.tags.join(', ')}
${metadataInfo}
Components (${componentsArray.length}): ${components}
Connections (${connectionsArray.length}): ${connections}
Estimated Cost: ${blueprint.metadata?.estimatedCost || 'Unknown'}
Deployment Time: ${blueprint.metadata?.deploymentTime || 'Unknown'}
`.trim();
  }

  /**
   * Generate embedding for analysis content (for similarity search)
   */
  async generateAnalysisEmbedding(analysisContent: {
    components: unknown[];
    connections: unknown[];
    description?: string;
    metadata?: Record<string, unknown>;
  }): Promise<EmbeddingResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Embedding service not available'
      };
    }

    try {
      const content = this.extractAnalysisContent(analysisContent);
      const embedding = await this.embeddingsClient!.generateEmbedding(content);
      
      return {
        success: true,
        embedding
      };
    } catch (error) {
      console.error('Failed to generate analysis embedding:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate embedding from text string (simple method for direct text input)
   */
  async generateEmbeddingFromText(text: string): Promise<EmbeddingResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Embedding service not available'
      };
    }

    try {
      const embedding = await this.embeddingsClient!.generateEmbedding(text);
      return {
        success: true,
        embedding
      };
    } catch (error) {
      console.error('Failed to generate embedding from text:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Extract content from analysis for embedding
   */
  private extractAnalysisContent(analysisContent: {
    components: unknown[];
    connections: unknown[];
    description?: string;
    metadata?: Record<string, unknown>;
  }): string {
    const components = analysisContent.components.map(c => {
      if (typeof c === 'string') return c;
      const comp = c as Record<string, unknown>;
      return `${comp.name || 'component'} (${comp.type || 'unknown'})`;
    }).join(', ');
    
    const connections = analysisContent.connections.map(c => {
      if (typeof c === 'string') return c;
      const conn = c as Record<string, unknown>;
      return `${conn.type || 'connection'}`;
    }).join(', ');

    const cloudProviders = Array.isArray(analysisContent.metadata?.cloudProviders)
      ? (analysisContent.metadata.cloudProviders as string[]).join(', ')
      : 'Unknown';

    return `
Description: ${analysisContent.description || 'Architecture analysis'}
Components: ${components}
Connections: ${connections}
Architecture Type: ${analysisContent.metadata?.architectureType || 'Unknown'}
Cloud Providers: ${cloudProviders}
Complexity: ${analysisContent.metadata?.estimatedComplexity || 'Unknown'}
Purpose: ${analysisContent.metadata?.primaryPurpose || 'Architecture analysis'}
Environment: ${analysisContent.metadata?.environmentType || 'Unknown'}
`.trim();
  }
}

// Global embedding service instance
let globalEmbeddingService: EmbeddingService | null = null;

export function getEmbeddingService(): EmbeddingService {
  if (!globalEmbeddingService) {
    globalEmbeddingService = new EmbeddingService();
  }
  return globalEmbeddingService;
}
