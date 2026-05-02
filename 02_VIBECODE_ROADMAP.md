# Vibecode Roadmap — Claude Code Edition

## Cách dùng file này

Mỗi phase có:
1. **Mục tiêu** — sau phase này có gì
2. **Prerequisites** — đã làm gì trước
3. **Prompt cho Claude Code** — copy-paste vào terminal session
4. **Verify steps** — bạn tự test
5. **Definition of done**

Workflow chuẩn cho mỗi phase:
```bash
cd <appropriate folder>
claude
# Trong session: paste prompt
# Đợi Claude Code làm việc
# Verify
# Commit
# Exit
```

---

## PHASE 0: Setup Monorepo (Manual, 30 phút)

### Mục tiêu
Project structure ready, git initialized.

### Steps (làm thủ công, không dùng Claude Code)

```bash
mkdir conversation-gym && cd conversation-gym

# Init git
git init

# Create folders
mkdir frontend backend

# Root .gitignore
cat > .gitignore <<EOF
# Dependencies
node_modules/

# Next.js
.next/
out/

# Python
__pycache__/
*.pyc
.venv/
venv/
*.egg-info/

# Environment
.env
.env.local
.env.production

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
EOF

# Copy 5 MD files của kit vào root project
# (00_QUICKSTART.md, 01_PROJECT_SPEC.md, 02_VIBECODE_ROADMAP.md, 03_CODE_TEMPLATES.md, 04_CLAUDE_CODE_TIPS.md)

# README đơn giản
cat > README.md <<EOF
# Conversation Gym

AI-powered conversation practice app.

- Frontend: Next.js (frontend/)
- Backend: FastAPI + LangGraph (backend/)
- DB: Supabase (PostgreSQL + Auth)

See 00_QUICKSTART.md to start.
EOF

git add .
git commit -m "Init monorepo structure"
```

Tạo GitHub repo, push:
```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

### ✅ Done when
- 2 folders frontend/, backend/ exist
- 5 MD files trong root
- Git initialized, pushed to GitHub

---

## PHASE 1: Setup Supabase (Manual, 1 giờ)

### Mục tiêu
DB + Auth ready với data.

### Steps

**1. Create project**: https://supabase.com → New project → Singapore region → strong password.

**2. Get keys** (Settings → API):
- Project URL
- anon public key  
- service_role key (kín!)

**3. Get JWT secret** (Settings → API → JWT Settings):
- JWT Secret

Lưu cả 4 keys vào notepad tạm.

**4. Create schema**:

Dashboard → SQL Editor → New query → paste full schema từ `01_PROJECT_SPEC.md` (section "Database Schema") → Run.

Verify Table Editor → 5 tables exist.

**5. Insert seed data**:

SQL Editor → paste seed data từ spec (section "Seed Data — 5 Situations") → Run.

Verify situations table → 5 rows.

**6. Disable email confirmation** (cho dễ test):

Authentication → Settings → uncheck "Enable email confirmations" → Save.

(Bật lại trước khi launch production.)

### ✅ Done when
- Supabase project created
- 5 tables exist
- 5 situations seeded
- 4 keys saved (URL, anon, service_role, JWT secret)

---

## PHASE 2: Backend Foundation (Claude Code, 2-3 giờ)

### Mục tiêu
FastAPI chạy, có /health, connect được Supabase.

### Setup trước khi dùng Claude Code

```bash
cd backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate    # Windows

# Verify
which python  # phải trỏ vào venv
```

### Mở Claude Code

```bash
cd backend  # phải ở backend/, KHÔNG phải root
claude
```

### Prompt 1 — Setup foundation

```
Đọc file ../01_PROJECT_SPEC.md để hiểu project.

Chúng ta đang build backend cho Conversation Gym (Phase 2 của roadmap).

Yêu cầu setup foundation FastAPI + Supabase (chưa làm agents):

1. Install Python dependencies vào venv hiện tại:
   - fastapi
   - uvicorn[standard]
   - python-dotenv
   - pydantic-settings
   - supabase
   - python-jose[cryptography]
   - openai
   - langgraph
   - langchain-openai
   
   Save to requirements.txt

2. Tạo .env file (template, tôi sẽ fill values):
   SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   SUPABASE_JWT_SECRET=
   OPENAI_API_KEY=
   OPENAI_MODEL=gpt-4o
   PORT=8000
   ALLOWED_ORIGINS=http://localhost:3000

