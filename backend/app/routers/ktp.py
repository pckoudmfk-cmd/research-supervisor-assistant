import io
from fastapi import APIRouter, HTTPException, UploadFile, File

from app.models.schemas import KtpParseRequest, KtpParseResponse
from app.services.ai_service import generate_text
from app.prompts.templates import ktp_parse_prompt

router = APIRouter()


def _extract_text(content: bytes, filename: str) -> str:
    name = (filename or "").lower()
    if name.endswith(".pdf"):
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Не удалось прочитать PDF: {e}")
    if name.endswith(".docx"):
        try:
            from docx import Document
            doc = Document(io.BytesIO(content))
            return "\n".join(p.text for p in doc.paragraphs)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Не удалось прочитать DOCX: {e}")
    # plain text fallback (.txt, .md, etc.)
    return content.decode("utf-8", errors="ignore")


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
    text = _extract_text(content, file.filename or "")
    if not text.strip():
        raise HTTPException(status_code=422, detail="Файл не содержит текста или не поддерживается")
    prompt = ktp_parse_prompt(text)
    try:
        result = await generate_text(prompt)
        topics = [line.strip() for line in result.strip().splitlines() if line.strip()]
        return KtpParseResponse(topics=topics[:20])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
