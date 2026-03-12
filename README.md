# MSPBots React Template

This is a full-stack React template for the MSPBots platform.


It includes:

- Frontend: React + TypeScript + Tailwind CSS + `@mspbots/ui`
- Backend: Deno runtime (`service/`) + REST APIs
- Platform integration: routing, layout, auth redirect, micro-frontend bridge

This document is an operator manual for LLMs working inside a project created from this template.

## Golden Rules (for LLMs)

1. Always follow the target package's README before using its API.
2. Do not invent APIs, props, config fields, or file locations.
3. Frontend API calls must use `$fetch` / `@mspbots/fetch` (no raw `fetch()` unless a package README requires it).
4. Never log or expose the token string. Use `window.useAccess()` only for roles/payload debugging.
5. Route/menu permissions should be implemented with page `meta` (`menu` / `route`) first, and only then with element-level gating (`<Permission />`).
6. All scrollable areas must use `ScrollArea` from `@mspbots/ui` (avoid `overflow-*-auto/scroll`). Run `pnpm -s check:scroll` to enforce.

## Project Structure

```
.
├── pages/                 Frontend pages (EDITABLE)
├── service/               Backend directory (EDITABLE)
│   ├── deno.json          Backend imports & permissions
│   └── server.ts          API routes
├── mspbot.config.ts       App/system config
└── package.json           Frontend dependencies & scripts
```

## Quick Start

Install dependencies:

- `pnpm install`

Frontend:

- Edit `pages/Home.tsx` as a reference.
- Add new pages under `pages/` (routing is automatic).

Backend:

- Add API routes in `service/server.ts`.
- Add backend dependencies with Deno:
  - `cd service && deno add npm:<package>`

Development:

- `pnpm dev`
- `pnpm build`

Notes:

- `pnpm dev` will also run `predev` (`cd service && deno install`) to prepare the backend runtime.
- Frontend can read app id via `import.meta.env.APP_ID` or `__APP_ID__` (shown in `pages/Home.tsx`).

## Frontend: Routing, Menus, Permissions

### 1) File-based routing (`pages/`)

Routing is generated from file paths:

- `pages/Home.tsx` → `/`
- `pages/User/List.tsx` → `/user/list`
- `pages/User/[id].tsx` → `/user/:id`

### 2) Page meta (the primary API) (frontend-only permissions)

Each page can export a `meta` object to control label/icon/order, menu visibility, and route access:

```tsx
export const meta = {
  label: 'Admin',
  icon: 'Settings',
  order: 10,
  menu: ['admin'],   // show in menu only if role matches
  route: ['admin'],  // allow visiting only if role matches
}
```

- `menu`: controls whether the page appears in navigation
- `route`: controls whether the route is accessible (otherwise redirects to `/403`)

Frontend-only note: This controls navigation visibility and route accessibility for UX. It does not replace server-side authorization. For sensitive data or protected operations, enforce checks in `service/server.ts`.

### 3) Element-level gating with `<Permission />` (frontend-only permissions)

For smaller UI fragments inside a page, use `Permission` from `@mspbots/ui`:

```tsx
import { Button, Permission } from '@mspbots/ui'

<Permission roles={['admin']} fallback={null}>
  <Button>Admin Action</Button>
</Permission>
```

`Permission` reads roles from `window.useAccess?.()` (injected by `@mspbots/system`).

Frontend-only note: This provides element-level visibility only and is not a data security boundary. Access to backend resources must be authorized on the server.

## Auth Redirect (no/invalid token → login)

This template can redirect to a login page when the token is missing or invalid:

- Config: `system.auth.enabled = true` and `system.auth.loginPath = '/apps/mb-platform-user/login'`
- Behavior: `window.location.href = loginPath`
- Loop prevention:
  - If already on `loginPath` (or its sub-path), it will not redirect again
  - Uses `sessionStorage['__mspbots_auth_redirect__']` to avoid repeating the same redirect within a session

## Backend: Adding APIs

Add new REST endpoints in `service/server.ts`. Keep handlers small, type-safe, and return stable JSON.

For frontend requests, see [`@mspbots/fetch` README](node_modules/@mspbots/fetch/README.md).

### Server Authorization (backend)
 
Install and utilize `@tools/auth` to enforce unified permission checks. Server-side authorization serves as the ultimate security boundary for data and operations, safeguarding API resources and data integrity.

### Local Development & Proxy

When running locally (`pnpm dev`), the development server automatically proxies specific paths to the backend Deno process. To ensure your APIs work correctly in local development, please follow these path conventions:

| Path Prefix | Usage | Description |
| :--- | :--- | :--- |
| `/api/*` | REST APIs | Standard HTTP requests (GET, POST, etc.) |
| `/sse/*` | SSE | Server-Sent Events streams |
| `/ws/*` | WebSocket | Real-time WebSocket connections |

> **Note:** These proxies are configured automatically by the CLI. Using other prefixes for backend routes may result in 404 errors during local development unless you manually configure additional proxies in `mspbot.config.ts`.

## Backend API Monitor (MySQL + Email Alert)

This project includes a backend monitor module under `monitor-service/`.

### What it does