3. Tạo .gitignore phù hợp Python.

4. Tạo file structure:
   app/
     __init__.py
     main.py        - FastAPI app + CORS + /health endpoint
     config.py      - Pydantic Settings load env vars
     db.py          - Supabase client factory
     auth.py        - JWT verification + get_current_user dependency
     schemas.py     - Pydantic models (paste từ 03_CODE_TEMPLATES.md section 5)
   
5. Setup main.py với:
   - FastAPI app
   - CORS middleware (origins từ settings)
   - GET /health → {"status": "ok"}

6. Implement config.py, db.py, auth.py theo specs trong 03_CODE_TEMPLATES.md.

7. Test app chạy được:
   uvicorn app.main:app --reload --port 8000
   
8. Verify localhost:8000/health returns OK.

Reference 03_CODE_TEMPLATES.md sections 1-5 cho code chi tiết. 

Sau khi xong, git commit "Phase 2: Backend foundation".
```

### Bạn cần làm

Sau khi Claude Code xong:

1. Fill `.env` với 4 keys từ Supabase + OpenAI key
2. Verify `uvicorn app.main:app --reload --port 8000` chạy
3. Mở http://localhost:8000/health → thấy `{"status":"ok"}`
4. Mở http://localhost:8000/docs → thấy Swagger UI

### ✅ Done when
- Backend chạy localhost:8000
- /health responds OK
- /docs hiển thị
- All files in app/ created
- Git commit done

---

## PHASE 3: Backend Situations + Sessions (Claude Code, 2-3 giờ)

### Mục tiêu
2 endpoints work: GET situations, POST sessions.

### Mở Claude Code

```bash
cd backend
claude
```

### Prompt

```
Đọc 01_PROJECT_SPEC.md và 03_CODE_TEMPLATES.md.

Chúng ta ở Phase 3. Backend đã có foundation. Giờ thêm 2 endpoints đầu:

1. Tạo app/routers/__init__.py (empty)

2. Tạo app/routers/situations.py:
   - GET /api/situations
   - Use Depends(get_current_user) for auth
   - Query: SELECT * FROM situations ORDER BY difficulty ASC, name ASC
   - Return List[SituationOut]
   
   Reference 03_CODE_TEMPLATES.md section 10 cho code.

3. Tạo app/routers/sessions.py với 2 endpoints:
   
   POST /api/sessions:
   - Body: CreateSessionRequest { situation_id: str }
   - Verify auth, get user_id
   - Get situation từ DB (404 nếu không tìm thấy)
   - Insert session: { user_id, situation_id, status: 'active' }
   - Insert opening message: { session_id, sender: 'ai', content: opening_line }
   - Return SessionCreatedOut { session_id, first_message, persona }
   
   GET /api/sessions/{session_id}:
   - Verify auth, verify session.user_id == user_id (403 nếu không)
   - Get session, all messages, persona từ situation
   - Return SessionFullOut
   
   Reference 03_CODE_TEMPLATES.md section 8.

4. Register routers trong app/main.py:
   from app.routers import situations, sessions
   app.include_router(situations.router, prefix="/api", tags=["situations"])
   app.include_router(sessions.router, prefix="/api", tags=["sessions"])

5. Test bằng cách:
   - Tạo test user trong Supabase Dashboard (Authentication → Users)
   - Get JWT token bằng curl:
     curl -X POST 'https://YOUR_PROJECT.supabase.co/auth/v1/token?grant_type=password' \
       -H 'apikey: YOUR_ANON_KEY' \
       -H 'Content-Type: application/json' \
       -d '{"email":"test@test.com","password":"yourpass"}'
   - Test:
     curl http://localhost:8000/api/situations \
       -H "Authorization: Bearer JWT_TOKEN"
   
   Document test commands vào file backend/test_commands.md để tôi dùng sau.

6. Nếu test pass, git commit "Phase 3: Situations + Sessions endpoints".

