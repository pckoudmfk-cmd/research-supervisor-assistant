import type { WorkType, Level, LiteratureSource, Chapter } from '../types';

// ---------- Gemini direct call ----------

async function gemini(prompt: string, jsonMode = false): Promise<string> {
  const key = localStorage.getItem('gemini-api-key') ?? '';
  if (!key) throw new Error('API_KEY_MISSING');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: jsonMode ? 0.3 : 0.7,
          maxOutputTokens: 3000,
          ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

function extractJson(text: string): any {
  const match = text.match(/```(?:json)?\s*([\s\S]+?)```/);
  const cleaned = match ? match[1].trim() : text.trim();
  const start = cleaned.indexOf('{');
  return JSON.parse(start !== -1 ? cleaned.slice(start) : cleaned);
}

// ---------- Prompts ----------

function ktpPrompt(text: string) {
  return `Ты — ассистент преподавателя. Из текста КТП или рабочей программы извлеки список учебных тем.

Текст:
${text.slice(0, 5000)}

Требования:
- Только конкретные учебные темы (не разделы, не номера занятий)
- Каждая тема — отдельная строка
- Без нумерации, без лишних символов
- Не более 20 самых содержательных тем

Выведи только список тем, без пояснений.`;
}

function formulationPrompt(
  ktp_topic: string, work_type: string, level: string, direction: string, subject_area: string
) {
  const WT: Record<string, string> = {
    article: 'научная статья', thesis: 'тезисы доклада',
    coursework: 'курсовая работа', vkr: 'ВКР', practical: 'практический проект',
  };
  const LV: Record<string, string> = { spo: 'СПО', vuz: 'ВУЗ' };
  return `Ты — опытный научный руководитель. Сформулируй научную тему на основе учебной темы из КТП.

Исходная тема: «${ktp_topic}»
Тип работы: ${WT[work_type] ?? work_type}
Уровень: ${LV[level] ?? level}
Направление: ${direction}
Предметная область: ${subject_area}

Ответь строго в формате JSON:
{
  "topic": "Академическая формулировка темы",
  "relevance": "Актуальность в 3-4 предложениях",
  "novelty": "Научная новизна в 2-3 предложениях"
}`;
}

function planPrompt(topic: string, work_type: string, level: string) {
  const WT: Record<string, string> = {
    article: 'научная статья', thesis: 'тезисы доклада',
    coursework: 'курсовая работа', vkr: 'ВКР', practical: 'практический проект',
  };
  const LV: Record<string, string> = { spo: 'СПО', vuz: 'ВУЗ' };
  return `Ты — научный руководитель. Разработай план исследования.

Тема: «${topic}»
Тип работы: ${WT[work_type] ?? work_type}
Уровень: ${LV[level] ?? level}

Ответь строго в формате JSON:
{
  "goal": "Цель — одно предложение начиная с глагола",
  "objectives": ["Задача 1", "Задача 2", "Задача 3", "Задача 4", "Задача 5"],
  "keywords": ["слово1", "слово2", "слово3"],
  "chapters": [
    { "number": 1, "title": "Название главы", "description": "Краткое описание" }
  ]
}

Задач: 5-7, ключевых слов: 8-12, глав: 4-5.`;
}

// ---------- KTP ----------

export async function parseKtp(text: string): Promise<string[]> {
  const result = await gemini(ktpPrompt(text));
  return result.trim().split('\n').map(l => l.trim()).filter(Boolean).slice(0, 20);
}

export async function parseKtpFile(file: File): Promise<string[]> {
  const key = localStorage.getItem('gemini-api-key') ?? '';
  if (!key) throw new Error('API_KEY_MISSING');

  if (file.name.toLowerCase().endsWith('.pdf')) {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let b64 = '';
    for (let i = 0; i < bytes.length; i++) b64 += String.fromCharCode(bytes[i]);
    const b64Str = btoa(b64);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: 'application/pdf', data: b64Str } },
              { text: 'Из этого КТП или рабочей программы извлеки список учебных тем. Каждая тема — отдельная строка. Без нумерации и лишних символов. Не более 20 тем. Выведи только список.' },
            ],
          }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2000 },
        }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
    }
    const data = await res.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return result.trim().split('\n').map((l: string) => l.trim()).filter(Boolean).slice(0, 20);
  }

  if (file.name.toLowerCase().endsWith('.docx')) {
    const text = await readDocxText(file);
    return parseKtp(text);
  }

  const text = await file.text();
  return parseKtp(text);
}

async function readDocxText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file('word/document.xml')?.async('string') ?? '';
  return xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ---------- Formulation ----------

export interface FormulationResult { topic: string; relevance: string; novelty: string; }

export async function generateFormulation(
  ktp_topic: string, work_type: WorkType, level: Level, direction: string, subject_area: string
): Promise<FormulationResult> {
  const text = await gemini(formulationPrompt(ktp_topic, work_type, level, direction, subject_area), true);
  return extractJson(text) as FormulationResult;
}

// ---------- Plan ----------

export interface PlanResult { goal: string; objectives: string[]; keywords: string[]; chapters: Chapter[]; }

export async function generatePlan(topic: string, work_type: WorkType, level: Level): Promise<PlanResult> {
  const text = await gemini(planPrompt(topic, work_type, level), true);
  return extractJson(text) as PlanResult;
}

// ---------- Literature ----------

export async function searchLiterature(topic: string, count = 10): Promise<LiteratureSource[]> {
  const results: LiteratureSource[] = [];

  try {
    const q = encodeURIComponent(topic);
    const r = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${q}&limit=${Math.ceil(count * 0.6)}&fields=title,authors,year,venue,externalIds,openAccessPdf`
    );
    if (r.ok) {
      const d = await r.json();
      for (const p of (d.data ?? [])) {
        results.push({
          title: p.title ?? '',
          authors: (p.authors ?? []).map((a: any) => a.name),
          year: p.year,
          source: p.venue,
          doi: p.externalIds?.DOI,
          url: p.openAccessPdf?.url ?? (p.externalIds?.DOI ? `https://doi.org/${p.externalIds.DOI}` : undefined),
          language: guessLang(p.title),
        });
      }
    }
  } catch { /* ignore */ }

  try {
    const need = count - results.length;
    if (need > 0) {
      const q = encodeURIComponent(topic);
      const r = await fetch(
        `https://api.openalex.org/works?search=${q}&per-page=${need}&filter=has_doi:true&sort=cited_by_count:desc`
      );
      if (r.ok) {
        const d = await r.json();
        for (const w of (d.results ?? [])) {
          results.push({
            title: w.title ?? '',
            authors: (w.authorships ?? []).slice(0, 5).map((a: any) => a.author?.display_name ?? ''),
            year: w.publication_year,
            source: w.primary_location?.source?.display_name,
            doi: w.doi?.replace('https://doi.org/', ''),
            url: w.doi ?? w.open_access?.oa_url,
            language: guessLang(w.title),
          });
        }
      }
    }
  } catch { /* ignore */ }

  return results.slice(0, count);
}

function guessLang(title?: string): 'ru' | 'en' | 'unknown' {
  if (!title) return 'unknown';
  return /[а-яё]/i.test(title) ? 'ru' : 'en';
}
