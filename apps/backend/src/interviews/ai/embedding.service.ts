import { Injectable, Logger } from '@nestjs/common';
import { config } from '../../config';

const { OLLAMA_BASE_URL, OLLAMA_EMBEDDING_MODEL } = config;

const EMBEDDING_DIMENSIONS = 768;

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  async createEmbedding(text: string): Promise<number[]> {
    try {
      const res = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, model: OLLAMA_EMBEDDING_MODEL }),
      });

      if (!res.ok) {
        throw new Error(`Embedding API error: ${res.status} ${res.statusText}`);
      }

      const json = await res.json();
      return json.embedding;
    } catch (error) {
      this.logger.warn(`Embedding generation failed, using zero vector: ${error.message}`);
      return Array(EMBEDDING_DIMENSIONS).fill(0);
    }
  }

  async createBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of texts) {
      const embedding = await this.createEmbedding(text);
      embeddings.push(embedding);
    }
    return embeddings;
  }

  getEmbeddingDimensions(): number {
    return EMBEDDING_DIMENSIONS;
  }
}
