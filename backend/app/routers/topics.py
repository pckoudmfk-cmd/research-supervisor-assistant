from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional

from app.models.schemas import TopicGenerateRequest, TopicGenerateResponse
from app.services.ai_service import generate_text, generate_json
from app.prompts.templates import topic_generation_prompt

router = APIRouter()


@router.post("/generate", response_model=TopicGenerateResponse)
async def generate_topics(request: TopicGenerateRequest):
    prompt = topic_generation_prompt(
        subject_area=request.subject_area,
        work_type=request.work_type,
        level=request.level,
        keywords=request.keywords or "",
        count=request.count,
    )
    try:
        text = await generate_text(prompt)
        topics = [line.strip() for line in text.strip().splitlines() if line.strip()]
        return TopicGenerateResponse(topics=topics[: request.count])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-from-file", response_model=TopicGenerateResponse)
async def generate_topics_from_file(
    file: UploadFile = File(...),
    work_type: str = Form(...),
    level: str = Form(...),
    count: int = Form(5),
):
    content = await file.read()
    text_content = content.decode("utf-8", errors="ignore")[:3000]

    prompt = topic_generation_prompt(
        subject_area=f"На основе следующего текста:\n{text_content}",
        work_type=work_type,
        level=level,
        keywords="",
        count=count,
    )
    try:
        text = await generate_text(prompt)
        topics = [line.strip() for line in text.strip().splitlines() if line.strip()]
        return TopicGenerateResponse(topics=topics[:count])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
