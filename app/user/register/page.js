'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (res.ok) router.push('/user/login');
    else setError(data.message);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.logoHeader}>
          <div className={styles.logoIcon}>🎓</div>
          <h1 className={styles.logoText}>Group Assignment Coordinator</h1>
          <p className={styles.subtext}>Student Registration</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Create Account</h2>
          <p className={styles.cardDescription}>
            Join the platform to access your assignments
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.inputGroup}>
              <label htmlFor="username">Full Name</label>
              <input
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
            </div>

            <button type="submit" className={styles.submit}>Create Account</button>
          </form>

          <p className={styles.loginLink}>
            Already have an account?{' '}
            <span onClick={() => router.push('/user/login')}>Sign in here</span>
          </p>
        </div>
      </div>
    </div>
  );
}
