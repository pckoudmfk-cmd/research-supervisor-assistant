import asyncio
import httpx
from app.models.schemas import LiteratureSource

TIMEOUT = 7


async def translate_ru_en(text: str) -> str:
    """MyMemory free translation API — no key, ~0.5s, 5000 chars/day."""
    try:
        query = text[:500]
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(
                "https://api.mymemory.translated.net/get",
                params={"q": query, "langpair": "ru|en"},
            )
            r.raise_for_status()
            data = r.json()
            translated = data.get("responseData", {}).get("translatedText", "")
            if translated and translated.lower() != query.lower():
                return translated
    except Exception:
        pass
    return text


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


async def search_crossref(query: str, limit: int = 5) -> list[LiteratureSource]:
    url = "https://api.crossref.org/works"
    params = {
        "query": query,
        "rows": limit,
        "select": "title,author,published,container-title,DOI,language",
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
    for item in data.get("message", {}).get("items", []):
        titles = item.get("title") or []
        title = titles[0] if titles else ""
        if not title:
            continue
        authors = []
        for a in item.get("author", []):
            name = " ".join(filter(None, [a.get("given", ""), a.get("family", "")])).strip()
            if name:
                authors.append(name)
        pub = item.get("published", {}).get("date-parts", [[None]])
        year = pub[0][0] if pub and pub[0] else None
        journals = item.get("container-title") or []
        doi = item.get("DOI") or None
        lang_raw = item.get("language") or "unknown"
        lang = "ru" if lang_raw in ("ru", "rus") else ("en" if lang_raw in ("en", "eng") else "unknown")
        sources.append(LiteratureSource(
            title=title,
            authors=authors[:3],
            year=year,
            source=journals[0] if journals else None,
            doi=doi,
            url=f"https://doi.org/{doi}" if doi else None,
            language=lang,
        ))
    return sources


async def search_arxiv(query: str, limit: int = 5) -> list[LiteratureSource]:
    import xml.etree.ElementTree as ET
    url = "https://export.arxiv.org/api/query"
    params = {"search_query": f"all:{query}", "max_results": limit, "sortBy": "relevance"}
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            root = ET.fromstring(r.text)
    except Exception:
        return []

    ns = {"a": "http://www.w3.org/2005/Atom"}
    sources = []
    for entry in root.findall("a:entry", ns):
        title_el = entry.find("a:title", ns)
        title = (title_el.text or "").strip().replace("\n", " ") if title_el is not None else ""
        if not title:
            continue
        authors = [
            (n.text or "").strip()
            for n in entry.findall("a:author/a:name", ns)
            if n.text
        ]
        published_el = entry.find("a:published", ns)
        year = int(published_el.text[:4]) if published_el is not None and published_el.text else None
        link_el = entry.find("a:id", ns)
        url_str = (link_el.text or "").strip() if link_el is not None else None
        doi_el = entry.find("{http://arxiv.org/schemas/atom}doi")
        doi = (doi_el.text or "").strip() if doi_el is not None else None
        sources.append(LiteratureSource(
            title=title,
            authors=authors[:3],
            year=year,
            source="arXiv",
            doi=doi,
            url=url_str,
            language="en",
        ))
    return sources


async def search_europepmc(query: str, limit: int = 5) -> list[LiteratureSource]:
    url = "https://www.ebi.ac.uk/europepmc/webservices/rest/search"
    params = {"query": query, "pageSize": limit, "format": "json", "resultType": "core"}
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            data = r.json()
    except Exception:
        return []

    sources = []
    for item in data.get("resultList", {}).get("result", []):
        title = item.get("title", "").strip()
        if not title:
            continue
        authors = [
            a.get("fullName") or f"{a.get('lastName','')} {a.get('initials','')}".strip()
            for a in (item.get("authorList", {}).get("author") or [])
            if a.get("fullName") or a.get("lastName")
        ]
        year = item.get("pubYear")
        try:
            year = int(year) if year else None
        except Exception:
            year = None
        doi = item.get("doi") or None
        source_name = item.get("journalTitle") or item.get("bookOrReportDetails", {}).get("publisher")
        pmid = item.get("pmid") or item.get("id")
        link = f"https://europepmc.org/article/{item.get('source','MED')}/{pmid}" if pmid else None
        sources.append(LiteratureSource(
            title=title,
            authors=authors[:3],
            year=year,
            source=source_name,
            doi=doi,
            url=f"https://doi.org/{doi}" if doi else link,
            language="en",
        ))
    return sources


async def search_literature(topic: str, count: int = 10) -> list[LiteratureSource]:
    per_source = max(count // 3, 3)

    # КиберЛенинка (русский) + перевод — параллельно
    ru_results, en_query = await asyncio.gather(
        search_cyberleninka(topic, per_source),
        translate_ru_en(topic),
        return_exceptions=True,
    )
    if isinstance(ru_results, Exception):
        ru_results = []
    if isinstance(en_query, Exception):
        en_query = topic

    # 5 англоязычных баз с переведённым запросом — параллельно
    en_results = await asyncio.gather(
        search_semantic_scholar(en_query, per_source),
        search_openalex(en_query, per_source),
        search_crossref(en_query, per_source),
        search_arxiv(en_query, per_source),
        search_europepmc(en_query, per_source),
        return_exceptions=True,
    )

    results = [ru_results] + list(en_results)

    seen: set[str] = set()
    merged: list[LiteratureSource] = []
    for batch in results:
        if isinstance(batch, Exception) or not isinstance(batch, list):
            continue
        for s in batch:
            if not s.title:
                continue
            key = s.title.lower()[:60]
            if key not in seen:
                seen.add(key)
                merged.append(s)

    return merged[:count]