Lưu ý:
- Error handling: try/except, return appropriate HTTP codes
- Use Pydantic models cho request/response (đã có trong schemas.py)
```

### Verify steps

1. Test user trong Supabase
2. Get JWT
3. Curl GET /api/situations → return 5 situations
4. Curl POST /api/sessions → return session_id + first message
5. Verify trong Supabase Table Editor: sessions có row mới, messages có 1 message AI

### ✅ Done when
- 3 endpoints work via curl
- Sessions + messages create properly
- Code committed

---

## PHASE 4: LangGraph Chat + Messages Endpoint ⭐ (Claude Code, 4-5 giờ)

### Mục tiêu
LangGraph chat workflow + endpoint để chat với AI.

Đây là phase phức tạp nhất. Cẩn thận làm.

### Mở Claude Code

```bash
cd backend
claude
```

### Prompt 1 — LangGraph chat workflow

```
Đọc 01_PROJECT_SPEC.md (section "Agent Prompts") và 03_CODE_TEMPLATES.md (section 6).

Chúng ta ở Phase 4. Build LangGraph chat workflow.

1. Tạo app/agents/__init__.py (empty)

2. Tạo app/agents/chat_graph.py exactly như section 6 của 03_CODE_TEMPLATES.md:
   - ChatState TypedDict
   - build_role_player_prompt() function với template từ 01_PROJECT_SPEC.md
   - role_player_node() function
   - build_chat_graph() function
   - run_chat() public interface
   
   QUAN TRỌNG:
   - Use langchain-openai's ChatOpenAI
   - Temperature 0.8 cho character variety
   - Max tokens 500
   - System prompt phải đúng template từ spec
   - LangGraph nodes return DICT mới, không mutate state

3. Test thử bằng Python script tạm:
   Tạo file backend/test_chat.py:
   
   from app.agents.chat_graph import run_chat
   
   persona = {
       "name": "Hằng",
       "age": 26,
       "background": "Mới chuyển team Marketing 1 tuần",
       "personality": "Thân thiện, nhút nhát",
       "goal": "Làm quen"
   }
   
   response = run_chat(
       persona=persona,
       history=[],
       user_message="Ờ ừ, anh làm backend",
       situation_description="Pha cà phê văn phòng"
   )
   print(response)
   
   Run: python test_chat.py
   
   Phải print phản hồi của Hằng đúng character.

4. Nếu test pass, xóa test_chat.py, git commit "Phase 4a: LangGraph chat workflow".
```

### Sau khi xong Prompt 1, Prompt 2 — Messages endpoint

```
Bây giờ thêm endpoint POST messages.

1. Tạo app/routers/messages.py theo 03_CODE_TEMPLATES.md section 9:
   - POST /api/sessions/{session_id}/messages
   - Body: SendMessageRequest { content }
   - Verify auth + session ownership
   - Save user message vào DB
   - Get situation persona
   - Build history từ DB (exclude user message vừa save)
   - Call run_chat() với persona + history + user_message
   - Save AI response
   - Return SendMessageResponse { ai_message }

2. Register router trong main.py:
   from app.routers import messages
   app.include_router(messages.router, prefix="/api", tags=["messages"])

3. Test end-to-end:
   - Restart server
   - Get JWT
   - Create session: curl POST /api/sessions
   - Send message: curl POST /api/sessions/{id}/messages with content
   - Phải return AI response trong 2-5s
   - Test 5-7 turns liên tiếp, verify AI giữ character

4. Git commit "Phase 4b: Messages endpoint with LangGraph".
```

### Verify steps

1. test_chat.py chạy được, AI giữ character
2. POST messages return AI response trong 2-5s
3. Chat 5-7 turns, AI nhớ context, giữ character Hằng
4. Verify trong DB: messages table có user + ai messages alternating

### ✅ Done when
- LangGraph chat compile không lỗi
- Test chat với 1 persona, AI giữ character qua 5-10 turns
- Messages persist đúng trong DB
- Code committed

---

## PHASE 5: LangGraph Feedback + End Endpoint ⭐ (Claude Code, 3-4 giờ)

### Mục tiêu
Coach agent generate feedback, end session endpoint work.

### Mở Claude Code

```bash
cd backend
claude
```

### Prompt

```
Đọc 01_PROJECT_SPEC.md section "Agent Prompts" và 03_CODE_TEMPLATES.md section 7.

Phase 5: Feedback workflow.

1. Tạo app/agents/feedback_graph.py exactly như section 7 của 03_CODE_TEMPLATES.md:
   - FeedbackState TypedDict
   - COACH_SYSTEM_PROMPT từ 01_PROJECT_SPEC.md
   - FALLBACK_FEEDBACK dict
   - coach_node() — call OpenAI với response_format JSON
   - generate_feedback() public interface
   
   QUAN TRỌNG:
   - Use response_format={"type": "json_object"}
   - Parse JSON từ response.content
   - Validate có đủ keys good/improve/tip
   - Try/except — return FALLBACK_FEEDBACK nếu fail
   - Temperature 0.5 (cần consistent feedback)

