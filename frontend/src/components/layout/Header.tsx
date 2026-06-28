import { Moon, Sun, Gem, KeyRound, X } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import type { Theme } from '../../types';
import styles from './Header.module.css';

const THEMES: { value: Theme; icon: typeof Moon; label: string }[] = [
  { value: 'dark', icon: Moon, label: 'Тёмная' },
  { value: 'light', icon: Sun, label: 'Светлая' },
  { value: 'gold', icon: Gem, label: 'Золотая' },
];

export function Header() {
  const { theme, setTheme } = useAppStore();
  const [showKey, setShowKey] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const hasKey = !!localStorage.getItem('groq-api-key');

  const saveKey = () => {
    if (keyInput.trim()) {
      localStorage.setItem('groq-api-key', keyInput.trim());
      setKeyInput('');
      setShowKey(false);
      window.location.reload();
    }
  };

  const clearKey = () => {
    localStorage.removeItem('groq-api-key');
    window.location.reload();
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img
            src="/research-supervisor-assistant/logo.jpg"
            alt="VS Production"
            className={styles.logoImg}
          />
        </div>
        <div className={styles.right}>
          {showKey ? (
            <div className={styles.keyRow}>
              <input
                className={styles.keyInput}
                type="password"
                placeholder="AIza..."
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveKey()}
                autoFocus
              />
              <button className={styles.themeBtn} onClick={saveKey} title="Сохранить">✓</button>
              <button className={styles.themeBtn} onClick={() => setShowKey(false)} title="Отмена"><X size={14} /></button>
            </div>
          ) : (
            <button
              className={`${styles.themeBtn} ${hasKey ? styles.keyActive : ''}`}
              onClick={hasKey ? clearKey : () => setShowKey(true)}
              title={hasKey ? 'API ключ задан — нажмите чтобы сбросить' : 'Ввести Gemini API ключ'}
            >
              <KeyRound size={16} />
            </button>
          )}
          <div className={styles.themes}>
            {THEMES.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                className={`${styles.themeBtn} ${theme === value ? styles.active : ''}`}
                onClick={() => setTheme(value)}
                title={label}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
