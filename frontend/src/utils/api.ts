import axios from 'axios';
import type { WorkType, Level, LiteratureSource, Chapter } from '../types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const api = axios.create({ baseURL: `${BASE}/api` });

// КТП
export const parseKtp = (text: string) =>
  api.post<{ topics: string[] }>('/ktp/parse', { text }).then((r) => r.data.topics);

export const parseKtpFile = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post<{ topics: string[] }>('/ktp/parse-file', form).then((r) => r.data.topics);
};

// Формулировка темы
export interface FormulationResult {
  topic: string;
  relevance: string;
  novelty: string;
}
export const generateFormulation = (
  ktp_topic: string,
  work_type: WorkType,
  level: Level,
  direction: string,
  subject_area: string
) =>
  api
    .post<FormulationResult>('/formulation/generate', { ktp_topic, work_type, level, direction, subject_area })
    .then((r) => r.data);

// План
export interface PlanResult {
  goal: string;
  objectives: string[];
  keywords: string[];
  chapters: Chapter[];
}
export const generatePlan = (topic: string, work_type: WorkType, level: Level) =>
  api.post<PlanResult>('/plan/generate', { topic, work_type, level }).then((r) => r.data);

// Литература
export const searchLiterature = (topic: string, count = 10) =>
  api
    .post<{ sources: LiteratureSource[] }>('/literature/search', { topic, count })
    .then((r) => r.data.sources);
