# Quickstart — Conversation Gym với Claude Code

## Trước khi bắt đầu (1 giờ chuẩn bị)

### Tài khoản cần
- [ ] GitHub: https://github.com (free)
- [ ] Supabase: https://supabase.com (free)
- [ ] Vercel: https://vercel.com (free, link với GitHub)
- [ ] Railway: https://railway.app (cho backend, $5 free credit)
- [ ] OpenAI API key: bạn đã có

### Tools máy
- [ ] Node.js v20+: https://nodejs.org
- [ ] Python 3.11+: https://python.org
- [ ] Git: https://git-scm.com
- [ ] **Claude Code**: https://claude.com/claude-code

Verify trong terminal:
```bash
node --version    # >= 20
python --version  # >= 3.11
git --version
claude --version  # Claude Code installed
```

## Cách Claude Code hoạt động (khác Cursor)

**Cursor**: AI chat trong IDE, bạn chỉnh sửa file thủ công  
**Claude Code**: AI chạy trong terminal, **tự đọc/sửa nhiều file**, tự chạy lệnh, tự test.

Workflow điển hình với Claude Code:

```bash
cd your-project
claude
```

Claude Code mở interactive session. Bạn nói gì → Claude đọc files, hiểu context, sửa code, chạy tests, commit.

**Khác biệt quan trọng**:
- Claude Code có thể **read/write nhiều files** trong 1 lệnh
- Claude Code **tự chạy bash commands** (npm install, uvicorn, etc.)
- Bạn dẫn dắt theo **phase**, không phải từng dòng code

→ Vibecode với Claude Code = nói **WHAT** bạn muốn build, Claude lo **HOW**.

## Nguyên tắc làm việc với Claude Code

### 1. Bắt đầu mỗi session với context
Khi mở `claude` lần đầu trong project, paste:
```
Tôi đang build Conversation Gym. Project context ở 01_PROJECT_SPEC.md.
Hiện đang ở Phase {N}. Đọc 02_VIBECODE_ROADMAP.md cho roadmap.
```
Claude Code sẽ tự đọc các file đó.

### 2. Một phase một session
Mỗi phase mới → mở session mới. Đừng làm 5 phase trong 1 session — context dài quá.

### 3. Verify từng bước
Sau mỗi major task, **bạn thử chạy** thay vì tin Claude. Claude sẽ test tự động nhưng bạn nên verify visually.

### 4. Commit thường xuyên
Yêu cầu Claude Code commit sau mỗi feature work. Để dễ rollback.

### 5. Đọc trước khi accept
Claude Code show diff trước khi save. Đọc qua, đặc biệt logic phức tạp.

## Roadmap 9 Phases

| Phase | Mục tiêu | Thời gian |
|-------|----------|-----------|
| 0 | Setup monorepo + git | 1-2h |
| 1 | Setup Supabase (DB + Auth) | 1-2h |
| 2 | Backend foundation (FastAPI skeleton) | 3-4h |
| 3 | Backend: Situations + Sessions endpoints | 3-4h |
| 4 | LangGraph Chat + Messages endpoint ⭐ | 4-5h |
| 5 | LangGraph Feedback + End endpoint ⭐ | 3-4h |
| 6 | Frontend setup + Landing + Auth | 4-5h |
| 7 | Frontend Home + Chat | 5-6h |
| 8 | Frontend Feedback page | 2-3h |
| 9 | Polish + Deploy | 1-2 ngày |

**Total**: 9-12 ngày realistic, 7-8 ngày nếu trôi chảy.

## Day 1 hôm nay

### Sáng (2-3h): Phase 0 + Phase 1

**Phase 0** — Setup repo (làm thủ công, không cần Claude Code):

```bash
mkdir conversation-gym && cd conversation-gym
git init
mkdir frontend backend
cat > .gitignore <<EOF
node_modules/
.next/
.env
.env.local
__pycache__/
*.pyc
.venv/
venv/
.DS_Store
EOF
git add . && git commit -m "Init monorepo"
```

Tạo GitHub repo, push.

**Phase 1** — Setup Supabase (làm thủ công trong dashboard):

1. https://supabase.com → New project
2. Region Singapore, password mạnh
3. Lấy 4 keys: URL, anon, service_role, JWT secret (Settings → API + JWT Settings)
4. SQL Editor → paste schema từ `01_PROJECT_SPEC.md` (section Database Schema)
5. SQL Editor → paste seed data từ spec (5 situations)
6. Verify Table Editor có 5 tables, 5 situations

→ Copy 5 file MD trong kit này vào `conversation-gym/` để Claude Code đọc được.

### Chiều (2-3h): Phase 2 (bắt đầu dùng Claude Code)

Trong terminal:
```bash
cd conversation-gym/backend
claude
```

Trong Claude Code session, paste prompt từ `02_VIBECODE_ROADMAP.md` Phase 2.

Claude Code sẽ:
- Tạo Python venv
- Install dependencies
- Create file structure
- Setup FastAPI app
- Test chạy được

Bạn verify ở localhost:8000/health.

### ✅ Cuối Day 1

- Repo có structure
- Supabase ready với data
- FastAPI chạy được
- 4 file MD trong project

## Rules để không bỏ cuộc

1. **Stuck >30 phút** → ask Claude Code "explain what's happening, simplify"
2. **Overwhelmed** → close laptop, đi 10 phút, quay lại làm 1 tiny step
3. **Code không chạy** → `git checkout` về commit trước, vibe lại
4. **Mất focus** → 1 ngày làm 1 phase, không cố push
5. **Nghi ngờ** → trust the roadmap, đừng redesign

## KHÔNG được làm

- ❌ Add features ngoài 9 phases
- ❌ "Redesign" giữa phase  
- ❌ Skip phase
- ❌ Đổi stack giữa chừng
- ❌ Over-optimize (caching, rate limit) — phase 9+

## Files trong kit

- **00_QUICKSTART.md** — file này, đọc đầu tiên
- **01_PROJECT_SPEC.md** — full spec (DB, API, agents) — Claude Code đọc nhiều
- **02_VIBECODE_ROADMAP.md** — 9 phases với prompts cho Claude Code
- **03_CODE_TEMPLATES.md** — code reference cho LangGraph + auth (phòng khi cần)
- **04_CLAUDE_CODE_TIPS.md** — workflow tips cho Claude Code

## Mindset

Bạn không cần biết hết mọi thứ. Claude Code biết. Việc của bạn:
1. Hiểu **mục tiêu** mỗi phase
2. Verify **kết quả** đúng yêu cầu
3. Học khi gặp **lỗi cụ thể**

6 tháng trước bạn không biết AI Engineering. Giờ biết. 6 tuần nữa bạn sẽ biết FastAPI + LangGraph + Next.js. Trust the process.

Bắt đầu thôi.
