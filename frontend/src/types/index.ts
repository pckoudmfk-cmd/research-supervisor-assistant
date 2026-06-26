export type WorkType = 'article' | 'thesis' | 'coursework' | 'vkr' | 'practical';
export type Level = 'spo' | 'vuz';
export type Theme = 'dark' | 'light' | 'gold';

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

export interface TopicGenerateRequest {
  subject_area: string;
  work_type: WorkType;
  level: Level;
  keywords?: string;
  count: number;
}

export interface ResearchPlanSection {
  title: string;
  description: string;
  estimated_pages: number;
}

export interface ResearchPlanResponse {
  topic: string;
  work_type: WorkType;
  level: Level;
  sections: ResearchPlanSection[];
  total_pages: number;
}

export interface LiteratureSource {
  title: string;
  author: string;
  year: number;
  type: 'book' | 'article' | 'online' | 'regulatory';
  publisher?: string;
  url?: string;
}

export interface LiteratureSearchResponse {
  sources: LiteratureSource[];
}
