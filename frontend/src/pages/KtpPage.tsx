import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Wand2, ArrowRight, CheckCircle2, FileText, BookOpen, GraduationCap, Briefcase, Newspaper, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { parseKtp, parseKtpFile } from '../utils/api';
import type { KtpTopic } from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import type { WorkType, Level } from '../types';
import { WORK_TYPE_LABELS, LEVEL_LABELS } from '../types';
import styles from './KtpPage.module.css';

const WORK_TYPE_ICONS: Record<WorkType, typeof FileText> = {
  article: Newspaper,
  thesis: BookOpen,
  coursework: FileText,
  vkr: GraduationCap,
  practical: Briefcase,
};
const WORK_TYPES: WorkType[] = ['article', 'thesis', 'coursework', 'vkr', 'practical'];

export function KtpPage() {
  const navigate = useNavigate();
  const {
    ktpText, setKtpText,
    ktpTopics, setKtpTopics,
    selectedKtpTopic, setSelectedKtpTopic,
    loadingKtp, setLoadingKtp,
    workType, setWorkType,
    level, setLevel,
    direction, setDirection,
    subjectArea, setSubjectArea,
  } = useAppStore();

  const [error, setError] = useState<string | null>(null);

  const runParse = async (text: string) => {
    setError(null);
    setLoadingKtp(true);
    try {
      const topics = await parseKtp(text, workType, level, direction, subjectArea);
      setKtpTopics(topics);
    } catch (e: any) {
      setError(e?.message || 'Неизвестная ошибка');
    } finally {
      setLoadingKtp(false);
    }
  };

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setError(null);
    setLoadingKtp(true);
    try {
      const topics = await parseKtpFile(files[0], workType, level, direction, subjectArea);
      setKtpTopics(topics);
    } catch (e: any) {
      setError(e?.message || 'Неизвестная ошибка');
    } finally {
      setLoadingKtp(false);
    }
  }, [workType, level, direction, subjectArea]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt', '.md'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  const selectTopic = (t: KtpTopic) => {
    setSelectedKtpTopic(t);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Загрузка КТП и выбор темы</h1>
        <p className={styles.desc}>
          Укажите параметры работы и загрузите КТП или темы уроков.
          AI проанализирует материал и предложит перспективные исследовательские направления.
        </p>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <Card title="Тип научной работы" subtitle="Определяет структуру, объём и требования к исследованию">
        <div className={styles.workTypeGrid}>
          {WORK_TYPES.map((wt) => {
            const Icon = WORK_TYPE_ICONS[wt];
            return (
              <button
                key={wt}
                className={`${styles.workTypeCard} ${workType === wt ? styles.workTypeActive : ''}`}
                onClick={() => setWorkType(wt)}
              >
                <Icon size={22} className={styles.workTypeIcon} />
                <span className={styles.workTypeLabel}>{WORK_TYPE_LABELS[wt]}</span>
                {workType === wt && <CheckCircle2 size={14} className={styles.workTypeCheck} />}
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Параметры подготовки">
        <div className={styles.paramsGrid}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Уровень образования</label>
            <div className={styles.levelButtons}>
              {(['spo', 'vuz'] as Level[]).map((l) => (
                <button
                  key={l}
                  className={`${styles.levelBtn} ${level === l ? styles.levelActive : ''}`}
                  onClick={() => setLevel(l)}
                >
                  {LEVEL_LABELS[l]}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Направление подготовки / специальность</label>
            <input
              className={styles.input}
              placeholder="Например: Информационные технологии, 09.02.07"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Дисциплина / предмет</label>
            <input
              className={styles.input}
              placeholder="Например: Основы программирования, Информатика"
              value={subjectArea}
              onChange={(e) => setSubjectArea(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className={styles.grid}>
        <Card title="Текст КТП или темы уроков">
          <Textarea
            placeholder="Вставьте темы занятий из КТП, рабочей программы или просто перечень тем уроков..."
            rows={7}
            value={ktpText}
            onChange={(e) => setKtpText(e.target.value)}
          />
          <Button
            className={styles.btn}
            onClick={() => runParse(ktpText)}
            loading={loadingKtp}
            disabled={!ktpText.trim()}
          >
            <Wand2 size={16} /> Найти исследовательские ракурсы
          </Button>
        </Card>

        <Card title="Загрузка файла" subtitle="Поддерживаются .pdf, .docx, .txt, .md">
          <div
            {...getRootProps()}
            className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
          >
            <input {...getInputProps()} />
            <Upload size={28} className={styles.uploadIcon} />
            <p className={styles.dropText}>
              {loadingKtp ? 'Анализируем...' : isDragActive ? 'Отпустите файл...' : 'Перетащите файл или нажмите для выбора'}
            </p>
          </div>
        </Card>
      </div>

      {ktpTopics.length > 0 && (
        <Card
          title={`Найдено исследовательских направлений: ${ktpTopics.length}`}
          subtitle="Выберите тему, которую будете разрабатывать"
        >
          <div className={styles.topicList}>
            {ktpTopics.map((topic, i) => (
              <button
                key={i}
                className={`${styles.topicItem} ${selectedKtpTopic?.title === topic.title ? styles.selected : ''}`}
                onClick={() => selectTopic(topic)}
              >
                <span className={styles.topicNum}>{i + 1}</span>
                <div className={styles.topicBody}>
                  <div className={styles.topicTitle}>{topic.title}</div>
                  <div className={styles.topicAngle}>
                    <Lightbulb size={12} className={styles.angleIcon} />
                    {topic.angle}
                  </div>
                  <div className={styles.topicWhy}>
                    <TrendingUp size={12} className={styles.whyIcon} />
                    {topic.why}
                  </div>
                </div>
                {selectedKtpTopic?.title === topic.title && (
                  <CheckCircle2 size={18} className={styles.check} />
                )}
              </button>
            ))}
          </div>

          {selectedKtpTopic && (
            <div className={styles.selected_info}>
              <div className={styles.selectedLabel}>Выбрана тема:</div>
              <div className={styles.selectedTopic}>«{selectedKtpTopic.title}»</div>
              <Button onClick={() => navigate('/topic')}>
                Далее: разработать тему <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
