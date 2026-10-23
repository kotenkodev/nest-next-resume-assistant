import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

type EmbeddingTask = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

@Injectable()
export class EmbeddingService {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(configService: ConfigService) {
    this.client = new GoogleGenAI({
      apiKey: configService.getOrThrow<string>('GEMINI_API_KEY'),
    });

    this.model = configService.getOrThrow<string>('EMBEDDING_MODEL');
  }

  async embed(
    text: string,
    taskType: EmbeddingTask = 'RETRIEVAL_DOCUMENT',
  ): Promise<number[]> {
    if (!text.trim()) {
      throw new Error('Cannot embed empty text');
    }

    const response = await this.client.models.embedContent({
      model: this.model,
      contents: text,
      config: {
        taskType,
        outputDimensionality: 1536,
        autoTruncate: false,
      },
    });

    const values = response.embeddings?.[0]?.values;

    if (!values || values.length !== 1536 || !values.every(Number.isFinite)) {
      throw new Error('Google returned an invalid embedding');
    }

    const norm = Math.hypot(...values);

    if (!Number.isFinite(norm) || norm === 0) {
      throw new Error('Google returned an invalid embedding norm');
    }

    return values.map((value) => value / norm);
  }
}
