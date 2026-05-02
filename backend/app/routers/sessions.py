from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_current_user
from app.db import get_supabase
from app.schemas import (
    CreateSessionRequest, SessionCreatedOut,
    SessionFullOut, SessionDetailOut, MessageOut,
    FeedbackResponse, FeedbackOut, FeedbackCard
)
from datetime import datetime, timezone

router = APIRouter()


@router.post("/sessions", response_model=SessionCreatedOut)
async def create_session(
    request: CreateSessionRequest,
    user_id: str = Depends(get_current_user)
):
    sb = get_supabase()

    sit_result = sb.table("situations").select("*").eq("id", request.situation_id).single().execute()
    if not sit_result.data:
        raise HTTPException(status_code=404, detail="Situation not found")
    situation = sit_result.data

    session_result = sb.table("sessions").insert({
        "user_id": user_id,
        "situation_id": request.situation_id,
        "status": "active"
    }).execute()
    session = session_result.data[0]

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
        raise HTTPException(status_code=404, detail="Session not found")
    session = session_result.data

    if session["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    msgs_result = (
        sb.table("messages")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )
    sit_result = (
        sb.table("situations")
        .select("persona_data")
        .eq("id", session["situation_id"])
        .single()
        .execute()
    )

    return SessionFullOut(
        session=SessionDetailOut(**session),
        messages=[MessageOut(**m) for m in msgs_result.data],
        persona=sit_result.data["persona_data"]
    )
