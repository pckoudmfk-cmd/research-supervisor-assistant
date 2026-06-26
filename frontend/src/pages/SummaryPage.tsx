import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Download, FileText } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { WORK_TYPE_LABELS, LEVEL_LABELS } from '../types';
import styles from './SummaryPage.module.css';

function formatGost(s: { title: string; authors: string[]; year?: number; source?: string; doi?: string }, i: number) {
  const authors = s.authors.join(', ') || 'Автор не указан';
  const year = s.year ?? 'б.г.';
  const src = s.source ? ` // ${s.source}` : '';
  const doi = s.doi ? `. — DOI: ${s.doi}` : '';
  return `${i}. ${authors}. ${s.title}${src}. — ${year}${doi}.`;
}

export function SummaryPage() {
  const navigate = useNavigate();
  const {
    selectedKtpTopic, topicFormulation, relevance, novelty,
    workType, level, direction, subjectArea,
    goal, objectives, keywords, chapters, literature,
  } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!topicFormulation) {
    return (
      <div className={styles.empty}>
        <p>Заполните все предыдущие шаги для получения итогового документа</p>
        <Button variant="secondary" onClick={() => navigate('/')}>К началу</Button>
      </div>
    );
  }

  const wt = WORK_TYPE_LABELS[workType];
  const lvl = LEVEL_LABELS[level];

  const fullDocument = `ЦИФРОВОЙ ПОМОЩНИК НАУЧНОГО РУКОВОДИТЕЛЯ
${'═'.repeat(60)}

ТИП РАБОТЫ: ${wt.toUpperCase()}
УРОВЕНЬ ОБРАЗОВАНИЯ: ${lvl}
${direction ? `НАПРАВЛЕНИЕ ПОДГОТОВКИ: ${direction}` : ''}
${subjectArea ? `ПРЕДМЕТНАЯ ОБЛАСТЬ: ${subjectArea}` : ''}

${'─'.repeat(60)}
ТЕМА ИССЛЕДОВАНИЯ
${'─'.repeat(60)}
${topicFormulation}

${'─'.repeat(60)}
АКТУАЛЬНОСТЬ
${'─'.repeat(60)}
${relevance}

${'─'.repeat(60)}
НАУЧНАЯ НОВИЗНА
${'─'.repeat(60)}
${novelty}

${'─'.repeat(60)}
ЦЕЛЬ ИССЛЕДОВАНИЯ
${'─'.repeat(60)}
${goal}

${'─'.repeat(60)}
ЗАДАЧИ ИССЛЕДОВАНИЯ
${'─'.repeat(60)}
${objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}

${'─'.repeat(60)}
КЛЮЧЕВЫЕ СЛОВА
${'─'.repeat(60)}
${keywords.join(', ')}

${'─'.repeat(60)}
СТРУКТУРА РАБОТЫ
${'─'.repeat(60)}
${chapters.map((ch) => `Глава ${ch.number}. ${ch.title}\n   ${ch.description}`).join('\n\n')}

${literature.length > 0 ? `${'─'.repeat(60)}
СПИСОК ЛИТЕРАТУРЫ
${'─'.repeat(60)}
${literature.map((s, i) => formatGost(s, i + 1)).join('\n')}` : ''}

${'═'.repeat(60)}
Исходная тема КТП: «${selectedKtpTopic}»
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullDocument);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullDocument], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `задание_студенту_${topicFormulation.slice(0, 40).replace(/[^а-яёa-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Итоговый документ</h1>
        <p className={styles.desc}>
          Готовое задание для студента на основе всех заполненных этапов.
        </p>
      </div>

      <div className={styles.toolbar}>
        <Button variant="secondary" onClick={handleCopy}>
          {copied ? <><Check size={15} /> Скопировано</> : <><Copy size={15} /> Копировать документ</>}
        </Button>
        <Button onClick={handleDownload}>
          <Download size={15} /> Скачать .txt
        </Button>
      </div>

      <Card className={styles.docCard}>
        <div className={styles.docHeader}>
          <FileText size={20} className={styles.docIcon} />
          <div>
            <div className={styles.docType}>{wt} · {lvl}</div>
            {direction && <div className={styles.docDir}>{direction}</div>}
          </div>
        </div>

        <div className={styles.docSection}>
          <div className={styles.secLabel}>Тема исследования</div>
          <div className={styles.secTitle}>«{topicFormulation}»</div>
        </div>

        {relevance && (
          <div className={styles.docSection}>
            <div className={styles.secLabel}>Актуальность</div>
            <p className={styles.secText}>{relevance}</p>
          </div>
        )}

        {novelty && (
          <div className={styles.docSection}>
            <div className={styles.secLabel}>Научная новизна</div>
            <p className={styles.secText}>{novelty}</p>
          </div>
        )}

        {goal && (
          <div className={styles.docSection}>
            <div className={styles.secLabel}>Цель исследования</div>
            <p className={styles.secGoal}>{goal}</p>
          </div>
        )}

        {objectives.length > 0 && (
          <div className={styles.docSection}>
            <div className={styles.secLabel}>Задачи</div>
            <ol className={styles.objectives}>
              {objectives.map((o, i) => <li key={i}>{o}</li>)}
            </ol>
          </div>
        )}

        {keywords.length > 0 && (
          <div className={styles.docSection}>
            <div className={styles.secLabel}>Ключевые слова</div>
            <div className={styles.keywords}>
              {keywords.map((kw, i) => <span key={i} className={styles.kw}>{kw}</span>)}
            </div>
          </div>
        )}

        {chapters.length > 0 && (
          <div className={styles.docSection}>
            <div className={styles.secLabel}>Структура работы</div>
            {chapters.map((ch) => (
              <div key={ch.number} className={styles.chapter}>
                <strong>Глава {ch.number}. {ch.title}</strong>
                <span>{ch.description}</span>
              </div>
            ))}
          </div>
        )}

        {literature.length > 0 && (
          <div className={styles.docSection}>
            <div className={styles.secLabel}>Список литературы ({literature.length} источников)</div>
            <ol className={styles.litList}>
              {literature.map((s, i) => (
                <li key={i} className={styles.litItem}>{formatGost(s, i + 1)}</li>
              ))}
            </ol>
          </div>
        )}

        <div className={styles.docFooter}>
          Исходная тема КТП: «{selectedKtpTopic}»
        </div>
      </Card>
    </div>
  );
}
