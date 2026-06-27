export type WorkType = 'article' | 'thesis' | 'coursework' | 'vkr' | 'practical';
export type Level = 'spo' | 'vuz';
export type Theme = 'dark' | 'light' | 'gold';
export type Difficulty = 'basic' | 'standard' | 'advanced';

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  article: 'Научная статья',
  thesis: 'Тезисы доклада',
  coursework: 'Курсовая работа',
  vkr: 'ВКР',
  practical: 'Практический проект',
};

export const LEVEL_LABELS: Record<Level, string> = {
  spo: 'СПО',
  vuz: 'ВУЗ',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  basic: 'Базовый',
  standard: 'Стандартный',
  advanced: 'Продвинутый',
};

export const DIFFICULTY_DESC: Record<Difficulty, string> = {
  basic: 'Обзорная работа, преимущественно теория, 1–2 метода',
  standard: 'Теория + практический анализ, 3–4 метода',
  advanced: 'Оригинальное исследование, эксперимент или разработка, 5+ методов',
};

export const DIRECTIONS = [
  'Информационные технологии',
  'Экономика и управление',
  'Педагогическое образование',
  'Юриспруденция',
  'Технические науки',
  'Естественные науки',
  'Гуманитарные науки',
  'Медицина и здравоохранение',
  'Сельское хозяйство',
  'Архитектура и строительство',
];

export interface Chapter {
  number: number;
  title: string;
  description: string;
}

export interface LiteratureSource {
  title: string;
  authors: string[];
  year?: number;
  source?: string;
  doi?: string;
  url?: string;
  language: 'ru' | 'en' | 'unknown';
}
