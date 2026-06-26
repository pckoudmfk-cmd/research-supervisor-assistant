import { NavLink } from 'react-router-dom';
import { FileText, Lightbulb, ClipboardList, BookMarked, FileOutput } from 'lucide-react';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '/',           icon: FileText,      label: 'Загрузка КТП',     badge: '1' },
  { to: '/topic',      icon: Lightbulb,     label: 'Тема и новизна',   badge: '2' },
  { to: '/plan',       icon: ClipboardList, label: 'План работы',       badge: '3' },
  { to: '/literature', icon: BookMarked,    label: 'Литература',        badge: '4' },
  { to: '/summary',    icon: FileOutput,    label: 'Итоговый документ', badge: '5' },
];

export function Sidebar() {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.label}>Этапы работы</div>
      {NAV.map(({ to, icon: Icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.badge}>{badge}</span>
          <Icon size={16} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
