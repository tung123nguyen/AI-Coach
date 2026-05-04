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

## Cấu trúc 4 agents (cập nhật 2026-05)

| Agent | Vai trò | Khi chạy | Phase |
|---|---|---|---|
| **Persona Agent** | Diễn vai đối phương trong roleplay, không phá vai để dạy | Mỗi turn user gửi tin | 4 |
| **Real-time Coach Agent** | Quan sát ngầm, phát hint ngắn khi cần (silence / lặp lỗi / off-track) | Song song với Persona | 5 |
| **Feedback Agent** | Chấm rubric đa chiều + trích 3 moments cụ thể (best / missed / most-important) | Sau khi user end session | 6 |
| **Reflection Agent** | Hỏi Socratic dẫn user tự rút bài học + đặt goal phiên kế | Sau Feedback, user opt-in | 7 |

Nguyên lý phân tách: Persona giữ chân thật của roleplay, Coach can thiệp tối thiểu, Feedback chấm sau, Reflection để user tự kiến tạo. **Không gộp** — gộp là phá vai hoặc làm feedback nhạt.

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

## PHASE 1: Setup Supabase (Manual, 1.5 giờ)

### Mục tiêu
DB + Auth ready với schema mở rộng cho 4 agents.

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

Dashboard → SQL Editor → New query → paste full schema từ `01_PROJECT_SPEC.md` (section "Database Schema"). Schema này phải bao gồm các bảng sau (so với spec ban đầu, **mở rộng** để hỗ trợ persona schema chi tiết, coaching hints, moments-based feedback, và reflection):

- `profiles` — thêm cột `skill_level INT DEFAULT 1` (1–5, dùng cho scaffolding fade), `next_session_goal TEXT NULL`
- `personas` (MỚI, tách khỏi `situations.persona_data`):
  - `id UUID PK`, `name TEXT`, `age INT`, `role TEXT`
  - `big_five JSONB` — keys: openness, conscientiousness, extraversion, agreeableness, neuroticism (mỗi cái int 1–5)
  - `communication_style TEXT CHECK (communication_style IN ('assertive','passive','aggressive','passive_aggressive'))`
  - `hot_buttons TEXT[]` — danh sách topic/từ khóa khiến persona phản ứng mạnh
  - `hidden_agenda TEXT` — mục tiêu ẩn không nói thẳng
  - `voice_traits JSONB` — verbosity, formality, slang_usage, emoji_usage
  - `opening_line TEXT`
- `situations` — thay `persona_data JSONB` bằng `persona_id UUID REFERENCES personas(id)`; thêm `learning_goal TEXT NOT NULL` (Coach dùng để detect off-track)
- `sessions` — giữ nguyên + thêm `learning_goal_snapshot TEXT` (snapshot tại thời điểm tạo session, để Coach reference dù situation đổi sau)
- `messages` — giữ nguyên
- `coaching_hints` (MỚI):
  - `id UUID PK`, `session_id UUID FK`, `message_id UUID FK NULL` (turn nào trigger)
  - `trigger_type TEXT CHECK (trigger_type IN ('silence','repeated_mistake','thought_spiral','off_track','closed_question'))`
  - `hint_text TEXT NOT NULL`
  - `scaffolding_level INT CHECK (scaffolding_level BETWEEN 1 AND 5)`
  - `shown_at TIMESTAMP DEFAULT NOW()`
  - `dismissed BOOLEAN DEFAULT FALSE`, `dismissed_at TIMESTAMP NULL`
  - `user_acted_on BOOLEAN NULL` — backend đoán xem turn kế user có thực hiện theo hint không
- `feedbacks` — mở rộng:
  - giữ `good`, `improve`, `tip` (legacy 3 cards) cho backward compat trong giai đoạn migration
  - thêm `rubric_scores JSONB` — keys: clarity, empathy, openness, goal_alignment, emotional_regulation (mỗi cái 0–10)
  - thêm `moments JSONB` — array 3 phần tử với schema `{ type: 'best'|'missed'|'most_important', quote, message_id, analysis, better_version, transferable_skill }`
  - thêm `drill_suggestion TEXT NULL` (lazy-generated)
- `reflections` (MỚI):
  - `id UUID PK`, `session_id UUID FK UNIQUE`
  - `transcript JSONB` — array `{ role: 'agent'|'user', content, ts }`
  - `insights TEXT[]` — bullets user tự articulate
  - `next_session_goal TEXT NULL`
  - `completed_at TIMESTAMP NULL`

Index quan trọng:
```sql
CREATE INDEX idx_messages_session ON messages(session_id, created_at);
CREATE INDEX idx_hints_session ON coaching_hints(session_id, shown_at);
CREATE INDEX idx_sessions_user ON sessions(user_id, created_at DESC);
```

Verify Table Editor → 8 tables exist (profiles, personas, situations, sessions, messages, coaching_hints, feedbacks, reflections).

**5. Insert seed data**:

SQL Editor → paste seed personas + situations từ spec → Run.

Verify `situations` table → 5 rows; `personas` table → 5 rows; mỗi situation có `persona_id` hợp lệ và `learning_goal` không null.

**6. Disable email confirmation** (cho dễ test):

Authentication → Settings → uncheck "Enable email confirmations" → Save.

(Bật lại trước khi launch production.)

### ✅ Done when
- Supabase project created
- 8 tables exist (đủ cho 4 agents)
- 5 personas + 5 situations seeded với `learning_goal`
- 4 keys saved (URL, anon, service_role, JWT secret)

---

## PHASE 2: Backend Foundation (Claude Code, 2-3 giờ)

### Mục tiêu
FastAPI chạy, có /health, connect được Supabase, sẵn sàng cho streaming + Redis.

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

Yêu cầu setup foundation FastAPI + Supabase + sẵn sàng cho streaming + Redis pub/sub (chưa làm agents):

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
   - sse-starlette        # SSE streaming cho chat + coach hints
   - redis[hiredis]       # pub/sub coach hints giữa các async tasks
   - numpy                # cosine similarity off-track detection
   - tiktoken             # đếm token cho rate limit safety
   
   Save to requirements.txt

2. Tạo .env file (template, tôi sẽ fill values):
   SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   SUPABASE_JWT_SECRET=
   OPENAI_API_KEY=
   OPENAI_MODEL=gpt-4o
   OPENAI_MODEL_COACH=gpt-4o-mini    # Coach hint dùng model rẻ hơn vì gọi nhiều
   PORT=8000
   ALLOWED_ORIGINS=http://localhost:3000
   REDIS_URL=redis://localhost:6379/0
   COACH_ENABLED=true
   COACH_SILENCE_THRESHOLD_SEC=8
   SCAFFOLDING_DEFAULT_LEVEL=3

3. Tạo .gitignore phù hợp Python.

4. Tạo file structure:
   app/
     __init__.py
     main.py        - FastAPI app + CORS + /health endpoint
     config.py      - Pydantic Settings load env vars
     db.py          - Supabase client factory
     auth.py        - JWT verification + get_current_user dependency
     bus.py         - Redis pub/sub helper (publish_hint, subscribe_hints)
     schemas.py     - Pydantic models (paste từ 03_CODE_TEMPLATES.md section 5)
   
5. Setup main.py với:
   - FastAPI app
   - CORS middleware (origins từ settings, expose Content-Type cho SSE)
   - GET /health → {"status": "ok"}
   - On startup: connect Redis, log warning nếu COACH_ENABLED=true mà Redis down (không crash, fallback sang in-memory queue)

6. Implement config.py, db.py, auth.py theo specs trong 03_CODE_TEMPLATES.md.

7. Implement bus.py:
   - publish_hint(session_id, payload: dict) — publish vào channel `coach:{session_id}`
   - async subscribe_hints(session_id) — async generator yield hint từ channel
   - Fallback in-memory dict-of-asyncio-Queue nếu Redis không kết nối được

8. Test app chạy được:
   uvicorn app.main:app --reload --port 8000
   
9. Verify localhost:8000/health returns OK.

Reference 03_CODE_TEMPLATES.md sections 1-5 cho code chi tiết. 

