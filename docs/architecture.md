# Architecture Overview

AI Todo List is a full-stack React and Node app built around one idea: turn a task into an actionable plan, not just a reminder. The frontend focuses on a fast task-management workflow, while the backend handles authentication, todo persistence, and AI-guided planning.

## High-Level Shape

- `src/` contains the React client.
- `server/` contains the Express API, database access, validation, and AI integration.
- MongoDB stores users, todos, and saved assistant guidance.
- The client talks to the API with JSON over HTTP.

## Client Layer

The client is centered around `src/App.js`, which wires together routing, authentication gates, and the main task experience.

- `Layout` provides the shared shell and theme controls.
- `RequireAuth` protects the task dashboard for signed-in users.
- `SignIn` and `SignUp` handle account access.
- `Tasks` renders the todo workflow and assistant guidance.
- Shared helpers in `src/util/fetch.js` standardize request handling, auth headers, and error normalization.

The UI keeps AI output structured so the app can render it predictably instead of treating it like freeform text.

## Server Layer

The server is an Express app started from `server/index.js` and configured in `server/app.js`.

- Authentication uses JWTs.
- Request payloads are validated before mutations.
- Todo ownership is enforced at the API layer.
- Assistant responses are normalized before they are stored or returned.
- CORS is configured by environment so production can stay locked down.

## Data Flow

1. The user signs in or creates an account.
2. The client stores the JWT and sends it on authenticated requests.
3. The server fetches or mutates todos in MongoDB.
4. When the user asks for help, the server calls the AI service.
5. The returned guidance is normalized and persisted on the todo.
6. The frontend renders the guidance as plan text, steps, and resources.

## Design Principles

- Keep the API contract predictable.
- Validate inputs early and fail clearly.
- Store the minimum data needed to recreate the user experience.
- Separate presentation concerns from persistence concerns.
- Make AI output safe to render by constraining its shape.
