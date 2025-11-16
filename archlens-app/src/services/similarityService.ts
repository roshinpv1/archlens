/**
 * Similarity Service for blueprint similarity search and matching
 */

import { getQdrantClient, SimilarBlueprint } from '../lib/qdrant-client';
import { getEmbeddingService } from './embeddingService';
import { Blueprint } from '../types/blueprint';

export interface SimilaritySearchResult {
  success: boolean;
  similarBlueprints?: SimilarBlueprint[];
  error?: string;
}

export interface AnalysisSimilarityResult {
  success: boolean;
  similarBlueprints?: SimilarBlueprint[];
  analysisId?: string;
  error?: string;
}

export interface BlueprintSimilarityResult {
  success: boolean;
  similarBlueprints?: SimilarBlueprint[];
  blueprintId?: string;
  error?: string;
}

export class SimilarityService {
  private embeddingService = getEmbeddingService();

  /**
   * Find similar blueprints for an analysis
   */
  async findSimilarBlueprintsForAnalysis(analysisContent: {
    components: unknown[];
    connections: unknown[];
    description?: string;
    metadata?: Record<string, unknown>;
  }): Promise<AnalysisSimilarityResult> {
    try {
      // Generate embedding for analysis content
      const embeddingResult = await this.embeddingService.generateAnalysisEmbedding(analysisContent);
      
      if (!embeddingResult.success || !embeddingResult.embedding) {
        return {
          success: false,
          error: embeddingResult.error || 'Failed to generate analysis embedding'
        };
      }

      // Search for similar blueprints
      const qdrantClient = await getQdrantClient();
      
      // Search blueprint embeddings
      const blueprintSearchResult = await qdrantClient.searchSimilarBlueprints(
        embeddingResult.embedding,
        2, // Top 2 closest matches
        0.7 // 70% similarity threshold
      );

      // Search analysis embeddings
      const analysisSearchResult = await qdrantClient.searchSimilarAnalysis(
        embeddingResult.embedding,
        2, // Top 2 closest matches
        0.7 // 70% similarity threshold
      );

      // Combine and deduplicate results
      const allSimilarBlueprints = [
        ...blueprintSearchResult,
        ...analysisSearchResult
      ];

      // Remove duplicates based on blueprintId
      const uniqueBlueprints = allSimilarBlueprints.reduce((acc, current) => {
        const existing = acc.find(item => item.blueprint.id === current.blueprint.id);
        if (!existing) {
          acc.push(current);
        } else if (current.score > existing.score) {
          // Keep the one with higher similarity score
          const index = acc.indexOf(existing);
          acc[index] = current;
        }
        return acc;
      }, [] as SimilarBlueprint[]);

      // Sort by similarity score and limit to top 3
      const topSimilarBlueprints = uniqueBlueprints
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      console.log(`🔍 Found ${topSimilarBlueprints.length} similar blueprints (${blueprintSearchResult.length} from blueprints, ${analysisSearchResult.length} from analyses)`);

      return {
        success: true,
        similarBlueprints: topSimilarBlueprints
      };
    } catch (error) {
      console.error('Failed to find similar blueprints for analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Find similar blueprints for a blueprint
   */
  async findSimilarBlueprintsForBlueprint(blueprintId: string): Promise<BlueprintSimilarityResult> {
    try {
      // Get the blueprint's embedding from Qdrant
      const qdrantClient = await getQdrantClient();
      const vectorId = `blueprint_${blueprintId}`;
      const blueprintVector = await qdrantClient.getBlueprint(vectorId);

      if (!blueprintVector) {
        return {
          success: false,
          error: 'Blueprint embedding not found'
        };
      }

      // Search for similar blueprints (excluding the current one)
      const similarBlueprints = await qdrantClient.searchSimilarBlueprints(
        blueprintVector.vector,
        3, // Top 3 matches (excluding self)
        0.7 // 70% similarity threshold
      );

      // Filter out the current blueprint
      const filteredBlueprints = similarBlueprints.filter(
        bp => bp.blueprint.id !== blueprintId
      ).slice(0, 2); // Return top 2 after filtering

      return {
        success: true,
        similarBlueprints: filteredBlueprints,
        blueprintId
      };
    } catch (error) {
      console.error('Failed to find similar blueprints for blueprint:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Find similar blueprints by content
   */
  async findSimilarBlueprintsByContent(content: string): Promise<SimilaritySearchResult> {
    try {
      // Generate embedding for the content
      const embeddingResult = await this.embeddingService.generateBlueprintEmbedding({
        id: 'temp',
        name: 'Search Query',
        description: content,
        type: 'search',
        category: 'search',
        cloudProvider: 'unknown',
        complexity: 'unknown',
        tags: [],
        isPublic: false,
        createdBy: 'system',
        createdAt: new Date(),
        downloadCount: 0,
        rating: 0,
        version: '1.0.0',
        metadata: {}
      } as Blueprint);

      if (!embeddingResult.success || !embeddingResult.embedding) {
        return {
          success: false,
          error: embeddingResult.error || 'Failed to generate content embedding'
        };
      }

      // Search for similar blueprints
      const qdrantClient = await getQdrantClient();
      const similarBlueprints = await qdrantClient.searchSimilarBlueprints(
        embeddingResult.embedding,
        5, // Top 5 matches
        0.6 // 60% similarity threshold for content search
      );

      return {
        success: true,
        similarBlueprints
      };
    } catch (error) {
      console.error('Failed to find similar blueprints by content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get blueprint similarity score
   */
  async getBlueprintSimilarityScore(
    blueprintId1: string,
    blueprintId2: string
  ): Promise<{
    success: boolean;
    score?: number;
    error?: string;
  }> {
    try {
      const qdrantClient = await getQdrantClient();
      
      // Get both blueprint vectors
      const vector1 = await qdrantClient.getBlueprint(`blueprint_${blueprintId1}`);
      const vector2 = await qdrantClient.getBlueprint(`blueprint_${blueprintId2}`);

      if (!vector1 || !vector2) {
        return {
          success: false,
          error: 'One or both blueprint embeddings not found'
        };
      }

      // Calculate cosine similarity
      const score = this.calculateCosineSimilarity(vector1.vector, vector2.vector);

      return {
        success: true,
        score
      };
    } catch (error) {
      console.error('Failed to calculate blueprint similarity score:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get similar blueprints with detailed information
   */
  async getDetailedSimilarBlueprints(
    blueprintId: string,
    limit: number = 2
  ): Promise<{
    success: boolean;
    similarBlueprints?: Array<SimilarBlueprint & {
      similarity: number;
      sharedTags: string[];
      sharedComponents: string[];
    }>;
    error?: string;
  }> {
    try {
      const result = await this.findSimilarBlueprintsForBlueprint(blueprintId);
      
      if (!result.success || !result.similarBlueprints) {
        return result;
      }

      // Enhance results with additional information
      const enhancedBlueprints = result.similarBlueprints.map(bp => ({
        ...bp,
        similarity: bp.score,
        sharedTags: [], // Could be calculated by comparing tags
        sharedComponents: [] // Could be calculated by comparing components
      }));

      return {
        success: true,
        similarBlueprints: enhancedBlueprints.slice(0, limit)
      };
    } catch (error) {
      console.error('Failed to get detailed similar blueprints:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private calculateCosineSimilarity(vector1: number[], vector2: number[]): number {
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
   * Get similarity statistics for a blueprint
   */
  async getBlueprintSimilarityStats(blueprintId: string): Promise<{
    success: boolean;
    stats?: {
      totalSimilar: number;
      averageSimilarity: number;
      highestSimilarity: number;
      lowestSimilarity: number;
    };
    error?: string;
  }> {
    try {
      const result = await this.findSimilarBlueprintsForBlueprint(blueprintId);
      
      if (!result.success || !result.similarBlueprints) {
        return result;
      }

      const scores = result.similarBlueprints.map(bp => bp.score);
      const stats = {
        totalSimilar: scores.length,
        averageSimilarity: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        highestSimilarity: Math.max(...scores),
        lowestSimilarity: Math.min(...scores)
      };

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Failed to get blueprint similarity stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Store embedding in Qdrant (for analysis embeddings)
   */
  async storeEmbedding(pointId: string, embedding: number[], metadata: Record<string, any>): Promise<void> {
    try {
      const qdrantClient = await getQdrantClient();
      await qdrantClient.storeEmbedding(pointId, embedding, metadata);
    } catch (error) {
      console.error('❌ Failed to store embedding:', error);
      throw error;
    }
  }
}

// Global similarity service instance
let globalSimilarityService: SimilarityService | null = null;

export function getSimilarityService(): SimilarityService {
  if (!globalSimilarityService) {
    globalSimilarityService = new SimilarityService();
  }
  return globalSimilarityService;
}
