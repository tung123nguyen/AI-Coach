# Code Templates — Reference

File này chứa code SNIPPETS cho các phần phức tạp. Claude Code sẽ đọc file này khi bạn reference trong prompt.

Đặc biệt quan trọng: LangGraph (mới với bạn) và auth flow (dễ sai).

## 1. backend/app/config.py

```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    supabase_jwt_secret: str
    
    openai_api_key: str
    openai_model: str = "gpt-4o"
    
    port: int = 8000
    allowed_origins: str = "http://localhost:3000"
    
    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## 2. backend/app/db.py

```python
from supabase import create_client, Client
from app.config import settings

def get_supabase() -> Client:
    """Returns Supabase client with service_role key (bypass RLS for backend)."""
    return create_client(
        settings.supabase_url,
        settings.supabase_service_role_key
    )
```

## 3. backend/app/auth.py

```python
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.config import settings

security = HTTPBearer()

def verify_jwt(token: str) -> str:
    """Verify Supabase JWT and return user_id (sub claim)."""
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated"
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing sub")
        return user_id
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """FastAPI dependency to get current user_id from JWT."""
    return verify_jwt(credentials.credentials)
```

## 4. backend/app/main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import situations, sessions, messages

app = FastAPI(
    title="Conversation Gym API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

app.include_router(situations.router, prefix="/api", tags=["situations"])
app.include_router(sessions.router, prefix="/api", tags=["sessions"])
app.include_router(messages.router, prefix="/api", tags=["messages"])
```

## 5. backend/app/schemas.py

```python
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# === Situations ===
class SituationOut(BaseModel):
    id: str
    name: str
    description: str
    difficulty: int
    category: str
    emoji: str
    persona_data: Dict[str, Any]
    opening_line: str
    objectives: Optional[Dict[str, Any]] = None

# === Sessions ===
class CreateSessionRequest(BaseModel):
    situation_id: str

class SessionCreatedOut(BaseModel):
    session_id: str
    first_message: str
    persona: Dict[str, Any]

class SessionDetailOut(BaseModel):
    id: str
    status: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    situation_id: str

# === Messages ===
class SendMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=500)

class MessageOut(BaseModel):
    id: str
    sender: str  # 'user' | 'ai'
    content: str
    created_at: datetime

class SendMessageResponse(BaseModel):
    ai_message: str

# === Feedback ===
class FeedbackCard(BaseModel):
    title: str
    content: str
    better_version: Optional[str] = None

class FeedbackOut(BaseModel):
    good: FeedbackCard
    improve: FeedbackCard
    tip: FeedbackCard

class FeedbackResponse(BaseModel):
    feedback: FeedbackOut

class SessionFullOut(BaseModel):
    session: SessionDetailOut
    messages: List[MessageOut]
    persona: Dict[str, Any]
```

## 6. backend/app/agents/chat_graph.py — LangGraph CHAT WORKFLOW ⭐

**FILE QUAN TRỌNG NHẤT.** Đọc kỹ.