Sau khi xong, git commit "Phase 2: Backend foundation".
```

### Bạn cần làm

Sau khi Claude Code xong:

1. Fill `.env` với 4 keys từ Supabase + OpenAI key
2. (Optional MVP) cài Redis local: `docker run -d -p 6379:6379 redis:7-alpine` — hoặc bỏ qua, dùng fallback in-memory
3. Verify `uvicorn app.main:app --reload --port 8000` chạy
4. Mở http://localhost:8000/health → thấy `{"status":"ok"}`
5. Mở http://localhost:8000/docs → thấy Swagger UI

### ✅ Done when
- Backend chạy localhost:8000
- /health responds OK
- /docs hiển thị
- All files in app/ created (bao gồm bus.py)
- Git commit done

---

## PHASE 3: Backend Situations + Sessions (Claude Code, 2-3 giờ)

### Mục tiêu
2 endpoints work: GET situations (kèm persona join), POST sessions (snapshot learning_goal).

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
   - Query: SELECT s.*, p.name as persona_name, p.role as persona_role 
     FROM situations s 
     JOIN personas p ON p.id = s.persona_id
     ORDER BY difficulty ASC, name ASC
   - Return List[SituationOut] (gồm summary persona, không expose hidden_agenda ra frontend)
   
   Reference 03_CODE_TEMPLATES.md section 10 cho code khung.

3. Tạo app/routers/sessions.py với 2 endpoints:
   
   POST /api/sessions:
   - Body: CreateSessionRequest { situation_id: str }
   - Verify auth, get user_id
   - Get situation + persona JOIN từ DB (404 nếu không tìm thấy)
   - Insert session: { user_id, situation_id, status: 'active', learning_goal_snapshot: situation.learning_goal }
   - Insert opening message: { session_id, sender: 'ai', content: persona.opening_line }
   - Return SessionCreatedOut { session_id, first_message, persona_public }
     - persona_public: chỉ expose name, age, role, opening_line. KHÔNG expose big_five, hot_buttons, hidden_agenda (giữ bí mật để user phải đoán)
   
   GET /api/sessions/{session_id}:
   - Verify auth, verify session.user_id == user_id (403 nếu không)
   - Get session, all messages, persona_public từ situation
   - Return SessionFullOut

4. Register routers trong app/main.py:
   from app.routers import situations, sessions
   app.include_router(situations.router, prefix="/api", tags=["situations"])
   app.include_router(sessions.router, prefix="/api", tags=["sessions"])

5. Test bằng cách:
   - Tạo test user trong Supabase Dashboard
   - Get JWT token bằng curl tới /auth/v1/token
   - Test GET /api/situations và POST /api/sessions
   - Document test commands vào file backend/test_commands.md

6. Nếu test pass, git commit "Phase 3: Situations + Sessions endpoints".

Lưu ý:
- KHÔNG bao giờ trả về hidden_agenda / big_five / hot_buttons trong API response cho frontend
- Use Pydantic models tách PersonaPublic vs PersonaFull
```

### Verify steps

1. Test user trong Supabase
2. Get JWT
3. Curl GET /api/situations → return 5 situations với persona_name + persona_role
4. Curl POST /api/sessions → return session_id + first message + persona_public (không có hidden_agenda)
5. Verify trong Supabase Table Editor: sessions có row với learning_goal_snapshot

### ✅ Done when
- 3 endpoints work via curl
- Hidden persona attributes KHÔNG leak ra response
- Code committed

---

## PHASE 4: Persona Agent v2 + Chat Streaming ⭐ (Claude Code, 5-6 giờ)

### Mục tiêu
Persona Agent dùng schema chi tiết (Big Five + hot buttons + hidden agenda) và stream từng token qua SSE.

Đây là phase nền cho tất cả agent khác — Coach hook vào event stream của phase này.

### Mở Claude Code

```bash
cd backend
claude
```

### Prompt 1 — Persona schema + prompt builder

```
Đọc 01_PROJECT_SPEC.md (section "Agent Prompts") và 03_CODE_TEMPLATES.md (section 6).

Chúng ta ở Phase 4. Build Persona Agent v2 với schema chi tiết.

1. Tạo app/agents/__init__.py (empty)

2. Tạo app/agents/persona/__init__.py (empty)

3. Tạo app/agents/persona/schema.py:
   
   Pydantic models:
   - BigFive: openness, conscientiousness, extraversion, agreeableness, neuroticism (int 1-5 mỗi cái)
   - VoiceTraits: verbosity (1-5), formality (1-5), slang_usage (1-5), emoji_usage (1-5)
   - PersonaProfile (full): id, name, age, role, big_five, communication_style, hot_buttons (list[str]), hidden_agenda, voice_traits, opening_line
   - PersonaPublic (subset cho frontend): id, name, age, role, opening_line
   
   Method PersonaProfile.to_public() → PersonaPublic.

4. Tạo app/agents/persona/prompts.py:
   
   Function build_persona_system_prompt(profile: PersonaProfile, situation_description: str, learning_goal: str) -> str
   
   Template structure:
   - Identity block: "Bạn là {name}, {age} tuổi, {role}."
   - Personality block: dịch big_five thành câu mô tả tự nhiên (vd O=4 → "tò mò, thích ý tưởng mới"; N=4 → "dễ lo lắng dưới áp lực")
   - Communication style block: cụ thể hoá theo enum
     * passive: tránh xung đột, dùng "có lẽ", "có thể", giảm nhẹ
     * passive-aggressive: bề ngoài nice nhưng có gai
     * assertive: nói thẳng, rõ ràng
     * aggressive: ngắt lời, áp đặt
   - Hot buttons block: "Khi user chạm tới [topic], bạn phản ứng [cách]" — KHÔNG nói lộ ra
   - Hidden agenda block: "Mục tiêu thật của bạn: {hidden_agenda}. Bạn KHÔNG nói thẳng điều này."
   - Voice block: dịch voice_traits thành rule cụ thể
   - HARD RULES (cuối prompt, đậm):
     * "Bạn KHÔNG bao giờ phá vai để dạy user, kể cả khi user nói vụng."
     * "Bạn KHÔNG bao giờ giải thích mình là AI."
     * "Bạn KHÔNG meta-comment về cuộc hội thoại."
     * "Việc dạy do agent khác đảm nhận. Bạn chỉ phản ứng tự nhiên theo tính cách."
     * "Trả lời tối đa 3 câu, theo phong cách {communication_style}."
   - Situation context: "Bối cảnh: {situation_description}"
   
   Function build_user_facing_message(history, user_message) — format messages cho ChatOpenAI.

5. Tạo app/agents/persona/graph.py với LangGraph:
   
   ChatState TypedDict:
   - persona: PersonaProfile
   - history: list[dict]
   - user_message: str
   - situation_description: str
   - learning_goal: str
   - emotional_state: dict (heat: 0-10, curiosity: 0-10, trust: 0-10)
   - ai_response: str (output)
   
   Nodes:
   - load_emotional_state: tính emotional_state hiện tại từ history (đơn giản: scan message gần nhất, nếu user chạm hot_button thì heat tăng)
   - generate_response: gọi ChatOpenAI với system prompt + history + user message; temperature 0.8; max_tokens 400; ENABLE streaming=True
   - validate_in_character: kiểm tra response có break character không (regex: "as an AI", "I'm a model", "let me teach you", "you should ask"); nếu break → flag và regenerate 1 lần
   
   Edges: load_emotional_state → generate_response → validate_in_character → END
   
   Public interface:
   - run_chat(persona, history, user_message, situation_description, learning_goal) -> str (non-stream, dùng cho test)
   - async stream_chat(...) -> AsyncIterator[str] (yield từng token cho SSE)

6. Test với script tạm backend/test_persona.py:
   - Tạo PersonaProfile mock với big_five = {O:4, C:3, E:2, A:3, N:4}, communication_style='passive', hot_buttons=['deadline','overtime'], hidden_agenda='Muốn được công nhận nhưng sợ làm phiền'
   - Test 3 user messages:
     a. "Em thấy task này gấp lắm, deadline tuần sau" (chạm hot_button)
     b. "Anh nghĩ em làm thế nào?" (câu mở)
     c. "Thôi em tự xử lý" (đóng cuộc thoại)
   - In ra response, verify persona giữ phong cách passive (rụt rè), không break character
   - Test stream_chat in từng token

7. Xóa test_persona.py, git commit "Phase 4a: Persona Agent v2 with full schema".
```

### Prompt 2 — Streaming chat endpoint

