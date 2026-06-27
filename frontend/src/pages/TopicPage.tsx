import { useNavigate } from 'react-router-dom';
import { Wand2, ArrowRight, Edit3, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { generateFormulation } from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import styles from './TopicPage.module.css';

function EditableBlock({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  return (
    <div className={styles.block}>
      <div className={styles.blockHeader}>
        <span className={styles.blockLabel}>{label}</span>
        {!editing && (
          <button className={styles.editBtn} onClick={() => { setDraft(value); setEditing(true); }}>
            <Edit3 size={13} /> Редактировать
          </button>
        )}
      </div>
      {editing ? (
        <div>
          <Textarea rows={4} value={draft} onChange={(e) => setDraft(e.target.value)} />
          <div className={styles.editActions}>
            <Button size="sm" onClick={() => { onChange(draft); setEditing(false); }}>
              <Check size={13} /> Сохранить
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Отмена</Button>
          </div>
        </div>
      ) : (
        <p className={styles.blockText}>{value}</p>
      )}
    </div>
  );
}

export function TopicPage() {
  const navigate = useNavigate();
  const {
    selectedKtpTopic,
    workType, level, direction, subjectArea,
    topicFormulation, setTopicFormulation,
    topicObject, setTopicObject,
    topicSubject, setTopicSubject,
    relevance, setRelevance,
    novelty, setNovelty,
    hypothesis, setHypothesis,
    loadingFormulation, setLoadingFormulation,
  } = useAppStore();

  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!selectedKtpTopic) return;
    setError(null);
    setLoadingFormulation(true);
    try {
      const result = await generateFormulation(
        selectedKtpTopic.title, selectedKtpTopic.angle,
        workType, level, direction, subjectArea
      );
      setTopicFormulation(result.topic);
      setTopicObject(result.object);
      setTopicSubject(result.subject);
      setRelevance(result.relevance);
      setNovelty(result.novelty);
      setHypothesis(result.hypothesis);
    } catch (e: any) {
      setError(e?.message || 'Ошибка при генерации');
    } finally {
      setLoadingFormulation(false);
    }
  };

  if (!selectedKtpTopic) {
    return (
      <div className={styles.empty}>
        <p>Сначала загрузите КТП и выберите тему на шаге 1</p>
        <Button variant="secondary" onClick={() => navigate('/')}>К загрузке КТП</Button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Разработка научной темы</h1>
        <p className={styles.desc}>
          AI развернёт исследовательский ракурс в полноценную тему с объектом, предметом,
          актуальностью и новизной — адаптировано под выбранный тип работы.
        </p>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={16} /><span>{error}</span>
        </div>
      )}

      <Card title="Выбранный исследовательский ракурс">
        <div className={styles.ktpTopic}>«{selectedKtpTopic.title}»</div>
        <div className={styles.angleText}>{selectedKtpTopic.angle}</div>
        <Button className={styles.btn} onClick={handleGenerate} loading={loadingFormulation}>
          <Wand2 size={16} /> Разработать тему
        </Button>
      </Card>

      {topicFormulation && (
        <>
          <Card title="Научная тема и обоснование">
            <EditableBlock label="Тема исследования" value={topicFormulation} onChange={setTopicFormulation} />
            <div className={styles.divider} />
            <div className={styles.twoCol}>
              <EditableBlock label="Объект исследования" value={topicObject} onChange={setTopicObject} />
              <EditableBlock label="Предмет исследования" value={topicSubject} onChange={setTopicSubject} />
            </div>
            <div className={styles.divider} />
            <EditableBlock label="Актуальность" value={relevance} onChange={setRelevance} />
            <div className={styles.divider} />
            <EditableBlock label="Научная новизна" value={novelty} onChange={setNovelty} />
            {hypothesis && <>
              <div className={styles.divider} />
              <EditableBlock label="Гипотеза исследования" value={hypothesis} onChange={setHypothesis} />
            </>}
          </Card>
          <Button onClick={() => navigate('/plan')}>
            Далее: план исследования <ArrowRight size={16} />
          </Button>
        </>
      )}
    </div>
  );
}
