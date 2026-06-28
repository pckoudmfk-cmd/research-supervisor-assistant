import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight, BookOpen, FlaskConical, BarChart2, MessageSquare, Flag, FileText, List } from 'lucide-react';
import { Card } from '../components/ui/Card';
import styles from './GuidePage.module.css';

function PromptBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className={styles.promptBlock}>
      <div className={styles.promptLabel}>Промпт</div>
      <p className={styles.promptText}>{text}</p>
      <button className={styles.copyBtn} onClick={handleCopy}>
        {copied ? <><Check size={13} /> Скопировано</> : <><Copy size={13} /> Копировать</>}
      </button>
    </div>
  );
}

function Section({ icon: Icon, num, title, children }: {
  icon: typeof BookOpen; num: string; title: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.section}>
      <button className={styles.sectionHeader} onClick={() => setOpen(o => !o)}>
        <span className={styles.sectionNum}>{num}</span>
        <Icon size={16} className={styles.sectionIcon} />
        <span className={styles.sectionTitle}>{title}</span>
        <span className={styles.chevron}>{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );
}

export function GuidePage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Руководство: AI в написании научной статьи</h1>
        <p className={styles.desc}>
          AI — инструмент, а не автор. Качество результата напрямую зависит от того,
          насколько вы понимаете структуру научной статьи. Нажмите на раздел, чтобы раскрыть.
        </p>
      </div>

      <Card title="Структура статьи: формат IMRAD" subtitle="Принят большинством научных журналов">
        <div className={styles.imradGrid}>
          {[
            { n: 'I', label: 'Introduction', ru: 'Введение' },
            { n: 'M', label: 'Methods', ru: 'Методы' },
            { n: 'R', label: 'Results', ru: 'Результаты' },
            { n: 'A', label: 'And', ru: '—' },
            { n: 'D', label: 'Discussion', ru: 'Обсуждение' },
          ].map(({ n, label, ru }) => (
            <div key={n} className={styles.imradItem}>
              <span className={styles.imradLetter}>{n}</span>
              <span className={styles.imradLabel}>{label}</span>
              <span className={styles.imradRu}>{ru}</span>
            </div>
          ))}
        </div>
        <p className={styles.note}>
          Также включает: Literature Review (Обзор литературы) и Conclusion (Заключение).
        </p>
      </Card>

      <div className={styles.sections}>

        <Section icon={FileText} num="1" title="Введение (Introduction)">
          <p className={styles.text}>
            Введение задаёт тон всей статье: о чём исследование, почему это важно и какой пробел в знаниях оно закрывает.
            Распространённая ошибка — начинать сразу с обзора литературы или повторять учебниковые определения.
          </p>
          <div className={styles.ruleBox}>
            <strong>Правильная структура — «перевёрнутый треугольник»:</strong>
            <ol className={styles.ruleList}>
              <li>Широкий контекст и актуальность темы</li>
              <li>Постановка конкретной проблемы</li>
              <li>Пробел в существующих знаниях</li>
              <li>Цель, задачи и гипотеза исследования</li>
            </ol>
          </div>
          <PromptBlock text={`Act as an academic writing expert. Write a comprehensive introduction section for a research paper titled "[Your Title]". Structure it as an inverted triangle: start with broad background and context, narrow to the specific research problem, then end with a clear research aim, objectives, and hypothesis. Include a hook, background, problem statement, research gap, and significance of the study. Follow Q1 journal standards.`} />
        </Section>

        <Section icon={BookOpen} num="2" title="Обзор литературы (Literature Review)">
          <p className={styles.text}>
            Раздел необходим при качественном, количественном и смешанном исследовании.
            Задача — не перечислить источники, а синтезировать: сравнить результаты, выявить паттерны, противоречия и пробелы.
          </p>
          <div className={styles.ruleBox}>
            <strong>Классический процесс:</strong>
            <ol className={styles.ruleList}>
              <li>Сформулировать цели исследования и подзаголовки</li>
              <li>Найти релевантные научные источники</li>
              <li>Проанализировать каждую статью: методы, находки, ограничения</li>
              <li>Синтезировать: сравнить результаты, выявить паттерны и пробелы</li>
            </ol>
          </div>
          <p className={styles.tip}>
            💡 Используйте <strong>ChatGPT Deep Research</strong> (до 5 раз в месяц бесплатно) или инструменты
            Consensus, Gini AI, AnswerThis для извлечения аргументов из источников.
            Источники в Deep Research — реальные, но цитирование в тексте нужно проверять вручную.
          </p>
          <PromptBlock text={`Write a critical and analytical literature review of 1,000 to 1,200 words on [Insert Your Topic Here], directly related to the following objectives of the study: [Insert Objectives]. Begin by broadly stating and explaining the topic and its significance. Then, critically synthesize the most relevant literature to the research aims. Examine how each study addresses its aim, method, findings, and limitations. Point out how each study contributes to the research problem. Use comparison of results to identify patterns, contradictions, and knowledge gaps. Finally, assess the overall state of the literature, explain whether it corresponds to the aims and objectives of the study, and clarify how this research will address the identified gap.`} />
        </Section>

        <Section icon={FlaskConical} num="3" title="Методы (Methods)">
          <p className={styles.text}>
            Раздел методов — «рецепт» вашего исследования. Он должен быть настолько чётким,
            чтобы другой учёный мог воспроизвести работу. Многие статьи отклоняются именно
            из-за недостаточной детализации.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Подраздел</th><th>Содержание</th></tr>
              </thead>
              <tbody>
                {[
                  ['Дизайн исследования', 'Экспериментальный, опросный, наблюдательный и т.д.'],
                  ['Условия и сроки', 'Место, период, стандарты (CONSORT, PRISMA — при необходимости)'],
                  ['Этическое одобрение', 'Подтверждение от комитета или наблюдательного совета'],
                  ['Участники / выборка', 'Кто, как отобраны, критерии включения/исключения'],
                  ['Инструменты', 'Что использовалось для сбора данных'],
                  ['Процедуры', 'Пошаговое описание действий, интервенций, сбора данных'],
                  ['Статистический анализ', 'Тесты, ПО и версия, порог значимости'],
                ].map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}
              </tbody>
            </table>
          </div>
          <p className={styles.warning}>⚠️ Раздел пишется в прошедшем времени. Результаты здесь не упоминаются.</p>
          <PromptBlock text={`Act as a research methodologist. Write a detailed Methods section for a research paper titled "[Your Title]". The study design is [e.g., cross-sectional survey / experimental / systematic review]. The setting is [location/context]. The time frame is [dates]. Participants: [description, sample size, selection method, inclusion and exclusion criteria]. Data collection tools: [instruments used]. Procedures: [step-by-step description of what was done]. Statistical analysis: [tests used, software and version, significance level]. Include an ethics statement. Write in past tense. Do not report results. Follow Q1 journal standards.`} />
        </Section>

        <Section icon={BarChart2} num="4" title="Результаты (Results)">
          <p className={styles.text}>
            AI помогает с анализом и интерпретацией — но только ваших реальных данных.
            Используйте специализированное ПО (SPSS, R, Python), а AI подключайте для объяснения шагов анализа и описания готовых таблиц.
          </p>
          <div className={styles.ruleBox}>
            <strong>Правильный порядок:</strong>
            <ol className={styles.ruleList}>
              <li>Соберите реальные данные (опросы, интервью, эксперименты)</li>
              <li>Проведите анализ в SPSS / R / Python</li>
              <li>Используйте AI для интерпретации готовых результатов</li>
            </ol>
          </div>
          <PromptBlock text={`Explain step-by-step how to perform [specific test, e.g., multiple regression or ANOVA] in SPSS using my dataset with the following variables: [list variable names]. Include how to check assumptions and interpret the output when the analysis is ready.`} />
          <PromptBlock text={`Act as a statistician and academic writer. Here are the results of my analysis: [paste your tables or output]. Write a Results section for a research paper. Report the findings objectively, table by table. Do not interpret or discuss the results, just describe what the data shows. Use past tense. Follow Q1 journal standards.`} />
        </Section>

        <Section icon={MessageSquare} num="5" title="Обсуждение (Discussion)">
          <p className={styles.text}>
            Самый важный раздел статьи. Здесь проявляется голос исследователя — вы не просто
            перечисляете результаты, а объясняете их смысл, сравниваете с литературой и выходите на широкие выводы.
          </p>
          <div className={styles.ruleBox}>
            <strong>Структура раздела:</strong>
            <ol className={styles.ruleList}>
              <li><strong>Интерпретация</strong> — что означают результаты?</li>
              <li><strong>Сравнение с литературой</strong> — совпадают или расходятся? Если расходятся — почему?</li>
              <li><strong>Критический взгляд</strong> — альтернативные объяснения, ограничения</li>
              <li><strong>Связь с теорией</strong> — подтверждает, расширяет или опровергает теоретический фреймворк?</li>
              <li><strong>Импликации</strong> — для политики, практики, будущих исследований</li>
            </ol>
          </div>
          <PromptBlock text={`Act as an expert academic writer. Write a Discussion section for a research paper titled "[Your Title]". The main findings are: [summarize key results]. Compare these findings with the following prior studies: [list or describe relevant literature]. Explain similarities and differences, and provide reasons for any discrepancies. Identify alternative explanations. Address the limitations of the study. Link the findings back to the theoretical framework used: [name the theory/framework]. End with implications for policy, practice, and future research. Write critically and analytically. Follow Q1 journal standards.`} />
        </Section>

        <Section icon={Flag} num="6" title="Заключение (Conclusion)">
          <p className={styles.text}>
            Заключение — «полный круг» аргументации. Сильное заключение не повторяет результаты —
            оно интерпретирует их в широкой перспективе и побуждает читателя думать вперёд.
          </p>
          <div className={styles.ruleBox}>
            <strong>Три обязательных элемента:</strong>
            <ol className={styles.ruleList}>
              <li><strong>What</strong> — напомнить, о чём исследование и что обнаружено</li>
              <li><strong>So what</strong> — объяснить, почему выводы важны</li>
              <li><strong>Now what</strong> — что делать дальше, какие новые вопросы возникают</li>
            </ol>
          </div>
          <PromptBlock text={`Act as an academic writing expert. Write a Conclusion section for a research paper titled "[Your Title]". First, briefly restate what the study was about and what was found (the what). Then, explain the significance of these findings for [policy / practice / the field] (the so what). Finally, suggest directions for future research and practical recommendations (the now what). Do not repeat the results verbatim. Situate the findings in a broader context. Show the study's contribution to knowledge. Follow Q1 journal standards.`} />
        </Section>

        <Section icon={List} num="✓" title="Финальные шаги перед подачей">
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Шаг</th><th>Действие</th></tr>
              </thead>
              <tbody>
                {[
                  ['1', 'Вычитать вручную, добавить собственный голос и примеры'],
                  ['2', 'Проверить корректность цитирования всех источников'],
                  ['3', 'Проверить на плагиат (Turnitin, iThenticate или Antiplagiat)'],
                  ['4', 'Привести оформление в соответствие с требованиями журнала или методическими указаниями'],
                  ['5', 'Показать научному руководителю перед подачей'],
                ].map(([n, a]) => <tr key={n}><td style={{width: 40}}>{n}</td><td>{a}</td></tr>)}
              </tbody>
            </table>
          </div>
        </Section>

      </div>
    </div>
  );
}
