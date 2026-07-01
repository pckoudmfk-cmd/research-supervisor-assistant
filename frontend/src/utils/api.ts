import type { WorkType, Level, Difficulty, LiteratureSource, Chapter } from '../types';

// ---------- AI провайдеры ----------

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function aiOpenAICompat(prompt: string, baseUrl: string, apiKey: string, model: string): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });
  if (res.status === 429) throw Object.assign(new Error('429'), { status: 429 });
  if (!res.ok) throw new Error(`AI HTTP ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function aiPollinations(prompt: string): Promise<string> {
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
  if (res.status === 429) throw Object.assign(new Error('429'), { status: 429 });
  if (!res.ok) throw new Error(`Pollinations: HTTP ${res.status}`);
  return res.text();
}

const BACKEND_URL = import.meta.env.VITE_API_URL as string | undefined;

async function aiBackend(prompt: string): Promise<string> {
  if (!BACKEND_URL) throw new Error('no backend');
  const res = await fetch(`${BACKEND_URL}/api/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (res.status === 429) throw Object.assign(new Error('429'), { status: 429 });
  if (!res.ok) throw new Error(`Backend: HTTP ${res.status}`);
  const data = await res.json();
  return data.text ?? '';
}

function getApiConfig(): { baseUrl: string; key: string; model: string } | null {
  const groqKey = localStorage.getItem('groq-api-key');
  if (groqKey) return { baseUrl: 'https://api.groq.com/openai/v1', key: groqKey, model: 'llama-3.3-70b-versatile' };
  const orKey = localStorage.getItem('openrouter-api-key');
  if (orKey) return { baseUrl: 'https://openrouter.ai/api/v1', key: orKey, model: 'meta-llama/llama-3.3-70b-instruct:free' };
  return null;
}

