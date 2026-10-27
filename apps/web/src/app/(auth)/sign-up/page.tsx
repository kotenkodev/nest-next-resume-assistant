'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp, useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  UserIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  AlertCircleIcon,
  UserPlusIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export default function SignUpPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      router.push('/');
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please provide your full name.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await signUp.email({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      if (signUpError) {
        setError(signUpError.message ?? 'Sign up failed');
        toast.error(signUpError.message ?? 'Registration failed');
        setLoading(false);
        return;
      }

      toast.success('Account created successfully!');
      router.push('/');
      router.refresh();
    } catch {
      setError('An unexpected error occurred during registration.');
      toast.error('Registration error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
      <div className="text-center space-y-1.5 mb-6">
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserPlusIcon className="size-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create an account
        </h1>
        <p className="text-xs text-muted-foreground">
          Start analyzing resume fit, uncovering skill gaps, and practicing
          interviews
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
            htmlFor="name"
            className="text-xs font-semibold text-foreground flex items-center gap-1.5"
          >
            <UserIcon className="size-3.5 text-muted-foreground" />
            <span>Full Name</span>
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Alex Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            autoComplete="name"
            required
            className="h-9 px-3 text-xs"
          />
        </div>

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
            placeholder="alex@example.com"
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
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              required
              minLength={8}
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
          <p className="text-[11px] text-muted-foreground">
            Must contain at least 8 characters
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-9 text-xs font-semibold gap-2 mt-2 shadow-xs"
        >
          {loading ? (
            <>
              <Loader2Icon className="size-3.5 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-muted-foreground pt-5 border-t border-border">
        Already have an account?{' '}
        <Link
          href="/sign-in"
          className="font-semibold text-primary hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
