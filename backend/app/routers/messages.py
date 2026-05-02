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
        raise HTTPException(status_code=404, detail="Session not found")
    session = session_result.data

    if session["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if session["status"] != "active":
        raise HTTPException(status_code=400, detail="Session ended")

    # Save user message
    sb.table("messages").insert({
        "session_id": session_id,
        "sender": "user",
        "content": request.content,
        "word_count": len(request.content.split())
    }).execute()

    # Get situation for persona + description
    sit_result = sb.table("situations").select("*").eq("id", session["situation_id"]).single().execute()
    situation = sit_result.data

    # Build history from DB (exclude the user message we just saved)
    msgs_result = sb.table("messages").select("*").eq("session_id", session_id).order("created_at").execute()
    all_msgs = msgs_result.data

    history = []
    for m in all_msgs[:-1]:  # exclude last (user msg just inserted)
        history.append({
            "role": "assistant" if m["sender"] == "ai" else "user",
            "content": m["content"]
        })

    # Run LangGraph chat
    try:
        ai_response = run_chat(
            persona=situation["persona_data"],
            history=history,
            user_message=request.content,
            situation_description=situation["description"]
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI error: {str(e)}")

    # Save AI message
    sb.table("messages").insert({
        "session_id": session_id,
        "sender": "ai",
        "content": ai_response,
        "word_count": len(ai_response.split())
    }).execute()

    return SendMessageResponse(ai_message=ai_response)
