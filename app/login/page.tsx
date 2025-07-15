// app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import '../auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
    if (!API_ENDPOINT) {
      setError('API endpoint not configured');
      return;
    }

    console.log('API Endpoint:', API_ENDPOINT);
    const res = await fetch(`${API_ENDPOINT}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    console.log('Set-Cookie Headers:', res.headers.get('set-cookie'));
    if (res.ok) {
      window.location.href = '/';
    } else {
      const errorData = await res.json();
      let errorMessage = 'Invalid credentials';
      
      // Handle different error formats
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          // Handle Pydantic validation errors (array of error objects)
          errorMessage = errorData.detail.map((err: any) => err.msg).join(', ');
        } else if (typeof errorData.detail === 'object') {
          // Handle single error object
          errorMessage = errorData.detail.msg || JSON.stringify(errorData.detail);
        }
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <h1>Login</h1>
      {error && <p className="auth-error">{error}</p>}
      <form className="auth-form" onSubmit={handleSubmit}>
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
        <button type="submit">Login</button>
      </form>
      <Link href="/register" className="auth-link">
        Don’t have an account? Register here
      </Link>
    </div>
  );
}