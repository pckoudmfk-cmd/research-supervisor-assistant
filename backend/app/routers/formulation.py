from fastapi import APIRouter, HTTPException

from app.models.schemas import TopicFormulationRequest, TopicFormulationResponse
from app.services.ai_service import generate_json
from app.prompts.templates import topic_formulation_prompt

router = APIRouter()


@router.post("/generate", response_model=TopicFormulationResponse)
async def generate_formulation(request: TopicFormulationRequest):
    prompt = topic_formulation_prompt(
        ktp_topic=request.ktp_topic,
        work_type=request.work_type,
        level=request.level,
        direction=request.direction,
        subject_area=request.subject_area,
    )
    try:
        data = await generate_json(prompt)
        return TopicFormulationResponse(
            topic=data.get("topic", ""),
            relevance=data.get("relevance", ""),
            novelty=data.get("novelty", ""),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
