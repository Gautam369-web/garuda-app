import { NextResponse } from 'next/server';
import { getDevices, upsertDevice, deleteDevice } from '@/lib/db';

// GET all devices
export async function GET() {
    try {
        const devices = await getDevices();
        return NextResponse.json(devices);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// UPDATE a device
export async function PATCH(req) {
    try {
        const { hwid, status, validUntil } = await req.json();
        const devices = await getDevices();
        const device = devices.find(d => d.hwid === hwid);

        if (!device) {
            return NextResponse.json({ error: "Device not found" }, { status: 404 });
        }

        if (status) device.status = status;
        if (validUntil !== undefined) device.validUntil = validUntil;

        await upsertDevice(device);
        return NextResponse.json(device);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE a device
export async function DELETE(req) {
    try {
        const { hwid } = await req.json();
        await deleteDevice(hwid);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
