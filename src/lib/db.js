import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/lib/data.json');
const MONGODB_URI = process.env.STORAGE_URL || process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "garuda_db";

let client;
let clientPromise;

if (MONGODB_URI) {
    if (process.env.NODE_ENV === 'development') {
        // In development mode, use a global variable so that the value
        // is preserved across module reloads caused by HMR (Hot Module Replacement).
        if (!global._mongoClientPromise) {
            client = new MongoClient(MONGODB_URI);
            global._mongoClientPromise = client.connect();
        }
        clientPromise = global._mongoClientPromise;
    } else {
        // In production mode, it's best to not use a global variable.
        client = new MongoClient(MONGODB_URI);
        clientPromise = client.connect();
    }
}

async function getDb() {
    if (!MONGODB_URI) return null;
    const client = await clientPromise;
    return client.db(MONGODB_DB);
}

// Fallback for local development WITHOUT MongoDB
function getLocalData() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            // Only try to write if we are NOT on Vercel (or in dev)
            if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
                fs.writeFileSync(DB_PATH, JSON.stringify({ devices: [] }, null, 2));
            }
            return { devices: [] };
        }
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } catch (err) {
        console.error("Local Data Error:", err);
        return { devices: [] };
    }
}

function saveLocalData(data) {
    try {
        if (!process.env.VERCEL) {
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        } else {
            console.warn("Attempted to save local data on Vercel - ignored.");
        }
    } catch (err) {
        console.error("Save Local Data Error:", err);
    }
}

export async function getDevices() {
    try {
        const db = await getDb();
        if (db) {
            const devices = await db.collection("devices").find({}).sort({ registeredAt: -1 }).toArray();
            return devices;
        }
    } catch (err) {
        console.error("getDevices MongoDB Error:", err);
    }
    return getLocalData().devices || [];
}

export async function upsertDevice(device) {
    try {
        // SECURITY: Sanitize hwid input to prevent NoSQL injection
        if (typeof device.hwid !== 'string') {
            throw new Error("Invalid HWID type");
        }

        const db = await getDb();
        if (db) {
            const { hwid, ...updateData } = device;
            delete updateData._id;
            await db.collection("devices").updateOne(
                { hwid: hwid },
                { $set: updateData },
                { upsert: true }
            );
            return;
        }
    } catch (err) {
        console.error("upsertDevice MongoDB Error:", err);
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
    try {
        // SECURITY: Sanitize hwid input
        if (typeof hwid !== 'string') {
            throw new Error("Invalid HWID type");
        }

        const db = await getDb();
        if (db) {
            await db.collection("devices").deleteOne({ hwid });
            return;
        }
    } catch (err) {
        console.error("deleteDevice MongoDB Error:", err);
    }

    const data = getLocalData();
    data.devices = data.devices.filter(d => d.hwid !== hwid);
    saveLocalData(data);
}