2. Test với script tạm backend/test_feedback.py:
   from app.agents.feedback_graph import generate_feedback
   
   transcript = [
       {"sender": "ai", "content": "Chào anh! Em là Hằng..."},
       {"sender": "user", "content": "Ờ ừ, anh làm backend"},
       {"sender": "ai", "content": "Hay quá! Anh làm dự án gì?"},
       {"sender": "user", "content": "À, payment system"},
   ]
   
   feedback = generate_feedback(transcript)
   import json
   print(json.dumps(feedback, ensure_ascii=False, indent=2))
   
   Phải print JSON với good/improve/tip, có reference tin số.

3. Thêm endpoints vào app/routers/sessions.py (đọc 03_CODE_TEMPLATES.md section 8):
   
   POST /api/sessions/{session_id}/end:
   - Verify ownership
   - Update session: status='ended', ended_at=now
   - Get all messages → format transcript
   - Call generate_feedback(transcript)
   - Save vào feedbacks table
   - Return FeedbackResponse
   
   GET /api/sessions/{session_id}/feedback:
   - Verify ownership
   - Get feedback từ DB (404 nếu chưa có)
   - Return FeedbackResponse formatted

4. Test:
   - Tiếp tục session từ Phase 4 (đã chat 5-7 turns)
   - curl POST /api/sessions/{id}/end → return feedback (đợi 5-8s)
   - curl GET /api/sessions/{id}/feedback → return feedback đã save

5. Verify quality:
   - Feedback có reference "Tin số X"?
   - Better_version có thực sự tốt hơn?
   - Tip có cụ thể?

6. Xóa test_feedback.py, git commit "Phase 5: Feedback workflow".
```

### Verify

1. test_feedback.py chạy, return JSON đúng format
2. POST end return feedback trong 5-8s
3. Content cụ thể, reference tin nhắn, không generic
4. Feedback persist trong DB

### ✅ Done when
- Coach agent generate đúng JSON
- End endpoint hoạt động
- GET feedback hoạt động
- Feedback quality tốt (cụ thể, có reference)

---

## PHASE 6: Frontend Setup + Landing + Auth (Claude Code, 4-5 giờ)

### Mục tiêu
Next.js chạy, landing page đẹp, signup/login work.

### Setup trước

```bash
cd ../frontend  # từ backend/
```

### Mở Claude Code

```bash
claude
```

### Prompt

```
Đọc ../01_PROJECT_SPEC.md và ../03_CODE_TEMPLATES.md sections 11-15.

Phase 6: Setup frontend + landing + auth.

1. Init Next.js project trong folder hiện tại:
   npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --eslint --turbopack --import-alias "@/*"
   
   Trả lời defaults, không tùy chỉnh.

2. Install dependencies:
   npm install @supabase/supabase-js @supabase/ssr lucide-react

3. Setup shadcn/ui:
   npx shadcn@latest init
   - Style: Default
   - Base color: Slate
   - CSS variables: Yes
   
   Add components: button, card, input, label, textarea
   npx shadcn@latest add button card input label textarea

4. Tạo .env.local (template, tôi fill values):
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   NEXT_PUBLIC_API_URL=http://localhost:8000

5. Tạo Supabase clients (paste exactly từ 03_CODE_TEMPLATES.md):
   - lib/supabase/client.ts (section 12)
   - lib/supabase/server.ts (section 13)

6. Tạo middleware.ts (section 14):
   - Refresh auth tokens
   - Protected routes: /home, /chat, /feedback redirect /login nếu no user

7. Tạo lib/types.ts (section 15)

8. Tạo lib/api.ts (section 11) — API client wrapper

9. Tạo app/page.tsx — Landing page:
   - Hero: "Phòng tập giao tiếp với AI"
   - Subtitle: "Từ 'không biết nói gì' đến phản xạ tự nhiên — luyện 5 phút mỗi ngày"
   - 2 CTAs: "Bắt đầu miễn phí" → /signup, "Đăng nhập" → /login
   - 3 feature cards:
     1. 🎭 AI Persona thật
     2. 📊 Feedback cụ thể (có reference tin)
     3. 🌱 Practice mỗi ngày
   - Footer: "Conversation Gym · 2026"
   - Style: gradient blue-50 → white, accent blue-600
   - Server component