```
Tiếp Phase 4. Bây giờ thêm endpoint POST messages dạng SSE streaming.

1. Tạo app/routers/messages.py:
   
   POST /api/sessions/{session_id}/messages
   
   - Auth + ownership check
   - Body: SendMessageRequest { content }
   - Phản hồi: text/event-stream (SSE)
   - Flow:
     1. Save user message vào DB ngay (lấy message_id)
     2. Publish event "user_turn_done" lên Redis channel coach:{session_id} 
        kèm payload { message_id, content, ts } — Coach Agent sẽ subscribe ở Phase 5
     3. Load PersonaProfile + history (exclude user message vừa save khỏi history vì nó là input riêng)
     4. async for token in stream_chat(...): yield SSE event "token" với data
     5. Sau khi stream xong, save AI response vào DB
     6. Yield SSE event "done" với { message_id, full_content }
   - Nếu lỗi: yield SSE event "error" với error message, đóng stream
   
   Dùng sse-starlette EventSourceResponse.

2. Register router trong main.py.

3. Test end-to-end với curl:
   curl -N -X POST http://localhost:8000/api/sessions/{id}/messages \
     -H "Authorization: Bearer JWT" \
     -H "Content-Type: application/json" \
     -d '{"content":"Chào em"}'
   
   Phải thấy:
   event: token
   data: "C"
   
   event: token
   data: "h"
   ...
   
   event: done
   data: {"message_id": "...", "full_content": "..."}

4. Test 5-7 turns liên tiếp, verify AI giữ character.

5. Verify trong DB: messages table có user + ai messages alternating.

6. Git commit "Phase 4b: Streaming chat endpoint with SSE".
```

### Verify steps

1. test_persona.py: AI giữ phong cách passive, không phá vai khi user vụng
2. SSE stream: token đến từng cái một, không bị buffer
3. Hot button: khi user nói về "deadline" persona neuroticism cao → response phản ánh sự lo lắng
4. Hidden agenda: persona không nói thẳng "tôi muốn được công nhận" nhưng có hint qua câu chữ
5. DB: cả user và AI message persist đúng

### ✅ Done when
- Persona schema đầy đủ Big Five + communication style + hot buttons + hidden agenda
- Streaming SSE work qua curl
- Hard rules giữ persona không phá vai để dạy
- Redis publish event "user_turn_done" sau khi save user message (Coach sẽ dùng ở Phase 5)
- Code committed

---

## PHASE 5: Real-time Coach Agent ⭐⭐ (Claude Code, 6-8 giờ)

### Mục tiêu
Coach chạy SONG SONG với Persona, phát hint ngắn khi phát hiện thời điểm cần can thiệp, không phá flow chat.

Đây là phase phức tạp nhất. Đọc kỹ trước khi prompt.

### Thiết kế kiến trúc

```
                          User gửi tin
                              │
                              ▼
                ┌─────────────────────────────┐
                │ POST /api/sessions/{id}/    │
                │ messages (SSE)              │
                │                             │
                │ 1. Save user msg            │
                │ 2. Publish "user_turn_done" │──────┐ Redis
                │ 3. Stream Persona response  │      │ pub/sub
                └─────────────────────────────┘      │
                              │                       ▼
                              │              ┌────────────────────┐
                              │              │ Coach worker       │
                              │              │ (asyncio.create_task)│
                              │              │                    │
                              │              │ heuristics:        │
                              │              │ - silence (timer)  │
                              │              │ - repeated mistake │
                              │              │ - thought spiral   │
                              │              │ - off track        │
                              │              │ - closed question  │
                              │              │                    │
                              │              │ Nếu trigger:       │
                              │              │ → LLM gen hint     │
                              │              │ → publish "hint"   │──┐
                              ▼              └────────────────────┘  │
                  Frontend chat stream                                │
                                                                     │
                                          ┌──────────────────────────┘
                                          ▼
                          ┌────────────────────────────┐
                          │ GET /api/sessions/{id}/    │
                          │ coach-stream (SSE separate)│
                          │                            │
                          │ subscribe Redis →          │
                          │ forward hint events        │
                          └────────────────────────────┘
                                          │
                                          ▼
                                  Frontend hint UI
```

Hai SSE stream **độc lập**: chat stream cho Persona response, coach stream cho hints. Frontend mở cả 2 song song.

### Mở Claude Code

```bash
cd backend
claude
```

### Prompt 1 — Heuristics layer

```
Đọc 01_PROJECT_SPEC.md, 02_VIBECODE_ROADMAP.md (Phase 5).

Build heuristics layer cho Coach Agent. Layer này là PURE FUNCTIONS, KHÔNG gọi LLM (heuristics rẻ + nhanh + deterministic).

1. Tạo app/agents/coach/__init__.py (empty)

2. Tạo app/agents/coach/heuristics.py:

   Pydantic Trigger model:
   - trigger_type: Literal['silence','repeated_mistake','thought_spiral','off_track','closed_question']
   - severity: float (0.0-1.0) — bao nhiêu chắc chắn
   - context: dict — extra info để feed vào hint generator
   
   Functions (async OK nhưng không gọi LLM):
   
   a. detect_silence(last_user_message_ts: datetime, last_heartbeat_ts: datetime, threshold_sec: int = 8) -> Trigger | None
      - Nếu now - last_heartbeat_ts > threshold AND user chưa gửi tin mới → silence trigger
      - Severity tăng theo thời gian (8s = 0.5, 15s = 0.8, 25s+ = 1.0)
   
   b. detect_repeated_mistake(history: list[Message], current_user_msg: str) -> Trigger | None
      - Fingerprint loại lỗi từ message: 
        * closed_question: kết thúc bằng "không?", "phải không?", "đúng chứ?"
        * dismissive: chứa "thôi", "không sao", "kệ"
        * ignoring_emotion: AI vừa expression cảm xúc mà user không acknowledge
      - Đếm fingerprint xuất hiện trong 6 tin user gần nhất
      - Nếu cùng fingerprint xuất hiện ≥3 lần → trigger với context.fingerprint
   
   c. detect_thought_spiral(history: list[Message]) -> Trigger | None
      - User xin lỗi (regex "xin lỗi|sorry|tôi sai") ≥2 lần trong 4 turn user gần nhất → trigger
      - HOẶC user lặp lại idea cũ (Jaccard similarity giữa 2 user msg gần nhất > 0.7) → trigger
   
   d. detect_off_track(history, learning_goal: str, embedding_fn) -> Trigger | None
      - Embed 3 tin user gần nhất + learning_goal
      - Tính cosine similarity trung bình
      - Nếu < 0.3 → off_track trigger với severity = 1 - similarity
      - embedding_fn là DI để dễ test (production dùng OpenAI text-embedding-3-small)
   
   e. detect_closed_question(user_msg: str) -> Trigger | None
      - Quick regex check: kết thúc "?" + bắt đầu bằng "có/là/phải/đã" → likely closed
      - Nếu phát hiện AND đây là turn user đầu tiên hỏi sau khi AI mở đề tài → trigger
      - Đây là trigger soft (severity 0.4) — chỉ nudge, không spam
   
   f. detect_all(session_state) -> list[Trigger] — chạy hết và return list (có thể nhiều trigger cùng turn, decide_show ở graph layer sẽ chọn)

3. Tạo app/agents/coach/scaffolding.py:
   
   Function compute_scaffolding_level(user_skill_level: int, hints_shown_in_session: int, hints_dismissed: int) -> int
   - Level 5 = scaffold mạnh (hint chi tiết, gợi ý nguyên câu thay thế)
   - Level 1 = scaffold tối thiểu (chỉ nudge, "thử nghĩ khác đi")
   - Logic:
     * Base = 6 - user_skill_level (skill 1 → scaffold 5; skill 5 → scaffold 1)
     * Trừ 1 nếu hints_shown ≥ 3 trong session (đã được giúp nhiều rồi)
     * Trừ 1 nếu user dismiss ≥2 hint (user không muốn bị quấy)
     * Clamp [1, 5]
   
   Function should_show_hint(triggers, session_state) -> Trigger | None
   - Nếu hint đã show trong 30s gần đây cùng trigger_type → skip (dedupe)
   - Nếu nhiều trigger: ưu tiên off_track > thought_spiral > repeated_mistake > silence > closed_question
   - Return trigger được chọn hoặc None

4. Test app/agents/coach/test_heuristics.py với pytest fixtures:
   - 5 transcripts mock cho mỗi heuristic (true positive + false positive)
   - Verify detect_silence tính thời gian đúng
   - Verify detect_repeated_mistake không trigger nếu chỉ 1 lần
   - Verify detect_off_track với mock embedding (vector cố định)
   - Verify scaffolding fade theo skill_level

5. Git commit "Phase 5a: Coach heuristics + scaffolding (no LLM)".
```

### Prompt 2 — Coach LangGraph + worker

