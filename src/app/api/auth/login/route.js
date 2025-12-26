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
            const cookieStore = await cookies();
            cookieStore.set('admin_session', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
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
