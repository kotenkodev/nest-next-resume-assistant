import type { Metadata } from 'next';
import { APP_NAME } from '@repo/shared';
import './globals.css';

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'A Next.js and NestJS workspace for Resume Assistant.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
