'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircleIcon, RotateCcwIcon, HomeIcon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from 'cn';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('Unhandled route error caught by boundary:', error);
  }, [error]);

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md rounded-2xl border border-destructive/20 bg-card p-6 shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <AlertCircleIcon className="size-6" />
        </div>

        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {error.message ||
            'An unexpected error occurred while loading this page.'}
        </p>

        {error.digest && (
          <div className="mt-3 rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs text-muted-foreground select-all">
            Digest: {error.digest}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={() => reset()} variant="default" className="gap-2">
            <RotateCcwIcon className="size-4" />
            Try Again
          </Button>

          <Link
            href="/"
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
          >
            <HomeIcon className="size-4" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
