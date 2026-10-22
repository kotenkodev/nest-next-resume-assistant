import { APP_NAME } from '@repo/shared';

export default function Home() {
  return (
    <main>
      <p className="eyebrow">Next.js + NestJS + Turborepo</p>
      <h1>{APP_NAME}</h1>
      <p>Your workspace is ready. Start building your resume assistant here.</p>
      <ul>
        <li>
          <code>apps/web</code> — Next.js frontend
        </li>
        <li>
          <code>apps/api</code> — NestJS API
        </li>
        <li>
          <code>packages/shared</code> — Shared types and utilities
        </li>
      </ul>
      <a href="http://localhost:3001/api/health">
        Check the local API health endpoint →
      </a>
    </main>
  );
}
