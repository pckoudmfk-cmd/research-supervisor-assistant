WORK_TYPE_RU = {
    "article": "научная статья",
    "thesis": "тезисы доклада",
    "coursework": "курсовая работа",
    "vkr": "выпускная квалификационная работа (ВКР)",
    "practical": "практический проект",
}

LEVEL_RU = {
    "spo": "СПО (среднее профессиональное образование)",
    "vuz": "ВУЗ (высшее образование)",
}


def topic_generation_prompt(subject_area: str, work_type: str, level: str, keywords: str, count: int) -> str:
    wt = WORK_TYPE_RU.get(work_type, work_type)
    lvl = LEVEL_RU.get(level, level)
    kw_part = f"\nКлючевые слова/уточнения: {keywords}" if keywords else ""
    return f"""Ты — опытный научный руководитель. Сформулируй {count} актуальных тем для {wt} уровня {lvl}.
Предметная область: {subject_area}{kw_part}

Требования:
- Темы должны быть конкретными, актуальными и выполнимыми
- Формулировки — академические, без лишних слов
- Уровень сложности соответствует {lvl}
- Каждая тема — отдельная строка, без нумерации и лишних символов

Выведи только список тем, без пояснений."""


def research_plan_prompt(topic: str, work_type: str, level: str) -> str:
    wt = WORK_TYPE_RU.get(work_type, work_type)
    lvl = LEVEL_RU.get(level, level)
    return f"""Ты — опытный научный руководитель. Составь подробный план исследования.

Тема: «{topic}»
Тип работы: {wt}
Уровень: {lvl}

Составь структуру работы в формате JSON:
{{
  "sections": [
    {{
      "title": "Название раздела",
      "description": "Краткое описание содержания (1-2 предложения)",
      "estimated_pages": 5
    }}
  ],
  "total_pages": 40
}}

Требования:
- Разделы должны логично следовать друг за другом
- Объём соответствует стандартам для {wt} уровня {lvl}
- Включи введение, основные главы и заключение
- Верни только валидный JSON без дополнительного текста."""


def literature_search_prompt(topic: str, work_type: str, level: str, count: int) -> str:
    wt = WORK_TYPE_RU.get(work_type, work_type)
    lvl = LEVEL_RU.get(level, level)
    return f"""Ты — библиограф и научный консультант. Составь список литературы для работы.

Тема: «{topic}»
Тип работы: {wt}
Уровень: {lvl}
Количество источников: {count}

Верни список в формате JSON:
{{
  "sources": [
    {{
      "title": "Название источника",
      "author": "Автор(ы)",
      "year": 2023,
      "type": "book",
      "publisher": "Издательство или журнал",
      "url": null
    }}
  ]
}}

Типы источников: book (книга), article (статья), online (интернет-ресурс), regulatory (норм. документ).
Включи разнообразные источники: учебники, статьи, нормативные документы.
Верни только валидный JSON без дополнительного текста."""
