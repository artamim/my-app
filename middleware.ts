import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

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

  if (!API_ENDPOINT) {
    console.error('API_ENDPOINT is not defined');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const createResponseWithUser = (user: User) => {
    const response = NextResponse.next();
    response.headers.set('x-user', JSON.stringify(user));
    return response;
  };

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
        maxTokenAge: '15m', // Enforce 15-minute expiration
      });
      const user = payload as User;
      return createResponseWithUser(user);
    } catch (error) {
      console.error('Access Token Verification Error:', error);
      // Fall through to refresh token logic
    }
  }

  if (refreshToken) {
    try {
      const refreshResponse = await fetch(`${API_ENDPOINT}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }), // Fixed key name
      });

      if (!refreshResponse.ok) {
        const errorData = await refreshResponse.json();
        console.error('Refresh API failed:', refreshResponse.status, errorData.detail);
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(errorData.detail || 'Refresh failed')}`, request.url)
        );
      }

      const { user } = await refreshResponse.json();
      const response = NextResponse.next();
      response.headers.set('x-user', JSON.stringify(user));
      return response; // Rely on FastAPI's Set-Cookie headers
    } catch (error) {
      console.error('Refresh Token Verification Error:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|register).*)'],
};