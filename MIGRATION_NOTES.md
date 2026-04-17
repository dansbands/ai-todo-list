# Migration Notes: CRA + Express → Next.js App Router

## What changed

- Migrated to a single Next.js app using App Router under `app/`.
- Migrated frontend routes:
  - `/` → task experience
  - `/sign-in`
  - `/sign-up`
- Ported backend endpoints into Next route handlers under `app/api/**`:
  - `GET /api/health`
  - `GET /api/user`
  - `POST /api/signup`
  - `POST /api/upgrade-guest`
  - `POST /api/signin`
  - `POST /api/guest-session`
  - `POST /api/user/todos`
  - `GET /api/todos`
  - `POST /api/todos`
  - `DELETE /api/todos/:id`
  - `PUT /api/todos/:id/edit`
  - `PUT /api/todos/:id/complete`
  - `POST /api/chat`
- Kept MongoDB, JWT auth, guest-session flow, guest-upgrade flow, and AI guidance contract expected by UI.
- Switched client API usage to same-origin (`/api/...`) by removing external backend URL selection logic.
- Removed obsolete split-architecture artifacts:
  - `server/`
  - `api/` (legacy Vercel wrappers)
  - `vercel.json` (legacy function mapping)
  - legacy CRA bootstrap files (`src/index.js`, `src/App.js`, etc.)
- Updated CI workflow to run tests/build for single-app architecture.
- Updated README and environment variable docs for Next.js architecture.

## Complete

- [x] Frontend migrated to Next App Router
- [x] Backend endpoints ported to `app/api/**`
- [x] Same-origin API calls in UI
- [x] MongoDB + auth + guest flows preserved
- [x] AI helper contract preserved for UI
- [x] Old Render backend dependency removed from runtime API calling
- [x] Obsolete CRA/Express files removed
- [x] README/env docs updated

## Follow-up items (non-blocking)

- Consider replacing remaining CRA-based test runner (`react-scripts test`) with Next/Jest config in a dedicated follow-up.
- Consider replacing custom client router shim with idiomatic Next navigation + `<Link href>` refactor for SPA transitions.
- Consider adding focused route-handler tests for `app/api/**`.
