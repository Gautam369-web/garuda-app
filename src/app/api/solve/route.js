import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { getDevices } from '@/lib/db';

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function POST(req) {
    try {
        const licenseKey = req.headers.get("x-license-key");
        const hwid = req.headers.get("x-hardware-id");

        // 1. Validate License
        const devices = await getDevices();
        const device = devices.find(d => d.hwid === hwid);

        if (!device || device.status !== "APPROVED") {
            return NextResponse.json({ error: "Unauthorized or Pending Approval" }, { status: 403 });
        }

        // 2. Process Request
        const { model, messages, temperature } = await req.json();

        const completion = await client.chat.completions.create({
            model,
            messages,
            temperature: temperature || 0.1,
        });

        return NextResponse.json({ content: completion.choices[0].message.content });

    } catch (error) {
        console.error("Solve Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