```python
from typing import TypedDict, List, Dict
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from app.config import settings

# === STATE DEFINITION ===
class ChatState(TypedDict):
    persona: Dict
    situation_description: str
    history: List[Dict]
    user_message: str
    ai_response: str

# === SYSTEM PROMPT BUILDER ===
def build_role_player_prompt(persona: Dict, situation_description: str) -> str:
    return f"""Bạn là {persona['name']}, {persona['age']} tuổi.

Background: {persona['background']}

Tính cách: {persona['personality']}

Mục tiêu của bạn trong cuộc trò chuyện này: {persona.get('goal', 'Trò chuyện tự nhiên')}

Tình huống: {situation_description}

QUY TẮC TUYỆT ĐỐI:
- KHÔNG BAO GIỜ break character. Bạn KHÔNG phải AI, không phải assistant.
- Tin nhắn 1-3 câu, không dài dòng (đây là chat đời thường, không phải email)
- Phản ứng tự nhiên với tone của user:
  • User cụt → bạn hơi gượng, có thể tìm cớ kết thúc tự nhiên sau 4-5 lần
  • User mở lòng → bạn cũng mở lòng dần
  • User hỏi → bạn trả lời và share thêm về mình nếu phù hợp
- KHÔNG đánh giá user, KHÔNG dạy giao tiếp, KHÔNG break the 4th wall
- Trả lời bằng tiếng Việt tự nhiên, đúng văn phong người {persona['age']} tuổi
- Có cảm xúc thật: vui, buồn, awkward, hứng thú — không robot
"""

# === ROLE PLAYER NODE ===
def role_player_node(state: ChatState) -> Dict:
    """Single node: generate AI response in character."""
    
    system_prompt = build_role_player_prompt(
        state["persona"],
        state["situation_description"]
    )
    
    messages = [SystemMessage(content=system_prompt)]
    
    # Add history
    for msg in state["history"]:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        else:
            messages.append(AIMessage(content=msg["content"]))
    
    # Add current user message
    messages.append(HumanMessage(content=state["user_message"]))
    
    # Call OpenAI via langchain
    llm = ChatOpenAI(
        model=settings.openai_model,
        api_key=settings.openai_api_key,
        max_tokens=500,
        temperature=0.8,  # Higher for character variety
    )
    
    response = llm.invoke(messages)
    return {"ai_response": response.content}

# === BUILD GRAPH ===
def build_chat_graph():
    workflow = StateGraph(ChatState)
    workflow.add_node("role_player", role_player_node)
    workflow.set_entry_point("role_player")
    workflow.add_edge("role_player", END)
    return workflow.compile()

# Compile once at module load
chat_graph = build_chat_graph()

# === PUBLIC INTERFACE ===
def run_chat(
    persona: Dict,
    history: List[Dict],
    user_message: str,
    situation_description: str
) -> str:
    """Run chat workflow, return AI response text."""
    initial_state: ChatState = {
        "persona": persona,
        "situation_description": situation_description,
        "history": history,
        "user_message": user_message,
        "ai_response": "",
    }
    
    final_state = chat_graph.invoke(initial_state)
    return final_state["ai_response"]
```

## 7. backend/app/agents/feedback_graph.py — LangGraph FEEDBACK ⭐

