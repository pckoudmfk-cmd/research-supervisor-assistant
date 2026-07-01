from fastapi import APIRouter, HTTPException

from app.models.schemas import LiteratureSearchRequest, LiteratureSearchResponse
from app.services.literature_service import search_literature

router = APIRouter()


@router.post("/search", response_model=LiteratureSearchResponse)
async def search(request: LiteratureSearchRequest):
    try:
        query = " ".join(request.keywords[:4]) if request.keywords else request.topic
        sources = await search_literature(query, request.count)
        return LiteratureSearchResponse(sources=sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
