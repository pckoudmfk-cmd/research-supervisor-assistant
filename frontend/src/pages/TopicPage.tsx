import { useNavigate } from 'react-router-dom';
import { Wand2, ArrowRight, Edit3, Check } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { generateFormulation } from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { WORK_TYPE_LABELS, LEVEL_LABELS, DIRECTIONS } from '../types';
import styles from './TopicPage.module.css';

function EditableBlock({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
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
    workType, setWorkType,
    level, setLevel,
    direction, setDirection,
    subjectArea, setSubjectArea,
    topicFormulation, setTopicFormulation,
    relevance, setRelevance,
    novelty, setNovelty,
    loadingFormulation, setLoadingFormulation,
  } = useAppStore();

  const workTypeOptions = Object.entries(WORK_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const levelOptions = Object.entries(LEVEL_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const directionOptions = DIRECTIONS.map((d) => ({ value: d, label: d }));

  const canGenerate = selectedKtpTopic && direction && subjectArea;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoadingFormulation(true);
    try {
      const result = await generateFormulation(
        selectedKtpTopic, workType, level, direction, subjectArea
      );
      setTopicFormulation(result.topic);
      setRelevance(result.relevance);
      setNovelty(result.novelty);
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
        <h1 className={styles.title}>Формулировка научной темы</h1>
        <p className={styles.desc}>
          AI преобразует учебную тему из КТП в академическую формулировку
          с обоснованием актуальности и научной новизны.
        </p>
      </div>

      <Card title="Исходная тема из КТП">
        <div className={styles.ktpTopic}>«{selectedKtpTopic}»</div>
      </Card>

      <Card title="Параметры работы">
        <div className={styles.params}>
          <Select
            label="Направление подготовки"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            options={[{ value: '', label: 'Выберите направление...' }, ...directionOptions]}
          />
          <Select
            label="Тип работы"
            value={workType}
            onChange={(e) => setWorkType(e.target.value as any)}
            options={workTypeOptions}
          />
          <Select
            label="Уровень"
            value={level}
            onChange={(e) => setLevel(e.target.value as any)}
            options={levelOptions}
          />
        </div>
        <Textarea
          label="Предметная область (уточните тематику)"
          placeholder="Например: применение машинного обучения в задачах классификации данных..."
          rows={2}
          value={subjectArea}
          onChange={(e) => setSubjectArea(e.target.value)}
          style={{ marginTop: 14 }}
        />
        <Button
          className={styles.btn}
          onClick={handleGenerate}
          loading={loadingFormulation}
          disabled={!canGenerate}
        >
          <Wand2 size={16} /> Сформулировать тему
        </Button>
      </Card>

      {topicFormulation && (
        <>
          <Card title="Результат формулировки AI">
            <EditableBlock
              label="Тема исследования"
              value={topicFormulation}
              onChange={setTopicFormulation}
            />
            <div className={styles.divider} />
            <EditableBlock
              label="Актуальность"
              value={relevance}
              onChange={setRelevance}
            />
            <div className={styles.divider} />
            <EditableBlock
              label="Научная новизна"
              value={novelty}
              onChange={setNovelty}
            />
          </Card>

          <Button onClick={() => navigate('/plan')}>
            Далее: план исследования <ArrowRight size={16} />
          </Button>
        </>
      )}
    </div>
  );
}
