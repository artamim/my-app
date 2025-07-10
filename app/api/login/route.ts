// app/api/login/route.ts
import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  // Mock authentication (replace with database check)
  if (email === 'user@example.com' && password === 'password') {
    const user = { id: '1', name: 'John Doe', email: 'user@example.com' };
    const accessToken = sign(user, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const refreshToken = sign(user, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
    console.log("accesstoken "+ accessToken);
    const response = NextResponse.json({ message: 'Login successful' });
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
    });
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    return response;
  }
  return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
}