```python
from typing import TypedDict, List, Dict
import json
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.config import settings

# === STATE ===
class FeedbackState(TypedDict):
    transcript: List[Dict]
    feedback: Dict

# === COACH PROMPT ===
COACH_SYSTEM_PROMPT = """Bạn là Coach giao tiếp chuyên nghiệp. Đọc transcript và đưa feedback có giáo dục cho user.

OUTPUT YÊU CẦU — CHÍNH XÁC JSON FORMAT NÀY:

{
  "good": {
    "title": "Bạn làm tốt",
    "content": "Tin số X: '[quote]' — vì sao tốt (1-2 câu)"
  },
  "improve": {
    "title": "Có thể cải thiện",
    "content": "Tin số X: '[quote]' — vì sao cần cải thiện (1-2 câu)",
    "better_version": "Phiên bản hay hơn của tin đó (giữ ý nhưng nâng cấp diễn đạt)"
  },
  "tip": {
    "title": "Tip cho lần tới",
    "content": "1 tip cụ thể và áp dụng được (1-2 câu)"
  }
}

QUY TẮC:
- LUÔN reference tin cụ thể (Tin số X)
- LUÔN quote tin user thật khi nêu ví dụ
- Tone: warm, encouraging, không preachy, không "fluffy"
- Tiếng Việt tự nhiên
- KHÔNG nói chung chung như "bạn cố gắng tự nhiên hơn"
- PHẢI cụ thể: số tin, từ ngữ, lý do

Output JSON valid duy nhất."""

# === FALLBACK ===
FALLBACK_FEEDBACK = {
    "good": {
        "title": "Bạn làm tốt",
        "content": "Bạn đã hoàn thành cuộc trò chuyện. Đó là bước đầu quan trọng."
    },
    "improve": {
        "title": "Có thể cải thiện",
        "content": "Hãy thử trả lời dài hơn ở lần tới, thêm chi tiết hoặc câu hỏi.",
        "better_version": ""
    },
    "tip": {
        "title": "Tip cho lần tới",
        "content": "Practice mỗi ngày 5 phút để tiến bộ tự nhiên."
    }
}

# === COACH NODE ===
def coach_node(state: FeedbackState) -> Dict:
    """Generate feedback from transcript."""
    
    formatted_transcript = "\n".join([
        f"Tin số {i+1} ({'AI' if m['sender'] == 'ai' else 'User'}): {m['content']}"
        for i, m in enumerate(state["transcript"])
    ])
    
    user_prompt = f"Phân tích transcript này và đưa feedback:\n\n{formatted_transcript}"
    
    llm = ChatOpenAI(
        model=settings.openai_model,
        api_key=settings.openai_api_key,
        max_tokens=2000,
        temperature=0.5,
        model_kwargs={"response_format": {"type": "json_object"}},
    )
    
    messages = [
        SystemMessage(content=COACH_SYSTEM_PROMPT),
        HumanMessage(content=user_prompt)
    ]
    
    try:
        response = llm.invoke(messages)
        parsed = json.loads(response.content)
        
        # Validate
        for key in ["good", "improve", "tip"]:
            if key not in parsed:
                raise ValueError(f"Missing key: {key}")
        
        return {"feedback": parsed}
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Coach parse error: {e}")
        return {"feedback": FALLBACK_FEEDBACK}

# === BUILD GRAPH ===
def build_feedback_graph():
    workflow = StateGraph(FeedbackState)
    workflow.add_node("coach", coach_node)
    workflow.set_entry_point("coach")
    workflow.add_edge("coach", END)
    return workflow.compile()

feedback_graph = build_feedback_graph()

# === PUBLIC INTERFACE ===
def generate_feedback(transcript: List[Dict]) -> Dict:
    """Generate feedback for a session."""
    initial_state: FeedbackState = {
        "transcript": transcript,
        "feedback": {},
    }
    
    final_state = feedback_graph.invoke(initial_state)
    return final_state["feedback"]
```

## 8. backend/app/routers/sessions.py

