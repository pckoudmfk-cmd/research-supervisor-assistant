import type { WorkType, Level, Difficulty, LiteratureSource, Chapter } from '../types';

// ---------- Pollinations.ai — бесплатно, без ключей ----------

async function ai(prompt: string): Promise<string> {
  const res = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai',
      seed: Math.floor(Math.random() * 1000),
      private: true,
    }),
  });
  if (!res.ok) throw new Error(`Ошибка сервиса AI: HTTP ${res.status}`);
  return res.text();
}

function repairJson(raw: string): string {
  const openers: string[] = [];
  let inStr = false;
  let esc = false;
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    out += c;
    if (esc) { esc = false; continue; }
    if (c === '\\' && inStr) { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{') openers.push('}');
    else if (c === '[') openers.push(']');
    else if ((c === '}' || c === ']') && openers.length) openers.pop();
  }
  if (inStr) out += '"';
  while (openers.length) out += openers.pop();
  return out;
}

function extractJson(text: string): any {
  const match = text.match(/```(?:json)?\s*([\s\S]+?)```/);
  const cleaned = match ? match[1].trim() : text.trim();
  const start = cleaned.indexOf('{');
  const raw = start !== -1 ? cleaned.slice(start) : cleaned;
  try { return JSON.parse(raw); } catch { return JSON.parse(repairJson(raw)); }
}

// ---------- Характеристики типов работ ----------

const WORK_INFO: Record<string, { name: string; volume: string; structure: string }> = {
  article: {
    name: 'научная статья',
    volume: '8–15 страниц',
    structure: 'аннотация, введение, основная часть (2–3 раздела), заключение, список литературы (10–15 источников)',
  },
  thesis: {
    name: 'тезисы доклада',
    volume: '3–5 страниц',
    structure: 'краткое введение с постановкой проблемы, 2–3 основных тезиса с аргументацией, вывод, 5–7 источников',
  },
  coursework: {
    name: 'курсовая работа',
    volume: '25–40 страниц',
    structure: 'введение, глава 1 — теоретические основы, глава 2 — практический анализ или эксперимент, заключение, список литературы (20–30 источников), приложения',
  },
  vkr: {
    name: 'выпускная квалификационная работа (ВКР)',
    volume: '50–80 страниц',
    structure: 'введение, глава 1 — теоретические основы, глава 2 — аналитическая часть, глава 3 — проектная/практическая часть, заключение, список литературы (30–50 источников), приложения',
  },
  practical: {
    name: 'практикоориентированный проект',
    volume: '20–35 страниц',
    structure: 'паспорт проекта, обоснование актуальности, цели и задачи, методология, этапы реализации, ожидаемые результаты, список литературы (15–20 источников)',
  },
};

const LEVEL_INFO: Record<string, string> = {
  spo: 'студент СПО (среднее профессиональное образование, 1–4 курс)',
  vuz: 'студент вуза (высшее образование, бакалавриат или магистратура)',
};

const DIFFICULTY_INFO: Record<string, { label: string; desc: string }> = {
  basic:    { label: 'базовый',     desc: 'обзорная работа, преимущественно теория, 1–2 простых метода (анализ литературы, сравнение)' },
  standard: { label: 'стандартный', desc: 'теория + практический анализ или кейс, 3–4 метода (анкетирование, анализ данных, SWOT и т.п.)' },
  advanced: { label: 'продвинутый', desc: 'оригинальное исследование: эксперимент, разработка прототипа или собственная методика, 5+ методов' },
};

// ---------- Промпты ----------

function ktpAnalysisPrompt(text: string, workType: string, level: string, difficulty: string, direction: string, subjectArea: string) {
  const wi = WORK_INFO[workType] ?? WORK_INFO.coursework;
  const lv = LEVEL_INFO[level] ?? LEVEL_INFO.vuz;
  const df = DIFFICULTY_INFO[difficulty] ?? DIFFICULTY_INFO.standard;
  return `Ты — опытный научный руководитель. Проанализируй учебный материал и предложи научно значимые исследовательские ракурсы.

Учебный материал (КТП / темы уроков / рабочая программа):
${text.slice(0, 5000)}

Параметры студента:
- Уровень: ${lv}
- Направление подготовки: ${direction || 'не указано'}
- Дисциплина: ${subjectArea || 'не указана'}
- Тип работы: ${wi.name} (${wi.volume})
- Сложность работы: ${df.label} — ${df.desc}

Твоя задача: найти 5–8 тем, каждая из которых:
1. Опирается на реальную проблему или противоречие в данной предметной области
2. Имеет исследовательский потенциал (можно собрать данные, провести анализ или эксперимент)
3. Посильна для ${lv} и соответствует объёму ${wi.name}
4. Актуальна сегодня — связана с современными вызовами, технологиями или социальными запросами

Верни ответ строго в формате JSON:
{
  "topics": [
    {
      "title": "Академическая формулировка темы",
      "angle": "В чём исследовательский ракурс — какую проблему решаем, что изучаем (1–2 предложения)",
      "why": "Почему тема перспективна и актуальна именно сейчас (1 предложение)"
    }
  ]
}`;
}

