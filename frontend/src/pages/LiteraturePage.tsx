import { BookOpen, Globe, FileText, Scale, Wand2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { searchLiterature } from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import type { LiteratureSource } from '../types';
import styles from './LiteraturePage.module.css';

const TYPE_ICONS: Record<LiteratureSource['type'], typeof BookOpen> = {
  book: BookOpen,
  article: FileText,
  online: Globe,
  regulatory: Scale,
};

const TYPE_LABELS: Record<LiteratureSource['type'], string> = {
  book: 'Книга',
  article: 'Статья',
  online: 'Интернет',
  regulatory: 'НПА',
};

function formatGost(s: LiteratureSource): string {
  if (s.type === 'online') {
    return `${s.author}. ${s.title} [Электронный ресурс]. — URL: ${s.url || 'https://...'} (дата обращения: ${new Date().toLocaleDateString('ru-RU')}).`;
  }
  return `${s.author}. ${s.title} / ${s.author}. — ${s.publisher ? s.publisher + ', ' : ''}${s.year}. — ...с.`;
}

export function LiteraturePage() {
  const navigate = useNavigate();
  const { selectedTopic, workType, level, literature, setLiterature, loadingLiterature, setLoadingLiterature } = useAppStore();
  const [count, setCount] = useState(10);
  const [copied, setCopied] = useState(false);

  const handleSearch = async () => {
    if (!selectedTopic) return;
    setLoadingLiterature(true);
    try {
      const sources = await searchLiterature(selectedTopic, workType, level, count);
      setLiterature(sources);
    } finally {
      setLoadingLiterature(false);
    }
  };

  const handleCopyAll = () => {
    const text = literature.map((s, i) => `${i + 1}. ${formatGost(s)}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!selectedTopic) {
    return (
      <div className={styles.empty}>
        <p>Сначала выберите тему в модуле 1</p>
        <Button variant="secondary" onClick={() => navigate('/')}>Перейти к модулю 1</Button>
      </div>
    );
  }

  const countOptions = [5, 10, 15, 20].map((n) => ({ value: String(n), label: String(n) }));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Модуль 4 — Поиск литературы</h1>
        <p className={styles.pageDesc}>AI подберёт источники по теме в соответствии со стандартами ГОСТ</p>
      </div>

      <Card>
        <div className={styles.topicRow}>
          <div>
            <div className={styles.topicLabel}>Тема работы</div>
            <div className={styles.topicValue}>«{selectedTopic}»</div>
          </div>
          <div className={styles.controls}>
            <Select label="Кол-во источников" value={String(count)} onChange={(e) => setCount(Number(e.target.value))} options={countOptions} />
            <Button onClick={handleSearch} loading={loadingLiterature} style={{ alignSelf: 'flex-end' }}>
              <Wand2 size={16} /> Подобрать
            </Button>
          </div>
        </div>
      </Card>

      {literature.length > 0 && (
        <Card
          title={`Список литературы (${literature.length} источников)`}
          subtitle="Оформление по ГОСТ 7.0.5-2008"
        >
          <div className={styles.copyRow}>
            <Button variant="secondary" size="sm" onClick={handleCopyAll}>
              {copied ? <><Check size={14} /> Скопировано</> : <><Copy size={14} /> Копировать список</>}
            </Button>
          </div>
          <ol className={styles.list}>
            {literature.map((s, i) => {
              const Icon = TYPE_ICONS[s.type];
              return (
                <li key={i} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <span className={`${styles.badge} ${styles[s.type]}`}>
                      <Icon size={12} /> {TYPE_LABELS[s.type]}
                    </span>
                    <span className={styles.year}>{s.year}</span>
                  </div>
                  <div className={styles.gost}>{formatGost(s)}</div>
                </li>
              );
            })}
          </ol>
        </Card>
      )}
    </div>
  );
}
