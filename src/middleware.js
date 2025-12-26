import { NextResponse } from 'next/server';

export function middleware(request) {
    const session = request.cookies.get('admin_session')?.value;
    const path = request.nextUrl.pathname;

    // Calculate what the valid token should be
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
    const SESSION_SECRET = process.env.SESSION_SECRET || "default_secret_dont_use_in_prod";
    const validToken = Buffer.from(`${ADMIN_PASSWORD}:${SESSION_SECRET}`).toString('base64');

    const isAuthenticated = session === validToken;

    // 1. If at /login and has session -> redirect home
    if (path === '/login' && isAuthenticated) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 2. Protect Dashboard and Admin APIs
    const isProtectedRoute = path === '/' || path.startsWith('/api/admin');

    if (isProtectedRoute && !isAuthenticated) {
        if (path.startsWith('/api/')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login', '/api/admin/:path*'],
};
