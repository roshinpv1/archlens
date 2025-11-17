/**
 * Unified Vector Store Interface
 * Supports both Qdrant (server-based) and FAISS (in-memory)
 * Automatically selects based on configuration
 */

import { QdrantClient, BlueprintVector, SimilarBlueprint, getQdrantClient } from './qdrant-client';
import { FaissClient, getFaissClient, VectorPoint } from './faiss-client';

// Re-export types for convenience
export type { BlueprintVector, SimilarBlueprint };
export type VectorStoreType = 'qdrant' | 'faiss';

export interface VectorStore {
  initialize(): Promise<void>;
  upsertBlueprint(blueprintVector: BlueprintVector): Promise<void>;
  storeEmbedding(pointId: string | number, embedding: number[], payload: Record<string, any>): Promise<void>;
  searchSimilarBlueprints(queryVector: number[], limit?: number, scoreThreshold?: number): Promise<SimilarBlueprint[]>;
  searchSimilarAnalysis(queryVector: number[], limit?: number, scoreThreshold?: number): Promise<SimilarBlueprint[]>;
  getBlueprint(vectorId: string): Promise<{ id: string; vector: number[]; payload: any } | null>;
  deleteBlueprint(vectorId: string): Promise<void>;
  isAvailable(): boolean;
}

/**
 * Unified Vector Store that wraps either Qdrant or FAISS
 */
export class UnifiedVectorStore implements VectorStore {
  private qdrantClient: QdrantClient | null = null;
  private faissClient: FaissClient | null = null;
  private storeType: VectorStoreType;

  constructor(storeType: VectorStoreType = 'qdrant') {
    this.storeType = storeType;
  }

  async initialize(): Promise<void> {
    if (this.storeType === 'faiss') {
      this.faissClient = await getFaissClient();
      await this.faissClient.initialize();
    } else {
      this.qdrantClient = await getQdrantClient();
      await this.qdrantClient.initialize();
    }
  }

  async upsertBlueprint(blueprintVector: BlueprintVector): Promise<void> {
    if (this.storeType === 'faiss' && this.faissClient) {
      const pointId = typeof blueprintVector.id === 'string' 
        ? parseInt(blueprintVector.id.replace(/\D/g, '')) || this.hashString(blueprintVector.id)
        : blueprintVector.id;
      
      await this.faissClient.upsert({
        id: pointId,
        vector: blueprintVector.vector,
        payload: blueprintVector.payload
      });
    } else if (this.qdrantClient) {
      await this.qdrantClient.upsertBlueprint(blueprintVector);
    } else {
      throw new Error('Vector store not initialized');
    }
  }

  async storeEmbedding(
    pointId: string | number,
    embedding: number[],
    payload: Record<string, any>
  ): Promise<void> {
    if (this.storeType === 'faiss' && this.faissClient) {
      const numericId = typeof pointId === 'string' 
        ? this.hashString(pointId)
        : pointId;
      await this.faissClient.storeEmbedding(numericId, embedding, payload);
    } else if (this.qdrantClient) {
      await this.qdrantClient.storeEmbedding(pointId, embedding, payload);
    } else {
      throw new Error('Vector store not initialized');
    }
  }

  async searchSimilarBlueprints(
    queryVector: number[],
    limit: number = 2,
    scoreThreshold: number = 0.7
  ): Promise<SimilarBlueprint[]> {
    if (this.storeType === 'faiss' && this.faissClient) {
      const results = await this.faissClient.search(
        queryVector,
        limit,
        scoreThreshold,
        (payload) => payload.type === 'blueprint'
      );

      return results.map(result => ({
        id: result.id.toString(),
        score: result.score,
        blueprint: {
          id: result.payload.blueprintId,
          name: result.payload.name,
          type: result.payload.blueprintType || result.payload.type,
          category: result.payload.category,
          cloudProvider: result.payload.cloudProvider,
          complexity: result.payload.complexity,
          tags: result.payload.tags || []
        }
      }));
    } else if (this.qdrantClient) {
      return await this.qdrantClient.searchSimilarBlueprints(queryVector, limit, scoreThreshold);
    } else {
      throw new Error('Vector store not initialized');
    }
  }

  async searchSimilarAnalysis(
    queryVector: number[],
    limit: number = 2,
    scoreThreshold: number = 0.7
  ): Promise<SimilarBlueprint[]> {
    if (this.storeType === 'faiss' && this.faissClient) {
      // Search for both blueprint_analysis and architecture_analysis
      const results = await this.faissClient.search(
        queryVector,
        limit,
        scoreThreshold,
        (payload) => payload.type === 'blueprint_analysis' || payload.type === 'architecture_analysis'
      );

      return results.map(result => ({
        id: result.id.toString(),
        score: result.score,
        blueprint: {
          id: result.payload.blueprintId || result.payload.analysisId || 'unknown',
          name: result.payload.blueprintName || result.payload.analysisName || 'Unknown',
          type: result.payload.type === 'architecture_analysis' ? 'architecture_analysis' : 'analysis',
          category: result.payload.architecturePatterns?.[0] || result.payload.architectureType || 'Unknown',
          cloudProvider: result.payload.technologyStack?.[0] || result.payload.cloudProviders?.[0] || 'Unknown',
          complexity: result.payload.componentCount > 10 ? 'high' : result.payload.componentCount > 5 ? 'medium' : 'low',
          tags: result.payload.architecturePatterns || []
        }
      }));
    } else if (this.qdrantClient) {
      return await this.qdrantClient.searchSimilarAnalysis(queryVector, limit, scoreThreshold);
    } else {
      throw new Error('Vector store not initialized');
    }
  }

  async getBlueprint(vectorId: string): Promise<{ id: string; vector: number[]; payload: any } | null> {
    if (this.storeType === 'faiss' && this.faissClient) {
      const numericId = this.hashString(vectorId);
      const point = await this.faissClient.get(numericId);
      if (!point) return null;
      return {
        id: point.id.toString(),
        vector: point.vector,
        payload: point.payload
      };
    } else if (this.qdrantClient) {
      return await this.qdrantClient.getBlueprint(vectorId);
    } else {
      throw new Error('Vector store not initialized');
    }
  }

  async deleteBlueprint(vectorId: string): Promise<void> {
    if (this.storeType === 'faiss' && this.faissClient) {
      const numericId = this.hashString(vectorId);
      await this.faissClient.delete(numericId);
    } else if (this.qdrantClient) {
      await this.qdrantClient.deleteBlueprint(vectorId);
    } else {
      throw new Error('Vector store not initialized');
    }
  }

  isAvailable(): boolean {
    if (this.storeType === 'faiss') {
      return this.faissClient?.isAvailable() || false;
    } else {
      // Qdrant client is available if it's initialized
      return this.qdrantClient !== null;
    }
  }

  /**
   * Hash string to number for FAISS ID
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

/**
 * Get vector store type from environment
 */
export function getVectorStoreType(): VectorStoreType {
  const storeType = process.env.VECTOR_STORE_TYPE?.toLowerCase();
  if (storeType === 'faiss') {
    return 'faiss';
  }
  // Default to Qdrant if not specified or if QDRANT_EMBEDDED is not set
  return 'qdrant';
}

/**
 * Get unified vector store instance
 */
let globalVectorStore: UnifiedVectorStore | null = null;

export async function getVectorStore(): Promise<UnifiedVectorStore> {
  if (!globalVectorStore) {
    const storeType = getVectorStoreType();
    globalVectorStore = new UnifiedVectorStore(storeType);
    await globalVectorStore.initialize();
  }
  return globalVectorStore;
}