```
Phase 5 tiếp. Build Coach LangGraph và worker chạy song song.

1. Tạo app/agents/coach/prompts.py:
   
   Function build_hint_prompt(trigger: Trigger, scaffolding_level: int, recent_history: list, learning_goal: str) -> str
   
   Template ngắn gọn — output phải ≤ 80 ký tự (1 dòng UI). Examples theo trigger_type:
   - closed_question + scaffold 4: "Thử hỏi câu mở: 'Em cảm thấy thế nào về...'"
   - silence + scaffold 3: "Im lặng cũng OK. Thử hỏi điều bạn thật sự tò mò."
   - off_track + scaffold 5: "Goal phiên là {goal}. Quay lại bằng câu: '...'"
   - repeated_mistake (fingerprint=closed_question, 4 lần) + scaffold 5: "Bạn đang hỏi câu đóng liên tục. Thử: 'Sao em lại nghĩ vậy?'"
   - thought_spiral + scaffold 4: "Bạn xin lỗi nhiều rồi. Thử nói thẳng điều bạn muốn."
   
   Hard rules:
   - KHÔNG bắt đầu bằng "Bạn nên" / "Tốt hơn là"
   - KHÔNG dài hơn 1 câu / 80 ký tự
   - Phong cách: friendly coach, không phán xét

2. Tạo app/agents/coach/graph.py với LangGraph:
   
   CoachState:
   - session_id: str
   - learning_goal: str
   - history: list[Message]
   - current_user_msg: str | None  (nếu trigger từ silence thì None)
   - last_heartbeat_ts: datetime
   - user_skill_level: int
   - hints_in_session: list[Hint] (đã show)
   - trigger: Trigger | None (output của detect)
   - hint_text: str | None (output của generate)
   
   Nodes:
   - detect_node: chạy heuristics.detect_all → state.triggers
   - decide_node: scaffolding.should_show_hint → state.trigger (singular, đã pick)
   - generate_node: nếu state.trigger không None → gọi LLM (gpt-4o-mini, temp 0.4, max 60 token) với prompt build → state.hint_text
   - validate_node: ép hint_text ≤ 80 ký tự, strip phần thừa, ensure không có "Bạn nên"
   
   Edges: detect → decide → (conditional: nếu trigger None → END; else → generate) → validate → END
   
   Public interface:
   - async run_coach_turn(session_id, current_user_msg=None) -> Hint | None
     * Load session state từ DB + Redis (recent heartbeat)
     * Run graph
     * Nếu hint generated: insert vào coaching_hints table, publish lên Redis channel coach:{session_id} với event "hint"
     * Return Hint object (hoặc None)

3. Tạo app/workers/coach_worker.py:
   
   async def coach_worker_loop():
     - Subscribe Redis channel "coach:*" pattern
     - Trigger types xử lý:
       * "user_turn_done" → run_coach_turn(session_id, current_user_msg=msg)
       * "heartbeat" → check silence (chỉ chạy detect_silence, không gọi LLM nếu không trigger)
     - Background timer: mỗi 3s scan tất cả active sessions để check silence (cron-like)
     
     Worker không block API request — fire-and-forget.

4. Tích hợp vào app/main.py startup:
   - Spawn coach_worker_loop() qua asyncio.create_task khi COACH_ENABLED=true
   - Graceful shutdown khi app stop

5. Tạo app/routers/coach.py với 3 endpoints:
   
   GET /api/sessions/{session_id}/coach-stream (SSE):
   - Auth + ownership
   - Subscribe Redis channel coach:{session_id}, filter event type "hint"
   - Yield SSE event "hint" với payload { hint_id, trigger_type, hint_text, scaffolding_level }
   - Heartbeat ping mỗi 15s để giữ connection (yield comment ":\n\n")
   
   POST /api/sessions/{session_id}/heartbeat:
   - Auth + ownership
   - Body: { is_typing: bool }
   - Update last_heartbeat_ts trong Redis (key heartbeat:{session_id}, TTL 30s)
   - Publish "heartbeat" event để worker timer biết user còn active
   - Return 204
   
   POST /api/hints/{hint_id}/dismiss:
   - Auth + verify hint thuộc session của user
   - UPDATE coaching_hints SET dismissed=true, dismissed_at=NOW()
   - Return 204

6. Register router trong main.py.

7. Test end-to-end:
   - Mở 2 terminal:
     T1: curl SSE chat stream
     T2: curl SSE coach stream cùng session_id
   - Test trigger silence: gửi 1 tin, không gửi tin tiếp, đợi 10s → T2 phải nhận hint event
   - Test trigger closed_question: gửi "Anh có khỏe không?" → có thể nhận hint
   - Test trigger repeated_mistake: gửi 4 closed question liên tiếp → hint xuất hiện ở turn 3-4
   - Test scaffolding fade: tăng profiles.skill_level lên 5, test → hint phải ngắn gọn hơn

8. Git commit "Phase 5b: Coach Agent worker + SSE stream".
```

### Verify steps

1. Heuristics test pass với mock fixtures
2. Silence trigger sau 8-10s không hoạt động
3. Closed question trigger nhận diện chuẩn (không false positive với câu mở "Em cảm thấy sao?")
4. Off-track: gửi tin lạc đề (vd chat về thời tiết khi goal là "đàm phán deadline") → hint xuất hiện
5. Dedupe: cùng trigger_type không show lại trong 30s
6. Scaffolding fade: skill_level cao → hint ngắn hơn / ít gợi câu hơn
7. Persona stream KHÔNG bị block bởi Coach (chat vẫn mượt)
8. Hint persist trong `coaching_hints` table

### ✅ Done when
- 5 heuristics work với test coverage
- Coach worker chạy song song không cản trở chat
- 2 SSE streams độc lập (chat + coach)
- Heartbeat endpoint nhận signal từ frontend
- Dismiss endpoint cập nhật DB
- Scaffolding fade theo skill_level
- Code committed

---

## PHASE 6: Feedback Agent v2 — Moments-based ⭐ (Claude Code, 4-5 giờ)

### Mục tiêu
Feedback Agent chấm rubric đa chiều và trích đúng 3 moments cụ thể với quote nguyên văn.

### Mở Claude Code

```bash
cd backend
claude
```

### Prompt

