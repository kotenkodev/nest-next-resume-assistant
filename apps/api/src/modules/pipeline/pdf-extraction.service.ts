import { Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class PdfExtractionService {
  async extractText(bytes: Uint8Array): Promise<string> {
    const parser = new PDFParse({ data: bytes });

    try {
      const result = await parser.getText();

      const text = result.pages
        .map((page) => page.text.trim())
        .filter(Boolean)
        .join('\n\n');

      if (!text) {
        throw new Error('PDF contains no extractable text; it may require OCR');
      }

      return text;
    } finally {
      await parser.destroy();
    }
  }
}
