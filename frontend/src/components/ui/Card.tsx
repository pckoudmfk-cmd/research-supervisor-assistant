import { type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Card.module.css';

interface Props {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function Card({ children, className, title, subtitle, action }: Props) {
  return (
    <div className={clsx(styles.card, className)}>
      {(title || subtitle || action) && (
        <div className={styles.header}>
          <div className={styles.headerMain}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {action && <div className={styles.action}>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
