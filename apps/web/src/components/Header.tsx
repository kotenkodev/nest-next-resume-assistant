'use client';

import { SidebarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';

export function Header() {
  const { toggleSidebar: toggleLeft } = useSidebar('left');
  const { toggleSidebar: toggleRight } = useSidebar('right');

  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) w-full items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleLeft}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="h-4" />
      </div>
      <div className="flex items-center gap-2">
        <Separator orientation="vertical" className="h-4" />
        <Button
          className="scale-x-[-1] h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleRight}
        >
          <SidebarIcon />
        </Button>
      </div>
    </header>
  );
}
