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
        raise HTTPException(status_code=500, detail=str(e))
