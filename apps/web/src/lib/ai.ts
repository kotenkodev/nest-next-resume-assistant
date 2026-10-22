import type { UIMessage } from 'ai';

export { createChat } from '@shadcn/helpers/ai-sdk';

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}
