'use client';

import { useSession, signOut } from '@/lib/auth-client';

export function UserMenu() {
  const { data: session, isPending } = useSession();

  if (isPending) return <span>Loading...</span>;
  if (!session) return <a href="/sign-in">Sign In</a>;

  return (
    <div className="flex items-center justify-between w-full">
      <span>{session.user.name}</span>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
