import { NextResponse } from 'next/server';
import { getDevices, upsertDevice } from '@/lib/db';

export async function POST(req) {
    try {
        const { hwid, pcName, username, licenseKey } = await req.json();

        if (!hwid) {
            return NextResponse.json({ error: "Missing HWID" }, { status: 400 });
        }

        const devices = await getDevices();
        let device = devices.find(d => d.hwid === hwid);

        if (!device) {
            // First time registration
            device = {
                hwid,
                pcName: pcName || "Unknown",
                username: username || "Unknown",
                licenseKey: licenseKey || "None",
                status: "PENDING",
                validUntil: null,
                lastCheckIn: new Date().toISOString(),
                registeredAt: new Date().toISOString()
            };
        } else {
            // Existing device: update check-in
            device.lastCheckIn = new Date().toISOString();
            if (pcName) device.pcName = pcName;
            if (username) device.username = username;
        }

        await upsertDevice(device);

        return NextResponse.json({
            status: device.status,
            validUntil: device.validUntil,
            message: device.status === "PENDING" ? "Awaiting Admin Approval" : "Authorized"
        });

    } catch (error) {
        console.error("Check License Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
