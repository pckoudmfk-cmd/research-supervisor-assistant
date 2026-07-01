import asyncio
import httpx
from app.models.schemas import LiteratureSource

TIMEOUT = 7


async def search_cyberleninka(query: str, limit: int = 5) -> list[LiteratureSource]:
    url = "https://cyberleninka.ru/api/search"
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            r = await client.post(url, json={"q": query, "size": limit, "from": 0})
            r.raise_for_status()
            data = r.json()
    except Exception:
        return []

    sources = []
    for a in data.get("articles", []):
        if not a.get("name"):
            continue
        slug = a.get("id", "")
        sources.append(LiteratureSource(
            title=a["name"],
            authors=[s.strip() for s in (a.get("authorNames") or "").split(",") if s.strip()],
            year=a.get("publishedYear"),
            source=a.get("journalName") or None,
            doi=None,
            url=f"https://cyberleninka.ru/article/n/{slug}" if slug else None,
            language="ru",
        ))
    return sources


async def search_semantic_scholar(query: str, limit: int = 5) -> list[LiteratureSource]:
    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = {
        "query": query,
        "limit": limit,
        "fields": "title,authors,year,venue,externalIds,openAccessPdf",
    }
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            data = r.json()
    except Exception:
        return []

    sources = []
    for paper in data.get("data", []):
        doi = (paper.get("externalIds") or {}).get("DOI")
        pdf_url = (paper.get("openAccessPdf") or {}).get("url")
        sources.append(LiteratureSource(
            title=paper.get("title", ""),
            authors=[a["name"] for a in paper.get("authors", [])],
            year=paper.get("year"),
            source=paper.get("venue") or None,
            doi=doi,
            url=pdf_url or (f"https://doi.org/{doi}" if doi else None),
            language="en",
        ))
    return sources


async def search_openalex(query: str, limit: int = 5) -> list[LiteratureSource]:
    url = "https://api.openalex.org/works"
    params = {
        "search": query,
        "per-page": limit,
        "select": "title,authorships,publication_year,primary_location,doi,language",
        "mailto": "app@research-assistant.ru",
    }
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            data = r.json()
    except Exception:
        return []

    sources = []
    for work in data.get("results", []):
        authors = [
            a["author"]["display_name"]
            for a in work.get("authorships", [])
            if a.get("author", {}).get("display_name")
        ]
        doi = work.get("doi", "").replace("https://doi.org/", "") or None
        loc = work.get("primary_location") or {}
        source_name = (loc.get("source") or {}).get("display_name")
        lang_raw = work.get("language") or "unknown"
        lang = lang_raw if lang_raw in ("ru", "en") else "unknown"
        sources.append(LiteratureSource(
            title=work.get("title", ""),
            authors=authors[:3],
            year=work.get("publication_year"),
            source=source_name,
            doi=doi,
            url=f"https://doi.org/{doi}" if doi else None,
            language=lang,
        ))
    return sources


async def search_literature(topic: str, count: int = 10) -> list[LiteratureSource]:
    ru_count = max(count // 2, 3)
    en_count = count - ru_count + 2

    # run all three searches in parallel — stays well within Vercel's 10s limit
    ru_results, en_results, extra_results = await asyncio.gather(
        search_cyberleninka(topic, ru_count),
        search_semantic_scholar(topic, en_count),
        search_openalex(topic, en_count),
    )

    seen: set[str] = set()
    merged: list[LiteratureSource] = []
    for s in ru_results + en_results + extra_results:
        if not s.title:
            continue
        key = s.title.lower()[:60]
        if key not in seen:
            seen.add(key)
            merged.append(s)

    return merged[:count]
