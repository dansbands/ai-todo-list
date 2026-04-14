# AI Todo List

Turn tasks into **actionable plans with real next steps**—not just another checklist.

## Overview

AI Todo List is a single Next.js app (App Router) with:
- UI routes (`/`, `/sign-in`, `/sign-up`)
- Same-origin API routes (`/api/**`)
- MongoDB persistence
- JWT auth (including guest sessions + guest upgrade)
- AI task guidance with structured response payloads

## Tech Stack

- Framework: Next.js (App Router + Route Handlers)
- UI: React
- API/Auth: Next.js route handlers + JWT
- Database: MongoDB Atlas
- AI: OpenAI API

## API Response Contract (AI Guidance)

The UI expects structured guidance JSON:

```json
{
  "message": "Start by researching beginner bodyweight routines...",
  "links": [
    {
      "linkTitle": "Beginner bodyweight guide",
      "url": "https://example.com/workout-guide",
      "description": "A practical intro plan"
    }
  ],
  "googleSearch": "beginner bodyweight workout plan at home",
  "steps": ["Pick a 3-day split", "Track your first week"]
}
```

## Getting Started

```bash
git clone https://github.com/dansbands/ai-todo-list.git
cd ai-todo-list
npm install
npm run dev
```

Open: `http://localhost:3000`

## Environment Variables

Create `.env.local` (or `.env`) with:

```env
DB_USERNAME=your_mongodb_username
DB_PASSWORD=your_mongodb_password
JWT_PRIVATE_KEY=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

### Notes
- `DB_USERNAME`/`DB_PASSWORD` are used to build the MongoDB Atlas connection string.
- `JWT_PRIVATE_KEY` is required for signin/signup/guest tokens.
- `OPENAI_API_KEY` is required for `/api/chat` AI guidance.
- `REACT_APP_SERVER_URL`, `REACT_APP_PROD_SERVER_URL`, and `CORS_ALLOWED_ORIGINS` are no longer used in this unified Next.js architecture.

## Scripts

- `npm run dev` – start Next.js dev server
- `npm run build` – production build
- `npm run start` – run built app
- `npm test` – existing component/util tests

## License

MIT
