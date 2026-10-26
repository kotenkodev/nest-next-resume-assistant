'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl text-xs font-sans',
          description: 'group-[.toast]:text-muted-foreground text-[11px]',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium text-xs rounded-md',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium text-xs rounded-md',
          success:
            '!bg-popover !text-popover-foreground !border-success/30 [&>[data-icon]]:!text-success',
          error:
            '!bg-popover !text-popover-foreground !border-destructive/30 [&>[data-icon]]:!text-destructive',
          warning:
            '!bg-popover !text-popover-foreground !border-warning/30 [&>[data-icon]]:!text-warning',
          info:
            '!bg-popover !text-popover-foreground !border-info/30 [&>[data-icon]]:!text-info',
        },
      }}
      {...props}
    />
  );
}

