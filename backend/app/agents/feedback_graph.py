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

OUTPUT YÊU CẦU — CHÍNH XÁC JSON FORMAT NÀY (không có markdown, không có text khác):

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

QUY TẮC FEEDBACK:
- LUÔN reference tin cụ thể (Tin số X)
- LUÔN quote tin user thật khi nêu ví dụ
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
