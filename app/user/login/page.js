'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './userlogin.module.css';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        throw new Error('Invalid JSON response from server');
      }

      if (res.ok) {
        localStorage.setItem("role", "user");
        localStorage.setItem("email", data.email);
        //localStorage.setItem("email", user.email);
        localStorage.setItem("username", data.username);
        router.push('/user/dashboards');
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
          <p className={styles.subtext}>Student Portal</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Student Login</h2>
          <p className={styles.cardDescription}>
            Sign in to access your assignments and group
          </p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="identifier">Email or Username</label>
              <input
                id="identifier"
                type="text"
                placeholder="student@university.edu"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
            {error && <p className={styles['error-message']}>{error}</p>}
            <button type="submit" className={styles.submit}>Sign In</button>
          </form>
          <p className={styles['register-link']}>
            Don&apos;t have an account?{' '}
            <span onClick={() => router.push('/user/register')}>Register here</span>
          </p>
        </div>
      </div>
    </div>
  );
}
