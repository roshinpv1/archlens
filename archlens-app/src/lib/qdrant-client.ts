/**
 * Qdrant Client for vector database operations
 * Supports both embedded Qdrant (in-process) and remote Qdrant server
 * 
 * Mode selection:
 * - Embedded: Set QDRANT_EMBEDDED=true (uses @qdrant/qdrant-js)
 * - Server: Set QDRANT_URL or use default localhost:6333 (uses @qdrant/js-client-rest)
 */

import { QdrantClient as QdrantSDK } from '@qdrant/js-client-rest';

export interface BlueprintVector {
  id: string;
  vector: number[];
  payload: {
    blueprintId: string;
    name: string;
    type: string;
    blueprintType?: string; // Original blueprint type (when type is 'blueprint' or 'blueprint_analysis')
    category: string;
    cloudProvider: string;
    complexity: string;
    tags: string[];
    content: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface SimilarBlueprint {
  id: string;
  score: number;
  blueprint: {
    id: string;
    name: string;
    type: string;
    category: string;
    cloudProvider: string;
    complexity: string;
    tags: string[];
  };
}

export interface QdrantConfig {
  url?: string;
  apiKey?: string;
  collectionName: string;
  vectorSize: number;
  distance: 'Cosine' | 'Euclid' | 'Dot';
}

export class QdrantError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'QdrantError';
  }
}

export class QdrantClient {
  private client: QdrantSDK;
  private config: QdrantConfig;
  private collectionName: string;

  constructor(config: QdrantConfig) {
    this.config = config;
    this.collectionName = config.collectionName;
    
    // Initialize Qdrant client
    this.client = new QdrantSDK({
      url: config.url || 'http://localhost:6333',
      apiKey: config.apiKey
    });
  }

