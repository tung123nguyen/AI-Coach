# Conversation Gym

> Luyện giao tiếp tiếng Việt với AI personas — nhận feedback cụ thể từng câu.

Practice real-life Vietnamese conversation scenarios with AI characters that stay in character. After each session, a Coach AI reviews your transcript and gives targeted feedback on what worked, what to improve, and a concrete tip.

---

## Features

- **5 built-in scenarios** — casual small talk to first dates, each with a unique AI persona
- **In-character AI** — personas react naturally to your tone: short replies if you're curt, open up if you engage
- **Per-message feedback** — Coach references specific messages by number, quotes your exact words
- **Session history** — reload any past chat and review the transcript
- **Dark UI** — clean, mobile-friendly interface

## Tech Stack

| Layer           | Technology                                                   |
| --------------- | ------------------------------------------------------------ |
| Frontend        | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend         | Python 3.11, FastAPI, LangGraph                              |
| LLM             | OpenAI gpt-4o (role-player + coach agents)                   |
| Database & Auth | Supabase (PostgreSQL + Auth)                                 |
| Hosting         | Vercel (frontend) · Railway (backend) · Supabase (DB)        |

## Architecture

```
Browser
  │
  ├─── Supabase Auth (signup / login direct)
  │
  └─── Next.js (Vercel)
         │
         ├─── Supabase (server-side reads: profile, sessions, messages)
         │
         └─── FastAPI (Railway)  ←── JWT verified per request
                │
                ├─── LangGraph: chat workflow  →  OpenAI gpt-4o
                └─── LangGraph: feedback workflow  →  OpenAI gpt-4o
                       │
                       └─── Supabase (service_role writes)
```

Frontend reads data directly from Supabase (RLS enforced). All LLM operations go through the FastAPI backend.

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- A [Supabase](https://supabase.com) project with the schema applied (see [01_PROJECT_SPEC.md](01_PROJECT_SPEC.md))
- An OpenAI API key

### 1. Clone

```bash
git clone <repo-url>
cd conversation-gym
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

Create `backend/.env`:

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

PORT=8000
ALLOWED_ORIGINS=http://localhost:3000
```

Start the server:

```bash
uvicorn app.main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/health` → `{"status":"ok"}`

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
conversation-gym/
├── backend/
│   └── app/
│       ├── main.py              # FastAPI entry point
│       ├── config.py            # Settings (pydantic-settings)
│       ├── auth.py              # JWT verification
│       ├── db.py                # Supabase client (service_role)
│       ├── schemas.py           # Pydantic models
│       ├── routers/
│       │   ├── situations.py    # GET /api/situations
│       │   ├── sessions.py      # POST/GET /api/sessions
│       │   └── messages.py      # POST /api/sessions/{id}/messages
│       └── agents/
│           ├── chat_graph.py    # LangGraph: role-player node
│           └── feedback_graph.py# LangGraph: coach node
│
└── frontend/
    ├── app/
    │   ├── page.tsx             # Landing
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── signup/page.tsx
    │   └── (app)/
    │       ├── home/page.tsx    # Dashboard (server component)
    │       ├── chat/[id]/page.tsx
    │       └── feedback/[id]/page.tsx
    ├── components/
    │   ├── home-client.tsx      # Situations grid
    │   ├── situation-card.tsx
    │   ├── chat-client.tsx      # Full chat UI
    │   ├── chat-message.tsx
    │   ├── feedback-content.tsx
    │   ├── feedback-card.tsx
    │   └── feedback-processing.tsx
    └── lib/
        ├── api.ts               # Backend API client
        ├── types.ts
        └── supabase/
            ├── client.ts        # Browser client
            └── server.ts        # Server component client
```

## API Reference

All endpoints (except `/health`) require `Authorization: Bearer <supabase_jwt>`.

| Method | Path                          | Description                      |
| ------ | ----------------------------- | -------------------------------- |
| GET    | `/health`                     | Health check                     |
| GET    | `/api/situations`             | List all scenarios               |
| POST   | `/api/sessions`               | Start a new session              |
| GET    | `/api/sessions/{id}`          | Get session + messages + persona |
| POST   | `/api/sessions/{id}/messages` | Send message, get AI reply       |
| POST   | `/api/sessions/{id}/end`      | End session, generate feedback   |
| GET    | `/api/sessions/{id}/feedback` | Retrieve saved feedback          |

## Database

Five tables in Supabase: `profiles`, `situations`, `sessions`, `messages`, `feedbacks`. Full schema with RLS policies in [01_PROJECT_SPEC.md](01_PROJECT_SPEC.md).

## Deployment

- **Frontend** → push to GitHub, connect to [Vercel](https://vercel.com). Add the three `NEXT_PUBLIC_*` env vars.
- **Backend** → deploy to [Railway](https://railway.app) from the `backend/` directory. Add all backend env vars. Set `ALLOWED_ORIGINS` to your Vercel URL.
- **Database** → already hosted on Supabase.

---

## License

MIT
