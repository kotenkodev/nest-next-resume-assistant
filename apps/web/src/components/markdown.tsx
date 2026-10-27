'use client';

import * as React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MarkdownProps {
  children: string;
  className?: string;
}

function CodeBlock({
  className,
  children,
  ...props
}: React.ComponentProps<'code'> & { className?: string }) {
  const [copied, setCopied] = React.useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');
  const isBlock = match || codeString.includes('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isBlock) {
    return (
      <code
        className={cn(
          'rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] sm:text-xs text-foreground border border-border/60 font-medium',
          className,
        )}
        {...props}
      >
        {children}
      </code>
    );
  }

  const language = match ? match[1] : '';

  return (
    <div className="relative my-3 rounded-xl border border-border bg-muted/60 overflow-hidden group">
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-border bg-muted/80 text-[11px] font-mono text-muted-foreground select-none">
        <span>{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
          aria-label="Copy code to clipboard"
          title="Copy code"
        >
          {copied ? (
            <>
              <CheckIcon className="size-3 text-emerald-500" />
              <span className="text-[10px] text-emerald-500 font-sans font-medium">
                Copied
              </span>
            </>
          ) : (
            <>
              <CopyIcon className="size-3" />
              <span className="text-[10px] font-sans">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-foreground">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

const markdownComponents: Components = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        'text-base sm:text-lg font-bold text-foreground mt-4 mb-2 first:mt-0 tracking-tight',
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        'text-sm sm:text-base font-semibold text-foreground mt-3.5 mb-1.5 first:mt-0 tracking-tight',
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        'text-xs sm:text-sm font-semibold text-foreground mt-3 mb-1 first:mt-0',
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        'text-xs font-semibold text-foreground mt-2 mb-1 first:mt-0',
        className,
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }) => (
    <h5
      className={cn(
        'text-xs font-semibold text-foreground mt-2 mb-1 first:mt-0',
        className,
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }) => (
    <h6
      className={cn(
        'text-xs font-semibold text-muted-foreground mt-2 mb-1 first:mt-0',
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn(
        'my-2 leading-relaxed text-foreground/90 first:mt-0 last:mb-0',
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn(
        'my-2.5 list-disc pl-5 space-y-1 marker:text-muted-foreground',
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn(
        'my-2.5 list-decimal pl-5 space-y-1 marker:text-muted-foreground',
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li className={cn('leading-relaxed pl-0.5', className)} {...props} />
  ),
  strong: ({ className, ...props }) => (
    <strong
      className={cn('font-semibold text-foreground', className)}
      {...props}
    />
  ),
  em: ({ className, ...props }) => (
    <em className={cn('italic text-foreground', className)} {...props} />
  ),
  del: ({ className, ...props }) => (
    <del className={cn('line-through opacity-75', className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        'my-3 border-l-2 border-primary/50 pl-3.5 py-1 text-muted-foreground italic bg-muted/20 rounded-r-md',
        className,
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn('my-4 border-border', className)} {...props} />
  ),
  a: ({ className, href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  ),
  table: ({ className, ...props }) => (
    <div className="my-3 w-full overflow-x-auto rounded-lg border border-border">
      <table
        className={cn('w-full border-collapse text-left text-xs', className)}
        {...props}
      />
    </div>
  ),
  thead: ({ className, ...props }) => (
    <thead
      className={cn(
        'bg-muted/70 text-foreground font-semibold border-b border-border',
        className,
      )}
      {...props}
    />
  ),
  tbody: ({ className, ...props }) => (
    <tbody className={cn('divide-y divide-border/60', className)} {...props} />
  ),
  tr: ({ className, ...props }) => (
    <tr
      className={cn('transition-colors hover:bg-muted/30', className)}
      {...props}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        'px-3 py-2 text-xs font-semibold text-foreground',
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn('px-3 py-2 text-xs text-foreground/90', className)}
      {...props}
    />
  ),
  input: ({ className, type, ...props }) => {
    if (type === 'checkbox') {
      return (
        <input
          type="checkbox"
          className={cn(
            'mr-2 rounded accent-primary align-middle cursor-default',
            className,
          )}
          {...props}
        />
      );
    }
    return <input type={type} className={className} {...props} />;
  },
  img: ({ className, alt, ...props }) => (
    <img
      className={cn(
        'rounded-xl max-w-full my-3 border border-border shadow-xs',
        className,
      )}
      alt={alt}
      {...props}
    />
  ),
  kbd: ({ className, ...props }) => (
    <kbd
      className={cn(
        'rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground border border-border shadow-2xs',
        className,
      )}
      {...props}
    />
  ),
  pre: ({ children }) => <>{children}</>,
  code: CodeBlock,
};

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        'min-w-0 text-xs sm:text-sm leading-relaxed space-y-1',
        '[&_h1]:text-base sm:[&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-4 [&_h1]:mb-2 [&_h1:first-child]:mt-0',
        '[&_h2]:text-sm sm:[&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-3.5 [&_h2]:mb-1.5 [&_h2:first-child]:mt-0',
        '[&_h3]:text-xs sm:[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-3 [&_h3]:mb-1 [&_h3:first-child]:mt-0',
        '[&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1',
        '[&_ol]:my-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1',
        '[&_li]:leading-relaxed',
        '[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-3.5 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:bg-muted/20 [&_blockquote]:rounded-r-md',
        '[&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_table]:my-3',
        '[&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:text-left [&_th]:bg-muted/70 [&_th]:font-semibold',
        '[&_td]:border [&_td]:border-border [&_td]:p-2',
        '[&_hr]:my-4 [&_hr]:border-border',
        '[&_strong]:font-semibold [&_strong]:text-foreground',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
