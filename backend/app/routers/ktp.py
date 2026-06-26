from fastapi import APIRouter, HTTPException, UploadFile, File

from app.models.schemas import KtpParseRequest, KtpParseResponse
from app.services.ai_service import generate_text
from app.prompts.templates import ktp_parse_prompt

router = APIRouter()


@router.post("/parse", response_model=KtpParseResponse)
async def parse_ktp(request: KtpParseRequest):
    prompt = ktp_parse_prompt(request.text)
    try:
        text = await generate_text(prompt)
        topics = [line.strip() for line in text.strip().splitlines() if line.strip()]
        return KtpParseResponse(topics=topics[:20])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/parse-file", response_model=KtpParseResponse)
async def parse_ktp_file(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    prompt = ktp_parse_prompt(text)
    try:
        result = await generate_text(prompt)
        topics = [line.strip() for line in result.strip().splitlines() if line.strip()]
        return KtpParseResponse(topics=topics[:20])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
