from pydantic import BaseModel
from typing import Literal, Optional

WorkType = Literal["article", "thesis", "coursework", "vkr", "practical"]
Level = Literal["spo", "vuz"]


class KtpParseRequest(BaseModel):
    text: str


class KtpParseResponse(BaseModel):
    topics: list[str]


class TopicFormulationRequest(BaseModel):
    ktp_topic: str
    work_type: WorkType
    level: Level
    direction: str
    subject_area: str


class TopicFormulationResponse(BaseModel):
    topic: str
    relevance: str
    novelty: str


class Chapter(BaseModel):
    number: int
    title: str
    description: str


class PlanRequest(BaseModel):
    topic: str
    work_type: WorkType
    level: Level


class PlanResponse(BaseModel):
    goal: str
    objectives: list[str]
    keywords: list[str]
    chapters: list[Chapter]


class LiteratureSearchRequest(BaseModel):
    topic: str
    count: int = 10


class LiteratureSource(BaseModel):
    title: str
    authors: list[str]
    year: Optional[int] = None
    source: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    language: Literal["ru", "en", "unknown"] = "unknown"


class LiteratureSearchResponse(BaseModel):
    sources: list[LiteratureSource]
