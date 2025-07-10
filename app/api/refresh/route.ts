// app/api/refresh/route.ts
import { NextResponse } from 'next/server';
import { verify, sign } from 'jsonwebtoken';

export async function POST(request: Request) {
  const { refreshToken } = await request.json();

  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token provided' }, { status: 401 });
  }

  try {
    // Verify refreshToken
    const user = verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      id: string;
      name: string;
      email: string;
      [key: string]: any;
    };

    // Generate new accessToken
    const newAccessToken = sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    return NextResponse.json({
      message: 'Token refreshed',
      accessToken: newAccessToken,
      user,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
  }
}