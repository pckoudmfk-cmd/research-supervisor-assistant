import { NavLink, useNavigate } from 'react-router-dom';
import { FileText, Lightbulb, ClipboardList, BookMarked, FileOutput, BookOpenText, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '/',           icon: FileText,      label: 'Загрузка КТП',     badge: '1' },
  { to: '/topic',      icon: Lightbulb,     label: 'Тема и новизна',   badge: '2' },
  { to: '/plan',       icon: ClipboardList, label: 'План работы',       badge: '3' },
  { to: '/literature', icon: BookMarked,    label: 'Литература',        badge: '4' },
  { to: '/summary',    icon: FileOutput,    label: 'Итоговый документ', badge: '5' },
];

export function Sidebar() {
  const { resetKtp } = useAppStore();
  const navigate = useNavigate();

  const handleReset = () => {
    if (confirm('Сбросить всё и начать заново?')) {
      resetKtp();
      navigate('/');
    }
  };

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
      <div className={styles.divider} />
      <div className={styles.label}>Материалы</div>
      <NavLink
        to="/guide"
        className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
      >
        <span className={styles.badge}><BookOpenText size={12} /></span>
        <BookOpenText size={16} />
        <span>Гид по статье</span>
      </NavLink>
      <div className={styles.divider} />
      <button className={styles.resetBtn} onClick={handleReset}>
        <RotateCcw size={14} />
        <span>Начать заново</span>
      </button>
    </nav>
  );
}
