import { NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/db';

// GET all devices
export async function GET() {
    try {
        const data = getData();
        return NextResponse.json(data.devices);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// UPDATE a device
export async function PATCH(req) {
    try {
        const { hwid, status, validUntil } = await req.json();
        const data = getData();
        const index = data.devices.findIndex(d => d.hwid === hwid);

        if (index === -1) {
            return NextResponse.json({ error: "Device not found" }, { status: 404 });
        }

        if (status) data.devices[index].status = status;
        if (validUntil !== undefined) data.devices[index].validUntil = validUntil;

        saveData(data);
        return NextResponse.json(data.devices[index]);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE a device
export async function DELETE(req) {
    try {
        const { hwid } = await req.json();
        const data = getData();
        data.devices = data.devices.filter(d => d.hwid !== hwid);
        saveData(data);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
