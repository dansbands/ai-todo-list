# System Design

This project is designed as a small but realistic full-stack system. It demonstrates authentication, data ownership, AI-assisted workflows, and environment-specific deployment settings without adding unnecessary infrastructure.

## Core Components

- Frontend: React single-page app.
- API: Express server with route-level auth and validation.
- Database: MongoDB for users and todos.
- AI: Server-side service that generates structured guidance.
- Hosting: Frontend and backend can be deployed independently, with client API URLs controlled by environment variables.

## Request Lifecycle

### Authenticated Todo Request

1. The client sends a request with a bearer token.
2. The API verifies the JWT and attaches the user to the request.
3. The route validates the request body.
4. The database query is scoped to the authenticated user.
5. The API returns a normalized response shape.

### AI Guidance Request

1. The user submits a todo or asks for next steps.
2. The server loads the todo record and calls the AI service.
3. The AI output is normalized into a stable schema.
4. The normalized guidance is stored with the todo.
5. The client renders the response as message text, steps, and links.

## Security Model

- JWT-based authentication protects private routes.
- Todo ownership is checked on every mutating operation.
- Request bodies are validated and rejected if they contain unexpected fields.
- Assistant guidance is normalized before display to reduce malformed output risk.
- CORS is environment-specific so production only accepts trusted browser origins.

## Operational Notes

- `REACT_APP_SERVER_URL` points the client to the local API during development.
- `REACT_APP_PROD_SERVER_URL` points the client to the deployed API in production.
- `CORS_ALLOWED_ORIGINS` lets the API accept only explicit frontends in production.
- The server defaults are intentionally conservative so the public deployment is harder to misuse.

## Why This Design Works

The system stays simple because the frontend, API, and database each own a narrow responsibility. That keeps the app easy to reason about, easy to test, and easy to evolve when the assistant response format or product shape changes.
