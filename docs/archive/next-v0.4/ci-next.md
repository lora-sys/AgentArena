# CI

GitHub Actions workflow at `.github/workflows/ci.yml` runs on every PR + push to `main`.

## Jobs

| Job | What it does |
|---|---|
| `typecheck` | `pnpm typecheck` — tsc --noEmit across workspace |
| `lint` | `pnpm lint` — Next.js + ESLint |
| `test` | `pnpm test --coverage` against Postgres 16 service container |
| `build` | `pnpm build` — Next.js production build |
| `coverage-comment` | Posts coverage delta to PR (only on PR runs) |

## Required env vars (none required for CI itself)

CI uses public-only secrets. Tests need `DATABASE_URL` which is provided by the Postgres service container.

## Local reproduction

```bash
docker run --rm -d --name test-pg -p 5432:5432 \
  -e POSTGRES_USER=agentarena \
  -e POSTGRES_PASSWORD=agentarena \
  -e POSTGRES_DB=agentarena_test \
  postgres:16

export DATABASE_URL=postgres://agentarena:agentarena@localhost:5432/agentarena_test
pnpm install
pnpm db:push
pnpm test -- --coverage

docker stop test-pg
```

## Debugging a failing CI run

1. Click into the failing job
2. Check the failing step's logs
3. Reproduce locally using the commands above
4. Coverage report is uploaded as artifact even on failure