import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { Layout } from './components/layout/Layout';
import { TopicInputPage } from './pages/TopicInputPage';
import { TopicFormulationPage } from './pages/TopicFormulationPage';
import { ResearchPlanPage } from './pages/ResearchPlanPage';
import { LiteraturePage } from './pages/LiteraturePage';

export default function App() {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<TopicInputPage />} />
          <Route path="/topic-formulation" element={<TopicFormulationPage />} />
          <Route path="/research-plan" element={<ResearchPlanPage />} />
          <Route path="/literature" element={<LiteraturePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
