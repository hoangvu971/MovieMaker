import { randomUUID } from 'crypto';
import { getDb } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

/**
 * Asset CRUD operations
 */

export function listAssetsByProject(projectId) {
    const db = getDb();
    const rows = db
        .prepare(
            `SELECT * FROM assets 
       WHERE project_id = ? 
       ORDER BY created_at DESC`
        )
        .all(projectId);

    return rows.map((row) => ({
        id: row.id,
        projectId: row.project_id,
        name: row.name,
        url: row.url,
        type: row.type,
        size: row.size,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}

export function getAsset(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
    if (!row) return null;

    return {
        id: row.id,
        projectId: row.project_id,
        name: row.name,
        url: row.url,
        type: row.type,
        size: row.size,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function createAsset(attrs) {
    const db = getDb();
    const now = new Date().toISOString();
    const id = attrs.id ?? randomUUID();
    const projectId = attrs.projectId;
    const name = attrs.name;
    const url = attrs.url;
    const type = attrs.type ?? null;
    const size = attrs.size ?? null;

    if (!projectId || !name || !url) {
        throw new Error('projectId, name, and url are required');
    }

    db.prepare(
        `INSERT INTO assets (id, project_id, name, url, type, size, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, projectId, name, url, type, size, now, now);

    return getAsset(id);
}

export function updateAsset(id, attrs) {
    const existing = getAsset(id);
    if (!existing) return null;

    const db = getDb();
    const now = new Date().toISOString();
    const name = attrs.name !== undefined ? attrs.name : existing.name;
    const url = attrs.url !== undefined ? attrs.url : existing.url;
    const type = attrs.type !== undefined ? attrs.type : existing.type;
    const size = attrs.size !== undefined ? attrs.size : existing.size;

    db.prepare(
        `UPDATE assets
     SET name = ?, url = ?, type = ?, size = ?, updated_at = ?
     WHERE id = ?`
    ).run(name, url, type, size, now, id);

    return getAsset(id);
}

export function deleteAsset(id) {
    const asset = getAsset(id);
    if (!asset) return false;

    // Delete file from disk
    if (asset.url && asset.url.startsWith('/uploads/')) {
        const filePath = path.join(UPLOADS_DIR, path.basename(asset.url));
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (e) {
            console.error(`Failed to delete file for asset ${id}:`, e);
        }
    }

    const db = getDb();
    const result = db.prepare('DELETE FROM assets WHERE id = ?').run(id);
    return result.changes > 0;
}

export function deleteAssetsByProject(projectId) {
    const db = getDb();
    const result = db.prepare('DELETE FROM assets WHERE project_id = ?').run(projectId);
    return result.changes;
}