```
Đọc 01_PROJECT_SPEC.md (section "Agent Prompts") và 03_CODE_TEMPLATES.md (section 7).

Phase 6: Feedback Agent v2.

1. Tạo app/agents/feedback/__init__.py (empty)

2. Tạo app/agents/feedback/rubric.py:
   
   Pydantic RubricScores:
   - clarity: int (0-10)         — câu cú rõ ràng, không lủng củng
   - empathy: int (0-10)         — đồng cảm với cảm xúc đối phương
   - openness: int (0-10)        — câu mở vs câu đóng, mời gọi chia sẻ
   - goal_alignment: int (0-10)  — bám learning_goal đến đâu
   - emotional_regulation: int (0-10)  — giữ bình tĩnh khi bị thách
   
   Function format_rubric_for_prompt(scores) -> str (cho Reflection agent dùng)

3. Tạo app/agents/feedback/moments.py:
   
   Pydantic Moment:
   - type: Literal['best','missed','most_important']
   - quote: str               # PHẢI là substring exact của 1 message trong transcript
   - message_id: str          # message chứa quote
   - analysis: str            # vì sao moment này quan trọng (2-3 câu)
   - better_version: str      # diễn đạt thay thế (chỉ với missed + most_important; với best là transferable_skill)
   - transferable_skill: str  # chỉ với type='best': kỹ năng nào user đã làm tốt, đem áp dụng được ở đâu
   
   Function validate_quote_in_transcript(quote: str, transcript: list[Message]) -> str | None
   - Tìm message_id chứa quote (substring match, case-sensitive)
   - Return message_id nếu match, None nếu không
   
   Function find_best_substring_match(quote: str, transcript: list[Message]) -> tuple[str, str] | None
   - Nếu quote không match exact, tìm message có Levenshtein similarity cao nhất
   - Dùng cho retry: feedback prompt sẽ được gợi "quote phải là substring của message X hoặc Y"

4. Tạo app/agents/feedback/prompts.py:
   
   Function build_rubric_prompt(transcript, learning_goal, persona_summary) -> str
   - System: "Bạn là coach chấm hội thoại theo rubric 5 chiều..."
   - Yêu cầu output JSON strict { clarity: int, empathy: int, openness: int, goal_alignment: int, emotional_regulation: int }
   
   Function build_moments_prompt(transcript, learning_goal, rubric_scores, persona_summary) -> str
   - System: "Trích đúng 3 moments. KHÔNG generic, NEO vào câu cụ thể."
   - Hard rules:
     * "quote phải là substring nguyên văn của 1 message trong transcript"
     * "KHÔNG paraphrase quote"
     * "analysis nói RÕ vì sao moment này tốt/dở, không nói chung chung"
     * "better_version phải khác quote về cấu trúc, không chỉ đổi từ"
   - Output JSON:
     {
       "best": { quote, message_id, analysis, transferable_skill },
       "missed": { quote, message_id, analysis, better_version },
       "most_important": { quote, message_id, analysis, better_version, root_cause }
     }
   
   Function build_drill_prompt(most_important_moment, persona_summary) -> str
   - Gợi ý 1 bài tập 5-10 phút user có thể tự làm để cải thiện điểm yếu chính
   - Output: 1 paragraph, tone encouraging

5. Tạo app/agents/feedback/graph.py với LangGraph:
   
   FeedbackState:
   - transcript: list[Message]
   - learning_goal: str
   - persona_summary: str
   - rubric_scores: RubricScores | None
   - moments: dict[str, Moment] | None  (best/missed/most_important)
   - drill: str | None
   - validation_errors: list[str]
   - retry_count: int
   
   Nodes:
   - score_rubric: gọi LLM (temp 0.3) với json_object response_format → state.rubric_scores
   - extract_moments: gọi LLM (temp 0.4) → parse JSON → state.moments (dict raw)
   - validate_quotes: với mỗi moment, validate_quote_in_transcript; nếu fail thêm vào validation_errors
   - retry_moments: nếu validation_errors không empty AND retry_count < 2 → re-prompt với hint "your quote was not found, candidates are: [msg X, msg Y]" → state.retry_count += 1
   - generate_drill: chỉ với most_important moment → state.drill
   - assemble: tổng hợp thành response final
   
   Conditional edges:
   - score_rubric → extract_moments
   - extract_moments → validate_quotes
   - validate_quotes → (errors empty? → generate_drill : retry_moments)
   - retry_moments → extract_moments (loop max 2 lần)
   - retry_moments thất bại 2 lần → fallback (skip moment đó, log warning)
   - generate_drill → assemble → END
   
   Public interface: 
   - async generate_feedback(session_id) -> FeedbackResult
     * Load transcript, learning_goal, persona_summary từ DB
     * Run graph
     * Save vào feedbacks table (rubric_scores + moments + drill)
     * Return FeedbackResult

6. Modify app/routers/sessions.py thêm 2 endpoints:
   
   POST /api/sessions/{session_id}/end:
   - Auth + ownership
   - Update session: status='ended', ended_at=NOW()
   - Publish Redis "session_ended" để Coach worker stop subscription cho session đó
   - Call generate_feedback(session_id) — đây là async, có thể tạo BackgroundTask để return 202 Accepted ngay, frontend poll GET feedback
   - HOẶC await trực tiếp nếu muốn đơn giản — return 200 với feedback đầy đủ
     * Đề xuất: BackgroundTask vì feedback có thể chạy 8-15s, return 202 + frontend poll
   - Return { session_id, status: 'processing' | 'completed' }
   
   GET /api/sessions/{session_id}/feedback:
   - Auth + ownership
   - SELECT * FROM feedbacks WHERE session_id = ?
   - Nếu chưa có → 404 (frontend retry)
   - Return FeedbackResponse với rubric_scores + moments + drill

7. Test:
   - Chat 7-10 turns với 1 persona
   - End session
   - Poll GET feedback đến khi có
   - Verify:
     * rubric_scores có đủ 5 chiều, mỗi cái 0-10
     * moments có đúng 3 phần tử (best, missed, most_important)
     * mỗi quote PHẢI là substring exact của message thật
     * better_version khác quote về cấu trúc
     * drill cụ thể, không generic

8. Test edge case validate_quote:
   - Mock LLM response trả về quote không tồn tại (vd hallucinated)
   - Verify retry mechanism kick in
   - Verify fallback nếu retry fail 2 lần

9. Git commit "Phase 6: Feedback Agent v2 with moments + rubric".
```

### Verify

1. POST end → 202 trong 100ms
2. Poll GET feedback → có feedback trong 10-15s
3. 3 moments mỗi cái có quote là substring nguyên văn (verify thủ công)
4. Rubric scores hợp lý (không phải 10/10 mặc định)
5. Drill cụ thể, không "hãy luyện tập thêm"

### ✅ Done when
- Feedback có rubric đa chiều + 3 moments
- Quote validation work, retry mechanism work
- Background task không block end endpoint
- Code committed

---

## PHASE 7: Reflection Agent — Socratic ⭐ (Claude Code, 3-4 giờ)

### Mục tiêu
Reflection Agent dẫn user tự rút bài học qua hỏi Socratic, kết thúc bằng next-session goal.

### Mở Claude Code

```bash
cd backend
claude
```

### Prompt

```
Đọc 01_PROJECT_SPEC.md (section "Agent Prompts").

Phase 7: Reflection Agent.

1. Tạo app/agents/reflection/__init__.py (empty)

2. Tạo app/agents/reflection/prompts.py:
   
   SOCRATIC_PROMPT_BASE: cấu trúc prompt
   - Identity: "Bạn là coach phản tư Socratic. Bạn KHÔNG giảng. Bạn chỉ hỏi câu mở giúp user tự kiến tạo bài học."
   - Hard rules:
     * "KHÔNG bao giờ nói 'bạn nên', 'tốt hơn là', 'thử cách này'"
     * "Mỗi turn chỉ hỏi 1 câu, ngắn gọn"
     * "Câu hỏi phải REFER tới quote/moment cụ thể từ feedback"
     * "Sau 3-5 turn, gợi ý user articulate 1-2 insights"
     * "Cuối phiên, gợi ý 2-3 next-session goals dựa trên insights, user pick 1"
   - Context: feedback moments + rubric + transcript snippet
   
   Function build_first_question(feedback, persona_summary) -> str
   - Câu hỏi đầu phải neo vào "missed" hoặc "most_important" moment
   - Format: "Lúc {persona_name} nói '{quote}', bạn nghĩ họ thực sự muốn gì?" (đại loại)
   
   Function build_next_question(reflection_history, feedback, depth_score) -> str
   - depth_score là output của evaluate_depth: nếu user trả lời surface (1-2 câu, không tự phản tư), hỏi sâu hơn
   - Nếu depth_score đã đủ (≥3 turn user thể hiện self-reflection rõ), chuyển sang phase suggest_goals
   
   Function build_goal_suggestion(reflection_history, feedback) -> str
   - Output 2-3 goal options, format JSON: [{ goal_text, rationale }]
   - User pick hoặc customize
   
   Function evaluate_depth(reflection_history) -> int (1-5)
   - 1: user trả lời 1 từ ("ok", "không")
   - 5: user articulate insight rõ ràng có cause-effect
   - Đơn giản: dùng heuristic word count + có "vì", "bởi vì", "tôi thấy" → tăng depth

3. Tạo app/agents/reflection/graph.py với LangGraph:
   
   ReflectionState:
   - reflection_id: str
   - session_id: str
   - feedback: dict
   - history: list[{role, content, ts}]
   - depth_score: int
   - phase: Literal['questioning','suggesting_goals','done']
   - current_question: str | None
   - suggested_goals: list[dict] | None
   - chosen_goal: str | None
   
   Nodes:
   - load_context: nếu reflection_id mới → load feedback + persona; nếu existing → load history
   - evaluate_depth: scan history, set depth_score
   - decide_phase: 
     * Nếu len(history) < 2 → phase='questioning' (first question)
     * Nếu depth_score < 3 AND len < 6 → tiếp tục questioning
     * Nếu depth_score ≥ 3 OR len ≥ 6 → phase='suggesting_goals'
     * Nếu chosen_goal đã có → phase='done'
   - generate_question (if phase='questioning'): build_first_question hoặc build_next_question
   - generate_goals (if phase='suggesting_goals'): build_goal_suggestion → state.suggested_goals
   - finalize (if phase='done'): save chosen_goal vào reflections + profiles.next_session_goal
   
   Public interface:
   - async start_reflection(session_id, user_id) -> ReflectionResponse
     * Tạo row reflections mới
     * Run graph với history rỗng → return first question
   - async submit_turn(reflection_id, user_answer) -> ReflectionResponse
     * Append user_answer vào history
     * Run graph
     * Return next question OR suggested_goals OR done signal
   - async finalize_reflection(reflection_id, chosen_goal) -> None
     * Update reflections.chosen_goal + completed_at
     * Update profiles.next_session_goal

4. Tạo app/routers/reflection.py với 3 endpoints:
   
   POST /api/sessions/{session_id}/reflection:
   - Auth + ownership
   - Verify session.status='ended' AND feedback exists
   - Verify chưa có reflection cho session này (UNIQUE)
   - Call start_reflection → return { reflection_id, first_question }
   
   POST /api/reflections/{reflection_id}/turn:
   - Auth + ownership (verify via reflection.session.user_id)
   - Body: { answer: str }
   - Call submit_turn → return:
     * { phase: 'questioning', next_question: str }, hoặc
     * { phase: 'suggesting_goals', goals: [{ goal_text, rationale }] }
   
   POST /api/reflections/{reflection_id}/finalize:
   - Auth + ownership
   - Body: { chosen_goal: str }
   - Call finalize_reflection
   - Return 204

5. Test:
   - End session từ Phase 6, có feedback
   - POST start reflection → nhận câu hỏi đầu (phải neo vào quote moment)
   - POST turn với answer surface ("không biết") → nhận câu hỏi sâu hơn
   - POST turn với answer có insight → sau 3-4 turn nhận suggested_goals
   - POST finalize với 1 goal → verify profiles.next_session_goal đã update

6. Verify Reflection KHÔNG vi phạm hard rules:
   - Đọc 5 reflections test
   - Mỗi câu hỏi phải là câu hỏi (kết thúc "?")
   - KHÔNG có "bạn nên" / "tốt hơn là"
   - KHÔNG quá 1 câu/turn

7. Git commit "Phase 7: Reflection Agent (Socratic)".
```

