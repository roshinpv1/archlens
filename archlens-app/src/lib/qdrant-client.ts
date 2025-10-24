/**
 * Qdrant Client for vector database operations
 * Supports embedded Qdrant for local development and production
 */

import { QdrantClient as QdrantSDK } from '@qdrant/js-client-rest';

export interface BlueprintVector {
  id: string;
  vector: number[];
  payload: {
    blueprintId: string;
    name: string;
    type: string;
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

  private generatePointId(blueprintId: string): string {
    // Convert string ID to a valid Qdrant point ID (UUID format)
    // Use a simple hash-based approach to generate consistent UUIDs
    const hash = this.simpleHash(blueprintId);
    return `${hash.toString(16).padStart(8, '0')}-0000-4000-8000-${hash.toString(16).padStart(12, '0')}`;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async upsertBlueprint(blueprintVector: BlueprintVector): Promise<void> {
    try {
      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [
          {
            id: this.generatePointId(blueprintVector.id),
            vector: blueprintVector.vector,
            payload: blueprintVector.payload
          }
        ]
      });
      console.log(`✅ Upserted blueprint vector: ${blueprintVector.id}`);
    } catch (error) {
      throw new QdrantError('Failed to upsert blueprint vector', undefined, error);
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
        with_payload: true
      });

      return searchResult.map((point: any) => ({
        id: point.id,
        score: point.score,
        blueprint: {
          id: point.payload.blueprintId,
          name: point.payload.name,
          type: point.payload.type,
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
        vectorSize: 768, // Default vector size
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
    vectorSize: parseInt(process.env.QDRANT_VECTOR_SIZE || '768'),
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