10. Tạo app/(auth)/signup/page.tsx:
    - 'use client'
    - Form: name, email, password
    - Validation: email format, password >= 8 chars
    - Call supabase.auth.signUp({email, password, options: {data: {name}}})
    - On success: router.push('/home')
    - On error: show toast/error message
    - Use shadcn Card, Input, Label, Button
    - Loading state khi submit
    - Bottom link "Đã có tài khoản? Đăng nhập"

11. Tạo app/(auth)/login/page.tsx:
    - Tương tự signup nhưng email + password only
    - Call supabase.auth.signInWithPassword
    - Bottom link "Chưa có tài khoản? Đăng ký"

12. Test:
    npm run dev
    
    - Landing đẹp ở localhost:3000
    - Signup → tạo account thật trong Supabase Dashboard
    - Login → redirect /home (page chưa có cũng OK, miễn auth work)

13. Tôi sẽ fill .env.local sau khi bạn xong setup.

14. Git commit "Phase 6: Frontend setup + Landing + Auth".
```

### Bạn cần làm

1. Fill `.env.local` với Supabase URL + anon key
2. `npm run dev`
3. Test landing page
4. Test signup → check Supabase Dashboard → Authentication → Users có user mới
5. Test login

### ✅ Done when
- localhost:3000 hiển thị landing page
- Signup/login hoạt động
- User xuất hiện trong Supabase Dashboard
- Code committed

---

## PHASE 7: Frontend Home + Chat (Claude Code, 5-6 giờ)

### Mục tiêu
Home hiển thị situations, click → vào chat real-time.

### Mở Claude Code

```bash
cd frontend
claude
```

### Prompt

```
Đọc ../01_PROJECT_SPEC.md và ../03_CODE_TEMPLATES.md.

Phase 7: Build Home + Chat pages.

QUAN TRỌNG: Backend phải đang chạy ở localhost:8000 trong terminal khác.

1. Tạo app/(app)/home/page.tsx (server component):
   - Use createClient từ lib/supabase/server
   - Get user, redirect '/login' nếu null
   - Fetch profile: SELECT * FROM profiles WHERE id = user.id
   - Pass props vào HomeClient component

2. Tạo components/home-client.tsx ('use client'):
   - Props: userName: string
   - useEffect: call api.getSituations() khi mount
   - State: situations, isLoading, isCreatingSession
   - Render:
     * Header: "Chào {name}!" + Logout button
     * Section: "Practice hôm nay"
     * Grid: 1 col mobile, 2 cols desktop
     * Map situations → SituationCard
   - Logout: supabase.auth.signOut() + router.push('/')
   - Click situation card → call api.createSession(situation_id) → router.push(`/chat/${session_id}`)

3. Tạo components/situation-card.tsx:
   - Props: situation, onStart (function), isLoading
   - Card với:
     * Top: emoji size text-5xl + difficulty dots (1-5)
     * Name: text-lg font-semibold
     * Description: text-sm text-gray-600
     * Bottom: "Bắt đầu →" button (disabled khi isLoading)
   - Hover effect: shadow + scale slightly

4. Tạo app/(app)/chat/[id]/page.tsx (server component):
   - Auth check
   - Fetch session via api.getSession(id) — return { session, messages, persona }
   - Pass vào ChatClient

5. Tạo components/chat-client.tsx ('use client'):
   
   Props: sessionId, initialMessages, persona
   
   State:
   - messages: Message[] (init từ initialMessages)
   - input: string
   - isLoading: boolean (waiting AI reply)
   - isEnding: boolean
   
   UI Layout:
   - Top bar (sticky top-0 bg-white border-b z-10):
     * Left: emoji avatar + persona.name + "Đang chat" subtitle
     * Right: "Kết thúc" button (variant outline)
   - Messages area (flex-1 overflow-y-auto p-4):
     * Map messages → ChatMessage component
     * Auto-scroll bottom on new message (useRef + useEffect)
     * Khi isLoading: typing indicator "..." trong AI bubble
   - Input bar (sticky bottom-0 bg-white border-t p-4):
     * Textarea (auto-resize 1-3 rows, max 500 chars)
     * Send button
     * Enter to send, Shift+Enter newline
     * Disable cả 2 khi isLoading
   
   handleSend:
   1. Validate input (trim, not empty)
   2. Add optimistic user message vào state
   3. setIsLoading(true)
   4. await api.sendMessage(sessionId, input)
   5. Add AI message vào state
   6. Clear input, setIsLoading(false)
   7. Catch: rollback optimistic, show error
   
   handleEnd:
   1. window.confirm("Bạn chắc chắn muốn kết thúc?")
   2. setIsEnding(true)
   3. await api.endSession(sessionId)
   4. router.push(`/feedback/${sessionId}`)

