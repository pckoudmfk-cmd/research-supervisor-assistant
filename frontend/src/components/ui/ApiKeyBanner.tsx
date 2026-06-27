import { useState } from 'react';
import { KeyRound, ExternalLink, Check } from 'lucide-react';
import { Button } from './Button';
import styles from './ApiKeyBanner.module.css';

export function ApiKeyBanner() {
  const [key, setKeyState] = useState(() => localStorage.getItem('groq-api-key') ?? '');
  const [input, setInput] = useState('');
  const [saved, setSaved] = useState(false);

  if (key) return null;

  const handleSave = () => {
    if (!input.trim()) return;
    localStorage.setItem('groq-api-key', input.trim());
    setKeyState(input.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.banner}>
      <div className={styles.icon}><KeyRound size={20} /></div>
      <div className={styles.content}>
        <div className={styles.title}>Требуется бесплатный Groq API ключ</div>
        <div className={styles.desc}>
          Получите бесплатный ключ на{' '}
          <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className={styles.link}>
            console.groq.com <ExternalLink size={11} />
          </a>
          {' '}— регистрация через Google, без карты, 14 400 запросов в день.
        </div>
        <div className={styles.row}>
          <input
            className={styles.input}
            type="password"
            placeholder="gsk_..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <Button size="sm" onClick={handleSave} disabled={!input.trim()}>
            {saved ? <><Check size={13} /> Сохранён</> : 'Сохранить'}
          </Button>
        </div>
        <div className={styles.note}>Ключ хранится только в вашем браузере, не передаётся нам.</div>
      </div>
    </div>
  );
}