function formulationPrompt(
  topic: string, angle: string, workType: string, level: string, difficulty: string, direction: string, subjectArea: string
) {
  const wi = WORK_INFO[workType] ?? WORK_INFO.coursework;
  const lv = LEVEL_INFO[level] ?? LEVEL_INFO.vuz;
  const df = DIFFICULTY_INFO[difficulty] ?? DIFFICULTY_INFO.standard;
  return `Ты — опытный научный руководитель. Разработай полноценное научное обоснование темы.

Тема: «${topic}»
Исследовательский ракурс: ${angle}
Тип работы: ${wi.name} (объём: ${wi.volume})
Уровень студента: ${lv}
Сложность: ${df.label} — ${df.desc}
Направление: ${direction}
Дисциплина: ${subjectArea}

Верни строго в формате JSON:
{
  "topic": "Уточнённая академическая формулировка темы (объект + предмет исследования)",
  "object": "Объект исследования — широкая область",
  "subject": "Предмет исследования — конкретный аспект",
  "relevance": "Актуальность: 2–3 предложения о современных проблемах и противоречиях в этой теме.",
  "novelty": "Научная новизна: 1–2 предложения о том, что нового вносит данная работа.",
  "hypothesis": "Гипотеза исследования: одно предложение-предположение, которое будет проверяться"
}`;
}

function planPrompt(topic: string, object: string, subject: string, workType: string, level: string, difficulty: string) {
  const wi = WORK_INFO[workType] ?? WORK_INFO.coursework;
  const lv = LEVEL_INFO[level] ?? LEVEL_INFO.vuz;
  const df = DIFFICULTY_INFO[difficulty] ?? DIFFICULTY_INFO.standard;
  return `Ты — научный руководитель. Составь подробный план работы как инструкцию для студента.

Тема: «${topic}»
Объект: ${object}
Предмет: ${subject}
Тип работы: ${wi.name}
Структура: ${wi.structure}
Объём: ${wi.volume}
Студент: ${lv}
Сложность: ${df.label} — ${df.desc}

Верни строго в формате JSON:
{
  "goal": "Цель работы — одно предложение, начинается с глагола (Исследовать / Разработать / Проанализировать...)",
  "objectives": [
    "Задача 1 — конкретное действие (изучить, проанализировать, разработать...)",
    "Задача 2",
    "Задача 3",
    "Задача 4",
    "Задача 5"
  ],
  "keywords": ["ключевое слово 1", "ключевое слово 2"],
  "chapters": [
    {
      "number": 1,
      "title": "Название раздела/главы",
      "description": "Что делать студенту в этом разделе: ключевые вопросы и ожидаемый результат (1–2 предложения)"
    }
  ],
  "methods": ["метод 1", "метод 2", "метод 3"],
  "expectedResult": "Что должно получиться в итоге — конкретный результат работы"
}

Задач должно быть 5–7 (по одной на каждую главу + общие). Глав — согласно структуре ${wi.name}. Методов — 3–5.`;
}

// ---------- КТП ----------

export async function parseKtp(
  text: string, workType: string, level: string, difficulty: string, direction: string, subjectArea: string
): Promise<KtpTopic[]> {
  const result = await ai(ktpAnalysisPrompt(text, workType, level, difficulty, direction, subjectArea));
  const data = extractJson(result);
  return (data.topics ?? []) as KtpTopic[];
}

export async function parseKtpFile(
  file: File, workType: string, level: string, difficulty: string, direction: string, subjectArea: string
): Promise<KtpTopic[]> {
  let text = '';
  if (file.name.toLowerCase().endsWith('.pdf')) {
    text = await readPdfText(file);
  } else if (file.name.toLowerCase().endsWith('.docx')) {
    text = await readDocxText(file);
  } else {
    text = await file.text();
  }
  if (!text.trim()) throw new Error('Файл не содержит текста');
  return parseKtp(text, workType, level, difficulty, direction, subjectArea);
}

