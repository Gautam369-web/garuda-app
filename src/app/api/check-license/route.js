import { NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/db';

export async function POST(req) {
    try {
        const { hwid, pcName, username, licenseKey } = await req.json();

        if (!hwid) {
            return NextResponse.json({ error: "Missing HWID" }, { status: 400 });
        }

        const data = getData();
        let device = data.devices.find(d => d.hwid === hwid);

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
            data.devices.push(device);
            saveData(data);
        } else {
            // Existing device: update last check-in
            device.lastCheckIn = new Date().toISOString();
            if (pcName) device.pcName = pcName;
            if (username) device.username = username;
            saveData(data);
        }

        return NextResponse.json({
            status: device.status,
            validUntil: device.validUntil,
            message: device.status === "PENDING" ? "Awaiting Admin Approval" : "Authorized"
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
