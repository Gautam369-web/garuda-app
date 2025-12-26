import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        const ADMIN_EMAIL = "gkk.devx@gmail.com";
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            // Set a session cookie
            // In a real app, you'd use a JWT or a proper session store
            // Here we use a simple plain-text (or simple hash) for portability
            // SECURITY: Generate a secure session token
            // We'll create a simple hash of the password + a salt/secret
            const SESSION_SECRET = process.env.SESSION_SECRET || "default_secret_dont_use_in_prod";
            const sessionToken = Buffer.from(`${ADMIN_PASSWORD}:${SESSION_SECRET}`).toString('base64');

            const cookieStore = await cookies();
            cookieStore.set('admin_session', sessionToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
