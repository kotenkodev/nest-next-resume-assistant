'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession, signOut } from '@/lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOutIcon, ChevronsUpDownIcon, LogInIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

function getInitials(name?: string | null): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function UserMenu() {
  const [mounted, setMounted] = React.useState(false);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isPending) {
    return (
      <div className="flex items-center gap-2.5 w-full p-1.5">
        <Skeleton className="size-8 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2.5 w-28" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <Link
        href="/sign-in"
        className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
      >
        <LogInIcon className="size-3.5" />
        Sign In
      </Link>
    );
  }

  const { user } = session;
  const initials = getInitials(user.name);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/sign-in');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 w-full p-1.5 rounded-lg text-left hover:bg-sidebar-accent transition-colors cursor-pointer group outline-none">
        <Avatar size="default" className="size-8 shrink-0">
          {user.image && (
            <AvatarImage src={user.image} alt={user.name || 'User avatar'} />
          )}
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <span className="block text-xs font-semibold text-foreground truncate">
            {user.name || 'User'}
          </span>
          <span className="block text-[11px] text-muted-foreground truncate">
            {user.email || ''}
          </span>
        </div>

        <ChevronsUpDownIcon className="size-3.5 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="top"
        sideOffset={8}
        className="w-56 p-1.5 rounded-xl shadow-lg border border-border"
      >
        <DropdownMenuLabel className="px-2 py-1.5">
          <div className="flex items-center gap-2">
            <Avatar size="sm" className="size-7 shrink-0">
              {user.image && (
                <AvatarImage
                  src={user.image}
                  alt={user.name || 'User avatar'}
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[10px]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">
                {user.name}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-md cursor-pointer transition-colors"
        >
          <LogOutIcon className="size-3.5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
