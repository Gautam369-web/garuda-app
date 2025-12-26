import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/lib/data.json');
const IS_PROD = process.env.NODE_ENV === 'production';

// Fallback for local development
function getLocalData() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({ devices: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function saveLocalData(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Unified Data Fetcher
export async function getDevices() {
    if (IS_PROD) {
        try {
            const { rows } = await sql`SELECT * FROM devices ORDER BY registered_at DESC`;
            // Map names to match our expected JS object format
            return rows.map(r => ({
                hwid: r.hwid,
                pcName: r.pc_name,
                username: r.username,
                licenseKey: r.license_key,
                status: r.status,
                validUntil: r.valid_until,
                lastCheckIn: r.last_check_in,
                registeredAt: r.registered_at
            }));
        } catch (e) {
            console.error("Postgres Error, falling back to local init", e);
            // Try to create table if it doesn't exist
            await sql`CREATE TABLE IF NOT EXISTS devices (
        hwid TEXT PRIMARY KEY,
        pc_name TEXT,
        username TEXT,
        license_key TEXT,
        status TEXT,
        valid_until TEXT,
        last_check_in TEXT,
        registered_at TEXT
      )`;
            return [];
        }
    }
    return getLocalData().devices;
}

export async function upsertDevice(device) {
    if (IS_PROD) {
        await sql`
      INSERT INTO devices (hwid, pc_name, username, license_key, status, valid_until, last_check_in, registered_at)
      VALUES (${device.hwid}, ${device.pcName}, ${device.username}, ${device.licenseKey}, ${device.status}, ${device.validUntil}, ${device.lastCheckIn}, ${device.registeredAt})
      ON CONFLICT (hwid) 
      DO UPDATE SET 
        last_check_in = ${device.lastCheckIn},
        pc_name = ${device.pcName},
        username = ${device.username},
        status = EXCLUDED.status,
        valid_until = EXCLUDED.valid_until
    `;
        return;
    }
    const data = getLocalData();
    const index = data.devices.findIndex(d => d.hwid === device.hwid);
    if (index === -1) {
        data.devices.push(device);
    } else {
        data.devices[index] = { ...data.devices[index], ...device };
    }
    saveLocalData(data);
}

export async function deleteDevice(hwid) {
    if (IS_PROD) {
        await sql`DELETE FROM devices WHERE hwid = ${hwid}`;
        return;
    }
    const data = getLocalData();
    data.devices = data.devices.filter(d => d.hwid !== hwid);
    saveLocalData(data);
}
