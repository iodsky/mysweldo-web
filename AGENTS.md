# AGENTS.md

React 19 + TypeScript + Vite SPA for HR management (employees, attendance, leave, overtime, payroll). Talks to a separate Spring Boot backend API (default: `localhost:8001`).

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build (typecheck via project references, NOT tsc --noEmit)
npm run lint     # ESLint check (no autofix)
npm run preview  # Preview dist build
```

No test runner. Prettier is installed (`.prettierrc` = `{}`) but not wired into any script.

## Environment

- `VITE_API_BASE_URL` must include the `/api` suffix — the axios client uses it directly as `baseURL` (`src/api/client.ts:4`). Working local value: `http://localhost:8001/api` (see `.env.local`).
- Because the base URL is absolute, requests hit the backend directly via CORS and the Vite `/api` proxy in `vite.config.ts` is effectively unused.
- `.env.prod` is only loaded with `--mode prod` (Vite loads `.env.[mode]`); there is no `build --mode prod` script, so it is unused today.

## Architecture

### Provider Stack (src/main.tsx)

```
MantineProvider → QueryClientProvider → AuthProvider → RouterProvider
```

### Auth

- Access + refresh tokens are **httpOnly cookies** set by the backend; the frontend never reads or stores them in JS/localStorage.
- `src/context/auth-provider.tsx` initializes on mount by silently calling `/auth/refresh` then `/auth/me`; `isAuthenticated` derives from the user. A `useRef` guard prevents React StrictMode from double-firing this in dev.
- Axios interceptor in `src/api/client.ts` retries once on 401 after a single-flight `/auth/refresh`; skips `/auth/login|logout|refresh`.

### API Layer (src/api/)

One Axios instance (`src/api/client.ts`) with `withCredentials: true`. Each domain has its own module (`auth.ts`, `employee.ts`, `leave.ts`, etc.). All responses follow:

```ts
ApiResponse<T>          // { success, message, timestamp, data }
PaginatedApiResponse<T> // adds meta: { page, size, totalElements, totalPages, first, last }
```

- Pagination is 0-indexed on the wire. UI sends `{ pageNo, limit }` (`PaginationFilters`) and renders `meta.page + 1` for Mantine's 1-indexed `<Pagination>` (`src/components/paginated-table.tsx:80`).
- All shared types live in `src/types/index.ts`; one API module per domain in `src/api/`.

### Server State

TanStack React Query v5 manages all data fetching and caching. Auth state (user, accessType) lives in React Context; no Redux or Zustand.

### Error Handling

`src/utils/error-handler.ts` exports `handleApiError()` — call it in mutation `onError` callbacks to show Mantine notifications for validation errors, duplicate fields, and generic API errors.

### Routing (src/routes/)

React Router v7. Routes are declared manually in `src/routes/app-routes.tsx` (`createBrowserRouter`), not file-based. Bracket-named files like `src/pages/hr/employees/[id].tsx` are imported explicitly. All pages under `/employee/*` and `/hr/*` are wrapped in `ProtectedRoute`. The navbar in `src/components/navbar.tsx` renders role-based links based on `accessType` (`EMPLOYEE` / `ADMIN`) and `role`.

### Component Conventions

- Reusable shared components in `src/components/`; page-level components in `src/pages/`.

## TypeScript strictness (build fails otherwise)

- `verbatimModuleSyntax: true` — type-only imports MUST use `import type`.
- `erasableSyntaxOnly: true` — no `enum` or TS parameter properties.
- `noUnusedLocals` / `noUnusedParameters` — unused variables fail the build.

## Codegen (broken)

`npm run api:fetch` / `api:generate` do not work: `openapi-ts` (hey-api) is absent from `devDependencies` and there is no `openapi-ts.config.ts`. Add the dependency and config before relying on type generation.

## Conventions

- Path alias `@/` → `src/` (vite + tsconfig).
- Mantine v9 for components; Tailwind v4 utilities for layout/spacing. Mantine styles imported in `src/main.tsx`.
- Call `handleApiError()` (`src/utils/error-handler.ts`) in mutation `onError` for Mantine notifications (validation / duplicate / generic).
