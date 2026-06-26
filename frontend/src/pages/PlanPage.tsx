import { useNavigate } from 'react-router-dom';
import { Wand2, ArrowRight, Target, ListTodo, Tag, BookOpen } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { generatePlan } from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import styles from './PlanPage.module.css';

export function PlanPage() {
  const navigate = useNavigate();
  const {
    topicFormulation, workType, level,
    goal, setGoal,
    objectives, setObjectives,
    keywords, setKeywords,
    chapters, setChapters,
    loadingPlan, setLoadingPlan,
  } = useAppStore();

  const handleGenerate = async () => {
    if (!topicFormulation) return;
    setLoadingPlan(true);
    try {
      const result = await generatePlan(topicFormulation, workType, level);
      setGoal(result.goal);
      setObjectives(result.objectives);
      setKeywords(result.keywords);
      setChapters(result.chapters);
    } finally {
      setLoadingPlan(false);
    }
  };

  if (!topicFormulation) {
    return (
      <div className={styles.empty}>
        <p>Сначала сформулируйте тему на шаге 2</p>
        <Button variant="secondary" onClick={() => navigate('/topic')}>К формулировке темы</Button>
      </div>
    );
  }

  const hasPlan = goal || objectives.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>План исследования</h1>
        <p className={styles.desc}>
          AI разработает подробный план: цель, задачи, ключевые слова и структуру глав.
        </p>
      </div>

      <Card>
        <div className={styles.topicRow}>
          <div>
            <div className={styles.topicLabel}>Тема</div>
            <div className={styles.topicValue}>«{topicFormulation}»</div>
          </div>
          <Button onClick={handleGenerate} loading={loadingPlan}>
            <Wand2 size={16} /> {hasPlan ? 'Пересгенерировать' : 'Разработать план'}
          </Button>
        </div>
      </Card>

      {hasPlan && (
        <>
          <div className={styles.planGrid}>
            <Card>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <Target size={16} className={styles.icon} /> Цель исследования
                </div>
                <p className={styles.goalText}>{goal}</p>
              </div>
            </Card>

            <Card>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <Tag size={16} className={styles.icon} /> Ключевые слова
                </div>
                <div className={styles.keywords}>
                  {keywords.map((kw, i) => (
                    <span key={i} className={styles.keyword}>{kw}</span>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <ListTodo size={16} className={styles.icon} /> Задачи исследования
              </div>
              <ol className={styles.objectives}>
                {objectives.map((obj, i) => (
                  <li key={i} className={styles.objective}>
                    <span className={styles.objNum}>{i + 1}</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Card>

          <Card title="Структура работы">
            <div className={styles.chapters}>
              {chapters.map((ch) => (
                <div key={ch.number} className={styles.chapter}>
                  <div className={styles.chapterNum}>
                    <BookOpen size={14} />
                    <span>Глава {ch.number}</span>
                  </div>
                  <div className={styles.chapterTitle}>{ch.title}</div>
                  <div className={styles.chapterDesc}>{ch.description}</div>
                </div>
              ))}
            </div>
          </Card>

          <Button onClick={() => navigate('/literature')}>
            Далее: поиск литературы <ArrowRight size={16} />
          </Button>
        </>
      )}
    </div>
  );
}
