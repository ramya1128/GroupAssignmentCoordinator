'use client';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>🎓 <span>Group Assignment Coordinator</span></div>
        <div className={styles.authButtons}>
          <button className={styles.outlineButton} onClick={() => router.push('/admin/login')}>
            Admin Login
          </button>
          <button className={styles.filledButton} onClick={() => router.push('/user/login')}>
            Student Login
          </button>
        </div>
      </header>

      <section className={styles.hero}>
        <h1>Simplify Group Assignments</h1>
        <p>
          A powerful platform for managing group formation, assignment tracking, and collaborative learning
        </p>
        <div className={styles.heroButtons}>
          <button onClick={() => router.push('/admin/login')}>Admin Dashboard</button>
          <button onClick={() => router.push('/user/login')}>Student Portal</button>
        </div>
      </section>

      <section className={styles.features}>
        <h2>Powerful Features for Every Role</h2>
        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🛡️</div>
            <h3 className={styles.cardTitle}>Admin Control Panel</h3>
            <p>Complete management capabilities</p>
            <ul>
              <li>👥 Create and manage user groups</li>
              <li>📘 Assign group-specific tasks</li>
              <li>🎯 Track submission progress</li>
            </ul>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>👤</div>
            <h3 className={styles.cardTitle}>Student Dashboard</h3>
            <p>Personalized learning experience</p>
            <ul>
              <li>👥 View group members and details</li>
              <li>📘 Access assigned tasks</li>
              <li>🎯 Submit assignments seamlessly</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>🎓 Group Assignment Coordinator</p>
        <p>Empowering collaborative learning through organized group management</p>
      </footer>
    </div>
  );
}
