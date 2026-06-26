import { Moon, Sun, Gem } from 'lucide-react';
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

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>📚</span>
          <div>
            <div className={styles.title}>Помощник научного руководителя</div>
            <div className={styles.subtitle}>Цифровой ассистент для работ СПО и ВУЗ</div>
          </div>
        </div>
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
    </header>
  );
}
