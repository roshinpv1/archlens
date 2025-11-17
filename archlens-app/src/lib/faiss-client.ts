/**
 * FAISS-like In-Memory Vector Store
 * Provides local, in-memory vector storage and similarity search
 * Alternative to Qdrant for local development and simple deployments
 */

export interface VectorPoint {
  id: string | number;
  vector: number[];
  payload: Record<string, any>;
}

export interface VectorStoreConfig {
  vectorSize: number;
  distance: 'Cosine' | 'Euclidean' | 'Dot';
  collectionName: string;
}

export class FaissClient {
  private vectors: Map<string | number, VectorPoint> = new Map();
  private config: VectorStoreConfig;
  private collectionName: string;

  constructor(config: VectorStoreConfig) {
    this.config = config;
    this.collectionName = config.collectionName;
  }

  /**
   * Initialize the vector store
   */
  async initialize(): Promise<void> {
    // In-memory store doesn't need initialization
    console.log(`✅ FAISS in-memory vector store '${this.collectionName}' initialized`);
  }

  /**
   * Add or update a vector
   */
  async upsert(point: VectorPoint): Promise<void> {
    // Validate vector dimensions
    if (point.vector.length !== this.config.vectorSize) {
      throw new Error(
        `Vector dimension mismatch: expected ${this.config.vectorSize}, got ${point.vector.length}`
      );
    }

    this.vectors.set(point.id, point);
  }

  /**
   * Store embedding with metadata
   */
  async storeEmbedding(
    pointId: string | number,
    embedding: number[],
    payload: Record<string, any>
  ): Promise<void> {
    if (embedding.length !== this.config.vectorSize) {
      throw new Error(
        `Vector dimension mismatch: expected ${this.config.vectorSize}, got ${embedding.length}`
      );
    }

    this.vectors.set(pointId, {
      id: pointId,
      vector: embedding,
      payload
    });
  }

  /**
   * Search for similar vectors
   */
  async search(
    queryVector: number[],
    limit: number = 10,
    scoreThreshold: number = 0.0,
    filter?: (payload: Record<string, any>) => boolean
  ): Promise<Array<{ id: string | number; score: number; payload: Record<string, any> }>> {
    if (queryVector.length !== this.config.vectorSize) {
      throw new Error(
        `Query vector dimension mismatch: expected ${this.config.vectorSize}, got ${queryVector.length}`
      );
    }

    const results: Array<{ id: string | number; score: number; payload: Record<string, any> }> = [];

    // Calculate similarity for all vectors
    for (const [id, point] of this.vectors.entries()) {
      // Apply filter if provided
      if (filter && !filter(point.payload)) {
        continue;
      }

      const score = this.calculateSimilarity(queryVector, point.vector);
      
      if (score >= scoreThreshold) {
        results.push({
          id,
          score,
          payload: point.payload
        });
      }
    }

    // Sort by score (descending) and return top K
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  /**
   * Get a vector by ID
   */
  async get(id: string | number): Promise<VectorPoint | null> {
    return this.vectors.get(id) || null;
  }

  /**
   * Delete a vector
   */
  async delete(id: string | number): Promise<void> {
    this.vectors.delete(id);
  }

  /**
   * Delete all vectors
   */
  async clear(): Promise<void> {
    this.vectors.clear();
  }

  /**
   * Get collection stats
   */
  async getStats(): Promise<{ count: number; vectorSize: number }> {
    return {
      count: this.vectors.size,
      vectorSize: this.config.vectorSize
    };
  }

  /**
   * Calculate similarity between two vectors
   */
  private calculateSimilarity(vector1: number[], vector2: number[]): number {
    switch (this.config.distance) {
      case 'Cosine':
        return this.cosineSimilarity(vector1, vector2);
      case 'Euclidean':
        return 1 / (1 + this.euclideanDistance(vector1, vector2)); // Convert distance to similarity
      case 'Dot':
        return this.dotProduct(vector1, vector2);
      default:
        return this.cosineSimilarity(vector1, vector2);
    }
  }

  /**
   * Calculate cosine similarity
   */
  private cosineSimilarity(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Calculate Euclidean distance
   */
  private euclideanDistance(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) {
      throw new Error('Vectors must have the same length');
    }

    let sum = 0;
    for (let i = 0; i < vector1.length; i++) {
      const diff = vector1[i] - vector2[i];
      sum += diff * diff;
    }

    return Math.sqrt(sum);
  }

  /**
   * Calculate dot product
   */
  private dotProduct(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) {
      throw new Error('Vectors must have the same length');
    }

    let product = 0;
    for (let i = 0; i < vector1.length; i++) {
      product += vector1[i] * vector2[i];
    }

    return product;
  }

  /**
   * Check if the store is available
   */
  isAvailable(): boolean {
    return true; // In-memory store is always available
  }
}

// Global FAISS client instance
let globalFaissClient: FaissClient | null = null;

/**
 * Create FAISS client from environment variables
 */
export function createFaissClientFromEnv(): FaissClient | null {
  const config: VectorStoreConfig = {
    collectionName: process.env.FAISS_COLLECTION_NAME || process.env.QDRANT_COLLECTION_NAME || 'blueprints',
    vectorSize: parseInt(process.env.FAISS_VECTOR_SIZE || process.env.QDRANT_VECTOR_SIZE || '1024'),
    distance: (process.env.FAISS_DISTANCE || process.env.QDRANT_DISTANCE || 'Cosine') as 'Cosine' | 'Euclidean' | 'Dot'
  };

  try {
    const client = new FaissClient(config);
    return client;
  } catch (error) {
    console.error('Failed to create FAISS client:', error);
    return null;
  }
}

/**
 * Get or create global FAISS client
 */
export async function getFaissClient(): Promise<FaissClient> {
  if (!globalFaissClient) {
    globalFaissClient = createFaissClientFromEnv();
    if (!globalFaissClient) {
      throw new Error('Failed to create FAISS client');
    }
    await globalFaissClient.initialize();
  }
  return globalFaissClient;
}

