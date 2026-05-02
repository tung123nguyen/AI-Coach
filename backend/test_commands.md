# Backend Test Commands

## 0. Start server

```bash
# Activate venv (Windows)
venv\Scripts\activate

# Run server
uvicorn app.main:app --reload --port 8000
```

Verify: http://localhost:8000/health → `{"status":"ok"}`
Swagger: http://localhost:8000/docs

---

## 1. Get JWT token

Cần anon key từ Supabase Dashboard → Settings → API → anon public.

```bash
curl -X POST "https://tixxyhzcnyiqvblpooyi.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"yourpassword"}'
```

Copy `access_token` từ response, dùng làm JWT_TOKEN bên dưới.

---

## 2. Test GET /api/situations

```bash
curl http://localhost:8000/api/situations \
  -H "Authorization: Bearer JWT_TOKEN"
```

Expected: Array 5 situations, sorted by difficulty.

---

## 3. Test POST /api/sessions

```bash
curl -X POST http://localhost:8000/api/sessions \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"situation_id": "SITUATION_ID_FROM_STEP_2"}'
```

Expected:
```json
{
  "session_id": "uuid...",
  "first_message": "Chào anh! Em là Hằng...",
  "persona": {...}
}
```

---

## 4. Test GET /api/sessions/{session_id}

```bash
curl http://localhost:8000/api/sessions/SESSION_ID \
  -H "Authorization: Bearer JWT_TOKEN"
```

Expected: `{ session, messages: [{sender: "ai", content: "..."}], persona }`

---

## 5. Verify in Supabase

- Table Editor → sessions: 1 row mới, status = "active"
- Table Editor → messages: 1 row, sender = "ai"

---

## Phase 4 commands (sau khi thêm messages endpoint)

```bash
# Send a message
curl -X POST http://localhost:8000/api/sessions/SESSION_ID/messages \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Ờ ừ, anh làm backend"}'

# End session + get feedback
curl -X POST http://localhost:8000/api/sessions/SESSION_ID/end \
  -H "Authorization: Bearer JWT_TOKEN"

# Get saved feedback
curl http://localhost:8000/api/sessions/SESSION_ID/feedback \
  -H "Authorization: Bearer JWT_TOKEN"
```
