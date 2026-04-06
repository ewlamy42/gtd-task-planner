# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: SQLite (better-sqlite3) stored at `data/tasks.db`
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## GTD Task Planner App

A single-user GTD (Getting Things Done) task planner inspired by Google Keep.

### Architecture
- **Frontend**: React + Vite at `/` (`artifacts/task-planner/`)
- **Backend**: Express API server (`artifacts/api-server/`)
- **Database**: SQLite via `better-sqlite3`, stored at `data/tasks.db`
- **Repository layer**: All DB logic in `artifacts/api-server/src/db/repository.ts` — swap for a cloud DB by replacing this file

### Key Features
- Google Keep-style responsive task card grid
- GTD buckets: Inbox, Next Actions, Projects, Waiting For, Someday/Maybe
- Task urgency: Now / Soon / Later with global sorting (urgency → rank → createdAt)
- Environments (Work, Side Gig, Personal + custom)
- Tags/contexts (@home, @computer, etc.)
- Quick-add bar, search, and multi-dimensional filters
- Stats sidebar with completion rate

### API Endpoints
- `GET/POST /api/environments` — list and create environments
- `PUT/DELETE /api/environments/:id` — update or delete environment
- `GET /api/tasks` — list tasks with filters (environmentIds, status, urgency, search, tags, includeCompleted)
- `POST /api/tasks` — create task
- `GET /api/tasks/stats` — get task statistics
- `GET/PUT/DELETE /api/tasks/:id` — get, update, or delete a task

### Extending Storage
To swap SQLite for a cloud database, replace `artifacts/api-server/src/db/repository.ts` with a new implementation that exports the same functions:
`getTasks`, `getTask`, `createTask`, `updateTask`, `deleteTask`,
`getEnvironments`, `createEnvironment`, `updateEnvironment`, `deleteEnvironment`,
`getTaskStats`, `seedDefaultEnvironments`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
