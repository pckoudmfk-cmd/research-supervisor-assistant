from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ai_service import generate_text

router = APIRouter()

class AiRequest(BaseModel):
    prompt: str

class AiResponse(BaseModel):
    text: str

@router.post("/", response_model=AiResponse)
async def ai_proxy(request: AiRequest):
    try:
        text = await generate_text(request.prompt)
        return AiResponse(text=text)
    except Exception as e:
        import os
        provider = os.getenv("AI_PROVIDER", "gemini")
        key_set = bool(os.getenv("GEMINI_API_KEY") or os.getenv("GROQ_API_KEY"))
        raise HTTPException(status_code=500, detail=f"AI error (provider={provider}, key_set={key_set}): {e}")
