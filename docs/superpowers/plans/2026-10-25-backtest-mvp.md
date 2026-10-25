# Backtest MVP Implementation Plan

> **Execution:** Native implementation in the existing clean `develop` checkout; no commits or deploys.

**Goal:** Implement a usable single-asset backtest with monthly DCA or one-time purchase, saved configuration, execution history, and results.

**Architecture:** Keep the pure calculation in `core-backend`, fetch normalized daily OHLCV through the existing Yahoo integration, and persist each run separately from its reusable configuration. Add a client form and history view using the existing shadcn-style UI and API helper. No Kafka, Argo, or separate Market Data deployment in this slice.

**Tech Stack:** Bun, Express, Prisma 6/PostgreSQL, Yahoo Finance 2, Next.js 16, React 19, existing UI components.

**Spec:** The user's approved scope and decisions in the referenced conversation; repository Strategy Lab section in `README.md`.

## Global Constraints

- One asset per backtest; modes are one-time `LUMP_SUM` or monthly `RECURRING`.
- Simulated purchases use first eligible daily open on/after each scheduled date; final value uses last completed daily close.
- Fractional units and configured proportional fees are supported; amounts/results use the instrument's quote currency; no FX conversion, tax, dividend, split or slippage modeling.
- Persist every execution separately; reruns must not overwrite earlier runs.
- Preserve existing auth and route conventions; no new dependencies unless required.

## Review Focus

- Invalid amount, date range, symbol, or mode/frequency combinations are rejected before data access.
- Weekend/missing-bar contribution dates advance to the next available session, with no future look-ahead.
- Missing/invalid OHLCV or missing quote currency becomes an explicit failed execution, not a fabricated result.
- Rerunning the same configuration adds a new execution and preserves earlier result/data snapshots.
- User A cannot read or rerun User B's backtests.

---

### Task 1: Deterministic calculation

**Files:**
- Create: `apps/core-backend/strategy/backtest.engine.ts`
- Test: `apps/core-backend/strategy/backtest.engine.test.ts`

**Interfaces:** `runBacktest(config, candles)` accepts validated mode, dates, amounts, fee rate, and normalized OHLCV; returns purchases and aggregate metrics.

- [x] Write literal-fixture tests for lump sum, monthly DCA with a missing session, fees, and invalid/empty history.
- [x] Run with `bun test apps/core-backend/strategy/backtest.engine.test.ts`; confirm expected failures.
- [x] Implement the smallest pure function to satisfy the tests.
- [x] Re-run focused tests and backend tests.

### Task 2: Persistence, provider, and API

**Files:**
- Modify: `apps/core-backend/prisma/schema.prisma`
- Create: `apps/core-backend/prisma/migrations/<timestamp>_backtest_executions/migration.sql`
- Modify: `apps/core-backend/interfaces/backtest.interface.ts`
- Modify: `apps/core-backend/repositories/backtest.repository.ts`
- Modify: `apps/core-backend/services/backtest.service.ts`
- Modify: `apps/core-backend/controller/backtest.controller.ts`
- Modify: `apps/core-backend/routes/backtest/backtest.routes.ts`
- Create: `apps/core-backend/strategy/backtest.market-data.ts`

**Interfaces:** `POST /api/backtest` creates and runs; `GET /api/backtest` lists owned configurations and executions; `GET /api/backtest/:id` reads one; `POST /api/backtest/:id/executions` reruns one. Each attempt has its own status, immutable config/data snapshot, result, and purchases.

- [x] Add request-validation tests before implementation where repository test seams permit.
- [x] Add migration and regenerate Prisma client; ensure transaction/relation types agree.
- [x] Run backend unit and type checks; ownership filters remain enforced in the user-scoped Prisma queries.

### Task 3: Form and run history UI

**Files:**
- Create: `apps/web/src/features/backtest/api.ts`
- Create: `apps/web/src/features/backtest/backtest-form.tsx`
- Modify: `apps/web/src/app/app/backtest/new/page.tsx`
- Modify: `apps/web/src/app/app/backtest/page.tsx`

**Interfaces:** Submit one-asset configuration, show API validation/provider failures, list execution status/results, and let the user rerun an existing configuration.

- [x] Use existing shadcn-style `Card`, `Field`, `Input`, `Select`, `Button`, `Badge`, and `Separator` components.
- [x] Run web type/build checks and lint the changed files; no authenticated database-backed visual run was available.

### Task 4: Whole-slice verification

- [x] Run backend tests and typecheck, Prisma validation/generation, web type/build, and inspect the final diff.
- [x] Record environment-dependent checks: migration not applied to a database; no authenticated UI/database end-to-end run.
