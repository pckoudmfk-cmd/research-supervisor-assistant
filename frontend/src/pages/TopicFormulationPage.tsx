import { useState } from 'react';
import { ArrowRight, Edit3, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { WORK_TYPE_LABELS, LEVEL_LABELS } from '../types';
import styles from './TopicFormulationPage.module.css';

export function TopicFormulationPage() {
  const navigate = useNavigate();
  const { selectedTopic, setSelectedTopic, workType, level } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(selectedTopic);

  const handleSave = () => {
    setSelectedTopic(draft);
    setEditing(false);
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
        <h1 className={styles.pageTitle}>Модуль 2 — Формулировка темы AI</h1>
        <p className={styles.pageDesc}>Просмотрите и скорректируйте сформулированную тему</p>
      </div>

      <Card title="Параметры работы">
        <div className={styles.params}>
          <div className={styles.param}><span className={styles.paramLabel}>Тип работы</span><span className={styles.paramValue}>{WORK_TYPE_LABELS[workType]}</span></div>
          <div className={styles.param}><span className={styles.paramLabel}>Уровень</span><span className={styles.paramValue}>{LEVEL_LABELS[level]}</span></div>
        </div>
      </Card>

      <Card title="Формулировка темы" subtitle="AI подготовил академическую формулировку на основе вашего выбора">
        {editing ? (
          <>
            <Textarea rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} />
            <div className={styles.editActions}>
              <Button onClick={handleSave}><CheckCircle size={15} /> Сохранить</Button>
              <Button variant="secondary" onClick={() => { setDraft(selectedTopic); setEditing(false); }}>Отмена</Button>
            </div>
          </>
        ) : (
          <div className={styles.topicDisplay}>
            <blockquote className={styles.topicText}>«{selectedTopic}»</blockquote>
            <Button variant="ghost" size="sm" onClick={() => { setDraft(selectedTopic); setEditing(true); }}>
              <Edit3 size={14} /> Редактировать
            </Button>
          </div>
        )}
      </Card>

      <Card title="Рекомендации по теме">
        <ul className={styles.tips}>
          <li>Тема соответствует уровню <strong>{LEVEL_LABELS[level]}</strong> и типу <strong>{WORK_TYPE_LABELS[workType]}</strong></li>
          <li>Формулировка содержит конкретный объект и предмет исследования</li>
          <li>При необходимости уточните тему с помощью редактирования выше</li>
          <li>Утверждённую тему можно использовать для генерации плана и подбора литературы</li>
        </ul>
      </Card>

      <Button className={styles.nextBtn} onClick={() => navigate('/research-plan')}>
        Далее: план исследования <ArrowRight size={16} />
      </Button>
    </div>
  );
}
