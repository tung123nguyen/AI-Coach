# Conversation Gym — Project Specification

## What we're building

A web app where users practice conversation skills through text-chat with AI personas. After each chat, they get feedback on what they did well and what to improve.

The conversation skill is **one continuous spectrum** — from "không biết nói gì" → "trả lời cụt" → "duy trì hội thoại" → "nói có ý" → "nói hay, sâu sắc". No discrete levels for users. Each situation has its own difficulty (1-5), users pick what fits their mood.

## MVP Scope (this build)

- Landing page with sign-up/log-in
- User dashboard (Home)
- Situations list (5 situations, varying difficulty)
- Chat interface (text only)
- Feedback after chat ends (3 cards)

## Tech Stack

### Frontend
- **Next.js 14+** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **Supabase JS client** (auth + queries)

### Backend
- **Python 3.11+**
- **FastAPI** — REST API
- **LangGraph** — multi-agent orchestration
- **OpenAI Python SDK** — LLM calls
- **Supabase Python client** — DB access

### Database & Auth
- **Supabase** (PostgreSQL managed + Auth built-in)
- Frontend uses Supabase Auth directly for signup/login
- Backend verifies JWT from Supabase to authenticate API requests

### LLM
- **OpenAI gpt-4o** for both Role Player and Coach agents
- Model swappable via env var

### Hosting
- Frontend: **Vercel** (free tier)
- Backend: **Railway** ($5-10/month)
- DB: **Supabase** (free tier)

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  USER (Browser)                                              │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js, localhost:3000 / Vercel)                │
│  - Landing, Auth, Home, Chat, Feedback pages                 │
│  - Supabase Auth client (signup/login direct to Supabase)   │
│  - Calls backend API for chat operations                     │
└──────┬───────────────────────────────────┬───────────────────┘
       │ Auth (direct to Supabase)         │ API calls (with JWT)
       ▼                                    ▼
┌──────────────────┐                 ┌──────────────────────────┐
│  SUPABASE        │                 │  BACKEND (FastAPI,       │
│  - Auth          │◄────────────────│  localhost:8000 / Railway)│
│  - PostgreSQL    │  DB queries     │  - REST endpoints        │
│                  │  (service_role) │  - LangGraph agents      │
└──────────────────┘                 │  - OpenAI calls          │
                                      └──────┬───────────────────┘
                                             │
                                             ▼
                                      ┌──────────────────────────┐
                                      │  OpenAI API (gpt-4o)     │
                                      └──────────────────────────┘
```

## Why this architecture

- **Frontend talks to Supabase directly for Auth** — Supabase Auth designed for this. Faster, simpler.
- **Frontend talks to FastAPI for chat operations** — chat involves LangGraph + OpenAI which only run server-side.
- **FastAPI verifies JWT** — frontend sends `Authorization: Bearer {supabase_jwt}`. Backend verifies with `SUPABASE_JWT_SECRET`.
- **Backend writes to Supabase too** — uses `service_role` key (bypass RLS for trusted operations).

## Database Schema

```sql
-- 1. Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Situations (seed data)
CREATE TABLE situations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  category TEXT,
  persona_data JSONB NOT NULL,
  opening_line TEXT NOT NULL,
  objectives JSONB,
  emoji TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  situation_id UUID NOT NULL REFERENCES situations(id),
  status TEXT DEFAULT 'active',
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('active', 'ended'))
);