async function ai(prompt: string, attempt = 0): Promise<string> {
  const cfg = getApiConfig();

  // Пользовательский ключ (Groq / OpenRouter)
  if (cfg) {
    try {
      return await aiOpenAICompat(prompt, cfg.baseUrl, cfg.key, cfg.model);
    } catch (e: any) {
      const is429 = e?.status === 429 || e?.message === '429';
      const isNetwork = e instanceof TypeError;
      if ((is429 || isNetwork) && attempt < 4) {
        await sleep([3000, 6000, 12000, 24000][attempt]);
        return ai(prompt, attempt + 1);
      }
      if (is429) throw new Error('Сервис AI перегружен — попробуйте через минуту');
      throw e;
    }
  }

  // Бэкенд (Gemini на Vercel)
  if (BACKEND_URL) {
    try {
      return await aiBackend(prompt);
    } catch {
      // Backend вернул 4xx/5xx или недоступен — фолбек на Pollinations
    }
  }

  // Фолбек: Pollinations (бесплатно, без ключа)
  try {
    return await aiPollinations(prompt);
  } catch (e: any) {
    const is429 = e?.status === 429 || e?.message === '429';
    const isNetwork = e instanceof TypeError;
    if ((is429 || isNetwork) && attempt < 4) {
      await sleep([3000, 6000, 12000, 24000][attempt]);
      return ai(prompt, attempt + 1);
    }
    if (is429) throw new Error('Сервис AI перегружен — попробуйте через минуту');
    if (isNetwork) throw new Error('Нет соединения с AI сервисом — проверьте интернет и попробуйте снова');
    throw e;
  }
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

const LEVEL_INFO: Record<string, { label: string; adapt: string }> = {
  spo: {
    label: 'студент СПО (среднее профессиональное образование)',
    adapt: 'Темы и язык изложения — прикладные, конкретные, без излишней теоретизации. Акцент на практическую значимость для будущей профессии. Исследование опирается на наблюдение, опросы, анализ документов или сравнение практик — без сложного математического аппарата. Объект и предмет формулируются через конкретную профессиональную ситуацию или задачу.',
  },
  vuz: {
    label: 'студент вуза (бакалавриат или магистратура)',
    adapt: 'Темы — академически значимые, с научным потенциалом. Допустимы теоретические обобщения, анализ научных школ, построение моделей. Магистратура — возможен авторский вклад, новая методика или теоретическая концепция. Объект и предмет формулируются в научных категориях.',
  },
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
  const hasDirection = direction && direction.trim();
  const hasSubject = subjectArea && subjectArea.trim();
  return `Ты — опытный научный руководитель. Отвечай ТОЛЬКО на русском языке.

Проанализируй учебный материал и предложи исследовательские темы, строго адаптированные под конкретного студента.

═══ ПРОФИЛЬ СТУДЕНТА ═══
Уровень: ${lv.label}
${hasDirection ? `Направление подготовки / специальность: ${direction}` : ''}
${hasSubject ? `Дисциплина / предмет: ${subjectArea}` : ''}
Тип работы: ${wi.name} (объём ${wi.volume})
Сложность: ${df.label} — ${df.desc}

═══ ПРАВИЛА АДАПТАЦИИ ═══
${lv.adapt}
${hasDirection ? `— Все темы должны быть непосредственно связаны со специальностью «${direction}» и решать задачи, актуальные именно для этой сферы.` : ''}
${hasSubject ? `— Темы формулируются в контексте дисциплины «${subjectArea}»: используй её понятийный аппарат, методы и проблематику.` : ''}
— Тип работы ${wi.name}: глубина раскрытия и сложность методов должны соответствовать объёму ${wi.volume}.
— Сложность «${df.label}»: ${df.desc}.

═══ УЧЕБНЫЙ МАТЕРИАЛ ═══
${text.slice(0, 5000)}

Найди 5–8 тем. Каждая тема должна:
1. Вытекать из учебного материала выше и быть привязана к специальности/дисциплине студента
2. Содержать реальную исследовательскую проблему или противоречие
3. Быть посильной для данного уровня и сложности
4. Быть актуальной — связана с современными вызовами в данной отрасли

Верни строго в формате JSON (все значения на русском языке):
{
  "topics": [
    {
      "title": "Академическая формулировка темы — конкретная, с указанием объекта исследования",
      "angle": "Исследовательский ракурс: какую именно проблему решаем и в контексте какой специальности/дисциплины (1–2 предложения)",
      "why": "Почему эта тема актуальна для данной отрасли/специальности именно сейчас (1 предложение)"
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
  const hasDirection = direction && direction.trim();
  const hasSubject = subjectArea && subjectArea.trim();
  return `Ты — опытный научный руководитель. Отвечай ТОЛЬКО на русском языке.

Разработай полноценное научное обоснование темы, строго адаптированное под студента.

═══ ТЕМА И РАКУРС ═══
Тема: «${topic}»
Исследовательский ракурс: ${angle}

═══ ПРОФИЛЬ СТУДЕНТА ═══
Уровень: ${lv.label}
${hasDirection ? `Специальность: ${direction}` : ''}
${hasSubject ? `Дисциплина: ${subjectArea}` : ''}
Тип работы: ${wi.name} (объём ${wi.volume})
Сложность: ${df.label} — ${df.desc}

═══ ПРАВИЛА АДАПТАЦИИ ═══
${lv.adapt}
${hasDirection ? `— Объект и предмет исследования формулируются через понятия специальности «${direction}».` : ''}
${hasSubject ? `— Актуальность и новизна обосновываются через проблематику дисциплины «${subjectArea}».` : ''}
— Гипотеза должна соответствовать уровню сложности «${df.label}»: ${df.desc}.
— Язык изложения — соответствующий уровню ${lv.label}.

Верни строго в формате JSON (все значения на русском языке):
{
  "topic": "Уточнённая формулировка темы — конкретная, с объектом и предметом, адаптированная под специальность",
  "object": "Объект исследования — широкая область в контексте специальности студента",
  "subject": "Предмет исследования — конкретный аспект, изучаемый в рамках дисциплины",
  "relevance": "Актуальность: 2–3 предложения — проблемы и противоречия в данной отрасли/дисциплине сегодня",
  "novelty": "Научная новизна: 1–2 предложения — что нового вносит работа на данном уровне подготовки",
  "hypothesis": "Гипотеза: одно предложение-предположение, проверяемое методами, доступными студенту данного уровня"
}`;
}

function planPrompt(topic: string, object: string, subject: string, workType: string, level: string, difficulty: string, direction: string, subjectArea: string) {
  const wi = WORK_INFO[workType] ?? WORK_INFO.coursework;
  const lv = LEVEL_INFO[level] ?? LEVEL_INFO.vuz;
  const df = DIFFICULTY_INFO[difficulty] ?? DIFFICULTY_INFO.standard;
  const hasDirection = direction && direction.trim();
  const hasSubject = subjectArea && subjectArea.trim();
  return `Ты — научный руководитель. Отвечай ТОЛЬКО на русском языке.

Составь подробный план работы как пошаговую инструкцию для конкретного студента.

═══ ТЕМА ═══
Тема: «${topic}»
Объект: ${object}
Предмет: ${subject}

═══ ПРОФИЛЬ СТУДЕНТА ═══
Уровень: ${lv.label}
${hasDirection ? `Специальность: ${direction}` : ''}
${hasSubject ? `Дисциплина: ${subjectArea}` : ''}
Тип работы: ${wi.name}
Структура: ${wi.structure}
Объём: ${wi.volume}
Сложность: ${df.label} — ${df.desc}

═══ ПРАВИЛА АДАПТАЦИИ ═══
${lv.adapt}
${hasDirection ? `— Задачи, методы и ожидаемый результат формулируются через задачи специальности «${direction}».` : ''}
${hasSubject ? `— Главы и их содержание опираются на понятийный аппарат дисциплины «${subjectArea}».` : ''}
— Методы исследования — только те, что реально доступны и посильны для уровня «${lv.label}» при сложности «${df.label}».
— Описания глав — конкретные инструкции: что читать, что анализировать, что сделать руками.

Верни строго в формате JSON (все значения на русском языке):
{
  "goal": "Цель — одно предложение, глагол + конкретный результат в контексте специальности",
  "objectives": [
    "Задача 1 — конкретное измеримое действие",
    "Задача 2",
    "Задача 3",
    "Задача 4",
    "Задача 5"
  ],
  "keywords": ["термин из специальности", "ключевое слово 2", "ключевое слово 3"],
  "chapters": [
    {
      "number": 1,
      "title": "Название главы",
      "description": "Конкретная инструкция студенту: что изучить, какие источники проработать, что проанализировать, какой промежуточный результат получить"
    }
  ],
  "methods": ["метод, доступный данному уровню", "метод 2"],
  "expectedResult": "Конкретный практический или теоретический результат, значимый для данной специальности"
}

Задач — 5–7. Глав — согласно структуре ${wi.name}. Методов — 3–5, строго соответствующих уровню и сложности.`;
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
  topic: string, object: string, subject: string, workType: WorkType, level: Level, difficulty: Difficulty, direction: string, subjectArea: string
): Promise<PlanResult> {
  const text = await ai(planPrompt(topic, object, subject, workType, level, difficulty, direction, subjectArea));
  return extractJson(text) as PlanResult;
}

// ---------- Литература ----------

async function translateToEnglish(text: string): Promise<string> {
  try {
    const result = await ai(
      `Translate to English for academic database search. Return only the translation, no explanations:\n"${text}"`
    );
    return result.trim().replace(/^["']|["']$/g, '');
  } catch {
    return text;
  }
}

async function fetchOpenAlex(query: string, count: number): Promise<LiteratureSource[]> {
  const q = encodeURIComponent(query);
  const r = await fetch(
    `https://api.openalex.org/works?search=${q}&per-page=${count}&filter=has_doi:true&sort=cited_by_count:desc`
  );
  if (!r.ok) throw new Error(`OpenAlex: HTTP ${r.status}`);
  const d = await r.json();
  const out: LiteratureSource[] = [];
  for (const w of (d.results ?? [])) {
    if (!w.title) continue;
    const doi = w.doi?.replace('https://doi.org/', '');
    out.push({
      title: w.title,
      authors: (w.authorships ?? []).slice(0, 5).map((a: any) => a.author?.display_name ?? ''),
      year: w.publication_year,
      source: w.primary_location?.source?.display_name,
      doi,
      url: w.doi ?? w.open_access?.oa_url ?? undefined,
      language: guessLang(w.title),
    });
  }
  return out;
}

