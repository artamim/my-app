// app/page.tsx
'use client';

import { useUser } from './_lib/UserContext';
import styles from './page.module.css';

export default function Home() {
  const { user } = useUser();

  if (!user) {
    // Unlikely due to middleware redirect, but included for robustness
    return <div>Loading user data...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Welcome, {user.name}!</h1>
      <p>Your email is {user.email}</p>
    </div>
  );
}