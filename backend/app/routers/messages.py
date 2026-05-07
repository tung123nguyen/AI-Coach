import asyncio
import json
from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_current_user
from app.db import get_supabase
from app.schemas import SendMessageRequest, SendMessageResponse, CoachCardOut
from app.agents.chat_graph import run_chat
from app.agents.coach_graph import run_coach, should_show_card

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
        raise HTTPException(status_code=404, detail="Session not found")
    session = session_result.data

    if session["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if session["status"] != "active":
        raise HTTPException(status_code=400, detail="Session ended")

    # Save user message first — Coach và Role-play đều cần message_id để link.
    user_msg_insert = sb.table("messages").insert({
        "session_id": session_id,
        "sender": "user",
        "content": request.content,
        "word_count": len(request.content.split()),
    }).execute()
    user_message_id = user_msg_insert.data[0]["id"]

    # Lấy situation 1 lần (persona + objectives + description).
    sit_result = sb.table("situations").select("*").eq("id", session["situation_id"]).single().execute()
    situation = sit_result.data

    # History: tất cả message TRƯỚC tin user vừa lưu.
    msgs_result = (
        sb.table("messages")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )
    history = [
        {
            "role": "assistant" if m["sender"] == "ai" else "user",
            "content": m["content"],
        }
        for m in msgs_result.data
        if m["id"] != user_message_id
    ]

    persona = situation["persona_data"]
    objectives = situation.get("objectives") or {}

    # CHẠY SONG SONG: Role-play + Coach quan sát độc lập, không chia sẻ context runtime.
    # return_exceptions=True để 1 agent fail không kéo cái còn lại chết.
    role_play_task = run_chat(
        persona=persona,
        history=history,
        user_message=request.content,
        situation_description=situation["description"],
    )
    coach_task = run_coach(
        history=history,
        user_message=request.content,
        objectives=objectives,
        situation_description=situation["description"],
        persona_name=persona.get("name", ""),
    )

    ai_response, coach_result = await asyncio.gather(
        role_play_task, coach_task, return_exceptions=True
    )

    # Role-play lỗi = lỗi chính, không thể tiếp tục.
    if isinstance(ai_response, Exception):
        raise HTTPException(status_code=503, detail=f"AI error: {ai_response}")

    # Coach lỗi = bỏ qua card, vẫn trả lời user.
    if isinstance(coach_result, Exception):
        print(f"[messages] coach failed: {coach_result}")
        coach_result = None

    # Lưu AI message.
    sb.table("messages").insert({
        "session_id": session_id,
        "sender": "ai",
        "content": ai_response,
        "word_count": len(ai_response.split()),
    }).execute()

    # Lưu coach_log + build response card nếu severity đủ ngưỡng.
    coach_card_out = None
    if coach_result and should_show_card(coach_result):
        try:
            sb.table("coach_logs").insert({
                "session_id": session_id,
                "message_id": user_message_id,
                "severity": int(coach_result["severity"]),
                "issue": coach_result["issue"],
                "suggestions": coach_result["suggestions"],
                "explanation": coach_result["explanation"],
            }).execute()
        except Exception as e:
            # Insert lỗi không phá flow — chỉ mất log, user vẫn nhận card.
            print(f"[messages] coach_log insert failed: {e}")

        coach_card_out = CoachCardOut(
            severity=int(coach_result["severity"]),
            issue=coach_result["issue"],
            suggestions=coach_result["suggestions"],
            explanation=coach_result["explanation"],
        )

    return SendMessageResponse(
        ai_message=ai_response,
        user_message_id=user_message_id,
        coach_card=coach_card_out,
    )
