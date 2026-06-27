import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AlertCircle } from 'lucide-react';
import { Upload, Wand2, ArrowRight, CheckCircle2, FileText, BookOpen, GraduationCap, Briefcase, Newspaper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { parseKtp, parseKtpFile } from '../utils/api';
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

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setError(null);
    setLoadingKtp(true);
    try {
      const topics = await parseKtpFile(files[0]);
      setKtpTopics(topics);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || 'Неизвестная ошибка';
      setError(`Ошибка загрузки файла: ${msg}`);
    } finally {
      setLoadingKtp(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt', '.md'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  const handleParse = async () => {
    if (!ktpText.trim()) return;
    setError(null);
    setLoadingKtp(true);
    try {
      const topics = await parseKtp(ktpText);
      setKtpTopics(topics);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || 'Неизвестная ошибка';
      setError(`Ошибка извлечения тем: ${msg}`);
    } finally {
      setLoadingKtp(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Загрузка тем КТП</h1>
        <p className={styles.desc}>
          Укажите параметры работы, вставьте темы из календарно-тематического плана или загрузите файл.
          AI извлечёт учебные темы и предложит их для дальнейшей научной работы.
        </p>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Тип работы */}
      <Card title="Тип научной работы" subtitle="Выберите вид разрабатываемого документа">
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

      {/* Параметры */}
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

      {/* Ввод КТП */}
      <div className={styles.grid}>
        <Card title="Текст КТП или рабочей программы">
          <Textarea
            placeholder="Вставьте сюда темы занятий из КТП, рабочей программы или учебного плана..."
            rows={7}
            value={ktpText}
            onChange={(e) => setKtpText(e.target.value)}
          />
          <Button
            className={styles.btn}
            onClick={handleParse}
            loading={loadingKtp}
            disabled={!ktpText.trim()}
          >
            <Wand2 size={16} /> Извлечь темы
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
              {isDragActive ? 'Отпустите файл...' : 'Перетащите файл или нажмите для выбора'}
            </p>
          </div>
        </Card>
      </div>

      {ktpTopics.length > 0 && (
        <Card
          title={`Найдено тем: ${ktpTopics.length}`}
          subtitle="Выберите одну тему как основу для научного исследования"
        >
          <div className={styles.topicList}>
            {ktpTopics.map((topic, i) => (
              <button
                key={i}
                className={`${styles.topicItem} ${selectedKtpTopic === topic ? styles.selected : ''}`}
                onClick={() => setSelectedKtpTopic(topic)}
              >
                {selectedKtpTopic === topic && (
                  <CheckCircle2 size={16} className={styles.check} />
                )}
                <span className={styles.topicNum}>{i + 1}</span>
                <span className={styles.topicText}>{topic}</span>
              </button>
            ))}
          </div>

          {selectedKtpTopic && (
            <div className={styles.selected_info}>
              <div className={styles.selectedLabel}>Выбрана тема:</div>
              <div className={styles.selectedTopic}>«{selectedKtpTopic}»</div>
              <Button onClick={() => navigate('/topic')}>
                Далее: формулировка темы <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
