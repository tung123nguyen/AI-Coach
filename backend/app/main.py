from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import situations, sessions

app = FastAPI(
    title="Conversation Gym API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(situations.router, prefix="/api", tags=["situations"])
app.include_router(sessions.router, prefix="/api", tags=["sessions"])
# Phase 4: app.include_router(messages.router, prefix="/api", tags=["messages"])
