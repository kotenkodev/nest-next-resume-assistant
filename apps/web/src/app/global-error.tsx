'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Unhandled global root error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex h-screen w-screen items-center justify-center bg-background p-6 font-sans antialiased text-foreground">
        <div className="w-full max-w-md rounded-2xl border border-destructive/20 bg-card p-6 text-center shadow-lg">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Application Error
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error.message ||
              'A critical error occurred while rendering the application.'}
          </p>
          {error.digest && (
            <div className="mt-3 rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs text-muted-foreground select-all">
              Digest: {error.digest}
            </div>
          )}
          <button
            onClick={() => reset()}
            className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
