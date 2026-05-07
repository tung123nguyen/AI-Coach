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
    image_situation: Optional[str] = None
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


class CoachCardOut(BaseModel):
    severity: int  # 2 | 3 (severity 1 không hiện)
    issue: str
    suggestions: List[str]
    explanation: str


class MessageOut(BaseModel):
    id: str
    sender: str  # 'user' | 'ai'
    content: str
    created_at: datetime
    coach_card: Optional[CoachCardOut] = None  # chỉ có ở user message


class SendMessageResponse(BaseModel):
    ai_message: str
    user_message_id: str
    coach_card: Optional[CoachCardOut] = None  # null nếu Coach không can thiệp


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
