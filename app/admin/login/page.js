'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './adminlogin.module.css';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        throw new Error('Invalid JSON response from server');
      }

      if (res.ok) {
        localStorage.setItem("role", "admin");
        router.push('/admin/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.logoHeader}>
          <span className={styles.logoIcon}>🎓</span>
          <h1 className={styles.logoText}>Group Assignment Coordinator</h1>
          <p className={styles.subtext}>Admin Portal</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Admin Login</h2>
          <p className={styles.cardDescription}>
            Enter your credentials to access the admin dashboard
          </p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="username">username</label>
              <input
                id="username"
                type="name"
                placeholder="admi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.submit}>Sign In</button>
          </form>
        </div>

        <div className={styles.backLink}>
          <Link href="/" className={styles.backText}>⬅️ Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
