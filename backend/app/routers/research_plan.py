from fastapi import APIRouter, HTTPException

from app.models.schemas import PlanRequest, PlanResponse
from app.services.ai_service import generate_json
from app.prompts.templates import plan_generation_prompt

router = APIRouter()


@router.post("/generate", response_model=PlanResponse)
async def generate_plan(request: PlanRequest):
    prompt = plan_generation_prompt(
        topic=request.topic,
        work_type=request.work_type,
        level=request.level,
    )
    try:
        data = await generate_json(prompt)
        return PlanResponse(
            goal=data.get("goal", ""),
            objectives=data.get("objectives", []),
            keywords=data.get("keywords", []),
            chapters=data.get("chapters", []),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
