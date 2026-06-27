import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', loading, children, className, disabled, ...rest }: Props) {
  return (
    <button
      type="button"
      className={clsx(styles.btn, styles[variant], styles[size], loading && styles.loading, className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  );
}
