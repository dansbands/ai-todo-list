# AI Todo List migration brief

## Goal
Migrate this repo from a split CRA frontend + Express/Render backend into a single Next.js app so it can be deployed as one project without depending on the old free Render backend.

## Current architecture
- CRA frontend in top-level `src/`
- Express backend in `server/`
- MongoDB data store
- JWT + bcrypt auth
- Frontend currently calls backend through environment-based fetch utilities
- AI helper currently depends on backend endpoint and stores a structured JSON response on the todo

## What must be preserved
- Sign up
- Sign in
- Current user session lookup
- Todo CRUD
- AI helper for todos
- Current UI behavior as much as possible
- MongoDB persistence

## Target architecture
- Single Next.js app using App Router
- Route handlers under `app/api/**`
- Same-origin API calls from the client
- No Express server
- No dependency on external Render backend

## Required work
1. Bootstrap or migrate repo into a Next.js app with App Router
2. Port Express routes into Next route handlers
3. Create shared Mongo connection utility
4. Move auth helpers into reusable server utilities
5. Replace frontend data utilities so they call same-origin `/api/...`
6. Port AI endpoint into Next route handler
7. Preserve current structured AI response contract:
   - `message`
   - `links`
   - `googleSearch`
8. Add solid JSON error handling
9. Remove obsolete Express/Cra files and scripts
10. Update README and env var docs

## Acceptance criteria
- App runs locally as one process
- No dependency on old Render backend
- Auth works end-to-end
- Todo CRUD works end-to-end
- AI helper works end-to-end
- Repo is deployable as a single Next.js project

## Constraints
- Do not redesign the app
- Preserve behavior over perfection
- If a full migration cannot be finished cleanly, produce the best working partial migration and document remaining gaps clearly in the PR