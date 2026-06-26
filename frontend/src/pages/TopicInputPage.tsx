import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Wand2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { generateTopics, generateTopicsFromFile } from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { WORK_TYPE_LABELS, LEVEL_LABELS } from '../types';
import styles from './TopicInputPage.module.css';

export function TopicInputPage() {
  const navigate = useNavigate();
  const {
    workType, setWorkType, level, setLevel,
    subjectArea, setSubjectArea, keywords, setKeywords,
    topicCount, setTopicCount, generatedTopics, setGeneratedTopics,
    selectedTopic, setSelectedTopic, loadingTopics, setLoadingTopics,
  } = useAppStore();

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setLoadingTopics(true);
    try {
      const topics = await generateTopicsFromFile(files[0], workType, level, topicCount);
      setGeneratedTopics(topics);
    } finally {
      setLoadingTopics(false);
    }
  }, [workType, level, topicCount]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/*': ['.txt', '.md'], 'application/pdf': ['.pdf'] }, maxFiles: 1 });

  const handleGenerate = async () => {
    if (!subjectArea.trim()) return;
    setLoadingTopics(true);
    try {
      const topics = await generateTopics({ subject_area: subjectArea, work_type: workType, level, keywords, count: topicCount });
      setGeneratedTopics(topics);
    } finally {
      setLoadingTopics(false);
    }
  };

  const workTypeOptions = Object.entries(WORK_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const levelOptions = Object.entries(LEVEL_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const countOptions = [3, 5, 7, 10].map((n) => ({ value: String(n), label: String(n) }));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Модуль 1 — Ввод темы КТП</h1>
        <p className={styles.pageDesc}>Введите предметную область или загрузите файл КТП для получения тем</p>
      </div>

      <div className={styles.grid}>
        <Card title="Параметры работы">
          <div className={styles.params}>
            <Select label="Тип работы" value={workType} onChange={(e) => setWorkType(e.target.value as any)} options={workTypeOptions} />
            <Select label="Уровень" value={level} onChange={(e) => setLevel(e.target.value as any)} options={levelOptions} />
            <Select label="Количество тем" value={String(topicCount)} onChange={(e) => setTopicCount(Number(e.target.value))} options={countOptions} />
          </div>
        </Card>

        <Card title="Предметная область">
          <Textarea
            label="Опишите тематику или направление"
            placeholder="Например: информационные технологии в образовании, машинное обучение, экономика предприятия..."
            rows={4}
            value={subjectArea}
            onChange={(e) => setSubjectArea(e.target.value)}
          />
          <Textarea
            label="Ключевые слова (необязательно)"
            placeholder="нейронные сети, Python, малый бизнес..."
            rows={2}
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            style={{ marginTop: 12 }}
          />
          <Button className={styles.generateBtn} onClick={handleGenerate} loading={loadingTopics} disabled={!subjectArea.trim()}>
            <Wand2 size={16} /> Сгенерировать темы
          </Button>
        </Card>

        <Card title="Загрузка файла КТП" subtitle="Поддерживаются .txt, .md, .pdf">
          <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ''}`}>
            <input {...getInputProps()} />
            <Upload size={32} className={styles.uploadIcon} />
            <p>{isDragActive ? 'Отпустите файл...' : 'Перетащите файл или нажмите для выбора'}</p>
          </div>
        </Card>
      </div>

      {generatedTopics.length > 0 && (
        <Card title="Сгенерированные темы" subtitle="Выберите тему для дальнейшей работы" className={styles.results}>
          <div className={styles.topicList}>
            {generatedTopics.map((topic, i) => (
              <button
                key={i}
                className={`${styles.topicItem} ${selectedTopic === topic ? styles.topicSelected : ''}`}
                onClick={() => setSelectedTopic(topic)}
              >
                <span className={styles.topicNum}>{i + 1}</span>
                <span>{topic}</span>
              </button>
            ))}
          </div>
          {selectedTopic && (
            <Button className={styles.nextBtn} onClick={() => navigate('/topic-formulation')}>
              Далее: формулировка AI <ArrowRight size={16} />
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
