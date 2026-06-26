from fastapi import APIRouter, HTTPException

from app.models.schemas import LiteratureSearchRequest, LiteratureSearchResponse
from app.services.ai_service import generate_json
from app.prompts.templates import literature_search_prompt

router = APIRouter()


@router.post("/search", response_model=LiteratureSearchResponse)
async def search_literature(request: LiteratureSearchRequest):
    prompt = literature_search_prompt(
        topic=request.topic,
        work_type=request.work_type,
        level=request.level,
        count=request.count,
    )
    try:
        data = await generate_json(prompt)
        return LiteratureSearchResponse(sources=data.get("sources", []))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
