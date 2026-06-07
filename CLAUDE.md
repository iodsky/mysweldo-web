# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MySweldo Web is a React 19 + TypeScript SPA for HR management (employees, attendance, leave, overtime, payroll). It communicates with a separate backend API (default: `localhost:8001`).

## Commands

```bash
npm run dev          # Start Vite dev server (API proxied via /api/*)
npm run build        # tsc --noEmit + vite build
npm run lint         # ESLint check (no auto-fix)
npm run preview      # Preview production build

# API type generation (requires backend running on localhost:8001)
npm run api:fetch    # Pull OpenAPI specs from backend
npm run api:generate # Generate TypeScript types from specs
```

No test runner is configured.

## Architecture

### Provider Stack (src/main.tsx)

```
MantineProvider → QueryClientProvider → AuthProvider → RouterProvider
```

### Auth

- `src/context/auth-provider.tsx` initializes on mount by attempting a token refresh (`/auth/refresh` with httpOnly cookie)
- Token stored in `localStorage`; accessed via `useAuth()` hook
- Axios interceptor in `src/api/client.ts` attaches `Bearer` token on each request and retries once on 401 with a refreshed token

### API Layer (src/api/)

One Axios instance (`src/api/client.ts`) with `withCredentials: true`. Each domain has its own module (`auth.ts`, `employee.ts`, `leave.ts`, etc.). All responses follow:

```ts
ApiResponse<T>         // { success, message, timestamp, data }
PaginatedApiResponse<T> // adds meta: { page, size, totalElements, totalPages, first, last }
```

**Pagination is 0-indexed** in the backend; the UI converts to 1-indexed for display.

All shared types (DTOs, domain types, response envelopes) live in `src/types/index.ts`.

### Server State

TanStack React Query v5 manages all data fetching and caching. Auth state (user, token, accessType) lives in React Context; no Redux or Zustand.

### Error Handling

`src/utils/error-handler.ts` exports `handleApiError()` — call it in mutation `onError` callbacks to show Mantine notifications for validation errors, duplicate fields, and generic API errors.

### Routing (src/routes/)

React Router v7. All pages under `/employee/*` and `/hr/*` are wrapped in `ProtectedRoute`. The navbar in `src/components/navbar.tsx` renders role-based links based on `accessType` (`EMPLOYEE` / `ADMIN`) and `role`.

### Component Conventions

- Reusable shared components in `src/components/`; page-level components in `src/pages/`
- Path alias `@/` maps to `src/`
- Mantine v9 components for UI; Tailwind CSS v4 utilities for layout/spacing

## Environment

Copy `.env.template` to `.env.local` and set:

```
VITE_API_BASE_URL=http://localhost:8001
```

The Vite dev server proxies `/api/*` to this URL.
