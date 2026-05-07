from typing import TypedDict, List, Dict, Optional
import json
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.config import settings


# Severity threshold — Coach card chỉ hiện khi >= ngưỡng này.
# 1 = lỗi nhỏ (bỏ qua), 2 = đáng lưu ý, 3 = nghiêm trọng.
COACH_MIN_SEVERITY = 2


class CoachState(TypedDict):
    history: List[Dict]            # [{role, content}] — toàn bộ hội thoại trước tin user
    user_message: str              # tin user vừa gửi
    objectives: Dict               # mục tiêu bài học của tình huống
    situation_description: str
    persona_name: str
    coach_result: Dict             # output


COACH_SYSTEM_PROMPT = """Bạn là Coach giao tiếp realtime, theo dõi học viên đang chat với một nhân vật giả lập.

Vai trò: phân tích MỘT tin nhắn user vừa gửi (trong ngữ cảnh hội thoại), quyết định có cần can thiệp không.

CAN THIỆP khi user mắc lỗi ảnh hưởng đến mục tiêu bài học, ví dụ:
- Trả lời cụt lủn ("ờ", "ok", "không") làm cuộc trò chuyện chết
- Cộc lốc, thô lỗ, mất lịch sự không phù hợp ngữ cảnh
- Đi sai trọng tâm tình huống / né tránh đề tài
- Phòng thủ quá mức, attack ngược
- Lan man, nói quá dài không có ý
- Làm break tự nhiên (kiểu robot, sáo rỗng)

KHÔNG can thiệp khi:
- Tin nhắn ổn dù chưa hoàn hảo (vẫn đang học)
- Lỗi quá nhỏ (typo, thiếu dấu)
- Phong cách cá nhân (ngắn gọn nhưng vẫn có ý)

OUTPUT — CHÍNH XÁC JSON FORMAT NÀY (không markdown, không text khác):

{
  "needs_coach": true | false,
  "severity": 1 | 2 | 3,
  "issue": "Vấn đề chính, 1 câu ngắn (ví dụ: 'Tin nhắn cụt làm cuộc trò chuyện khó tiếp tục')",
  "suggestions": [
    "Cách nói thay thế 1 (giữ ý user, nâng cấp diễn đạt)",
    "Cách nói thay thế 2 (góc khác)"
  ],
  "explanation": "Vì sao cách nói cũ chưa tốt, 1-2 câu. Cụ thể, không sáo rỗng."
}

QUY TẮC:
- needs_coach=false → severity=1, các trường text để chuỗi rỗng, suggestions=[]
- severity 1=nhẹ, 2=đáng lưu ý, 3=nghiêm trọng
- suggestions PHẢI là tin nhắn user có thể copy-paste, tự nhiên, đúng ngữ cảnh
- Tiếng Việt tự nhiên, warm tone, KHÔNG preachy
- KHÔNG dạy đạo đức, chỉ feedback giao tiếp

OUTPUT: JSON valid duy nhất."""


def _build_user_prompt(
    history: List[Dict],
    user_message: str,
    objectives: Dict,
    situation_description: str,
    persona_name: str,
) -> str:
    formatted_history = "\n".join(
        f"{'AI(' + persona_name + ')' if m['role'] == 'assistant' else 'User'}: {m['content']}"
        for m in history
    ) or "(chưa có tin nhắn nào trước đó)"

    objectives_text = "\n".join(f"- {k}: {v}" for k, v in objectives.items()) or "- Không có"

    return f"""Tình huống: {situation_description}

Mục tiêu bài học của user:
{objectives_text}

Hội thoại trước đó:
{formatted_history}

Tin nhắn user vừa gửi (CẦN PHÂN TÍCH):
"{user_message}"

Hãy quyết định có cần can thiệp không và trả JSON theo format đã yêu cầu."""


_NO_COACH = {
    "needs_coach": False,
    "severity": 1,
    "issue": "",
    "suggestions": [],
    "explanation": "",
}


def coach_node(state: CoachState) -> Dict:
    user_prompt = _build_user_prompt(
        state["history"],
        state["user_message"],
        state["objectives"],
        state["situation_description"],
        state["persona_name"],
    )

    # Coach dùng model nhẹ hơn để giảm độ trễ và chi phí.
    # Có thể swap qua env var nếu cần.
    llm = ChatOpenAI(
        model=settings.coach_model,
        api_key=settings.openai_api_key,
        max_tokens=600,
        temperature=0.3,
        model_kwargs={"response_format": {"type": "json_object"}},
    )

    try:
        response = llm.invoke([
            SystemMessage(content=COACH_SYSTEM_PROMPT),
            HumanMessage(content=user_prompt),
        ])
        parsed = json.loads(response.content)

        # Validate shape; nếu thiếu field, coi như no-coach (an toàn).
        for key in ("needs_coach", "severity", "issue", "suggestions", "explanation"):
            if key not in parsed:
                return {"coach_result": _NO_COACH}

        # Clamp severity vào [1,3]
        try:
            sev = int(parsed["severity"])
        except (TypeError, ValueError):
            sev = 1
        parsed["severity"] = max(1, min(3, sev))

        if not isinstance(parsed["suggestions"], list):
            parsed["suggestions"] = []

        return {"coach_result": parsed}
    except (json.JSONDecodeError, ValueError, Exception) as e:
        # Coach lỗi không được làm hỏng flow chính → fail-soft.
        print(f"[coach] error: {e}")
        return {"coach_result": _NO_COACH}


def build_coach_graph():
    workflow = StateGraph(CoachState)
    workflow.add_node("coach", coach_node)
    workflow.set_entry_point("coach")
    workflow.add_edge("coach", END)
    return workflow.compile()


coach_graph = build_coach_graph()


async def run_coach(
    history: List[Dict],
    user_message: str,
    objectives: Dict,
    situation_description: str,
    persona_name: str,
) -> Dict:
    """Phân tích tin user, trả coach_result. An toàn để await song song với run_chat."""
    initial_state: CoachState = {
        "history": history,
        "user_message": user_message,
        "objectives": objectives or {},
        "situation_description": situation_description,
        "persona_name": persona_name,
        "coach_result": {},
    }
    final_state = await coach_graph.ainvoke(initial_state)
    return final_state["coach_result"]


def should_show_card(coach_result: Dict) -> bool:
    """Có hiển thị card cho user không (theo ngưỡng severity)."""
    return bool(coach_result.get("needs_coach")) and int(coach_result.get("severity", 1)) >= COACH_MIN_SEVERITY
