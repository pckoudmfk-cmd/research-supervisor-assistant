import { ArrowRight, FileText, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { generateResearchPlan } from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { WORK_TYPE_LABELS, LEVEL_LABELS } from '../types';
import styles from './ResearchPlanPage.module.css';

export function ResearchPlanPage() {
  const navigate = useNavigate();
  const { selectedTopic, workType, level, researchPlan, setResearchPlan, loadingPlan, setLoadingPlan } = useAppStore();

  const handleGenerate = async () => {
    if (!selectedTopic) return;
    setLoadingPlan(true);
    try {
      const plan = await generateResearchPlan(selectedTopic, workType, level);
      setResearchPlan(plan);
    } finally {
      setLoadingPlan(false);
    }
  };

  if (!selectedTopic) {
    return (
      <div className={styles.empty}>
        <p>Сначала выберите тему в модуле 1</p>
        <Button variant="secondary" onClick={() => navigate('/')}>Перейти к модулю 1</Button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Модуль 3 — План исследования</h1>
        <p className={styles.pageDesc}>AI сгенерирует структуру работы по утверждённой теме</p>
      </div>

      <Card>
        <div className={styles.topicRow}>
          <div>
            <div className={styles.topicLabel}>Тема работы</div>
            <div className={styles.topicValue}>«{selectedTopic}»</div>
            <div className={styles.meta}>{WORK_TYPE_LABELS[workType]} · {LEVEL_LABELS[level]}</div>
          </div>
          <Button onClick={handleGenerate} loading={loadingPlan}>
            <Wand2 size={16} /> {researchPlan ? 'Пересгенерировать' : 'Создать план'}
          </Button>
        </div>
      </Card>

      {researchPlan && (
        <>
          <Card title="Структура работы" subtitle={`Ориентировочный объём: ${researchPlan.total_pages} страниц`}>
            <div className={styles.sections}>
              {researchPlan.sections.map((s, i) => (
                <div key={i} className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionIndex}>{i + 1}</div>
                    <div>
                      <div className={styles.sectionTitle}>{s.title}</div>
                      <div className={styles.sectionDesc}>{s.description}</div>
                    </div>
                    <div className={styles.pages}>
                      <FileText size={13} />
                      <span>{s.estimated_pages} стр.</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Button className={styles.nextBtn} onClick={() => navigate('/literature')}>
            Далее: поиск литературы <ArrowRight size={16} />
          </Button>
        </>
      )}
    </div>
  );
}
