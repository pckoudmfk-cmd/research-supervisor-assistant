import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkType, Level, Theme, Difficulty, Chapter, LiteratureSource } from '../types';
import type { KtpTopic } from '../utils/api';

interface AppState {
  theme: Theme;
  workType: WorkType;
  level: Level;
  difficulty: Difficulty;
  direction: string;
  subjectArea: string;

  ktpText: string;
  ktpTopics: KtpTopic[];
  selectedKtpTopic: KtpTopic | null;

  topicFormulation: string;
  topicObject: string;
  topicSubject: string;
  relevance: string;
  novelty: string;
  hypothesis: string;

  goal: string;
  objectives: string[];
  keywords: string[];
  chapters: Chapter[];
  methods: string[];
  expectedResult: string;

  literature: LiteratureSource[];

  loadingKtp: boolean;
  loadingFormulation: boolean;
  loadingPlan: boolean;
  loadingLiterature: boolean;

  setTheme: (v: Theme) => void;
  setWorkType: (v: WorkType) => void;
  setLevel: (v: Level) => void;
  setDifficulty: (v: Difficulty) => void;
  setDirection: (v: string) => void;
  setSubjectArea: (v: string) => void;
  setKtpText: (v: string) => void;
  setKtpTopics: (v: KtpTopic[]) => void;
  setSelectedKtpTopic: (v: KtpTopic | null) => void;
  setTopicFormulation: (v: string) => void;
  setTopicObject: (v: string) => void;
  setTopicSubject: (v: string) => void;
  setRelevance: (v: string) => void;
  setNovelty: (v: string) => void;
  setHypothesis: (v: string) => void;
  setGoal: (v: string) => void;
  setObjectives: (v: string[]) => void;
  setKeywords: (v: string[]) => void;
  setChapters: (v: Chapter[]) => void;
  setMethods: (v: string[]) => void;
  setExpectedResult: (v: string) => void;
  setLiterature: (v: LiteratureSource[]) => void;
  setLoadingKtp: (v: boolean) => void;
  setLoadingFormulation: (v: boolean) => void;
  setLoadingPlan: (v: boolean) => void;
  setLoadingLiterature: (v: boolean) => void;
  resetKtp: () => void;
  resetLiterature: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      workType: 'coursework',
      level: 'vuz',
      difficulty: 'standard',
      direction: '',
      subjectArea: '',
      ktpText: '',
      ktpTopics: [],
      selectedKtpTopic: null,
      topicFormulation: '',
      topicObject: '',
      topicSubject: '',
      relevance: '',
      novelty: '',
      hypothesis: '',
      goal: '',
      objectives: [],
      keywords: [],
      chapters: [],
      methods: [],
      expectedResult: '',
      literature: [],
      loadingKtp: false,
      loadingFormulation: false,
      loadingPlan: false,
      loadingLiterature: false,

      setTheme: (theme) => set({ theme }),
      setWorkType: (workType) => set({ workType }),
      setLevel: (level) => set({ level }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setDirection: (direction) => set({ direction }),
      setSubjectArea: (subjectArea) => set({ subjectArea }),
      setKtpText: (ktpText) => set({ ktpText }),
      setKtpTopics: (ktpTopics) => set({ ktpTopics }),
      setSelectedKtpTopic: (selectedKtpTopic) => set({ selectedKtpTopic }),
      setTopicFormulation: (topicFormulation) => set({ topicFormulation }),
      setTopicObject: (topicObject) => set({ topicObject }),
      setTopicSubject: (topicSubject) => set({ topicSubject }),
      setRelevance: (relevance) => set({ relevance }),
      setNovelty: (novelty) => set({ novelty }),
      setHypothesis: (hypothesis) => set({ hypothesis }),
      setGoal: (goal) => set({ goal }),
      setObjectives: (objectives) => set({ objectives }),
      setKeywords: (keywords) => set({ keywords }),
      setChapters: (chapters) => set({ chapters }),
      setMethods: (methods) => set({ methods }),
      setExpectedResult: (expectedResult) => set({ expectedResult }),
      setLiterature: (literature) => set({ literature }),
      setLoadingKtp: (loadingKtp) => set({ loadingKtp }),
      setLoadingFormulation: (loadingFormulation) => set({ loadingFormulation }),
      setLoadingPlan: (loadingPlan) => set({ loadingPlan }),
      setLoadingLiterature: (loadingLiterature) => set({ loadingLiterature }),
      resetKtp: () => set({
        ktpText: '', ktpTopics: [], selectedKtpTopic: null,
        topicFormulation: '', topicObject: '', topicSubject: '',
        relevance: '', novelty: '', hypothesis: '',
        goal: '', objectives: [], keywords: [], chapters: [], methods: [], expectedResult: '',
        literature: [],
      }),
      resetLiterature: () => set({ literature: [] }),
    }),
    {
      name: 'rsa-v4',
      partialize: (s) => ({
        theme: s.theme,
        workType: s.workType,
        level: s.level,
        difficulty: s.difficulty,
        direction: s.direction,
        subjectArea: s.subjectArea,
        ktpText: s.ktpText,
        ktpTopics: s.ktpTopics,
        selectedKtpTopic: s.selectedKtpTopic,
        topicFormulation: s.topicFormulation,
        topicObject: s.topicObject,
        topicSubject: s.topicSubject,
        relevance: s.relevance,
        novelty: s.novelty,
        hypothesis: s.hypothesis,
        goal: s.goal,
        objectives: s.objectives,
        keywords: s.keywords,
        chapters: s.chapters,
        methods: s.methods,
        expectedResult: s.expectedResult,
        literature: s.literature,
      }),
    }
  )
);
