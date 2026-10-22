'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function Markdown({ children }: { children: string }) {
  return (
    <div className="min-w-0 space-y-3 text-sm leading-relaxed [&_p]:text-inherit [&_li]:my-1 [&_li]:text-inherit [&_ul]:my-3 [&_ul]:list-disc [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_code]:font-mono [&_code]:text-inherit [&_a]:underline [&_table]:w-full [&_th]:text-left [&_td]:p-2 [&_th]:p-2">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
