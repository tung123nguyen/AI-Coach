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
