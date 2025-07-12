// app/components/Nav.tsx
"use client";

import { useRouter } from 'next/navigation';

export default function Nav({ user }: { user?: { id: string; name: string; email: string } | null }) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear cookies on the client side
    document.cookie = 'accessToken=; Max-Age=0; path=/';
    document.cookie = 'refreshToken=; Max-Age=0; path=/';
    router.push('/login'); // Use router.push for client-side navigation
  };

  // Only render nav if user is logged in (user is not null)
  if (!user) {
    return null; // Hide nav when not logged in
  }

  return (
    <nav className="nav">
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        {/* Add more nav links as needed */}
      </ul>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}