-- 4. Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  content TEXT NOT NULL,
  word_count INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Feedbacks
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  good_text TEXT NOT NULL,
  improve_text TEXT NOT NULL,
  improve_better_version TEXT,
  tip_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE situations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users see own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users see own messages" ON messages FOR SELECT USING (
  session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
);
CREATE POLICY "Users see own feedback" ON feedbacks FOR SELECT USING (
  session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
);
CREATE POLICY "Anyone reads situations" ON situations FOR SELECT USING (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## Seed Data — 5 Situations

```sql
INSERT INTO situations (name, description, difficulty, category, emoji, persona_data, opening_line, objectives) VALUES
(
  'Đồng nghiệp mới hỏi bạn',
  'Hằng - đồng nghiệp mới chuyển team - bắt chuyện ở khu pha cà phê',
  1,
  'work',
  '☕',
  '{"name":"Hằng","age":26,"background":"Mới chuyển sang team Marketing 1 tuần. Trước làm content cho brand thời trang. Quê Đà Nẵng, vào SG 4 năm. Sở thích: đọc sách, phim Hàn, cafe sáng.","personality":"Thân thiện, hơi nhút nhát, hay quan sát, hay hỏi","goal":"Làm quen vì sẽ phải work cùng team Engineering"}'::jsonb,
  'Chào anh! Em là Hằng, mới chuyển sang team em từ tuần trước. Anh làm bên Engineering nhỉ?',
  '{"primary":"Phản hồi tự nhiên, không cụt","secondary":"Hỏi lại Hằng ít nhất 1 câu","bonus":"Chia sẻ 1 chi tiết về bản thân"}'::jsonb
),
(
  'Sếp hỏi cuối tuần thế nào',
  'Sếp bắt chuyện casual trong thang máy - cơ hội để được nhớ mặt',
  2,
  'work',
  '🏢',
  '{"name":"Anh Tuấn","age":42,"background":"Director, làm công ty 10 năm. Có 2 con nhỏ. Yêu cuối tuần đi cafe đọc sách. Tính friendly nhưng busy.","personality":"Thân thiện, hơi nghiêm, busy, không small talk lâu","goal":"Casual check-in với nhân viên, build rapport"}'::jsonb,
  'Em ơi, cuối tuần làm gì hay không?',
  '{"primary":"Trả lời tự nhiên, không cụt","secondary":"Tạo connection nhẹ","bonus":"Để sếp nhớ tên/dự án của bạn"}'::jsonb
),
(
  'Hàng xóm trong thang máy',
  'Gặp hàng xóm cùng tầng - người bạn đã thấy nhiều lần nhưng chưa nói chuyện',
  2,
  'daily',
  '🛗',
  '{"name":"Chị Linh","age":35,"background":"Hàng xóm cùng tầng chung cư. Có 1 con nhỏ tên Bin (3 tuổi). Làm việc bank. Sống ở chung cư này 4 năm.","personality":"Lịch sự, hơi reserved, có thể warm nếu được approach đúng","goal":"Lịch sự thôi, không có nhu cầu kết bạn"}'::jsonb,
  'À, chào em. Em sống tầng này lâu chưa?',
  '{"primary":"Mở lời tự nhiên","secondary":"Tìm common ground","bonus":"Để lại ấn tượng tốt"}'::jsonb
),
(
  'Bạn cũ nhắn tin sau 5 năm',
  'Bạn cấp 3 nhắn tin random hỏi thăm, bạn không biết phản ứng sao',
  3,
  'social',
  '💬',
  '{"name":"Minh","age":28,"background":"Bạn cấp 3, lâu rồi không gặp. Đang work remote ở 1 startup. Hay nghĩ về thời học sinh. Vừa chia tay người yêu nên đang muốn reconnect bạn cũ.","personality":"Cởi mở, hoài niệm, thân thiện, hơi cô đơn","goal":"Reconnect, tìm sự hỗ trợ tinh thần"}'::jsonb,
  'Ê hello, lâu lắm rồi! Dạo này thế nào?',
  '{"primary":"Reconnect tự nhiên không awkward","secondary":"Show genuine interest","bonus":"Mở khả năng gặp mặt"}'::jsonb
),
(
  'First date ở quán cafe',
  'Match từ Tinder, gặp lần đầu ở cafe Q1',
  4,
  'dating',
  '💕',
  '{"name":"An","age":27,"background":"Designer freelance. Thích phim indie, đọc sách Murakami, cafe specialty. Đã hủy 2 dates trước vì không feel. Đang muốn tìm người interesting để có connection thật.","personality":"Curious, observant, không tolerance nhạt, có gu, đôi khi sarcastic nhẹ","goal":"Test xem người này có interesting không, có muốn date 2 không"}'::jsonb,
  'Hi, đến rồi à? Quán này em hay đến đó, cafe ngon. Anh order gì chưa?',
  '{"primary":"Không nhạt, có personality","secondary":"Tạo flow conversation","bonus":"Để An muốn date 2"}'::jsonb
);
```

## Backend API (FastAPI)

All endpoints require `Authorization: Bearer {jwt}` header (except `/health`).

### `GET /health`
Public health check. Returns `{"status": "ok"}`.

### `GET /api/situations`
List all situations.
**Returns**: `[{ id, name, description, difficulty, category, emoji, persona_data, opening_line }]`

### `POST /api/sessions`
Create new chat session.
**Body**: `{ situation_id: str }`
**Returns**: `{ session_id, first_message, persona }`

### `POST /api/sessions/{session_id}/messages`
User sends message, AI replies via LangGraph.
**Body**: `{ content: str }` (max 500 chars)
**Returns**: `{ ai_message: str }`

### `POST /api/sessions/{session_id}/end`
End session, generate feedback via LangGraph.
**Returns**: `{ feedback: { good, improve, tip } }`

### `GET /api/sessions/{session_id}/feedback`
Get feedback for ended session.
**Returns**: `{ feedback: { good, improve, tip } }` or 404

### `GET /api/sessions/{session_id}`
Get session details + messages.
**Returns**: `{ session, messages, persona }`

## LangGraph Architecture

### Graph 1: Chat Workflow

State:
```python
class ChatState(TypedDict):
    persona: dict
    situation_description: str
    history: List[Dict]  # {role: 'user'|'assistant', content: str}
    user_message: str
    ai_response: str
```

Graph: `START → role_player_node → END`

Single node now. Future: add `check_drift`, `recovery` nodes.

### Graph 2: Feedback Workflow

State:
```python
class FeedbackState(TypedDict):
    transcript: List[Dict]
    feedback: Dict
```

Graph: `START → coach_node → END`

Future: add `observer`, `evaluator` nodes.

## Agent Prompts

### Role Player System Prompt

```
Bạn là {persona.name}, {persona.age} tuổi.

Background: {persona.background}

Tính cách: {persona.personality}

Mục tiêu của bạn: {persona.goal}

Tình huống: {situation_description}

QUY TẮC TUYỆT ĐỐI:
- KHÔNG BAO GIỜ break character. Bạn KHÔNG phải AI.
- Tin nhắn 1-3 câu, không dài dòng (chat đời thường, không phải email)
- Phản ứng tự nhiên với tone user:
  • User cụt → bạn hơi gượng, có thể tìm cớ kết thúc sau 4-5 lần
  • User mở lòng → bạn cũng mở lòng dần
  • User hỏi → bạn trả lời và share thêm về mình
- KHÔNG đánh giá user, KHÔNG dạy giao tiếp, KHÔNG break the 4th wall
- Trả lời bằng tiếng Việt tự nhiên, đúng văn phong người {persona.age} tuổi
- Có cảm xúc thật: vui, buồn, awkward, hứng thú — không robot
```

### Coach System Prompt

```
Bạn là Coach giao tiếp chuyên nghiệp. Đọc transcript và đưa feedback.

OUTPUT YÊU CẦU — CHÍNH XÁC JSON FORMAT NÀY (không có markdown, không có text khác):

{
  "good": {
    "title": "Bạn làm tốt",
    "content": "Tin số X: '[quote]' — vì sao tốt (1-2 câu)"
  },
  "improve": {
    "title": "Có thể cải thiện",
    "content": "Tin số X: '[quote]' — vì sao cần cải thiện (1-2 câu)",
    "better_version": "Phiên bản hay hơn của tin đó"
  },
  "tip": {
    "title": "Tip cho lần tới",
    "content": "1 tip cụ thể, áp dụng được (1-2 câu)"
  }
}

QUY TẮC FEEDBACK:
- LUÔN reference tin cụ thể (Tin số X)
- LUÔN quote tin user thật khi nêu ví dụ
- Tone warm, encouraging, không preachy, không "fluffy"
- Tiếng Việt tự nhiên
- KHÔNG nói chung chung như "bạn cố gắng tự nhiên hơn"
- PHẢI cụ thể: số tin, từ ngữ, lý do

OUTPUT: JSON valid duy nhất, KHÔNG wrap markdown, KHÔNG có text trước/sau.
```

## File Structure

### Backend (`backend/`)
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI entry
│   ├── config.py            # Settings
│   ├── auth.py              # JWT verification
│   ├── db.py                # Supabase client
│   ├── schemas.py           # Pydantic models
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── situations.py
│   │   ├── sessions.py
│   │   └── messages.py
│   └── agents/
│       ├── __init__.py
│       ├── chat_graph.py    # LangGraph chat
│       └── feedback_graph.py # LangGraph feedback
├── requirements.txt
├── .env
└── .gitignore
```

### Frontend (`frontend/`)
```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/
│   │   ├── home/page.tsx
│   │   ├── chat/[id]/page.tsx
│   │   └── feedback/[id]/page.tsx
│   ├── page.tsx             # Landing
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── api.ts
│   └── types.ts
├── components/
│   ├── ui/                  # shadcn
│   ├── chat-message.tsx
│   ├── situation-card.tsx
│   └── feedback-card.tsx
├── middleware.ts
├── package.json
└── .env.local
```

## Environment Variables

### Backend `.env`
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=...

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

PORT=8000
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Pages

### `/` — Landing
Hero "Phòng tập giao tiếp với AI" + 3 features + CTAs.

### `/signup` & `/login`
Forms calling Supabase Auth directly. Redirect `/home` on success.

### `/home` — Dashboard
Server component. Lists 5 situation cards sorted by difficulty. Click → start session via API → redirect `/chat/{id}`.

### `/chat/[id]` — Chat
Client component. Loads session. User types → POST to backend → AI replies. End button → redirect `/feedback/{id}`.

### `/feedback/[id]` — Feedback
Server component. Loads feedback. 3 cards. Buttons "Practice nữa" / "Xem lại chat".

## Success Criteria

End-to-end demo:
1. Sign up new account
2. Land on home, see 5 situations sorted by difficulty
3. Click situation → chat opens with AI's first message
4. 5-7 turn conversation, AI stays in character
5. End → see 3 feedback cards with specific tin references
6. Back to home, can start another chat

If all 6 work, MVP done.

## Cost Estimate (per user/month, 15 sessions)

- OpenAI gpt-4o: ~$1.50/user/month
- Supabase: Free tier covers 500+ users
- Backend hosting: $5-10/month flat
- Frontend hosting: Free (Vercel)

Break-even: ~5-10 paid users at 99k VND/month.