  async initialize(): Promise<void> {
    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const collectionExists = collections.collections.some(
        (col: any) => col.name === this.collectionName
      );

      if (!collectionExists) {
        await this.createCollection();
      } else {
        // Verify collection dimensions match configuration
        const collectionInfo = await this.client.getCollection(this.collectionName);
        const actualVectorSize = collectionInfo.config?.params?.vectors?.size;
        
        if (actualVectorSize && actualVectorSize !== this.config.vectorSize) {
          console.warn(`⚠️ Collection dimension mismatch: collection has ${actualVectorSize}, config expects ${this.config.vectorSize}`);
          
          // Auto-fix if enabled via environment variable
          const autoFix = process.env.QDRANT_AUTO_FIX_DIMENSIONS === 'true';
          if (autoFix) {
            console.log(`🔄 Auto-fixing: Deleting and recreating collection with correct dimensions...`);
            await this.deleteCollection();
            await this.createCollection();
            console.log(`✅ Collection recreated with ${this.config.vectorSize} dimensions`);
          } else {
            console.warn(`⚠️ This will cause errors. To auto-fix, set QDRANT_AUTO_FIX_DIMENSIONS=true in your environment variables.`);
            console.warn(`⚠️ Or manually delete the collection: curl -X DELETE http://localhost:6333/collections/${this.collectionName}`);
          }
        }
      }

      console.log(`✅ Qdrant collection '${this.collectionName}' is ready`);
    } catch (error) {
      console.error('Failed to initialize Qdrant:', error);
      throw new QdrantError('Failed to initialize Qdrant client', undefined, error);
    }
  }

  private async createCollection(): Promise<void> {
    try {
      await this.client.createCollection(this.collectionName, {
        vectors: {
          size: this.config.vectorSize,
          distance: this.config.distance
        }
      });
      console.log(`✅ Created Qdrant collection '${this.collectionName}'`);
    } catch (error) {
      throw new QdrantError('Failed to create Qdrant collection', undefined, error);
    }
  }

  private async deleteCollection(): Promise<void> {
    try {
      await this.client.deleteCollection(this.collectionName);
      console.log(`🗑️ Deleted Qdrant collection '${this.collectionName}'`);
    } catch (error) {
      throw new QdrantError('Failed to delete Qdrant collection', undefined, error);
    }
  }

  private generatePointId(blueprintId: string): number {
    // Convert string ID to a valid Qdrant point ID (integer format)
    // Use a simple hash-based approach to generate consistent integer IDs
    const hash = this.simpleHash(blueprintId);
    // Ensure positive integer (Qdrant requires positive integers)
    return Math.abs(hash);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  async upsertBlueprint(blueprintVector: BlueprintVector): Promise<void> {
    try {
      const pointId = this.generatePointId(blueprintVector.id);
      const vectorDimensions = blueprintVector.vector.length;
      
      console.log(`🔄 Upserting blueprint vector: ${blueprintVector.id} -> ${pointId}`);
      console.log(`📊 Vector dimensions: ${vectorDimensions}`);
      console.log(`📋 Payload keys: ${Object.keys(blueprintVector.payload).join(', ')}`);
      
      // Check for dimension mismatch before attempting upsert
      const collectionInfo = await this.client.getCollection(this.collectionName);
      const expectedDimensions = collectionInfo.config?.params?.vectors?.size;
      
      if (expectedDimensions && vectorDimensions !== expectedDimensions) {
        const errorMsg = `Vector dimension mismatch: collection expects ${expectedDimensions} dimensions, but got ${vectorDimensions}. ` +
          `Please update QDRANT_VECTOR_SIZE environment variable to ${vectorDimensions} or delete the collection to recreate it.`;
        console.error(`❌ ${errorMsg}`);
        throw new QdrantError(errorMsg, 400);
      }
      
      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [
          {
            id: pointId,
            vector: blueprintVector.vector,
            payload: blueprintVector.payload
          }
        ]
      });
      console.log(`✅ Upserted blueprint vector: ${blueprintVector.id}`);
    } catch (error: any) {
      if (error instanceof QdrantError) {
        throw error; // Re-throw our custom errors
      }
      
      console.error('❌ Qdrant upsert error details:', {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        data: error?.data,
        response: error?.response?.data
      });
      
      // Check if it's a dimension error
      const errorData = error?.data?.status?.error || error?.response?.data?.status?.error || '';
      if (errorData.includes('dimension')) {
        const dimensionMatch = errorData.match(/expected dim: (\d+), got (\d+)/);
        if (dimensionMatch) {
          const expected = dimensionMatch[1];
          const got = dimensionMatch[2];
          const errorMsg = `Vector dimension mismatch: Qdrant collection expects ${expected} dimensions, but embedding model produces ${got} dimensions. ` +
            `Please set QDRANT_VECTOR_SIZE=${got} in your environment variables and restart the service, or delete the Qdrant collection to recreate it with the correct dimensions.`;
          throw new QdrantError(errorMsg, 400, error);
        }
      }
      
      throw new QdrantError('Failed to upsert blueprint vector', undefined, error);
    }
  }

  /**
   * Store any embedding in Qdrant (generic method for analysis embeddings, etc.)
   */
  async storeEmbedding(pointId: string | number, embedding: number[], payload: Record<string, any>): Promise<void> {
    try {
      const numericPointId = typeof pointId === 'string' ? this.generatePointId(pointId) : pointId;
      const vectorDimensions = embedding.length;
      
      console.log(`🔄 Storing embedding: ${pointId} -> ${numericPointId}`);
      console.log(`📊 Vector dimensions: ${vectorDimensions}`);
      
      // Check for dimension mismatch before attempting upsert
      const collectionInfo = await this.client.getCollection(this.collectionName);
      const expectedDimensions = collectionInfo.config?.params?.vectors?.size;
      
      if (expectedDimensions && vectorDimensions !== expectedDimensions) {
        const errorMsg = `Vector dimension mismatch: collection expects ${expectedDimensions} dimensions, but got ${vectorDimensions}. ` +
          `Please update QDRANT_VECTOR_SIZE environment variable to ${vectorDimensions} or delete the collection to recreate it.`;
        console.error(`❌ ${errorMsg}`);
        throw new QdrantError(errorMsg, 400);
      }
      
      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [
          {
            id: numericPointId,
            vector: embedding,
            payload
          }
        ]
      });
      
      console.log(`✅ Stored embedding: ${pointId}`);
    } catch (error: any) {
      if (error instanceof QdrantError) {
        throw error; // Re-throw our custom errors
      }
      
      console.error('❌ Qdrant store embedding error details:', {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        data: error?.data,
        response: error?.response?.data
      });
      
      // Check if it's a dimension error
      const errorData = error?.data?.status?.error || error?.response?.data?.status?.error || '';
      if (errorData.includes('dimension')) {
        const dimensionMatch = errorData.match(/expected dim: (\d+), got (\d+)/);
        if (dimensionMatch) {
          const expected = dimensionMatch[1];
          const got = dimensionMatch[2];
          const errorMsg = `Vector dimension mismatch: Qdrant collection expects ${expected} dimensions, but embedding model produces ${got} dimensions. ` +
            `Please set QDRANT_VECTOR_SIZE=${got} in your environment variables and restart the service, or delete the Qdrant collection to recreate it with the correct dimensions.`;
          throw new QdrantError(errorMsg, 400, error);
        }
      }
      
      throw new QdrantError('Failed to store embedding', undefined, error);
    }
  }

  async deleteBlueprint(vectorId: string): Promise<void> {
    try {
      await this.client.delete(this.collectionName, {
        wait: true,
        points: [vectorId]
      });
      console.log(`✅ Deleted blueprint vector: ${vectorId}`);
    } catch (error) {
      throw new QdrantError('Failed to delete blueprint vector', undefined, error);
    }
  }

  async searchSimilarBlueprints(
    queryVector: number[],
    limit: number = 2,
    scoreThreshold: number = 0.7
  ): Promise<SimilarBlueprint[]> {
    try {
      const searchResult = await this.client.search(this.collectionName, {
        vector: queryVector,
        limit,
        score_threshold: scoreThreshold,
        with_payload: true,
        // Filter to only blueprint embeddings (not analysis embeddings)
        filter: {
          must: [
            {
              key: 'type',
              match: {
                value: 'blueprint'
              }
            }
          ]
        }
      });

      return searchResult.map((point: any) => ({
        id: point.id,
        score: point.score,
        blueprint: {
          id: point.payload.blueprintId,
          name: point.payload.name,
          type: point.payload.blueprintType || point.payload.type, // Use blueprintType if available
          category: point.payload.category,
          cloudProvider: point.payload.cloudProvider,
          complexity: point.payload.complexity,
          tags: point.payload.tags
        }
      }));
    } catch (error) {
      throw new QdrantError('Failed to search similar blueprints', undefined, error);
    }
  }

  async searchSimilarAnalysis(
    queryVector: number[],
    limit: number = 2,
    scoreThreshold: number = 0.7
  ): Promise<SimilarBlueprint[]> {
    try {
      const searchResult = await this.client.search(this.collectionName, {
        vector: queryVector,
        limit,
        score_threshold: scoreThreshold,
        with_payload: true,
        // Filter to both blueprint_analysis and architecture_analysis
        filter: {
          should: [
            {
              key: 'type',
              match: {
                value: 'blueprint_analysis'
              }
            },
            {
              key: 'type',
              match: {
                value: 'architecture_analysis'
              }
            }
          ]
        }
      });

      return searchResult.map((point: any) => ({
        id: point.id,
        score: point.score,
        blueprint: {
          id: point.payload.blueprintId || point.payload.analysisId || 'unknown',
          name: point.payload.blueprintName || point.payload.analysisName || 'Unknown',
          type: point.payload.type === 'architecture_analysis' ? 'architecture_analysis' : 'analysis',
          category: point.payload.architecturePatterns?.[0] || point.payload.architectureType || 'Unknown',
          cloudProvider: point.payload.technologyStack?.[0] || point.payload.cloudProviders?.[0] || 'Unknown',
          complexity: point.payload.componentCount > 10 ? 'high' : point.payload.componentCount > 5 ? 'medium' : 'low',
          tags: point.payload.architecturePatterns || []
        }
      }));
    } catch (error) {
      throw new QdrantError('Failed to search similar analysis', undefined, error);
    }
  }

  async getBlueprint(vectorId: string): Promise<BlueprintVector | null> {
    try {
      const result = await this.client.retrieve(this.collectionName, {
        ids: [vectorId],
        with_payload: true,
        with_vector: true
      });

      if (result.length === 0) {
        return null;
      }

      const point = result[0];
      return {
        id: String(point.id),
        vector: point.vector as number[],
        payload: point.payload as BlueprintVector['payload']
      };
    } catch (error) {
      throw new QdrantError('Failed to get blueprint vector', undefined, error);
    }
  }

  async updateBlueprintPayload(
    vectorId: string,
    payload: Partial<BlueprintVector['payload']>
  ): Promise<void> {
    try {
      await this.client.setPayload(this.collectionName, {
        wait: true,
        payload,
        points: [vectorId]
      });
      console.log(`✅ Updated blueprint vector payload: ${vectorId}`);
    } catch (error) {
      throw new QdrantError('Failed to update blueprint vector payload', undefined, error);
    }
  }

  async getCollectionInfo(): Promise<{
    name: string;
    vectorsCount: number;
    vectorSize: number;
    distance: string;
  }> {
    try {
      const collection = await this.client.getCollection(this.collectionName);
      return {
        name: this.collectionName,
        vectorsCount: collection.vectors_count || 0,
        vectorSize: 384, // Default vector size
        distance: 'Cosine' // Default distance metric
      };
    } catch (error) {
      throw new QdrantError('Failed to get collection info', undefined, error);
    }
  }

  async clearCollection(): Promise<void> {
    try {
      // Delete all points in the collection
      await this.client.delete(this.collectionName, {
        wait: true,
        points: {
          filter: {}
        }
      } as any);
      console.log(`✅ Cleared collection '${this.collectionName}'`);
    } catch (error) {
      throw new QdrantError('Failed to clear collection', undefined, error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.getCollections();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Factory function to create Qdrant client from environment
export function createQdrantClientFromEnv(): QdrantClient | null {
  const config: QdrantConfig = {
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: process.env.QDRANT_COLLECTION_NAME || 'blueprints',
    vectorSize: parseInt(process.env.QDRANT_VECTOR_SIZE || '384'),
    distance: (process.env.QDRANT_DISTANCE as 'Cosine' | 'Euclid' | 'Dot') || 'Cosine'
  };

  try {
    const client = new QdrantClient(config);
    return client;
  } catch (error) {
    console.error('Failed to create Qdrant client:', error);
    return null;
  }
}

// Global Qdrant client instance
let globalQdrantClient: QdrantClient | null = null;

export async function getQdrantClient(): Promise<QdrantClient> {
  if (!globalQdrantClient) {
    globalQdrantClient = createQdrantClientFromEnv();
    if (!globalQdrantClient) {
      throw new QdrantError('Failed to create Qdrant client');
    }
    await globalQdrantClient.initialize();
  }
  return globalQdrantClient;
}
