# AI Todo List

Turn tasks into **actionable plans with real next steps**—not just another checklist.

## Overview

AI Todo List is a lightweight productivity app that uses AI to **help users complete tasks**, not just track them.

Instead of manually breaking down work, users enter a task and receive a structured response that includes:
- A clear message explaining what to do
- Relevant links to get started
- A prebuilt Google search to continue exploration

This shifts the app from passive task tracking → **active task execution**.

---

## How It Works

1. User enters a task  
2. The app sends a prompt to an AI model  
3. The AI returns a **structured JSON response**:
   - `message` — actionable guidance
   - `links` — curated resources
   - `search` — optimized query string  
4. The UI renders this into a usable workflow

The key idea: **constrain AI output into predictable structure**, then build UX around it.

---

## Example Output

~~~json
{
  "message": "Start by researching beginner bodyweight routines...",
  "links": [
    "https://example.com/workout-guide",
    "https://example.com/home-fitness"
  ],
  "search": "beginner bodyweight workout plan at home"
}
~~~

---

## Key Features

- AI-assisted task breakdown  
- Structured JSON responses (not freeform text)  
- Direct links to relevant resources  
- One-click Google search handoff  
- Simple, fast UI focused on execution  

---

## Why This Exists

Most todo apps optimize for **organization**.

This project explores a different angle:

> What if a todo app helped you *actually do the thing*?

By combining AI with structured outputs, this app reduces:
- decision fatigue  
- context switching  
- “where do I start?” friction  

---

## Tech Stack

- Frontend: HTML, CSS, JavaScript  
- AI: OpenAI API  
- Hosting: Render  
- Database: MongoDB Atlas  

---

## Architecture Notes

- AI responses are constrained into a **predictable JSON schema**  
- Frontend is responsible for rendering structured data, not parsing prose  
- Clear separation between:
  - input (user task)  
  - processing (AI prompt + response)  
  - presentation (UI components)  

This keeps the system simple and extensible.

---

## Getting Started

~~~bash
git clone https://github.com/dansbands/ai-todo-list.git
cd ai-todo-list
npm install
npm start
~~~

Create a `.env` file with:

~~~env
OPENAI_API_KEY=your_api_key_here
CORS_ALLOWED_ORIGINS=http://localhost:3000
REACT_APP_SERVER_URL=http://localhost:10000
REACT_APP_PROD_SERVER_URL=https://your-production-api.example.com
~~~

`CORS_ALLOWED_ORIGINS` accepts a comma-separated list. In development, the server falls back to `http://localhost:3000` and `http://127.0.0.1:3000` when the variable is omitted. In production, you should set it explicitly so browser requests are only accepted from trusted frontends.

---

## Live Demo

https://dansbands.github.io/ai-todo-list/

---

## Future Improvements

- Persistent task history  
- User accounts and saved sessions  
- Better prompt tuning for higher-quality outputs  
- Task prioritization and scheduling  
- Notification system (email / push)  
- Mobile-friendly redesign  

---

## License

MIT