```python
from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_current_user
from app.db import get_supabase
from app.schemas import (
    CreateSessionRequest, SessionCreatedOut,
    SessionFullOut, SessionDetailOut, MessageOut,
    FeedbackResponse, FeedbackOut, FeedbackCard
)
from app.agents.feedback_graph import generate_feedback
from datetime import datetime, timezone

router = APIRouter()

@router.post("/sessions", response_model=SessionCreatedOut)
async def create_session(
    request: CreateSessionRequest,
    user_id: str = Depends(get_current_user)
):
    sb = get_supabase()
    
    # Get situation
    sit_result = sb.table("situations").select("*").eq("id", request.situation_id).single().execute()
    if not sit_result.data:
        raise HTTPException(404, "Situation not found")
    situation = sit_result.data
    
    # Create session
    session_result = sb.table("sessions").insert({
        "user_id": user_id,
        "situation_id": request.situation_id,
        "status": "active"
    }).execute()
    session = session_result.data[0]
    
    # Insert opening message
    opening = situation["opening_line"]
    sb.table("messages").insert({
        "session_id": session["id"],
        "sender": "ai",
        "content": opening,
        "word_count": len(opening.split())
    }).execute()
    
    return SessionCreatedOut(
        session_id=session["id"],
        first_message=opening,
        persona=situation["persona_data"]
    )

@router.get("/sessions/{session_id}", response_model=SessionFullOut)
async def get_session(
    session_id: str,
    user_id: str = Depends(get_current_user)
):
    sb = get_supabase()
    
    session_result = sb.table("sessions").select("*").eq("id", session_id).single().execute()
    if not session_result.data:
        raise HTTPException(404, "Session not found")
    session = session_result.data
    
    if session["user_id"] != user_id:
        raise HTTPException(403, "Forbidden")
    
    msgs_result = sb.table("messages").select("*").eq("session_id", session_id).order("created_at").execute()
    sit_result = sb.table("situations").select("persona_data").eq("id", session["situation_id"]).single().execute()
    
    return SessionFullOut(
        session=SessionDetailOut(**session),
        messages=[MessageOut(**m) for m in msgs_result.data],
        persona=sit_result.data["persona_data"]
    )

@router.post("/sessions/{session_id}/end", response_model=FeedbackResponse)
async def end_session(
    session_id: str,
    user_id: str = Depends(get_current_user)
):
    sb = get_supabase()
    
    session_result = sb.table("sessions").select("*").eq("id", session_id).single().execute()
    if not session_result.data:
        raise HTTPException(404, "Session not found")
    if session_result.data["user_id"] != user_id:
        raise HTTPException(403, "Forbidden")
    
    # Update status
    sb.table("sessions").update({
        "status": "ended",
        "ended_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", session_id).execute()
    
    # Get all messages
    msgs_result = sb.table("messages").select("*").eq("session_id", session_id).order("created_at").execute()
    transcript = [{"sender": m["sender"], "content": m["content"]} for m in msgs_result.data]
    
    # Generate feedback
    try:
        feedback_dict = generate_feedback(transcript)
    except Exception as e:
        raise HTTPException(503, f"Feedback generation failed: {str(e)}")
    
    # Save
    sb.table("feedbacks").insert({
        "session_id": session_id,
        "good_text": feedback_dict["good"]["content"],
        "improve_text": feedback_dict["improve"]["content"],
        "improve_better_version": feedback_dict["improve"].get("better_version", ""),
        "tip_text": feedback_dict["tip"]["content"]
    }).execute()
    
    return FeedbackResponse(
        feedback=FeedbackOut(
            good=FeedbackCard(**feedback_dict["good"]),
            improve=FeedbackCard(**feedback_dict["improve"]),
            tip=FeedbackCard(**feedback_dict["tip"])
        )
    )

@router.get("/sessions/{session_id}/feedback", response_model=FeedbackResponse)
async def get_feedback(
    session_id: str,
    user_id: str = Depends(get_current_user)
):
    sb = get_supabase()
    
    session_result = sb.table("sessions").select("user_id").eq("id", session_id).single().execute()
    if not session_result.data or session_result.data["user_id"] != user_id:
        raise HTTPException(403, "Forbidden")
    
    fb_result = sb.table("feedbacks").select("*").eq("session_id", session_id).single().execute()
    if not fb_result.data:
        raise HTTPException(404, "Feedback not found")
    fb = fb_result.data
    
    return FeedbackResponse(
        feedback=FeedbackOut(
            good=FeedbackCard(title="Bạn làm tốt", content=fb["good_text"]),
            improve=FeedbackCard(
                title="Có thể cải thiện",
                content=fb["improve_text"],
                better_version=fb["improve_better_version"] or None
            ),
            tip=FeedbackCard(title="Tip cho lần tới", content=fb["tip_text"])
        )
    )
```

## 9. backend/app/routers/messages.py

```python
from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_current_user
from app.db import get_supabase
from app.schemas import SendMessageRequest, SendMessageResponse
from app.agents.chat_graph import run_chat

router = APIRouter()

@router.post("/sessions/{session_id}/messages", response_model=SendMessageResponse)
async def send_message(
    session_id: str,
    request: SendMessageRequest,
    user_id: str = Depends(get_current_user)
):
    sb = get_supabase()
    
    session_result = sb.table("sessions").select("*").eq("id", session_id).single().execute()
    if not session_result.data:
        raise HTTPException(404, "Session not found")
    session = session_result.data
    
    if session["user_id"] != user_id:
        raise HTTPException(403, "Forbidden")
    if session["status"] != "active":
        raise HTTPException(400, "Session ended")
    
    # Save user message
    sb.table("messages").insert({
        "session_id": session_id,
        "sender": "user",
        "content": request.content,
        "word_count": len(request.content.split())
    }).execute()
    
    # Get situation
    sit_result = sb.table("situations").select("*").eq("id", session["situation_id"]).single().execute()
    situation = sit_result.data
    
    # Get all messages, build history (exclude last user message)
    msgs_result = sb.table("messages").select("*").eq("session_id", session_id).order("created_at").execute()
    all_msgs = msgs_result.data
    
    history = []
    for m in all_msgs[:-1]:  # exclude the user message we just added
        history.append({
            "role": "assistant" if m["sender"] == "ai" else "user",
            "content": m["content"]
        })
    
    # Run chat graph
    try:
        ai_response = run_chat(
            persona=situation["persona_data"],
            history=history,
            user_message=request.content,
            situation_description=situation["description"]
        )
    except Exception as e:
        raise HTTPException(503, f"AI error: {str(e)}")
    
    # Save AI message
    sb.table("messages").insert({
        "session_id": session_id,
        "sender": "ai",
        "content": ai_response,
        "word_count": len(ai_response.split())
    }).execute()
    
    return SendMessageResponse(ai_message=ai_response)
```

