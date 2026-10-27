'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  AlertCircleIcon,
  LogInIcon,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SignInPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (session?.user) {
      router.push('/');
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signInError } = await signIn.email({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message ?? 'Invalid email or password');
        toast.error(signInError.message ?? 'Failed to sign in');
        setLoading(false);
        return;
      }

      toast.success('Signed in successfully');
      router.push('/');
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
      
      <div className="text-center space-y-1.5 mb-6">
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LogInIcon className="size-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-xs text-muted-foreground">
          Sign in to access your resumes, job evaluations, and career assistant
        </p>
      </div>

      
      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircleIcon className="size-4 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{error}</div>
        </div>
      )}

      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-semibold text-foreground flex items-center gap-1.5"
          >
            <MailIcon className="size-3.5 text-muted-foreground" />
            <span>Email address</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            required
            className="h-9 px-3 text-xs"
          />
        </div>

        
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-semibold text-foreground flex items-center gap-1.5"
          >
            <LockIcon className="size-3.5 text-muted-foreground" />
            <span>Password</span>
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              required
              className="h-9 pr-9 pl-3 text-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOffIcon className="size-3.5" />
              ) : (
                <EyeIcon className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-9 text-xs font-semibold gap-2 mt-2 shadow-xs"
        >
          {loading ? (
            <>
              <Loader2Icon className="size-3.5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </Button>
      </form>

      
      <div className="mt-6 text-center text-xs text-muted-foreground pt-5 border-t border-border">
        Don&apos;t have an account?{' '}
        <Link
          href="/sign-up"
          className="font-semibold text-primary hover:underline underline-offset-4"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
