import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/lib/data.json');

export function getData() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({ devices: [] }, null, 2));
    }
    const fileData = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(fileData);
}

export function saveData(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
