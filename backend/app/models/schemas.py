from pydantic import BaseModel
from typing import Literal, Optional

WorkType = Literal["article", "thesis", "coursework", "vkr", "practical"]
Level = Literal["spo", "vuz"]


class TopicGenerateRequest(BaseModel):
    subject_area: str
    work_type: WorkType
    level: Level
    keywords: Optional[str] = None
    count: int = 5


class TopicGenerateResponse(BaseModel):
    topics: list[str]


class ResearchPlanRequest(BaseModel):
    topic: str
    work_type: WorkType
    level: Level


class ResearchPlanSection(BaseModel):
    title: str
    description: str
    estimated_pages: int


class ResearchPlanResponse(BaseModel):
    topic: str
    work_type: WorkType
    level: Level
    sections: list[ResearchPlanSection]
    total_pages: int


class LiteratureSearchRequest(BaseModel):
    topic: str
    work_type: WorkType
    level: Level
    count: int = 10


class LiteratureSource(BaseModel):
    title: str
    author: str
    year: int
    type: Literal["book", "article", "online", "regulatory"]
    publisher: Optional[str] = None
    url: Optional[str] = None


class LiteratureSearchResponse(BaseModel):
    sources: list[LiteratureSource]
