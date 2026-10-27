import * as React from 'react';
import Link from 'next/link';
import { SparklesIcon, ArrowLeftIcon } from 'lucide-react';
import { APP_NAME } from '@repo/shared';

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-y-auto bg-background selection:bg-primary/20">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      </div>

      <header className="w-full flex items-center justify-center p-6 max-w-5xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity"
        >
          <div className="size-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
            <SparklesIcon className="size-4" />
          </div>
          <span className="text-sm font-semibold">{APP_NAME}</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="w-full text-center py-6 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </footer>
    </div>
  );
}
