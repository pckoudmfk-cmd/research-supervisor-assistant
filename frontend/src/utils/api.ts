import axios from 'axios';
import type {
  TopicGenerateRequest,
  ResearchPlanResponse,
  LiteratureSearchResponse,
  WorkType,
  Level,
} from '../types';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export const generateTopics = (req: TopicGenerateRequest) =>
  api.post<{ topics: string[] }>('/topics/generate', req).then((r) => r.data.topics);

export const generateTopicsFromFile = (file: File, work_type: WorkType, level: Level, count: number) => {
  const form = new FormData();
  form.append('file', file);
  form.append('work_type', work_type);
  form.append('level', level);
  form.append('count', String(count));
  return api.post<{ topics: string[] }>('/topics/generate-from-file', form).then((r) => r.data.topics);
};

export const generateResearchPlan = (topic: string, work_type: WorkType, level: Level) =>
  api.post<ResearchPlanResponse>('/research-plan/generate', { topic, work_type, level }).then((r) => r.data);

export const searchLiterature = (topic: string, work_type: WorkType, level: Level, count: number) =>
  api.post<LiteratureSearchResponse>('/literature/search', { topic, work_type, level, count }).then((r) => r.data.sources);