- Runs every 5 minutes (`MONITOR_INTERVAL_SECONDS=300`)
- Calls tenant API `/apps/mb-platform-user/api/tenants` with pagination (`page/pageSize`)
- Calls agents API `/apps/mb-platform-agent/api/agents` for each tenant with cookie `X_Tenant_ID=<tenant.id>`
- Saves every request execution record to MySQL (`request_logs`)
- Saves tenant snapshots to MySQL (`tenant_cache`)
- Sends alert email immediately when:
  - tenant API request fails
  - tenant API returns empty tenant array
  - agents API request fails for any tenant
  - critical tenant (default `mspbots.ai,mspbots`) returns empty agents array

### Required env vars

Already added in `.env.development` and `.env.production`:

- MySQL: `MONITOR_DB_HOST`, `MONITOR_DB_PORT`, `MONITOR_DB_NAME`, `MONITOR_DB_USER`, `MONITOR_DB_PASSWORD`
- SMTP: `MONITOR_SMTP_HOST`, `MONITOR_SMTP_PORT`, `MONITOR_SMTP_USER`, `MONITOR_SMTP_PASS`, `MONITOR_EMAIL_TO`
- APIs: `MONITOR_TENANT_API_URL`, `MONITOR_AGENT_API_URL`, `MONITOR_TENANT_API_TOKEN`, `MONITOR_AGENT_API_TOKEN`
- Tenant cookie context: `MONITOR_TENANT_COOKIE_TENANT_ID`, `MONITOR_AGENT_COOKIE_HOST`
- Scheduler: `MONITOR_ENABLED`, `MONITOR_INTERVAL_SECONDS`, `MONITOR_RUN_ON_START`

### SQL initialization

Schema file:

- `monitor-service/sql/001_init_monitor_tables.sql`

The backend also auto-initializes schema at startup, but keeping SQL file allows manual DBA execution and review.

### Runtime behavior

- Scheduler auto-starts when backend starts
- Duplicate overlapping runs are prevented
- Request/alert/run tracking tables:
  - `monitor_runs`
  - `tenant_cache`
  - `request_logs`
  - `alert_logs`

### Operations APIs

- Trigger one run: `POST /api/monitor/run`
- Get monitor status: `GET /api/monitor/status`

## Permission Selection Guide (frontend vs backend)

- Frontend permissions (page `meta` / `Permission` component): navigation and element visibility; keywords: frontend permissions, route guard, visibility, UX.
- Backend authorization (`server.ts` / `@tools/auth`): API access control and data security; keywords: server-side authorization, permission check, API protection, roles/scopes.
- Use both for sensitive pages/operations: frontend for UX, backend for security.

## Core Packages You Must Read (before coding)

This template relies on several core packages. Always read their README before using them.

Docs location in a generated project:

- Frontend packages: `node_modules/<pkg>/README.md`
- Backend (Deno) packages: `service/node_modules/<pkg>/README.md` (after `pnpm dev` / `deno install`)

| Package | Scope | When to use it | Readme path |
| :--- | :--- | :--- | :--- |
| `@mspbots/routes` | Frontend (build) | When you add/rename pages under `pages/`, want menus, or need page-level role gating via `meta.menu` / `meta.route`. | `node_modules/@mspbots/routes/README.md` |
| `@mspbots/system` | Build + runtime inject | When you need system-level behavior: app title/icon, theme/layout, 403 handling, global `$fetch`, `window.useAccess()`, or auth redirect (`system.auth`). | `node_modules/@mspbots/system/README.md` |
| `@mspbots/react` | Build | When you need to change the build pipeline for the template. In most cases, you only configure it in `mspbot.config.ts` and let it aggregate everything. | `node_modules/@mspbots/react/README.md` |
| `@mspbots/ui` | Frontend | When you build UI pages: buttons/forms/dialogs/tables, and element-level permission gating with `<Permission />`. | `node_modules/@mspbots/ui/README.md` |
| `@mspbots/fetch` | Frontend | HTTP requests (`$fetch`), Server-Sent Events (`$sse`), WebSocket (`$ws`). Provides automatic basePath normalization and auth headers injection. | `node_modules/@mspbots/fetch/README.md` |
| `@mspbots/layout` | Frontend | When you customize the app shell (sidebar/header), navigation rendering, or layout behavior beyond `system.layout` config. | `node_modules/@mspbots/layout/README.md` |
| `@mspbots/bridge` | Frontend | When integrating micro-frontends: token/context sync, events, or host/sub-app communication. | `node_modules/@mspbots/bridge/README.md` |
| `@mspbots/type` | Frontend/shared | When you need shared types (page nodes, handler params, platform types) across UI and server logic. | `node_modules/@mspbots/type/README.md` |

## Optional Tools (examples)

These are optional backend-side tools. Only install them when the feature is required, and always follow each package README after installing.

| Package | When to use it (backend) |
| :--- | :--- |
| `@tools/langchain-sdk` | When you need LLM calls, agents, tool execution, prompt pipelines, or RAG workflows. |
| `@tools/database` | When you need persistent storage (e.g., Postgres/MySQL) instead of in-memory data. |
| `@tools/common` | When you need shared utilities/resources or MSPBots common integrations provided by the platform. |
| `@tools/auth` | Server-side authorization & access control for `service/server.ts`: validate user/roles/scopes to protect API resources. Use when endpoints require authenticated/authorized access. |
| `@tools/applogs-sdk` | When you need application logs storage and search/retrieval. |


Install with Deno when needed:

- `cd service && deno add npm:@tools/langchain-sdk`
- `cd service && deno add npm:@tools/database`
- `cd service && deno add npm:@tools/common`
- `cd service && deno add npm:@tools/auth`
- `cd service && deno add npm:@tools/applogs-sdk`

---

## License

MIT