### Verify

1. First question neo vào quote moment cụ thể
2. Adaptive depth: trả lời nông → hỏi tiếp; trả lời sâu → suggest goals
3. Goals cụ thể, không generic
4. profiles.next_session_goal update đúng
5. Hard rules giữ (không "bạn nên")

### ✅ Done when
- Reflection 3-5 turn smooth
- Goal flow tới profiles
- Phase 5 Coach (next session) có thể đọc next_session_goal làm learning_goal mới (loop khép)
- Code committed

---

## PHASE 8: Frontend Setup + Landing + Auth (Claude Code, 4-5 giờ)

### Mục tiêu
Next.js chạy, landing page đẹp, signup/login work.

### Setup trước

```bash
cd ../frontend
```

### Mở Claude Code

```bash
claude
```

### Prompt

```
Đọc ../01_PROJECT_SPEC.md và ../03_CODE_TEMPLATES.md sections 11-15.

Phase 8: Setup frontend + landing + auth.

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
   
   Add components: button, card, input, label, textarea, sonner, dialog, badge
   npx shadcn@latest add button card input label textarea sonner dialog badge

4. Tạo .env.local (template, tôi fill values):
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   NEXT_PUBLIC_API_URL=http://localhost:8000

5. Tạo Supabase clients (paste exactly từ 03_CODE_TEMPLATES.md):
   - lib/supabase/client.ts (section 12)
   - lib/supabase/server.ts (section 13)

6. Tạo middleware.ts (section 14):
   - Refresh auth tokens
   - Protected routes: /home, /chat, /feedback, /reflection redirect /login nếu no user

7. Tạo lib/types.ts (section 15) — bao gồm types mới: PersonaPublic, CoachHint, RubricScores, Moment, ReflectionTurn

8. Tạo lib/api.ts (section 11) — API client wrapper với functions:
   - getSituations, getSession, createSession (như cũ)
   - sendMessageStream(sessionId, content, onToken, onDone, onError) — SSE consumer cho chat
   - subscribeCoachHints(sessionId, onHint) — SSE consumer cho coach stream, return unsubscribe fn
   - postHeartbeat(sessionId, isTyping)
   - dismissHint(hintId)
   - endSession(sessionId)
   - getFeedback(sessionId)
   - startReflection(sessionId)
   - submitReflectionTurn(reflectionId, answer)
   - finalizeReflection(reflectionId, goal)

9. Tạo app/page.tsx — Landing page:
   - Hero: "Phòng tập giao tiếp với AI"
   - Subtitle: "Persona thật. Coach realtime. Feedback neo vào câu cụ thể."
   - 2 CTAs: "Bắt đầu miễn phí" → /signup, "Đăng nhập" → /login
   - 4 feature cards (cập nhật 4 agents):
     1. AI Persona schema chi tiết — Big Five, hot buttons, hidden agenda
     2. Coach realtime — hint xuất hiện khi bạn cần, không phá flow
     3. Feedback neo vào quote — 3 moments cụ thể, không generic
     4. Reflection Socratic — bạn tự rút bài học, không bị giảng
   - Footer: "Conversation Gym · 2026"
   - Style: gradient blue-50 → white, accent blue-600
   - Server component

10. Tạo app/(auth)/signup/page.tsx và app/(auth)/login/page.tsx như Phase 6 cũ.

11. Test:
    npm run dev
    
    - Landing đẹp ở localhost:3000
    - Signup → tạo account thật
    - Login → redirect /home

12. Tôi sẽ fill .env.local sau.

13. Git commit "Phase 8: Frontend setup + Landing + Auth".
```

### ✅ Done when
- localhost:3000 hiển thị landing với 4 feature cards (4 agents)
- Signup/login work
- Code committed

---

## PHASE 9: Frontend Home + Chat + Coach Hint UI (Claude Code, 6-8 giờ)

### Mục tiêu
Home → Chat realtime với Persona streaming + Coach hint side panel.

### Mở Claude Code

```bash
cd frontend
claude
```

### Prompt

```
Đọc ../01_PROJECT_SPEC.md và ../03_CODE_TEMPLATES.md.

Phase 9: Build Home + Chat pages với realtime streaming + coach hints.

QUAN TRỌNG: Backend phải đang chạy ở localhost:8000 với Phase 5 + Persona streaming.

1. Tạo app/(app)/home/page.tsx (server component) — như spec.

2. Tạo components/home-client.tsx ('use client') — list situations + click → tạo session → /chat/{id}.

3. Tạo components/situation-card.tsx — như spec, thêm badge "Goal: {learning_goal_short}" nếu có.

4. Tạo app/(app)/chat/[id]/page.tsx (server component):
   - Auth check
   - Fetch session via api.getSession(id) — return { session, messages, persona_public, learning_goal }
   - Pass vào ChatClient

5. Tạo components/chat-client.tsx ('use client'):
   
   Props: sessionId, initialMessages, persona, learningGoal
   
   State:
   - messages: Message[]
   - input: string
   - isStreaming: boolean
   - streamingTokens: string (đang stream tới)
   - hints: CoachHint[]      # active hints (chưa dismissed, chưa expired)
   - isEnding: boolean
   
   UI Layout:
   - Top bar (sticky): emoji + persona.name + learning_goal badge + "Kết thúc" button
   - Main area chia 2 cột (desktop):
     * Cột trái 70%: messages
     * Cột phải 30%: hint panel (mobile: hint panel slide từ dưới)
   - Messages area:
     * Map messages → ChatMessage
     * Trong khi streaming: bubble cuối hiển thị streamingTokens (typing realtime)
     * Auto-scroll bottom
   - Hint panel:
     * Header "Coach gợi ý" + count badge
     * Map hints → CoachHintCard
     * Empty state: "Coach đang quan sát..."
   - Input bar (sticky bottom):
     * Textarea auto-resize
     * Send button
     * Enter to send, Shift+Enter newline
     * Disable khi isStreaming
   
   Effects:
   
   useEffect (mount): subscribe coach hint stream:
     const unsub = api.subscribeCoachHints(sessionId, (hint) => {
       setHints(prev => [...prev, hint])
       // Auto-expire sau 60s
       setTimeout(() => setHints(prev => prev.filter(h => h.id !== hint.id)), 60000)
     })
     return unsub
   
   useEffect (input change): heartbeat
     - Khi user đang gõ (input không empty hoặc focused), send heartbeat mỗi 3s với is_typing=true
     - Khi user idle (input empty + không focused 8s), không gửi heartbeat → backend detect silence
     - Dùng useDebounce
   
   handleSend:
   1. Add optimistic user message
   2. setIsStreaming(true), setStreamingTokens('')
   3. await api.sendMessageStream(sessionId, input, 
        onToken: (t) => setStreamingTokens(prev => prev + t),
        onDone: ({message_id, full_content}) => {
           setMessages(prev => [...prev, { id: message_id, sender: 'ai', content: full_content }])
           setStreamingTokens('')
           setIsStreaming(false)
        },
        onError: (err) => { rollback + toast })
   
   handleEnd:
   1. window.confirm
   2. setIsEnding(true)
   3. await api.endSession (return 202)
   4. router.push(`/feedback/${sessionId}`)
   
   handleDismissHint(hintId):
   - api.dismissHint(hintId)
   - setHints(prev => prev.filter(h => h.id !== hintId))

6. Tạo components/chat-message.tsx — bubble user/AI, whitespace-pre-wrap.

7. Tạo components/coach-hint-card.tsx:
   - Props: hint { id, trigger_type, hint_text, scaffolding_level }, onDismiss
   - Slide-in animation từ phải
   - Icon theo trigger_type:
     * silence: ⏱
     * closed_question: 💭
     * repeated_mistake: 🔁
     * thought_spiral: 🌀
     * off_track: 🎯
   - Card: small, border-l-4 border-amber-400, bg-amber-50, p-3 rounded
   - Hint text bold
   - X button top-right để dismiss
   - Auto-fade opacity sau 30s, hoàn toàn ẩn sau 60s

8. Test full flow:
   - Login → /home → 5 situations
   - Click → /chat/{id} → first message stream từng token
   - Type tin → enter → AI reply stream realtime
   - Đợi 10s không type → Coach hint slide từ phải
   - Gõ nhiều closed question → Coach hint trigger
   - Dismiss hint → biến mất
   - Mobile: hint slide từ dưới, không che input
   - End → /feedback/{id}

9. Git commit "Phase 9: Home + Chat + Coach hint UI realtime".
```

