import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Wand2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { parseKtp, parseKtpFile } from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import styles from './KtpPage.module.css';

export function KtpPage() {
  const navigate = useNavigate();
  const {
    ktpText, setKtpText,
    ktpTopics, setKtpTopics,
    selectedKtpTopic, setSelectedKtpTopic,
    loadingKtp, setLoadingKtp,
  } = useAppStore();

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setLoadingKtp(true);
    try {
      const topics = await parseKtpFile(files[0]);
      setKtpTopics(topics);
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
    setLoadingKtp(true);
    try {
      const topics = await parseKtp(ktpText);
      setKtpTopics(topics);
    } finally {
      setLoadingKtp(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Загрузка тем КТП</h1>
        <p className={styles.desc}>
          Вставьте темы из календарно-тематического плана или загрузите файл.
          AI извлечёт учебные темы и предложит их для дальнейшей научной работы.
        </p>
      </div>

      <div className={styles.grid}>
        <Card title="Текст КТП или рабочей программы">
          <Textarea
            placeholder="Вставьте сюда темы занятий из КТП, рабочей программы или учебного плана..."
            rows={8}
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
