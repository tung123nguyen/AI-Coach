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


@router.post("/sessions/{session_id}/end", response_model=FeedbackResponse)
async def end_session(
    session_id: str,
    user_id: str = Depends(get_current_user)
):
    sb = get_supabase()

    session_result = sb.table("sessions").select("*").eq("id", session_id).single().execute()
    if not session_result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    if session_result.data["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    sb.table("sessions").update({
        "status": "ended",
        "ended_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", session_id).execute()

    msgs_result = (
        sb.table("messages")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )
    transcript = [{"sender": m["sender"], "content": m["content"]} for m in msgs_result.data]

    try:
        feedback_dict = generate_feedback(transcript)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Feedback generation failed: {str(e)}")

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
        raise HTTPException(status_code=403, detail="Forbidden")

    fb_result = sb.table("feedbacks").select("*").eq("session_id", session_id).single().execute()
    if not fb_result.data:
        raise HTTPException(status_code=404, detail="Feedback not found")
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
