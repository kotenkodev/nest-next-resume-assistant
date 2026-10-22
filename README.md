# Resume Assistant

A pnpm + Turborepo workspace with a Next.js frontend, a NestJS API, and a shared TypeScript package.

## Structure

```text
apps/
  web/              Next.js App Router, http://localhost:3000
  api/              NestJS, http://localhost:3001/api
packages/
  shared/           @repo/shared: shared types, constants, and utilities
```

Both apps import `@repo/shared`. The API exposes `GET /api/health`, returning the shared `HealthResponse` contract and `APP_NAME` constant. The frontend uses the same constant for its title.

## Setup

Use Node.js 22 or newer and pnpm 10.30.3.

```sh
pnpm install
pnpm dev
```

The API works with defaults. To customize its port or allowed browser origin, copy `apps/api/.env.example` to `apps/api/.env` and edit it. Restart development after changing environment variables.

## Commands

| Command             | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `pnpm dev`          | Build shared code, then watch both apps and their dependencies |
| `pnpm build`        | Build shared code and both apps for production                 |
| `pnpm lint`         | Lint all packages                                              |
| `pnpm typecheck`    | Check types in all packages                                    |
| `pnpm format`       | Format source and configuration                                |
| `pnpm format:check` | Check formatting                                               |

To develop one app with its dependencies, use `pnpm dev --filter=@repo/web` or `pnpm dev --filter=@repo/api` from the root.

After `pnpm build`, run `pnpm --filter @repo/api start` and `pnpm --filter @repo/web start` in separate terminals.

## Shared code

Add exports to `packages/shared/src/index.ts` and import them from `@repo/shared`. Keep this package independent of browser APIs and NestJS so both apps can consume it. It compiles to JavaScript and type declarations in `dist`; Turbo builds it before dependent tasks. During `pnpm dev`, Turbo rebuilds shared code and restarts affected app tasks when dependencies change.

## Setup references

- [Turborepo internal packages](https://turborepo.dev/docs/crafting-your-repository/creating-an-internal-package)
- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [NestJS first steps](https://docs.nestjs.com/first-steps)