## 10. backend/app/routers/situations.py

```python
from fastapi import APIRouter, Depends
from typing import List
from app.auth import get_current_user
from app.db import get_supabase
from app.schemas import SituationOut

router = APIRouter()

@router.get("/situations", response_model=List[SituationOut])
async def list_situations(user_id: str = Depends(get_current_user)):
    sb = get_supabase()
    result = sb.table("situations").select("*").order("difficulty").order("name").execute()
    return [SituationOut(**s) for s in result.data]
```

## 11. frontend/lib/api.ts

```typescript
import { createClient } from '@/lib/supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  }
}

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'API error' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  return response.json()
}

export const api = {
  getSituations: () => apiFetch('/api/situations'),
  
  createSession: (situation_id: string) =>
    apiFetch('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ situation_id })
    }),
  
  getSession: (id: string) => apiFetch(`/api/sessions/${id}`),
  
  sendMessage: (session_id: string, content: string) =>
    apiFetch(`/api/sessions/${session_id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),
  
  endSession: (session_id: string) =>
    apiFetch(`/api/sessions/${session_id}/end`, { method: 'POST' }),
  
  getFeedback: (session_id: string) =>
    apiFetch(`/api/sessions/${session_id}/feedback`)
}
```

## 12. frontend/lib/supabase/client.ts

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

## 13. frontend/lib/supabase/server.ts

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component, ignore
          }
        }
      }
    }
  )
}
```

## 14. frontend/middleware.ts

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        }
      }
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Protected routes
  const protectedPaths = ['/home', '/chat', '/feedback']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))
  
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
```

## 15. frontend/lib/types.ts

```typescript
export type Persona = {
  name: string
  age: number
  background: string
  personality: string
  goal?: string
}

export type Situation = {
  id: string
  name: string
  description: string
  difficulty: number
  category: string
  emoji: string
  persona_data: Persona
  opening_line: string
  objectives?: Record<string, string>
}

export type Message = {
  id: string
  sender: 'user' | 'ai'
  content: string
  created_at: string
}

export type Session = {
  id: string
  status: 'active' | 'ended'
  started_at: string
  ended_at?: string
  situation_id: string
}

export type FeedbackCard = {
  title: string
  content: string
  better_version?: string
}

export type Feedback = {
  good: FeedbackCard
  improve: FeedbackCard
  tip: FeedbackCard
}
```

## Critical Pitfalls

### LangGraph state mutation
LangGraph cần immutable state updates trong nodes:
- ❌ `state["ai_response"] = response` 
- ✅ `return {"ai_response": response}`

### Supabase JWT verification
- `audience="authenticated"` BẮT BUỘC trong jwt.decode
- JWT secret từ Settings → JWT Settings (KHÔNG phải service_role)
- Algorithm: HS256

### CORS
- ALLOWED_ORIGINS phải match đúng URL frontend
- Cả localhost:3000 (dev) và Vercel URL (prod) trong list
- Restart backend sau khi đổi env

### OpenAI structured output
- `response_format: {"type": "json_object"}` chỉ work với gpt-4o
- Vẫn cần system prompt yêu cầu JSON
- Always wrap parse trong try/except với fallback

### Next.js 15 async cookies
- `cookies()` giờ là async: `await cookies()`
- Tương tự `params`: `await params` trong route handlers