6. Tạo components/chat-message.tsx:
   - Props: message: { sender, content, created_at }
   - User: bubble bg-blue-500 text-white, ml-auto, max-w-[75%], rounded-lg, p-3
   - AI: bubble bg-gray-100, mr-auto, max-w-[75%], rounded-lg, p-3
   - Timestamp text-xs text-gray-500 dưới bubble
   - Whitespace-pre-wrap để giữ line breaks

7. Test full flow:
   - Login → /home → thấy 5 situations
   - Click situation → tạo session → /chat/{id}
   - Thấy first message của AI
   - Type tin → enter → AI reply trong 2-5s
   - Chat 5-7 turns
   - Reload page → messages persist

8. Git commit "Phase 7: Home + Chat pages".
```

### Verify

1. Home hiển thị 5 situation cards
2. Click → chat opens với first message
3. Chat back-and-forth hoạt động
4. AI giữ character
5. Reload → messages giữ nguyên

### ✅ Done when
- Full chat flow work end-to-end
- UI smooth, no jarring transitions
- Reload không mất state
- Code committed

---

## PHASE 8: Frontend Feedback Page (Claude Code, 2-3 giờ)

### Mục tiêu
Feedback page đẹp, hiển thị 3 cards.

### Mở Claude Code

```bash
cd frontend
claude
```

### Prompt

```
Đọc ../01_PROJECT_SPEC.md.

Phase 8: Build Feedback page.

1. Tạo app/(app)/feedback/[id]/page.tsx (server component):
   - Auth check
   - Fetch via api.getFeedback(sessionId) — return { feedback: { good, improve, tip } }
   - Fetch session info qua api.getSession(sessionId) cho stats
   - Pass props vào FeedbackContent component

2. Tạo components/feedback-content.tsx (server component OK):
   
   Props: feedback, session, persona, messages
   
   UI:
   - Container max-w-2xl mx-auto py-8 px-4
   - Header section:
     * "Cuộc chat đã kết thúc!" + 🎉 emoji
     * Subtitle persona name
   - Stats card (small):
     * Số phút chat (calculate từ started_at, ended_at)
     * Số tin user (filter messages sender='user')
   - 3 feedback cards stack vertically gap-4:
     
     Card 1 — Good (border-l-4 border-green-500, bg-green-50, p-4 rounded):
     - ✅ {good.title}
     - {good.content}
     
     Card 2 — Improve (border-l-4 border-yellow-500, bg-yellow-50, p-4 rounded):
     - ⚠️ {improve.title}
     - {improve.content}
     - Subsection (border-t pt-3 mt-3):
       * "💡 Phiên bản hay hơn:"
       * Italic: "{improve.better_version}"
     - Skip subsection nếu better_version empty
     
     Card 3 — Tip (border-l-4 border-blue-500, bg-blue-50, p-4 rounded):
     - 💡 {tip.title}
     - {tip.content}
   
   - Bottom buttons (flex gap-3):
     * "Practice nữa" (primary, link /home)
     * "Xem lại chat" (outline, link /chat/{id})

3. Tạo components/feedback-card.tsx tách card component:
   Props: title, content, variant ('good'|'improve'|'tip'), icon, betterVersion?
   
   Map variants sang colors:
   - good: green-500 / green-50 / ✅
   - improve: yellow-500 / yellow-50 / ⚠️
   - tip: blue-500 / blue-50 / 💡

4. Test full E2E flow:
   - Signup new user
   - /home → click situation → chat
   - 5-7 turns → end
   - Loading 5-8s → /feedback/{id}
   - Thấy 3 cards với content cụ thể
   - "Practice nữa" → /home (có thể start session khác)
   - "Xem lại chat" → /chat/{id} (chat bị disabled vì status=ended)

5. Edge case: nếu chưa có feedback (race condition):
   - Show loading state
   - Poll mỗi 1s đến khi có (hoặc dùng Server Component refetch)
   - Hoặc redirect về home với message "Đang xử lý..."