### Verify

1. Persona response stream từng token (không loading rồi xuất hiện cả block)
2. Coach hint xuất hiện khi silence 8-10s
3. Coach hint dismiss work
4. Heartbeat gửi đúng (verify Network tab)
5. 2 SSE streams song song không xung đột
6. Mobile responsive: hint không che input

### ✅ Done when
- Streaming chat smooth
- Coach hints xuất hiện đúng timing
- Heartbeat work, silence detection accurate
- Code committed

---

## PHASE 10: Frontend Feedback + Reflection (Claude Code, 4-5 giờ)

### Mục tiêu
Feedback page với 3 moments + rubric chart + entry vào Reflection.

### Mở Claude Code

```bash
cd frontend
claude
```

### Prompt

```
Đọc ../01_PROJECT_SPEC.md.

Phase 10: Build Feedback page (moments + rubric) + Reflection page (Socratic).

1. Tạo app/(app)/feedback/[id]/page.tsx (server component):
   - Auth check
   - Fetch via api.getFeedback(sessionId)
     * Nếu 404 (chưa generate xong) → render FeedbackProcessing component (poll mỗi 2s)
   - Fetch session info qua api.getSession(sessionId) cho stats
   - Pass props vào FeedbackContent

2. Tạo components/feedback-processing.tsx ('use client'):
   - useEffect poll api.getFeedback mỗi 2s
   - Khi có → router.refresh()
   - UI: spinner + "Đang phân tích cuộc hội thoại của bạn..." + animated dots
   - Timeout 30s → hiển thị "Mất nhiều thời gian hơn dự kiến, retry?"

3. Tạo components/feedback-content.tsx:
   
   Layout (max-w-3xl):
   
   Section 1 — Header:
   - "Phiên đã kết thúc!" + 🎉
   - Persona name + thời gian chat + số tin user
   
   Section 2 — Rubric scores (radar chart hoặc bar chart đơn giản):
   - 5 chiều: Clarity, Empathy, Openness, Goal Alignment, Emotional Regulation
   - Mỗi chiều bar 0-10, màu gradient theo score
   - Dùng recharts hoặc tự vẽ với CSS
   - Subtitle nhỏ giải thích từng chiều khi hover
   
   Section 3 — 3 Moment cards:
   
   Card 1 (Best, border-l-4 green-500, bg-green-50):
   - ✅ "Bạn đã làm tốt:" + transferable_skill
   - Quote box (italic, border-l-2 gray): "{quote}"
   - Analysis paragraph
   - Footer: "Áp dụng được ở: {situations gợi ý}"
   
   Card 2 (Missed, border-l-4 yellow-500, bg-yellow-50):
   - ⚠️ "Cơ hội bạn đã bỏ lỡ:"
   - Quote box: "{quote}"
   - Analysis paragraph
   - Subsection: "💡 Phiên bản hay hơn:" + better_version (italic)
   
   Card 3 (Most Important, border-l-4 red-500, bg-red-50):
   - 🎯 "Điểm quan trọng nhất cần cải thiện:"
   - Quote box: "{quote}"
   - Root cause paragraph
   - Better version
   - Drill suggestion (collapsible "Bài tập 5 phút")
   
   Section 4 — CTA buttons:
   - "Phản tư cùng AI" (primary) → /reflection/{sessionId}
   - "Practice nữa" (outline) → /home
   - "Xem lại chat" (ghost) → /chat/{sessionId} (read-only mode)

4. Tạo app/(app)/reflection/[sessionId]/page.tsx (server component):
   - Auth check
   - Verify feedback exists
   - Check reflections table: nếu có completed → redirect /feedback (không reflect lại)
   - Pass props vào ReflectionClient

5. Tạo components/reflection-client.tsx ('use client'):
   
   Props: sessionId, feedback (cho context display)
   
   State:
   - reflectionId: string | null
   - turns: { role, content }[]
   - input: string
   - isAgentThinking: boolean
   - phase: 'questioning' | 'suggesting_goals' | 'done'
   - suggestedGoals: { goal_text, rationale }[] | null
   - chosenGoal: string | null
   
   On mount: 
   - api.startReflection(sessionId) → set reflectionId, append first question vào turns, phase='questioning'
   
   UI:
   - Top: small recap card "Phản tư về phiên với {persona_name}"
   - Chat-like flow:
     * Map turns → bubble (agent left bg-purple-50, user right bg-blue-500)
     * Khi isAgentThinking: typing indicator
   - Nếu phase='questioning':
     * Textarea + Send button
     * Hint dưới textarea: "Suy nghĩ kỹ trước khi trả lời. Không có đáp án đúng/sai."
   - Nếu phase='suggesting_goals':
     * Hiển thị goals như cards radio:
       Card 1: goal_text + rationale + radio button
       Card 2: ...
       Card 3: ...
     * Option "Tự viết goal khác" + textarea
     * Button "Lưu goal này"
   - Nếu phase='done':
     * Confetti + "Goal đã lưu cho phiên kế!"
     * "{chosen_goal}" hiển thị to
     * Buttons: "Practice ngay" → /home, "Về dashboard" → /home
   
   handleSubmitTurn:
   1. Append user turn optimistic
   2. setIsAgentThinking(true)
   3. await api.submitReflectionTurn(reflectionId, input)
   4. Nếu response.phase='questioning': append agent turn, clear input
      Nếu response.phase='suggesting_goals': set suggestedGoals, set phase
   5. setIsAgentThinking(false)
   
   handleFinalize:
   1. await api.finalizeReflection(reflectionId, chosenGoal)
   2. setPhase('done')

6. Test full E2E flow mới:
   - Signup → home → click situation → chat 7 turns → end
   - Feedback page: rubric chart đẹp, 3 moments với quote thật
   - Click "Phản tư cùng AI" → /reflection
   - Trả lời 3-5 câu hỏi
   - Nhận 3 goals → pick 1 → finalize
   - Quay lại /home → start phiên mới → trong chat thấy goal mới ảnh hưởng coach (next session learning_goal đã update)

7. Git commit "Phase 10: Feedback + Reflection pages".
```

### Verify

1. Feedback page render đầy đủ rubric + 3 moments
2. Quote trong moment trùng với message thật trong chat replay
3. Reflection: agent KHÔNG dạy, chỉ hỏi
4. Goal save thành công
5. Phiên kế: coach reference goal mới (verify Phase 5 đọc next_session_goal)

### ✅ Done when
- 4 agents flow khép kín (Persona → Coach → Feedback → Reflection → Persona phiên kế)
- UI smooth không glitch
- Code committed

---

## PHASE 11: Polish + Deploy (Claude Code + Manual, 1-2 ngày)

### Mục tiêu
App polish, live trên internet với Redis production.

### Polish (Claude Code)

```bash
cd frontend
claude
```

