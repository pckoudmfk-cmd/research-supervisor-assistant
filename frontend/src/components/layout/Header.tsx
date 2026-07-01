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

type KeyProvider = 'groq' | 'openrouter';

const PROVIDERS: { id: KeyProvider; label: string; hint: string; placeholder: string; storageKey: string }[] = [
  { id: 'groq',        label: 'Groq',        hint: 'groq.com → API Keys',        placeholder: 'gsk_...',  storageKey: 'groq-api-key' },
  { id: 'openrouter', label: 'OpenRouter',   hint: 'openrouter.ai → Keys',       placeholder: 'sk-or-...', storageKey: 'openrouter-api-key' },
];

export function Header() {
  const { theme, setTheme } = useAppStore();
  const [activeProvider, setActiveProvider] = useState<KeyProvider | null>(null);
  const [keyInput, setKeyInput] = useState('');

  const hasGroq = !!localStorage.getItem('groq-api-key');
  const hasOR   = !!localStorage.getItem('openrouter-api-key');
  const hasAny  = hasGroq || hasOR;

  const activeLabel = hasGroq ? 'Groq' : hasOR ? 'OpenRouter' : null;

  const openInput = (p: KeyProvider) => { setActiveProvider(p); setKeyInput(''); };
  const cancelInput = () => { setActiveProvider(null); setKeyInput(''); };

  const saveKey = () => {
    if (!activeProvider || !keyInput.trim()) return;
    const prov = PROVIDERS.find(p => p.id === activeProvider)!;
    localStorage.setItem(prov.storageKey, keyInput.trim());
    setActiveProvider(null);
    setKeyInput('');
    window.location.reload();
  };

  const clearKeys = () => {
    PROVIDERS.forEach(p => localStorage.removeItem(p.storageKey));
    window.location.reload();
  };

  const currentProv = PROVIDERS.find(p => p.id === activeProvider);

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
          {activeProvider ? (
            <div className={styles.keyRow}>
              <span className={styles.keyProviderLabel}>{currentProv?.label}</span>
              <input
                className={styles.keyInput}
                type="password"
                placeholder={currentProv?.placeholder}
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveKey()}
                autoFocus
              />
              <button className={styles.themeBtn} onClick={saveKey} title="Сохранить">✓</button>
              <button className={styles.themeBtn} onClick={cancelInput} title="Отмена"><X size={14} /></button>
            </div>
          ) : hasAny ? (
            <div className={styles.keyRow}>
              <span className={styles.keyBadge}>{activeLabel} ключ активен</span>
              <button
                className={`${styles.themeBtn} ${styles.keyActive}`}
                onClick={clearKeys}
                title="Сбросить API ключ"
              >
                <KeyRound size={16} />
              </button>
            </div>
          ) : (
            <div className={styles.keyButtons}>
              {PROVIDERS.map(p => (
                <button
                  key={p.id}
                  className={styles.keyProviderBtn}
                  onClick={() => openInput(p.id)}
                  title={p.hint}
                >
                  <KeyRound size={13} />
                  {p.label}
                </button>
              ))}
            </div>
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
