import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  const createResponseWithUser = (user: { id: string; name: string; email: string; [key: string]: any }) => {
    const response = NextResponse.next();
    response.headers.set('x-user', JSON.stringify(user));
    return response;
  };

  if (accessToken) {
    try {
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined');
        return NextResponse.redirect(new URL('/login', request.url));
      }
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(accessToken, secret, {
        algorithms: ['HS256'],
      });
      const user = payload as { id: string; name: string; email: string; [key: string]: any };
      return createResponseWithUser(user);
    } catch (error) {
      console.error('Access Token Verification Error:', error);
    }
  }

  if (refreshToken) {
    try {
      if (!process.env.JWT_REFRESH_SECRET) {
        console.error('JWT爽_SECRET is not defined');
        return NextResponse.redirect(new URL('/login', request.url));
      }
      const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
      const { payload } = await jwtVerify(refreshToken, secret, {
        algorithms: ['HS256'],
      });
      const refreshUser = payload as { id: string; name: string; email: string; [key: string]: any };

      const refreshResponse = await fetch(`${request.nextUrl.origin}/api/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const { accessToken: newAccessToken, user } = await refreshResponse.json();
        const response = NextResponse.next();
        response.cookies.set('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60, // 15 minutes
        });
        response.headers.set('x-user', JSON.stringify(user));
        return response;
      } else {
        console.error('Refresh API failed:', refreshResponse.status);
      }
    } catch (error) {
      console.error('Refresh Token Verification Error:', error);
    }
  }

  if (request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};