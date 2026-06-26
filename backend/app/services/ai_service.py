import json
import os
import re
from openai import AsyncOpenAI

# AI_PROVIDER: "groq" | "ollama" | "gemini"
# Groq  — бесплатный tier, регистрация на console.groq.com (без карты)
# Ollama — полностью локально, бесплатно, нужен запущенный ollama
# Gemini — бесплатный tier Google, ключ на aistudio.google.com

PROVIDER = os.getenv("AI_PROVIDER", "groq").lower()

PROVIDER_CONFIGS = {
    "groq": {
        "base_url": "https://api.groq.com/openai/v1",
        "api_key": os.getenv("GROQ_API_KEY", ""),
        "model": os.getenv("AI_MODEL", "llama-3.1-8b-instant"),
        "json_mode": True,
    },
    "ollama": {
        "base_url": os.getenv("OLLAMA_URL", "http://localhost:11434/v1"),
        "api_key": "ollama",
        "model": os.getenv("AI_MODEL", "llama3.2"),
        "json_mode": False,
    },
    "gemini": {
        "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/",
        "api_key": os.getenv("GEMINI_API_KEY", ""),
        "model": os.getenv("AI_MODEL", "gemini-2.0-flash"),
        "json_mode": True,
    },
}

cfg = PROVIDER_CONFIGS.get(PROVIDER, PROVIDER_CONFIGS["groq"])
client = AsyncOpenAI(base_url=cfg["base_url"], api_key=cfg["api_key"])


def _extract_json(text: str) -> dict:
    """Извлекает JSON из текста, даже если модель обернула его в ```json."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]+?)```", text)
    if match:
        text = match.group(1).strip()
    start = text.find("{")
    if start != -1:
        text = text[start:]
    return json.loads(text)


async def generate_text(prompt: str) -> str:
    response = await client.chat.completions.create(
        model=cfg["model"],
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=2000,
    )
    return response.choices[0].message.content or ""


async def generate_json(prompt: str) -> dict:
    kwargs: dict = dict(
        model=cfg["model"],
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=3000,
    )
    if cfg["json_mode"]:
        kwargs["response_format"] = {"type": "json_object"}

    response = await client.chat.completions.create(**kwargs)
    content = response.choices[0].message.content or "{}"
    return _extract_json(content)
