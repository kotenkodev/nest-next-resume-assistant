import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type EmbeddingTask = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

@Injectable()
export class EmbeddingService {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(configService: ConfigService) {
    this.apiKey = configService.getOrThrow<string>('JINA_API_KEY');
    this.model =
      configService.get<string>('EMBEDDING_MODEL') ?? 'jina-embeddings-v3';
  }

  async embed(
    text: string,
    taskType: EmbeddingTask = 'RETRIEVAL_DOCUMENT',
  ): Promise<number[]> {
    if (!text.trim()) {
      throw new Error('Cannot embed empty text');
    }

    const jinaTask =
      taskType === 'RETRIEVAL_QUERY' ? 'retrieval.query' : 'retrieval.passage';

    const response = await fetch('https://api.jina.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        task: jinaTask,
        dimensions: 1024,
        input: [text],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Jina Embeddings API error (${response.status}): ${errText}`,
      );
    }

    const data = (await response.json()) as {
      data?: Array<{ embedding: number[] }>;
    };
    const values = data.data?.[0]?.embedding;

    if (!values || values.length !== 1024 || !values.every(Number.isFinite)) {
      throw new Error('Jina returned an invalid embedding');
    }

    const norm = Math.hypot(...values);

    if (!Number.isFinite(norm) || norm === 0) {
      throw new Error('Jina returned an invalid embedding norm');
    }

    return values.map((value) => value / norm);
  }
}
