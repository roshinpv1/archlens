/**
 * Embeddings Client for generating vector embeddings
 * Supports multiple embedding providers with unified interface
 */

export enum EmbeddingsProvider {
  LOCAL = 'local',
  OPENAI = 'openai',
  COHERE = 'cohere',
  HUGGINGFACE = 'huggingface'
}

export interface EmbeddingsConfig {
  provider: EmbeddingsProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  dimensions?: number;
}

export interface EmbeddingsResponse {
  embedding: number[];
  model: string;
  usage?: {
    promptTokens: number;
    totalTokens: number;
  };
}

export class EmbeddingsError extends Error {
  constructor(
    message: string,
    public provider: EmbeddingsProvider,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'EmbeddingsError';
  }
}

export class EmbeddingsClient {
  private config: EmbeddingsConfig;

  constructor(config: EmbeddingsConfig) {
    this.config = config;
  }

  getConfig(): EmbeddingsConfig {
    return { ...this.config };
  }

  isAvailable(): boolean {
    try {
      return this.validateConfig();
    } catch {
      return false;
    }
  }

  private validateConfig(): boolean {
    if (!this.config.provider || !this.config.model) {
      return false;
    }

    switch (this.config.provider) {
      case EmbeddingsProvider.LOCAL:
        return true; // Local models don't need API keys
      case EmbeddingsProvider.OPENAI:
        return !!(this.config.apiKey && this.config.baseUrl);
      case EmbeddingsProvider.COHERE:
        return !!(this.config.apiKey && this.config.baseUrl);
      case EmbeddingsProvider.HUGGINGFACE:
        return !!(this.config.apiKey && this.config.baseUrl);
      default:
        return false;
    }
  }

  async generateEmbedding(text: string, options?: { timeout?: number }): Promise<number[]> {
    const timeout = options?.timeout || 30000; // 30 seconds default

    switch (this.config.provider) {
      case EmbeddingsProvider.LOCAL:
        return this.callLocalEmbedding(text, timeout);
      case EmbeddingsProvider.OPENAI:
        return this.callOpenAIEmbedding(text, timeout);
      case EmbeddingsProvider.COHERE:
        return this.callCohereEmbedding(text, timeout);
      case EmbeddingsProvider.HUGGINGFACE:
        return this.callHuggingFaceEmbedding(text, timeout);
      default:
        throw new EmbeddingsError(
          `Unsupported embedding provider: ${this.config.provider}`,
          this.config.provider
        );
    }
  }

  async generateBatchEmbeddings(texts: string[], options?: { timeout?: number }): Promise<number[][]> {
    const timeout = options?.timeout || 60000; // 60 seconds for batch
    const batchSize = 10; // Process in batches to avoid overwhelming the API
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(text => this.generateEmbedding(text, { timeout: timeout / Math.ceil(texts.length / batchSize) }))
      );
      results.push(...batchResults);
    }

    return results;
  }

  private async callLocalEmbedding(text: string, timeout: number): Promise<number[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      if (!this.config.baseUrl) {
        throw new EmbeddingsError('Local embedding base URL not provided', EmbeddingsProvider.LOCAL);
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (this.config.apiKey && this.config.apiKey !== 'not-needed') {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(`${this.config.baseUrl}/v1/embeddings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.config.model,
          input: text,
          encoding_format: 'float'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new EmbeddingsError(
          `Local embedding API error: ${errorText}`,
          EmbeddingsProvider.LOCAL,
          response.status
        );
      }

      const data = await response.json();
      return data.data[0].embedding;

    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new EmbeddingsError('Local embedding API call timed out', EmbeddingsProvider.LOCAL);
      }
      throw error;
    }
  }

  private async callOpenAIEmbedding(text: string, timeout: number): Promise<number[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const baseUrl = this.config.baseUrl || 'https://api.openai.com';
      
      const response = await fetch(`${baseUrl}/v1/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          input: text,
          encoding_format: 'float'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new EmbeddingsError(
          `OpenAI embedding API error: ${errorData.error?.message || 'Unknown error'}`,
          EmbeddingsProvider.OPENAI,
          response.status
        );
      }

      const data = await response.json();
      return data.data[0].embedding;

    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new EmbeddingsError('OpenAI embedding API call timed out', EmbeddingsProvider.OPENAI);
      }
      throw error;
    }
  }

  private async callCohereEmbedding(text: string, timeout: number): Promise<number[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const baseUrl = this.config.baseUrl || 'https://api.cohere.ai';
      
      const response = await fetch(`${baseUrl}/v1/embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          texts: [text],
          input_type: 'search_document'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new EmbeddingsError(
          `Cohere embedding API error: ${errorData.message || 'Unknown error'}`,
          EmbeddingsProvider.COHERE,
          response.status
        );
      }

      const data = await response.json();
      return data.embeddings[0];

    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new EmbeddingsError('Cohere embedding API call timed out', EmbeddingsProvider.COHERE);
      }
      throw error;
    }
  }

  private async callHuggingFaceEmbedding(text: string, timeout: number): Promise<number[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const baseUrl = this.config.baseUrl || 'https://api-inference.huggingface.co';
      
      const response = await fetch(`${baseUrl}/models/${this.config.model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          inputs: text,
          options: {
            wait_for_model: true
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new EmbeddingsError(
          `Hugging Face embedding API error: ${errorData.error || 'Unknown error'}`,
          EmbeddingsProvider.HUGGINGFACE,
          response.status
        );
      }

      const data = await response.json();
      return data;

    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new EmbeddingsError('Hugging Face embedding API call timed out', EmbeddingsProvider.HUGGINGFACE);
      }
      throw error;
    }
  }
}

// Factory function to create embeddings client from environment
export function createEmbeddingsClientFromEnv(): EmbeddingsClient | null {
  const provider = (process.env.EMBEDDINGS_PROVIDER || 'local') as EmbeddingsProvider;
  const model = process.env.EMBEDDINGS_MODEL || 'nomic-embed-text';
  const apiKey = process.env.EMBEDDINGS_API_KEY;
  const baseUrl = process.env.EMBEDDINGS_BASE_URL;
  const dimensions = parseInt(process.env.EMBEDDINGS_DIMENSIONS || '768');

  const config: EmbeddingsConfig = {
    provider,
    model,
    apiKey,
    baseUrl,
    dimensions
  };

  try {
    const client = new EmbeddingsClient(config);
    if (client.isAvailable()) {
      return client;
    }
    return null;
  } catch (error) {
    console.error('Failed to create embeddings client:', error);
    return null;
  }
}
