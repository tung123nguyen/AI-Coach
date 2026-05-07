from typing import TypedDict, List, Dict
import json
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.config import settings


# === STATE ===
class FeedbackState(TypedDict):
    transcript: List[Dict]
    coach_logs: List[Dict]
    objectives: Dict
    feedback: Dict


# === COACH PROMPT ===
COACH_SYSTEM_PROMPT = """Bạn là Coach giao tiếp chuyên nghiệp. Đọc transcript + log các lần coach realtime can thiệp và đưa feedback tổng kết.

OUTPUT YÊU CẦU — CHÍNH XÁC JSON FORMAT NÀY (không có markdown, không có text khác):

{
  "good": {
    "title": "Bạn làm tốt",
    "content": "Tin số X: '[quote]' — vì sao tốt (1-2 câu)"
  },
  "improve": {
    "title": "Có thể cải thiện",
    "content": "Tin số X: '[quote]' — vì sao cần cải thiện (1-2 câu). Nếu coach đã can thiệp nhiều lần với cùng kiểu lỗi, nêu pattern đó.",
    "better_version": "Phiên bản hay hơn của tin đó (giữ ý nhưng nâng cấp diễn đạt)"
  },
  "tip": {
    "title": "Tip cho lần tới",
    "content": "1 tip cụ thể và áp dụng được (1-2 câu), ưu tiên giải quyết pattern lỗi nhiều nhất"
  }
}

QUY TẮC FEEDBACK:
- LUÔN reference tin cụ thể (Tin số X)
- LUÔN quote tin user thật khi nêu ví dụ
- ƯU TIÊN dùng coach_logs để xác định lỗi mắc nhiều nhất — đây là tín hiệu mạnh hơn tự đọc transcript
- Đối chiếu với objectives bài học để xem user đạt mức độ nào
- Tone: warm, encouraging, không preachy, không "fluffy"
- Tiếng Việt tự nhiên
- KHÔNG nói chung chung như "bạn cố gắng tự nhiên hơn"
- PHẢI cụ thể: số tin, từ ngữ, lý do

OUTPUT: JSON valid duy nhất, KHÔNG wrap markdown, KHÔNG có text trước/sau."""


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


def _format_transcript(transcript: List[Dict]) -> str:
    return "\n".join(
        f"Tin số {i+1} ({'AI' if m['sender'] == 'ai' else 'User'}): {m['content']}"
        for i, m in enumerate(transcript)
    )


def _format_coach_logs(coach_logs: List[Dict], transcript: List[Dict]) -> str:
    if not coach_logs:
        return "(Coach realtime không can thiệp lần nào — user giao tiếp ổn)"

    # Map message_id -> tin số (1-indexed) để Feedback agent reference đúng.
    id_to_index = {m.get("id"): i + 1 for i, m in enumerate(transcript) if m.get("id")}

    lines = []
    for log in coach_logs:
        idx = id_to_index.get(log.get("message_id"), "?")
        suggestions = log.get("suggestions") or []
        if isinstance(suggestions, str):
            try:
                suggestions = json.loads(suggestions)
            except Exception:
                suggestions = [suggestions]
        sugg_text = " | ".join(suggestions[:2]) if suggestions else "(none)"
        lines.append(
            f"- Tin số {idx} (severity {log.get('severity')}): {log.get('issue')} "
            f"| explanation: {log.get('explanation')} "
            f"| gợi ý: {sugg_text}"
        )
    return "\n".join(lines)


def _format_objectives(objectives: Dict) -> str:
    if not objectives:
        return "(không có)"
    return "\n".join(f"- {k}: {v}" for k, v in objectives.items())


# === COACH NODE ===
def coach_node(state: FeedbackState) -> Dict:
    transcript_text = _format_transcript(state["transcript"])
    coach_logs_text = _format_coach_logs(state["coach_logs"], state["transcript"])
    objectives_text = _format_objectives(state["objectives"])

    user_prompt = f"""Mục tiêu bài học của user:
{objectives_text}

Coach realtime đã can thiệp các lần sau:
{coach_logs_text}

Transcript đầy đủ:
{transcript_text}

Đưa feedback tổng kết theo JSON format đã yêu cầu."""

    llm = ChatOpenAI(
        model=settings.feedback_model,
        api_key=settings.openai_api_key,
        max_tokens=2000,
        temperature=0.5,
        model_kwargs={"response_format": {"type": "json_object"}},
    )

    try:
        response = llm.invoke([
            SystemMessage(content=COACH_SYSTEM_PROMPT),
            HumanMessage(content=user_prompt),
        ])
        parsed = json.loads(response.content)

        for key in ("good", "improve", "tip"):
            if key not in parsed:
                raise ValueError(f"Missing key: {key}")

        return {"feedback": parsed}
    except (json.JSONDecodeError, ValueError) as e:
        print(f"[feedback] parse error: {e}")
        return {"feedback": FALLBACK_FEEDBACK}


def build_feedback_graph():
    workflow = StateGraph(FeedbackState)
    workflow.add_node("coach", coach_node)
    workflow.set_entry_point("coach")
    workflow.add_edge("coach", END)
    return workflow.compile()


feedback_graph = build_feedback_graph()


# === PUBLIC INTERFACE ===
def generate_feedback(
    transcript: List[Dict],
    coach_logs: List[Dict] = None,
    objectives: Dict = None,
) -> Dict:
    """Generate feedback for a session.

    transcript: [{id, sender, content}, ...]
    coach_logs: [{message_id, severity, issue, suggestions, explanation}, ...]
    objectives: {primary, secondary, bonus} từ situation
    """
    initial_state: FeedbackState = {
        "transcript": transcript,
        "coach_logs": coach_logs or [],
        "objectives": objectives or {},
        "feedback": {},
    }
    final_state = feedback_graph.invoke(initial_state)
    return final_state["feedback"]
