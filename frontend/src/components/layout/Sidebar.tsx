import { NavLink } from 'react-router-dom';
import { BookOpen, Lightbulb, ListChecks, Library } from 'lucide-react';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '/', icon: BookOpen, label: 'Ввод темы', badge: '1' },
  { to: '/topic-formulation', icon: Lightbulb, label: 'Формулировка AI', badge: '2' },
  { to: '/research-plan', icon: ListChecks, label: 'План исследования', badge: '3' },
  { to: '/literature', icon: Library, label: 'Поиск литературы', badge: '4' },
];

export function Sidebar() {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.label}>Модули</div>
      {NAV.map(({ to, icon: Icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.badge}>{badge}</span>
          <Icon size={17} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
