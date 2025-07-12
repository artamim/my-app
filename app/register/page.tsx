// app/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link'; // Import Link for navigation
import '../auth.css'; // Corrected path to auth.css

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Name state
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT; // Access the env variable
    if (!API_ENDPOINT) {
      setError('API endpoint not configured');
      return;
    }

    const res = await fetch(`${API_ENDPOINT}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (res.ok) {
      // Tokens are set as cookies by FastAPI, no need to store manually
      window.location.href = '/';
    } else {
      const errorData = await res.json(); // Parse error details
      setError(errorData.detail || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <h1>Register</h1>
      {error && <p className="auth-error">{error}</p>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>
        <button type="submit">Register</button>
      </form>
      <Link href="/login" className="auth-link">
        Already have an account? Login here
      </Link>
    </div>
  );
}