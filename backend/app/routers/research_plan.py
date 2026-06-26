from fastapi import APIRouter, HTTPException

from app.models.schemas import ResearchPlanRequest, ResearchPlanResponse
from app.services.ai_service import generate_json
from app.prompts.templates import research_plan_prompt

router = APIRouter()


@router.post("/generate", response_model=ResearchPlanResponse)
async def generate_research_plan(request: ResearchPlanRequest):
    prompt = research_plan_prompt(
        topic=request.topic,
        work_type=request.work_type,
        level=request.level,
    )
    try:
        data = await generate_json(prompt)
        return ResearchPlanResponse(
            topic=request.topic,
            work_type=request.work_type,
            level=request.level,
            sections=data.get("sections", []),
            total_pages=data.get("total_pages", 0),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