async function generateAiLiterature(topic: string, keywords: string[], count: number): Promise<LiteratureSource[]> {
  const prompt = `Ты — библиограф. Составь список из ${count} реальных научных источников по теме: «${topic}».
Ключевые слова: ${keywords.join(', ')}.
Включи русскоязычные статьи из журналов ВАК, РИНЦ, КиберЛенинки и международные статьи.
Верни строго JSON (без пояснений):
{
  "sources": [
    {
      "title": "Название статьи или книги",
      "authors": ["Фамилия И.О."],
      "year": 2022,
      "source": "Название журнала или издательства",
      "url": "https://cyberleninka.ru/article/n/... или https://doi.org/...",
      "language": "ru"
    }
  ]
}
Используй реальные, существующие публикации. Язык полей — соответствующий оригиналу (ru или en).`;
  const text = await ai(prompt);
  const data = extractJson(text);
  return (data.sources ?? []).map((s: any) => ({
    title: s.title ?? '',
    authors: Array.isArray(s.authors) ? s.authors : [],
    year: s.year,
    source: s.source,
    doi: undefined,
    url: s.url,
    language: s.language === 'ru' ? 'ru' : 'en',
  })) as LiteratureSource[];
}

export async function searchLiterature(topic: string, keywords: string[], count = 10): Promise<LiteratureSource[]> {
  // Используем бэкенд если доступен — он обходит CORS и использует КиберЛенинку
  if (BACKEND_URL) {
    try {
      const r = await fetch(`${BACKEND_URL}/api/literature/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, keywords, count }),
      });
      if (r.ok) {
        const data = await r.json();
        const sources = (data.sources ?? []) as LiteratureSource[];
        if (sources.length > 0) return sources;
      }
    } catch { /* fallback to client-side */ }
  }

  // Фолбек: клиентский поиск через OpenAlex (поддерживает CORS) + AI
  const results: LiteratureSource[] = [];
  const enQuery = await translateToEnglish(keywords.length > 0 ? keywords.slice(0, 4).join(' ') : topic);

  try {
    const items = await fetchOpenAlex(enQuery, Math.ceil(count * 0.6));
    results.push(...items);
  } catch { /* fallthrough */ }

  const need = count - results.length;
  if (need > 0) {
    try {
      const aiItems = await generateAiLiterature(topic, keywords, need + 2);
      results.push(...aiItems);
    } catch { /* ignore */ }
  }

  if (results.length === 0) {
    throw new Error('Источники не найдены. Проверьте подключение к интернету и попробуйте снова.');
  }

  const seen = new Set<string>();
  return results.filter(r => {
    const key = r.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, count);
}

function guessLang(title?: string): 'ru' | 'en' | 'unknown' {
  if (!title) return 'unknown';
  return /[а-яё]/i.test(title) ? 'ru' : 'en';
}