```
Phase 11 polish. Yêu cầu:

1. Loading states (skeleton):
   - /home: skeleton khi fetching situations
   - /chat: skeleton khi loading session
   - /feedback: skeleton khi loading + FeedbackProcessing với poll
   - /reflection: skeleton khi loading

2. Error handling toasts (sonner):
   - SSE drop connection → toast + retry button
   - Coach stream lỗi → silently fallback (không spam user)
   - Heartbeat fail → giảm frequency, không alert

3. Empty states:
   - /home nếu chưa có situations: friendly message
   - Coach panel: "Coach đang quan sát..." khi chưa có hint

4. Mobile responsive:
   - Chat input không bị che bởi keyboard (env(safe-area-inset))
   - Coach hint slide từ dưới thay vì side panel
   - Reflection chat full screen mobile

5. Edge cases:
   - User quay lại /chat của session ended → redirect /feedback
   - User quay lại /feedback của session chưa end → redirect /chat
   - User quay lại /reflection đã hoàn thành → redirect /feedback
   - Network error: retry button trên các critical action
   - SSE reconnect tự động sau 3s với exponential backoff

6. Polish copy:
   - Vietnamese natural, không robot
   - Encouraging tone ở Feedback
   - Curious tone ở Reflection (không judgmental)

7. Accessibility:
   - aria-live="polite" cho coach hint panel
   - Keyboard nav cho goal selection
   - Focus management khi phase chuyển

8. Git commit "Phase 11 polish".
```

### Deploy Backend (Railway, manual)

1. https://railway.app → New Project → Deploy from GitHub
2. Select repo, choose backend/ as root directory
3. **Add Redis service**: New → Database → Redis (Railway free 500MB) — copy REDIS_URL
4. Add environment variables:
   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET
   - OPENAI_API_KEY, OPENAI_MODEL=gpt-4o, OPENAI_MODEL_COACH=gpt-4o-mini
   - REDIS_URL (paste từ Redis service)
   - COACH_ENABLED=true
   - COACH_SILENCE_THRESHOLD_SEC=8
   - SCAFFOLDING_DEFAULT_LEVEL=3
   - ALLOWED_ORIGINS=http://localhost:3000,https://YOUR_VERCEL_URL
5. Settings → set start command:
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1`
   
   Lưu ý: workers=1 vì Coach worker dùng asyncio in-process. Multi-worker cần Redis pub/sub đúng cách (mỗi worker subscribe riêng) — đã design đúng nhưng test kỹ trước khi tăng.
6. Generate domain → copy URL

### Deploy Frontend (Vercel, manual)

1. https://vercel.com → New Project → Import GitHub repo
2. Root directory: `frontend/`
3. Environment variables:
   - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_API_URL = Railway URL
4. **Vercel SSE config**: thêm `vercel.json`:
   ```json
   {
     "headers": [
       {
         "source": "/api/(.*)",
         "headers": [
           { "key": "X-Accel-Buffering", "value": "no" },
           { "key": "Cache-Control", "value": "no-cache" }
         ]
       }
     ]
   }
   ```
   (SSE phải bypass buffer)
5. Deploy

### Update CORS

Railway → Variables → update ALLOWED_ORIGINS thêm Vercel URL → Restart.

### Update Supabase Auth

Supabase → Authentication → URL Configuration:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: thêm `https://your-app.vercel.app/**`

### Final test

Mở Vercel URL → signup mới → flow full 4 agents → verify mọi thứ work.

### ✅ Done when
- App live trên Vercel URL
- 4 agents work production
- Redis pub/sub work cross worker (nếu multi-instance)
- SSE không bị proxy buffer

---

## What's Next After MVP

1. **Send to 5-10 friends** test thật
2. **Quan sát họ dùng** (Zoom share screen) — đặc biệt quan sát phản ứng với coach hints (có khó chịu không, có dismiss tất cả không)
3. **Đo metrics**:
   - % session có ≥1 hint shown
   - % hint shown được user act on (gửi tin tiếp khác trước khi nhận hint)
   - % session có completed reflection
   - Avg rubric score change qua các session của 1 user
4. **Iterate** based on feedback

KHÔNG add features mới ngay. Validate core 4-agents flow trước.

### Roadmap V2 ideas (sau khi validate)

- Voice input/output cho chat
- Coach học từ user dismiss patterns (ML để giảm false positive)
- Persona dynamic (mood thay đổi theo conversation length)
- Reflection group session (review nhiều session cùng lúc)
- Skill-based situation recommendation

---

## Common Issues & Fixes

### Backend

**"ImportError: cannot import langgraph"**
Install lại: `pip install langgraph langchain-openai sse-starlette`

**"Invalid JWT" backend**
- JWT_SECRET sai (không phải service_role!) → check Settings → JWT Settings
- audience phải là "authenticated" trong jwt.decode

**CORS errors**
- ALLOWED_ORIGINS thiếu URL frontend
- Restart backend sau khi đổi env

**LangGraph state mutation error**
- Không mutate state trong node
- Return DICT mới: `return {"ai_response": text}`

**OpenAI rate limit**
- gpt-4o tier 1 rate limit thấp
- Coach dùng gpt-4o-mini cho cheap calls
- Add retry logic với exponential backoff

**Supabase RLS deny query**
- Frontend query bị deny → use service_role ở backend
- Hoặc adjust RLS policy

### Streaming + Realtime (Phase 4-5-9)

**SSE bị buffer (token tới batch lớn)**
- Backend: dùng sse-starlette, đảm bảo `media_type="text/event-stream"` và flush sau mỗi yield
- Frontend (dev): không có vấn đề
- Production (Vercel/Railway): add header `X-Accel-Buffering: no` (xem Phase 11)
- Test bằng curl với `-N` (no buffer)

**Coach hint không xuất hiện**
- Verify Redis connection: `redis-cli ping` (production: dùng REDIS_URL trong Railway)
- Verify `COACH_ENABLED=true`
- Check `coaching_hints` table có row không (worker chạy nhưng publish fail?)
- Heartbeat endpoint có nhận signal không (verify Network tab frontend)

**Silence detection sai**
- Frontend phải gửi heartbeat khi user idle (input focused, empty)
- Threshold (8s) bắt đầu tính từ `last_user_message_ts`, không phải `last_heartbeat_ts` lần cuối
- Đọc kỹ logic detect_silence

**Quote trong feedback không match transcript**
- LLM hallucinate quote → validate_quote_in_transcript fail → retry
- Nếu retry 2 lần vẫn fail → log warning, fallback skip moment đó
- Chấp nhận đôi khi feedback chỉ có 2 moments thay vì 3 (better than fake quote)

**Reflection agent giảng (vi phạm hard rule)**
- Prompt template ép quá yếu
- Thêm few-shot examples vào prompt: "Đây là câu hỏi tốt: ..." vs "Đây là câu giảng (sai): ..."
- Validate output có dấu "?" cuối; nếu không có → retry

### Frontend

**Next.js hydration mismatch**
- Server/client component mismatch
- Check dynamic data (timestamps, isStreaming), dùng useEffect cho client-only logic

**SSE EventSource không reconnect**
- Browser auto-reconnect chỉ khi server gửi 200 + content-type đúng
- Nếu disconnect bất thường, tự reconnect với backoff trong useEffect cleanup

**Coach hint xếp chồng**
- Auto-expire 60s sau khi xuất hiện
- Filter dismissed hints ra khỏi state

**Heartbeat spam network**
- Debounce 3s
- Chỉ gửi khi tab visible (document.visibilityState)
- Pause khi isStreaming (không cần silence detect khi AI đang trả lời)

---

## Tips with Claude Code

### Claude Code workflow tốt
- Một phase = một session `claude`
- Đọc spec trước khi prompt
- Verify từng step thay vì tin blindly
- Git commit thường xuyên
- Phase 5 (Coach) phức tạp: chia 2 prompts (heuristics rồi worker), test riêng từng phần

### Khi Claude Code bí
- "Show me the file structure"
- "Explain what's happening"
- "Simplify this approach"
- "Run tests and tell me what's failing"

### Khi Claude Code làm sai
- "Revert that change"
- "Let me check git history"
- "Rollback to last commit"

### Tips riêng cho 4-agents architecture
- Test từng agent độc lập trước khi tích hợp (Persona standalone trước, Coach standalone trước)
- Mock LLM trong test heuristics để không tốn token
- Đo cost OpenAI sau mỗi phase: gpt-4o (Persona, Feedback) đắt; gpt-4o-mini (Coach) rẻ; nếu chi phí cao quá thì giảm temperature hoặc cache prompts
