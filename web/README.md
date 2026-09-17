# Medora HMS — Phase 1 (Frontend Foundation, no backend)

React + React Router application built from the original `hms-prototype.html`
static mockup. This phase focuses purely on frontend structure and routing,
per project scope — there is no backend/API/database in this build.

## What this phase delivers

- **Real React app structure** — Vite + React, organized into
  `components/`, `pages/`, `layouts/`, `routes/`, `context/`, `services/`, `legacy/`.
- **Real routing** — `react-router-dom` with genuine, bookmarkable URLs
  (`/dashboard`, `/patients`, `/patients/:id`, `/appointments`, …) replacing
  the prototype's fake in-memory `S.route` router.
- **Protected routes** — `ProtectedRoute` blocks any page unless the user is
  authenticated; `RoleRoute` blocks pages a role isn't allowed to see,
  mirroring the original `ROLE_ROUTES` table.
- **Removed fake auth** — no more `setTimeout(() => authed = true)` and no
  more role-selector dropdown in the top bar. Login is a real controlled
  form against an auth service.
- **Preserved UI exactly** — no redesign. The existing design system
  (`src/legacy/legacy.css`) and all page markup/behavior were ported
  from the prototype essentially verbatim.

## What this phase intentionally does NOT include

There is no backend in this build (by request) — no Express/API, no
PostgreSQL, no real password hashing, no server-side authorization.
`src/services/authService.js` is a **mock**, browser-only auth service with
hardcoded dev credentials, clearly marked as insecure and not for
production. It's written with the same shape a real `api.auth.*` client
would have, specifically so it can be swapped out later without touching
`AuthContext` or any page.

Patients/Appointments/Consultation/etc. still use static mock data
(ported from the prototype) — full CRUD against real data is a later phase.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
```

## Dev accounts (frontend-only, insecure — remove before any real deployment)

| Role            | Email                        | Password     |
|-----------------|-------------------------------|---------------|
| Administrator   | admin@alshifa.hospital        | admin123      |
| Receptionist    | reception@alshifa.hospital    | reception123  |
| Doctor          | s.khan@alshifa.hospital       | doctor123     |
| Nurse           | nurse@alshifa.hospital        | nurse123      |
| Lab Technician  | lab@alshifa.hospital          | lab123        |
| Pharmacist      | pharmacy@alshifa.hospital     | pharmacy123   |

These are also shown in a collapsible "Dev accounts" hint on the login screen.

## Project structure

```
src/
  components/       reusable UI building blocks (scaffolded, ready for Phase 2)
  pages/            one folder per route, each a thin wrapper around the legacy engine
  layouts/          AppLayout.jsx — bridges React Router <-> legacy engine
  routes/           AppRoutes.jsx, ProtectedRoute.jsx, RoleRoute.jsx
  context/          AuthContext.jsx — the single source of truth for the current user
  services/         authService.js — mock auth (swap for a real API client later)
  legacy/           legacy.css + legacyEngine.js — the ported prototype UI/behavior
```

## Known limitations / next steps

- Auth is entirely client-side and resets on server restart / new browser tab
  (uses `sessionStorage`). Not secure — do not use with real data.
- Role/permission checks are frontend-only "don't show this page" logic, not
  real access control. A real backend must independently re-check
  permissions on every request once one exists.
- Business pages (Patients, Appointments, etc.) render static mock data
  ported from the prototype; no real CRUD yet.