async function readPdfText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const raw = decoder.decode(bytes);
  const chunks: string[] = [];
  const btEt = raw.match(/BT[\s\S]*?ET/g) ?? [];
  for (const block of btEt) {
    const strings = block.match(/\(([^)]*)\)/g) ?? [];
    for (const s of strings) {
      const content = s.slice(1, -1).replace(/\\n/g, '\n').replace(/\\\(/g, '(').replace(/\\\)/g, ')');
      if (content.trim()) chunks.push(content);
    }
  }
  const extracted = chunks.join(' ');
  return extracted.length > 50 ? extracted : raw.replace(/[^\x20-\x7EЀ-ӿ\n]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function readDocxText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file('word/document.xml')?.async('string') ?? '';
  return xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ---------- Формулировка ----------

export interface KtpTopic { title: string; angle: string; why: string; }
export interface FormulationResult {
  topic: string; object: string; subject: string;
  relevance: string; novelty: string; hypothesis: string;
}

export async function generateFormulation(
  topic: string, angle: string, workType: WorkType, level: Level, difficulty: Difficulty, direction: string, subjectArea: string
): Promise<FormulationResult> {
  const text = await ai(formulationPrompt(topic, angle, workType, level, difficulty, direction, subjectArea));
  return extractJson(text) as FormulationResult;
}

// ---------- План ----------

export interface PlanResult {
  goal: string; objectives: string[]; keywords: string[];
  chapters: Chapter[]; methods: string[]; expectedResult: string;
}

export async function generatePlan(
  topic: string, object: string, subject: string, workType: WorkType, level: Level, difficulty: Difficulty
): Promise<PlanResult> {
  const text = await ai(planPrompt(topic, object, subject, workType, level, difficulty));
  return extractJson(text) as PlanResult;
}

// ---------- Литература ----------

async function translateToEnglish(text: string): Promise<string> {
  try {
    const result = await ai(
      `Translate the following research topic/keywords to English for academic database search. Return only the translation, nothing else:\n"${text}"`
    );
    return result.trim().replace(/^["']|["']$/g, '');
  } catch {
    return text;
  }
}

export async function searchLiterature(topic: string, keywords: string[], count = 10): Promise<LiteratureSource[]> {
  const results: LiteratureSource[] = [];
  const ruQuery = keywords.length > 0 ? keywords.slice(0, 4).join(' ') : topic;
  const errors: string[] = [];

  // 1. КиберЛенинка — русскоязычные статьи в открытом доступе
  try {
    const r = await fetch('https://cyberleninka.ru/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: ruQuery, size: Math.ceil(count * 0.5), from: 0 }),
    });
    if (r.ok) {
      const d = await r.json();
      for (const a of (d.articles ?? [])) {
        if (!a.name) continue;
        const slug = a.id ?? '';
        results.push({
          title: a.name,
          authors: a.authorNames ? a.authorNames.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          year: a.publishedYear ?? undefined,
          source: a.journalName ?? undefined,
          doi: undefined,
          url: slug ? `https://cyberleninka.ru/article/n/${slug}` : undefined,
          language: 'ru',
        });
      }
    } else {
      errors.push(`КиберЛенинка: HTTP ${r.status}`);
    }
  } catch (e: any) { errors.push(`КиберЛенинка: ${e?.message ?? 'недоступна'}`); }

  // 2. Semantic Scholar — международные статьи (запрос на английском)
  try {
    const enQuery = await translateToEnglish(ruQuery);
    const q = encodeURIComponent(enQuery || ruQuery);
    const need = Math.ceil(count * 0.35);
    const r = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${q}&limit=${need}&fields=title,authors,year,venue,externalIds,openAccessPdf`
    );
    if (r.ok) {
      const d = await r.json();
      for (const p of (d.data ?? [])) {
        if (!p.title) continue;
        const doi = p.externalIds?.DOI;
        const url = p.openAccessPdf?.url ?? (doi ? `https://doi.org/${doi}` : undefined);
        results.push({
          title: p.title,
          authors: (p.authors ?? []).map((a: any) => a.name),
          year: p.year,
          source: p.venue || undefined,
          doi,
          url,
          language: guessLang(p.title),
        });
      }
    } else {
      errors.push(`Semantic Scholar: HTTP ${r.status}`);
    }
  } catch (e: any) { errors.push(`Semantic Scholar: ${e?.message ?? 'недоступен'}`); }

  // 3. OpenAlex — дополнение до нужного количества
  try {
    const need = count - results.length;
    if (need > 0) {
      const enQuery = await translateToEnglish(ruQuery);
      const q = encodeURIComponent(enQuery || ruQuery);
      const r = await fetch(
        `https://api.openalex.org/works?search=${q}&per-page=${need + 3}&filter=has_doi:true&sort=cited_by_count:desc`
      );
      if (r.ok) {
        const d = await r.json();
        for (const w of (d.results ?? [])) {
          if (!w.title) continue;
          const doi = w.doi?.replace('https://doi.org/', '');
          results.push({
            title: w.title,
            authors: (w.authorships ?? []).slice(0, 5).map((a: any) => a.author?.display_name ?? ''),
            year: w.publication_year,
            source: w.primary_location?.source?.display_name,
            doi,
            url: w.doi ?? w.open_access?.oa_url ?? undefined,
            language: guessLang(w.title),
          });
        }
      } else {
        errors.push(`OpenAlex: HTTP ${r.status}`);
      }
    }
  } catch (e: any) { errors.push(`OpenAlex: ${e?.message ?? 'недоступен'}`); }

  if (results.length === 0) {
    throw new Error(
      errors.length
        ? `Не удалось получить источники: ${errors.join('; ')}`
        : 'Источники не найдены. Попробуйте уточнить тему или ключевые слова.'
    );
  }

  // deduplicate by title
  const seen = new Set<string>();
  const unique = results.filter(r => {
    const key = r.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, count);
}

function guessLang(title?: string): 'ru' | 'en' | 'unknown' {
  if (!title) return 'unknown';
  return /[а-яё]/i.test(title) ? 'ru' : 'en';
}
