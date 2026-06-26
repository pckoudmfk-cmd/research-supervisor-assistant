import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkType, Level, Theme, ResearchPlanResponse, LiteratureSource } from '../types';

interface AppState {
  // Settings
  theme: Theme;
  workType: WorkType;
  level: Level;

  // Module 1 — Topic input
  subjectArea: string;
  keywords: string;
  topicCount: number;
  generatedTopics: string[];
  selectedTopic: string;

  // Module 3 — Research plan
  researchPlan: ResearchPlanResponse | null;

  // Module 4 — Literature
  literature: LiteratureSource[];

  // Loading states
  loadingTopics: boolean;
  loadingPlan: boolean;
  loadingLiterature: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  setWorkType: (wt: WorkType) => void;
  setLevel: (level: Level) => void;
  setSubjectArea: (v: string) => void;
  setKeywords: (v: string) => void;
  setTopicCount: (n: number) => void;
  setGeneratedTopics: (topics: string[]) => void;
  setSelectedTopic: (topic: string) => void;
  setResearchPlan: (plan: ResearchPlanResponse | null) => void;
  setLiterature: (sources: LiteratureSource[]) => void;
  setLoadingTopics: (v: boolean) => void;
  setLoadingPlan: (v: boolean) => void;
  setLoadingLiterature: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      workType: 'coursework',
      level: 'vuz',
      subjectArea: '',
      keywords: '',
      topicCount: 5,
      generatedTopics: [],
      selectedTopic: '',
      researchPlan: null,
      literature: [],
      loadingTopics: false,
      loadingPlan: false,
      loadingLiterature: false,

      setTheme: (theme) => set({ theme }),
      setWorkType: (workType) => set({ workType }),
      setLevel: (level) => set({ level }),
      setSubjectArea: (subjectArea) => set({ subjectArea }),
      setKeywords: (keywords) => set({ keywords }),
      setTopicCount: (topicCount) => set({ topicCount }),
      setGeneratedTopics: (generatedTopics) => set({ generatedTopics }),
      setSelectedTopic: (selectedTopic) => set({ selectedTopic }),
      setResearchPlan: (researchPlan) => set({ researchPlan }),
      setLiterature: (literature) => set({ literature }),
      setLoadingTopics: (loadingTopics) => set({ loadingTopics }),
      setLoadingPlan: (loadingPlan) => set({ loadingPlan }),
      setLoadingLiterature: (loadingLiterature) => set({ loadingLiterature }),
    }),
    { name: 'rsa-storage', partialize: (s) => ({ theme: s.theme, workType: s.workType, level: s.level }) }
  )
);
