import { Buffer } from 'node:buffer';

export function splitEmbeddingText(text: string, maxBytes = 1800): string[] {
  if (!Number.isInteger(maxBytes) || maxBytes < 4) {
    throw new Error('Chunk size must be an integer of at least 4 bytes');
  }

  const chunks: string[] = [];
  let current = '';
  let currentBytes = 0;

  for (const character of text.trim()) {
    const characterBytes = Buffer.byteLength(character, 'utf8');

    if (currentBytes + characterBytes > maxBytes) {
      if (current.trim()) {
        chunks.push(current);
      }

      current = '';
      currentBytes = 0;
    }

    current += character;
    currentBytes += characterBytes;
  }

  if (current.trim()) {
    chunks.push(current);
  }

  return chunks;
}
