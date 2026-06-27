import { type ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ApiKeyBanner } from '../ui/ApiKeyBanner';
import styles from './Layout.module.css';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.main}>
          <ApiKeyBanner />
          {children}
        </main>
      </div>
    </>
  );
}
