import type { WorkType, Level, LiteratureSource, Chapter } from '../types';

// ---------- Pollinations.ai — бесплатно, без ключей ----------

async function ai(prompt: string): Promise<string> {
  const res = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai',
      seed: 42,
      private: true,
    }),
  });

  if (!res.ok) throw new Error(`Ошибка сервиса AI: HTTP ${res.status}`);
  return res.text();
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

Ответь строго в формате JSON (без лишнего текста):
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

Ответь строго в формате JSON (без лишнего текста):
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
  const result = await ai(ktpPrompt(text));
  return result.trim().split('\n').map(l => l.trim()).filter(Boolean).slice(0, 20);
}

export async function parseKtpFile(file: File): Promise<string[]> {
  let text = '';
  if (file.name.toLowerCase().endsWith('.pdf')) {
    text = await readPdfText(file);
  } else if (file.name.toLowerCase().endsWith('.docx')) {
    text = await readDocxText(file);
  } else {
    text = await file.text();
  }
  if (!text.trim()) throw new Error('Файл не содержит текста');
  return parseKtp(text);
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

// ---------- Formulation ----------

export interface FormulationResult { topic: string; relevance: string; novelty: string; }

export async function generateFormulation(
  ktp_topic: string, work_type: WorkType, level: Level, direction: string, subject_area: string
): Promise<FormulationResult> {
  const text = await ai(formulationPrompt(ktp_topic, work_type, level, direction, subject_area));
  return extractJson(text) as FormulationResult;
}

// ---------- Plan ----------

export interface PlanResult { goal: string; objectives: string[]; keywords: string[]; chapters: Chapter[]; }

export async function generatePlan(topic: string, work_type: WorkType, level: Level): Promise<PlanResult> {
  const text = await ai(planPrompt(topic, work_type, level));
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
