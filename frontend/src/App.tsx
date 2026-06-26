import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { Layout } from './components/layout/Layout';
import { KtpPage } from './pages/KtpPage';
import { TopicPage } from './pages/TopicPage';
import { PlanPage } from './pages/PlanPage';
import { LiteraturePage } from './pages/LiteraturePage';
import { SummaryPage } from './pages/SummaryPage';

export default function App() {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<KtpPage />} />
          <Route path="/topic" element={<TopicPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/literature" element={<LiteraturePage />} />
          <Route path="/summary" element={<SummaryPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