6. Git commit "Phase 8: Feedback page".
```

### Verify

1. End session → loading → feedback page
2. 3 cards đẹp, content thật, có reference tin
3. Better version hiển thị đúng
4. Buttons hoạt động

### ✅ Done when
- Feedback page complete
- Full MVP flow work end-to-end
- Code committed

---

## PHASE 9: Polish + Deploy (Claude Code + Manual, 1-2 ngày)

### Mục tiêu
App polish, live trên internet.

### Polish (Claude Code)

```bash
cd frontend
claude
```

```
Phase 9 polish. Yêu cầu:

1. Loading states (skeleton):
   - /home: skeleton khi fetching situations
   - /chat: skeleton khi loading session
   - /feedback: skeleton khi loading feedback

2. Error handling toasts:
   - Install: npx shadcn@latest add sonner
   - Setup Toaster trong root layout
   - Show toast khi API call fail
   - Show toast khi session timeout

3. Empty states:
   - /home nếu chưa có situations: friendly message

4. Mobile responsive check:
   - Chat input không bị che bởi keyboard
   - Cards stack đúng trên mobile
   - Top bar không overflow

5. Edge cases:
   - User quay lại /chat của session đã ended → redirect /feedback
   - User quay lại /feedback của session chưa end → redirect /chat
   - Network error: retry button

6. Polish copy:
   - Vietnamese natural, không robot
   - Encouraging tone
   - Không formal quá

7. Git commit "Phase 9 polish".
```

### Deploy Backend (Railway, manual)

1. https://railway.app → New Project → Deploy from GitHub
2. Select repo, choose backend/ as root directory
3. Add environment variables (paste từ .env, không paste OPENAI_API_KEY chung với code):
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - SUPABASE_JWT_SECRET
   - OPENAI_API_KEY
   - OPENAI_MODEL=gpt-4o
   - ALLOWED_ORIGINS=http://localhost:3000,https://YOUR_VERCEL_URL
4. Settings → set start command:
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Generate domain → copy URL (https://xxx.railway.app)

### Deploy Frontend (Vercel, manual)

1. https://vercel.com → New Project → Import GitHub repo
2. Root directory: `frontend/`
3. Environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_API_URL = Railway URL
4. Deploy

### Update CORS

Quay lại Railway → Variables → update ALLOWED_ORIGINS thêm URL Vercel:
```
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

Restart Railway service.

### Update Supabase Auth

Supabase → Authentication → URL Configuration:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: thêm `https://your-app.vercel.app/**`

### Final test

Mở Vercel URL → signup mới → flow đầy đủ → verify mọi thứ work.

### ✅ Done when
- App live trên Vercel URL
- Public URL có thể share
- Full flow work production

---

## What's Next After MVP

1. **Send to 5-10 friends** test thật
2. **Quan sát họ dùng** (Zoom share screen)
3. **Ghi xuống** mọi friction
4. **Iterate** based on feedback

KHÔNG add features mới ngay. Validate core trước.

---

## Common Issues & Fixes

### "ImportError: cannot import langgraph"
Install lại: `pip install langgraph langchain-openai`

### "Invalid JWT" backend
- JWT_SECRET sai (không phải service_role!) → check Settings → JWT Settings
- audience phải là "authenticated" trong jwt.decode

### CORS errors
- ALLOWED_ORIGINS thiếu URL frontend
- Restart backend sau khi đổi env

### LangGraph state mutation error
- Không mutate state trong node
- Return DICT mới: `return {"ai_response": text}`

### OpenAI rate limit
- gpt-4o tier 1 rate limit thấp
- Add retry logic hoặc upgrade tier

### Supabase RLS deny query
- Frontend query bị deny → use service_role ở backend
- Hoặc adjust RLS policy

### Next.js hydration mismatch
- Server/client component mismatch
- Check dynamic data, dùng useEffect cho client-only logic

## Tips with Claude Code

### Claude Code workflow tốt
- Một phase = một session `claude`
- Đọc spec trước khi prompt
- Verify từng step thay vì tin blindly
- Git commit thường xuyên

### Khi Claude Code bí
- "Show me the file structure"
- "Explain what's happening"
- "Simplify this approach"
- "Run tests and tell me what's failing"

### Khi Claude Code làm sai
- "Revert that change"
- "Let me check git history"
- "Rollback to last commit"
