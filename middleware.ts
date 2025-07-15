import { NextResponse } from 'next/server';
import { jwtVerify, JWTVerifyOptions } from 'jose'; // Explicitly import JWTVerifyOptions
import type { NextRequest } from 'next/server';

// Extend JWTVerifyOptions to include leeway
interface CustomJWTVerifyOptions extends JWTVerifyOptions {
  leeway?: number;
}

// Define user interface based on FastAPI /me response
interface User {
  id?: string;
  name: string;
  email: string;
  [key: string]: any;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

  // Validate API_ENDPOINT
  if (!API_ENDPOINT) {
    console.error('API_ENDPOINT is not defined');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const createResponseWithUser = (user: User) => {
    const response = NextResponse.next();
    response.headers.set('x-user', JSON.stringify(user));
    return response;
  };

  // Check if the request is for /login or /register, skip middleware
  const { pathname } = request.nextUrl;
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.next();
  }

  if (accessToken) {
    try {
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined');
        return NextResponse.redirect(new URL('/login', request.url));
      }
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(accessToken, secret, {
        algorithms: ['HS256'],
        maxTokenAge: '15m', // Match access token expiration
        leeway: 10, // Allow 10 seconds for clock skew (type-safe with extension)
      } as CustomJWTVerifyOptions); // Type assertion
      const user = payload as User;
      return createResponseWithUser(user);
    } catch (error) {
      console.error('Access Token Verification Error:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (refreshToken) {
    try {
      if (!process.env.JWT_REFRESH_SECRET) {
        console.error('JWT_REFRESH_SECRET is not defined');
        return NextResponse.redirect(new URL('/login', request.url));
      }
      const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
      const { payload } = await jwtVerify(refreshToken, secret, {
        algorithms: ['HS256'],
        maxTokenAge: '7d', // Match refresh token expiration
        leeway: 10, // Allow 10 seconds for clock skew (type-safe with extension)
      } as CustomJWTVerifyOptions); // Type assertion
      const refreshUser = payload as User;

      const refreshResponse = await fetch(`${API_ENDPOINT}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshResponse.ok) {
        console.error('Refresh API failed:', refreshResponse.status);
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = await refreshResponse.json();
      const response = NextResponse.next();
      response.cookies.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes
      });
      response.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
      response.headers.set('x-user', JSON.stringify(user));
      return response;
    } catch (error) {
      console.error('Refresh Token Verification Error:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect to login if no valid token
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|register).*)'],
};