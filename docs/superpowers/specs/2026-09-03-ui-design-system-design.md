# MySweldo UI Design System — Design Spec

**Date:** 2026-09-03
**Status:** Approved (awaiting implementation)
**Author:** iodsky + opencode

## 1. Problem

The app is functionally complete but visually bare:

- `MantineProvider` has no theme — everything renders with default Mantine blue/gray.
- The sidebar and header are unstyled (header is just two burger toggles, no brand).
- The HR dashboard is a placeholder (renders only the word "Dashboard").
- Pages rely on default Mantine component styling with minimal Tailwind polish, so spacing, color, and hierarchy feel unintentional.
- The login page uses ad-hoc `color="black"` / `color="gray"` hacks.

## 2. Decisions (agreed with user)

| Topic | Decision |
| --- | --- |
| Scope | Full design system + polish across the whole app |
| Brand | No existing brand — propose one (teal direction selected) |
| Visual direction | Modern light SaaS (clean, airy, whitespace, subtle borders/shadows) |
| Primary color | **Teal** `#0D9488` (chosen from palette options A/B/C) |
| Rollout | Build everything, then review |

## 3. Design Plan

### 3.1 Theme foundation

Create `src/theme.ts` exporting a Mantine theme object and wire it into `MantineProvider` in `src/main.tsx`.

- **Primary color:** teal with a full tint scale (50 → 900, matching the selected swatches).
- **Neutral scale:** warm gray (`gray` from Mantine's default is fine; tune if needed).
- **Semantic colors:** success (green), warning (amber), danger (red) — used by badges, status chips, alerts.
- **Radius:** `lg` (soft rounded corners).
- **Shadows:** subtle default shadow for cards/popovers.
- **Typography:** keep default sans (Inter-style); refine sizes/weights via `fontSizes`/`headings` where helpful.
- Remove inline `color="black"` / `color="gray"` button hacks (login page) in favor of theme colors.

### 3.2 Brand

Simple wordmark composed of:

- A teal rounded-square icon glyph (wallet/coin motif, e.g. `IconWallet`/`IconCoin` from `@tabler/icons-react`).
- "MySweldo" logotype next to it.

Shown in the sidebar header and (optionally) the login page.

### 3.3 Layout & navigation

**`src/components/layout.tsx`** — restyle `AppShell`:

- **Header:** brand + current-page context, subtle bottom border, consistent height.
- **Main:** keep the fluid container; ensure page content sits on a light gray background (`gray.0`) so white cards stand out.

**`src/components/navbar.tsx`** — restyle:

- White sidebar surface.
- Brand at top.
- Active link = teal-tinted pill; hover states on all items.
- Section grouping labels where meaningful (HR / IT / Payroll / Employee).
- User/role chip + logout pinned at bottom.
- Keep existing role-based link maps and logout behavior intact.

### 3.4 Shared UI primitives (new `src/components/ui/`)

- **`PageHeader`** — title + subtitle + optional action slot; replaces repeated breadcrumb/header boilerplate across pages.
- **`StatCard`** — label, value, optional trend icon/delta; used by the dashboard.
- **`EmptyState`** — icon, message, optional CTA; used by tables/lists with no data.
- **`PageCard`** (optional) — consistent white card container with border/radius/shadow.

Restyle existing shared components:

- **`PaginatedTable`** — clean header row (bold, muted, no column borders), striped or soft hover, rounded card container, refined pagination. Remove the harsh `withColumnBorders`.
- **`EmployeeForm`** — minor polish only (spacing, section labels); functionality untouched.
- **`ConfirmationModal`** — use theme primary instead of `blue` for confirm.

### 3.5 Pages (restyle order)

1. **Login** (`src/pages/auth/login`) — branded card, theme colors, proper button/input styling.
2. **Forgot password** (`src/pages/auth/forgot-password`) — match login style.
3. **HR Dashboard** (`src/pages/hr/dashboard`) — build a real dashboard: stat cards (e.g. total employees, pending leave, pending overtime) + recent-activity placeholder. Needs backend endpoints for real data; use available hooks where present, otherwise show a well-designed scaffold.
4. **HR Employees** (list + `[id]` detail) — PageHeader, styled table, better status/type badges, cleaner detail card sections.
5. **HR Leave** (requests + credits tabs) — PageHeader, styled tables, consistent modals.
6. **HR Overtime / Attendance / Department / Position / Benefit** — PageHeader + consistent card/table styling.
7. **Employee pages** (profile, attendance, leave, overtime, payslip) — PageHeader + consistent styling.

### 3.6 Scope notes

- Navbar links to `/it/users` and `/payroll/runs`, but those pages **do not exist yet** (no route entries). Out of scope for this pass — the design system will be ready for them when built. No new backend endpoints or routes are introduced here.
- No functional/behavioral changes; this is a visual/structural pass only.

## 4. Implementation checklist

- [ ] `src/theme.ts` + wire into `main.tsx`
- [ ] Shared UI primitives (`PageHeader`, `StatCard`, `EmptyState`)
- [ ] Restyle `Layout` + `Navbar` (brand, active states)
- [ ] Restyle `PaginatedTable` + `EmployeeForm`
- [ ] Restyle Login + Forgot password + Not found
- [ ] Build real HR Dashboard
- [ ] Restyle HR pages (employees, detail, leave, overtime, attendance, department, position, benefit)
- [ ] Restyle Employee pages (profile, attendance, leave, overtime, payslip)
- [ ] `npm run build` + `npm run lint` green

## 5. Verification

- `npm run build` (runs `tsc -b && vite build`) must pass — strict TS (`verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals/Parameters`).
- `npm run lint` must pass.
- No test runner exists; visual review by the user after build.
