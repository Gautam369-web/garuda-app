import { NextResponse } from 'next/server';

export function middleware(request) {
    const session = request.cookies.get('admin_session');
    const path = request.nextUrl.pathname;

    // 1. If at /login and has session -> redirect home
    if (path === '/login' && session) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 2. Protect Dashboard and Admin APIs
    const isProtectedRoute = path === '/' || path.startsWith('/api/admin');

    if (isProtectedRoute && !session) {
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
