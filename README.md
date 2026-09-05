# mysweldo-web

A production-grade HR & payroll web application for Philippine statutory payroll (SSS, PhilHealth, Pag-IBIG, and withholding tax). This is the React SPA for **mysweldo** — employee management, attendance, leave, overtime, payroll runs, and IT administration in one place, with role-based access for employees, supervisors, HR, payroll, and IT admins.

This project demonstrates end-to-end full-stack engineering: a typed, codegen-driven API client, cookie-based JWT auth with automatic refresh, server-state caching, and a role-gated multi-dashboard UI. The companion backend lives in [`mysweldo-api`](https://github.com/iodsky/mysweldo-api).

## Live demo

- Backend API (Spring Boot, deployed): [`https://mysweldo-api.iodsky.com`](https://mysweldo-api.iodsky.com)
- Swagger UI: [`https://mysweldo-api.iodsky.com/api/swagger-ui.html`](https://mysweldo-api.iodsky.com/api/swagger-ui.html)

> Frontend demo link goes here once the SPA is deployed.

## Features

- **Role-based dashboards** — distinct landing experiences for Employee, Supervisor, HR, Payroll, IT, and Superuser (`accessType` + `role` gating on routes and navbar links).
- **Employee management** — list, search, and filter employees; detail view with salary history, benefits, government IDs; create/edit with a right-side drawer form.
- **Time & attendance** — clock-in/clock-out, personal attendance history, and HR-wide attendance view.
- **Leave & overtime** — request submission, credit tracking, and an inline approve/reject workflow for supervisors and HR.
- **Payroll** — payroll run list/detail, generate + status workflows, and CRUD configuration for SSS, PhilHealth, Pag-IBIG, and income-tax brackets.
- **Team management (supervisor)** — attendance, overtime, and leave tabs for the supervisor's roster.
- **CSV bulk import** — employee and user imports with job status and per-row error details.
- **IT administration** — user and role management with role-based page guards.

## Tech stack

| Concern | Technology |
| --- | --- |
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| UI | Mantine v9 (+ `@mantine/charts`), Tailwind CSS v4 |
| Server state | TanStack Query v5 |
| Routing | React Router v7 |
| HTTP | Axios (cookie-based auth) |
| API client | Generated with orval from the backend OpenAPI spec |

## Architecture

### Provider stack (`src/main.tsx`)

```
MantineProvider → QueryClientProvider → AuthProvider → RouterProvider
```

### Auth

Access and refresh tokens are **HTTP-only cookies** set by the backend — never read or stored in JS/localStorage. On mount the app silently calls `/auth/refresh` then `/auth/me` to restore the session; an axios response interceptor single-flights `/auth/refresh` on a 401 and retries the failed request.

### Codegen-first API layer (`src/api/`)

There are no hand-written per-domain API modules. `npm run api:fetch` pulls the backend OpenAPI spec, and `npm run api:generate` (orval) produces:

- `src/api/generated/model/` — fully typed DTOs/enums for every endpoint.
- `src/api/generated/endpoints/<tag>/` — typed SDK functions plus TanStack Query hooks and query-key helpers.

Pages consume generated hooks via a small unwrap layer (`src/api/helpers.ts`): `unwrapData` for single DTOs, `unwrapPage` for `PageDto<T>` paginated lists.

### Server state

All data fetching and caching goes through TanStack Query. Auth state (user, `accessType`, `role`) lives in React Context — no Redux or Zustand.

### Routing & guards

Routes are declared with `createBrowserRouter` in `src/routes/app-routes.tsx`. `ProtectedRoute` gates authenticated areas; `RoleRoute` gates by role/access type; the navbar renders role-appropriate links.

### Error handling

Mutations route errors through `handleApiError()` (`src/utils/error-handler.ts`) to surface Mantine notifications for validation errors, duplicate fields, and generic API failures.

## Getting started

### Prerequisites

- Node.js (Vite 8 — Node 20.19+ / 22.12+)
- The `mysweldo-api` backend running at `localhost:8001`

### 1. Install & run

```bash
npm install
npm run dev
```

### 2. Configure the API base URL

Set `VITE_API_BASE_URL` in `.env.local` (must include the `/api` suffix):

```
VITE_API_BASE_URL=http://localhost:8001/api
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck (`tsc -b`) and build for production |
| `npm run lint` | ESLint check |
| `npm run preview` | Preview the production build |
| `npm run api:fetch` | Download the OpenAPI spec from the running backend |
| `npm run api:generate` | Regenerate the typed API client with orval |

## TypeScript strictness

`verbatimModuleSyntax` (type-only imports must use `import type`), `erasableSyntaxOnly` (no enums/parameter properties), and `noUnusedLocals`/`noUnusedParameters` are all enforced — the build fails otherwise.

## Related

- [`mysweldo-api`](https://github.com/iodsky/mysweldo-api) — Spring Boot backend (Java 21, PostgreSQL, Flyway, JWT, payroll engine).