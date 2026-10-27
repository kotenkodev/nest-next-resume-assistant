import type { ConversationDto, CreateConversationPayload } from '@repo/shared';
import { API_BASE, request } from './client';
export interface ConversationDetail extends ConversationDto {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
  }>;
}

export const chatApi = {
  listConversations: () => request<ConversationDto[]>(`/api/chat`),
  getConversation: (conversationId: string) =>
    request<ConversationDetail>(`/api/chat/${conversationId}`),
  createConversation: (payload: CreateConversationPayload) =>
    request<ConversationDto>(`/api/chat`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateConversation: (
    conversationId: string,
    payload: { jobPostingIds?: string[]; title?: string },
  ) =>
    request<ConversationDto>(`/api/chat/${conversationId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteConversation: (conversationId: string) =>
    request<void>(`/api/chat/${conversationId}`, {
      method: 'DELETE',
    }),
  async streamMessage(
    conversationId: string,
    message: string,
    callbacks: {
      onChunk: (chunk: string) => void;
      onDone: () => void;
      onError: (error: Error) => void;
    },
    signal?: AbortSignal,
  ): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE}/api/chat/${conversationId}/messages/stream`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
          signal,
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!line.startsWith('data: ')) continue;
          const dataStr = trimmedLine.slice(6);

          if (dataStr === '[DONE]') {
            callbacks.onDone();
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              callbacks.onError(new Error(parsed.error));
              return;
            }
            if (parsed.content) {
              callbacks.onChunk(parsed.content);
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      callbacks.onError(
        err instanceof Error ? err : new Error('Unknown streaming error'),
      );
    }
  },
};
