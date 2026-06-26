import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkType, Level, Theme, Chapter, LiteratureSource } from '../types';

interface AppState {
  theme: Theme;

  // Шаг 1 — КТП
  ktpText: string;
  ktpTopics: string[];
  selectedKtpTopic: string;

  // Шаг 2 — Тема
  workType: WorkType;
  level: Level;
  direction: string;
  subjectArea: string;
  topicFormulation: string;
  relevance: string;
  novelty: string;

  // Шаг 3 — План
  goal: string;
  objectives: string[];
  keywords: string[];
  chapters: Chapter[];

  // Шаг 4 — Литература
  literature: LiteratureSource[];

  // Загрузка
  loadingKtp: boolean;
  loadingFormulation: boolean;
  loadingPlan: boolean;
  loadingLiterature: boolean;

  // Сеттеры
  setTheme: (v: Theme) => void;
  setKtpText: (v: string) => void;
  setKtpTopics: (v: string[]) => void;
  setSelectedKtpTopic: (v: string) => void;
  setWorkType: (v: WorkType) => void;
  setLevel: (v: Level) => void;
  setDirection: (v: string) => void;
  setSubjectArea: (v: string) => void;
  setTopicFormulation: (v: string) => void;
  setRelevance: (v: string) => void;
  setNovelty: (v: string) => void;
  setGoal: (v: string) => void;
  setObjectives: (v: string[]) => void;
  setKeywords: (v: string[]) => void;
  setChapters: (v: Chapter[]) => void;
  setLiterature: (v: LiteratureSource[]) => void;
  setLoadingKtp: (v: boolean) => void;
  setLoadingFormulation: (v: boolean) => void;
  setLoadingPlan: (v: boolean) => void;
  setLoadingLiterature: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      ktpText: '',
      ktpTopics: [],
      selectedKtpTopic: '',
      workType: 'coursework',
      level: 'vuz',
      direction: '',
      subjectArea: '',
      topicFormulation: '',
      relevance: '',
      novelty: '',
      goal: '',
      objectives: [],
      keywords: [],
      chapters: [],
      literature: [],
      loadingKtp: false,
      loadingFormulation: false,
      loadingPlan: false,
      loadingLiterature: false,

      setTheme: (theme) => set({ theme }),
      setKtpText: (ktpText) => set({ ktpText }),
      setKtpTopics: (ktpTopics) => set({ ktpTopics }),
      setSelectedKtpTopic: (selectedKtpTopic) => set({ selectedKtpTopic }),
      setWorkType: (workType) => set({ workType }),
      setLevel: (level) => set({ level }),
      setDirection: (direction) => set({ direction }),
      setSubjectArea: (subjectArea) => set({ subjectArea }),
      setTopicFormulation: (topicFormulation) => set({ topicFormulation }),
      setRelevance: (relevance) => set({ relevance }),
      setNovelty: (novelty) => set({ novelty }),
      setGoal: (goal) => set({ goal }),
      setObjectives: (objectives) => set({ objectives }),
      setKeywords: (keywords) => set({ keywords }),
      setChapters: (chapters) => set({ chapters }),
      setLiterature: (literature) => set({ literature }),
      setLoadingKtp: (loadingKtp) => set({ loadingKtp }),
      setLoadingFormulation: (loadingFormulation) => set({ loadingFormulation }),
      setLoadingPlan: (loadingPlan) => set({ loadingPlan }),
      setLoadingLiterature: (loadingLiterature) => set({ loadingLiterature }),
    }),
    {
      name: 'rsa-v2',
      partialize: (s) => ({ theme: s.theme, workType: s.workType, level: s.level }),
    }
  )
);
