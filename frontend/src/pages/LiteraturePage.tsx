import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, ArrowRight, Copy, Check, Globe, BookOpen, ExternalLink, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { searchLiterature } from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import type { LiteratureSource } from '../types';
import styles from './LiteraturePage.module.css';

function formatGost(s: LiteratureSource, index: number): string {
  const authors = s.authors.join(', ') || 'Автор не указан';
  const year = s.year ?? 'б.г.';
  const source = s.source ? ` // ${s.source}` : '';
  const doi = s.doi ? `. — DOI: ${s.doi}` : '';
  return `${index}. ${authors}. ${s.title}${source}. — ${year}${doi}.`;
}

export function LiteraturePage() {
  const navigate = useNavigate();
  const { topicFormulation, keywords, literature, setLiterature, loadingLiterature, setLoadingLiterature } = useAppStore();
  const [count, setCount] = useState(10);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!topicFormulation) return;
    setError(null);
    setLoadingLiterature(true);
    try {
      const sources = await searchLiterature(topicFormulation, keywords, count);
      setLiterature(sources);
    } catch (e: any) {
      setError(e?.message || 'Ошибка при поиске литературы');
    } finally {
      setLoadingLiterature(false);
    }
  };

  const handleCopy = () => {
    const text = literature.map((s, i) => formatGost(s, i + 1)).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!topicFormulation) {
    return (
      <div className={styles.empty}>
        <p>Сначала сформулируйте тему на шаге 2</p>
        <Button variant="secondary" onClick={() => navigate('/topic')}>К формулировке темы</Button>
      </div>
    );
  }

  const countOptions = [5, 10, 15, 20].map((n) => ({ value: String(n), label: `${n} источников` }));
  const ruCount = literature.filter((s) => s.language === 'ru').length;
  const enCount = literature.filter((s) => s.language === 'en').length;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Поиск литературы</h1>
        <p className={styles.desc}>
          Поиск по КиберЛенинке (русскоязычные статьи), Semantic Scholar и OpenAlex.
          Более 200 миллионов работ в открытом доступе — без ключей и ограничений.
        </p>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={16} /><span>{error}</span>
        </div>
      )}

      <Card>
        <div className={styles.searchRow}>
          <div className={styles.topicInfo}>
            <div className={styles.topicLabel}>Тема поиска</div>
            <div className={styles.topicValue}>«{topicFormulation}»</div>
          </div>
          <div className={styles.searchControls}>
            <Select
              value={String(count)}
              onChange={(e) => setCount(Number(e.target.value))}
              options={countOptions}
            />
            <Button onClick={handleSearch} loading={loadingLiterature}>
              <Wand2 size={16} /> Найти литературу
            </Button>
          </div>
        </div>
      </Card>

      {literature.length > 0 && (
        <Card
          title={`Найдено источников: ${literature.length}`}
          subtitle={`🇷🇺 Русскоязычных: ${ruCount} · 🌍 Англоязычных: ${enCount}`}
        >
          <div className={styles.toolbar}>
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? <><Check size={14} /> Скопировано</> : <><Copy size={14} /> Копировать список (ГОСТ)</>}
            </Button>
          </div>
          <div className={styles.list}>
            {literature.map((s, i) => (
              <div key={i} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={`${styles.lang} ${s.language === 'ru' ? styles.ru : styles.en}`}>
                    {s.language === 'ru' ? '🇷🇺 РУС' : '🌍 ENG'}
                  </span>
                  {s.year && <span className={styles.year}>{s.year}</span>}
                  {s.url && (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                      <ExternalLink size={13} /> Открыть
                    </a>
                  )}
                </div>
                <div className={styles.itemTitle}>{s.title}</div>
                <div className={styles.itemMeta}>
                  {s.authors.length > 0 && (
                    <span><BookOpen size={12} /> {s.authors.slice(0, 3).join(', ')}{s.authors.length > 3 ? ' и др.' : ''}</span>
                  )}
                  {s.source && <span><Globe size={12} /> {s.source}</span>}
                </div>
                {s.doi && <div className={styles.doi}>DOI: {s.doi}</div>}
                <div className={styles.gost}>{formatGost(s, i + 1)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {literature.length > 0 && (
        <Button onClick={() => navigate('/summary')}>
          Далее: итоговый документ <ArrowRight size={16} />
        </Button>
      )}
    </div>
  );
}
