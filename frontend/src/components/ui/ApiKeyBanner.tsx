import { useState } from 'react';
import { KeyRound, ExternalLink, Check } from 'lucide-react';
import { Button } from './Button';
import styles from './ApiKeyBanner.module.css';

export function useApiKey() {
  const [key, setKeyState] = useState(() => localStorage.getItem('gemini-api-key') ?? '');
  const setKey = (v: string) => {
    localStorage.setItem('gemini-api-key', v);
    setKeyState(v);
  };
  return { key, setKey };
}

export function ApiKeyBanner() {
  const { key, setKey } = useApiKey();
  const [input, setInput] = useState('');
  const [saved, setSaved] = useState(false);

  if (key) return null;

  const handleSave = () => {
    if (!input.trim()) return;
    setKey(input.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.banner}>
      <div className={styles.icon}><KeyRound size={20} /></div>
      <div className={styles.content}>
        <div className={styles.title}>Требуется Gemini API ключ</div>
        <div className={styles.desc}>
          Получите бесплатный ключ на{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className={styles.link}>
            aistudio.google.com <ExternalLink size={11} />
          </a>
          {' '}— это бесплатно, без карты.
        </div>
        <div className={styles.row}>
          <input
            className={styles.input}
            type="password"
            placeholder="AIza..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <Button size="sm" onClick={handleSave} disabled={!input.trim()}>
            {saved ? <><Check size={13} /> Сохранён</> : 'Сохранить'}
          </Button>
        </div>
        <div className={styles.note}>Ключ хранится только в вашем браузере, не отправляется нам.</div>
      </div>
    </div>
  );
}
