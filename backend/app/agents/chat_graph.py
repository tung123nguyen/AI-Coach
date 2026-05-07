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
async def role_player_node(state: ChatState) -> Dict:
    """Single node: generate AI response in character."""

    system_prompt = build_role_player_prompt(
        state["persona"],
        state["situation_description"]
    )

    messages = [SystemMessage(content=system_prompt)]

    for msg in state["history"]:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        else:
            messages.append(AIMessage(content=msg["content"]))

    messages.append(HumanMessage(content=state["user_message"]))

    llm = ChatOpenAI(
        model=settings.openai_model,
        api_key=settings.openai_api_key,
        max_tokens=500,
        temperature=0.8,
    )

    response = await llm.ainvoke(messages)
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
async def run_chat(
    persona: Dict,
    history: List[Dict],
    user_message: str,
    situation_description: str
) -> str:
    """Run chat workflow async, return AI response text."""
    initial_state: ChatState = {
        "persona": persona,
        "situation_description": situation_description,
        "history": history,
        "user_message": user_message,
        "ai_response": "",
    }

    final_state = await chat_graph.ainvoke(initial_state)
    return final_state["ai_response"]
