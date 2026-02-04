import { randomUUID } from 'crypto';
import { getDb } from './db.js';

/**
 * Shot CRUD operations
 */

/**
 * List all shots for a scene, with their assets
 */
export function listShotsByScene(sceneId) {
    const db = getDb();

    // Fetch shots ordered by shot_order
    const shots = db.prepare(`
        SELECT * FROM shots 
        WHERE scene_id = ? 
        ORDER BY shot_order ASC
    `).all(sceneId);

    if (shots.length === 0) return [];

    // Fetch all assets for these shots
    const shotIds = shots.map(s => s.id);
    const placeholders = shotIds.map(() => '?').join(',');

    const shotAssets = db.prepare(`
        SELECT sa.shot_id, sa.asset_order, a.id as assetId, a.url, a.name, a.type
        FROM shot_assets sa
        JOIN assets a ON sa.asset_id = a.id
        WHERE sa.shot_id IN (${placeholders})
        ORDER BY sa.shot_id, sa.asset_order ASC
    `).all(...shotIds);

    // Group assets by shot
    const assetsByShot = {};
    shotAssets.forEach(sa => {
        if (!assetsByShot[sa.shot_id]) {
            assetsByShot[sa.shot_id] = [];
        }
        assetsByShot[sa.shot_id].push({
            id: sa.assetId,
            url: sa.url,
            name: sa.name,
            type: sa.type,
            order: sa.asset_order
        });
    });

    // Map to response format
    return shots.map(shot => ({
        id: shot.id,
        sceneId: shot.scene_id,
        order: shot.shot_order,
        content: shot.content,
        description: shot.description,
        dialogue: shot.dialogue,
        ert: shot.ert,
        size: shot.size,
        perspective: shot.perspective,
        movement: shot.movement,
        equipment: shot.equipment,
        focalLength: shot.focal_length,
        aspectRatio: shot.aspect_ratio,
        notes: shot.notes,
        assets: assetsByShot[shot.id] || [],
        createdAt: shot.created_at,
        updatedAt: shot.updated_at
    }));
}

/**
 * Get a single shot by ID with its assets
 */
export function getShot(id) {
    const db = getDb();
    const shot = db.prepare('SELECT * FROM shots WHERE id = ?').get(id);
    if (!shot) return null;

    // Get assets for this shot
    const assets = db.prepare(`
        SELECT sa.asset_order, a.id as assetId, a.url, a.name, a.type
        FROM shot_assets sa
        JOIN assets a ON sa.asset_id = a.id
        WHERE sa.shot_id = ?
        ORDER BY sa.asset_order ASC
    `).all(id);

    return {
        id: shot.id,
        sceneId: shot.scene_id,
        order: shot.shot_order,
        content: shot.content,
        description: shot.description,
        dialogue: shot.dialogue,
        ert: shot.ert,
        size: shot.size,
        perspective: shot.perspective,
        movement: shot.movement,
        equipment: shot.equipment,
        focalLength: shot.focal_length,
        aspectRatio: shot.aspect_ratio,
        notes: shot.notes,
        assets: assets.map(a => ({
            id: a.assetId,
            url: a.url,
            name: a.name,
            type: a.type,
            order: a.asset_order
        })),
        createdAt: shot.created_at,
        updatedAt: shot.updated_at
    };
}

/**
 * Update shots for a scene (upsert logic similar to updateProjectScenes)
 */
export function updateSceneShots(sceneId, shotsData) {
    const db = getDb();

    console.log(`[ShotStore] Updating shots for scene ${sceneId}`, {
        count: shotsData.length
    });

    const updateTransaction = db.transaction((shots) => {
        const now = new Date().toISOString();

        const existingRows = db.prepare('SELECT id FROM shots WHERE scene_id = ?').all(sceneId);
        const existingIds = new Set(existingRows.map(r => r.id));
        const incomingIds = new Set(shots.map(s => s.id).filter(id => id && !id.startsWith('temp-')));

        // Delete removed shots
        for (const row of existingRows) {
            if (!incomingIds.has(row.id)) {
                db.prepare('DELETE FROM shots WHERE id = ?').run(row.id);
            }
        }

        // Upsert shots
        for (const shot of shots) {
            const isNew = !existingIds.has(shot.id) || !shot.id || shot.id.startsWith('temp-');
            const shotId = isNew ? (shot.id?.startsWith('temp-') ? randomUUID() : (shot.id || randomUUID())) : shot.id;

            if (isNew) {
                db.prepare(`
                    INSERT INTO shots (id, scene_id, shot_order, content, description, dialogue, ert, size, perspective, movement, equipment, focal_length, aspect_ratio, notes, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    shotId, sceneId, shot.order,
                    shot.content || '', shot.description || '', shot.dialogue || '',
                    shot.ert || '', shot.size || '', shot.perspective || '',
                    shot.movement || '', shot.equipment || '', shot.focalLength || '',
                    shot.aspectRatio || '', shot.notes || '', now, now
                );
            } else {
                db.prepare(`
                    UPDATE shots 
                    SET shot_order = ?, content = ?, description = ?, dialogue = ?, ert = ?, size = ?, perspective = ?, movement = ?, equipment = ?, focal_length = ?, aspect_ratio = ?, notes = ?, updated_at = ?
                    WHERE id = ?
                `).run(
                    shot.order, shot.content || '', shot.description || '',
                    shot.dialogue || '', shot.ert || '', shot.size || '',
                    shot.perspective || '', shot.movement || '', shot.equipment || '',
                    shot.focalLength || '', shot.aspectRatio || '', shot.notes || '',
                    now, shotId
                );
            }

            // Replace assets for this shot
            db.prepare('DELETE FROM shot_assets WHERE shot_id = ?').run(shotId);

            if (shot.assets && shot.assets.length > 0) {
                const stmt = db.prepare(`
                    INSERT INTO shot_assets (id, shot_id, asset_id, asset_order)
                    VALUES (?, ?, ?, ?)
                `);

                shot.assets.forEach((asset, index) => {
                    const assetId = asset.id || asset.assetId;
                    const order = asset.order !== undefined ? asset.order : index;

                    if (assetId) {
                        try {
                            stmt.run(randomUUID(), shotId, assetId, order);
                        } catch (e) {
                            console.error(`[ShotStore] Failed to link asset ${assetId} to shot ${shotId}`, e);
                        }
                    }
                });
            }
        }
    });

    updateTransaction(shotsData);
    return listShotsByScene(sceneId);
}

/**
 * Update individual shot properties (not order or assets)
 */
export function updateShotProperties(id, attrs) {
    const existing = getShot(id);
    if (!existing) return null;

    const db = getDb();
    const now = new Date().toISOString();

    // Only update editable fields (not sceneId or order)
    const content = attrs.content !== undefined ? attrs.content : existing.content;
    const description = attrs.description !== undefined ? attrs.description : existing.description;
    const dialogue = attrs.dialogue !== undefined ? attrs.dialogue : existing.dialogue;
    const ert = attrs.ert !== undefined ? attrs.ert : existing.ert;
    const size = attrs.size !== undefined ? attrs.size : existing.size;
    const perspective = attrs.perspective !== undefined ? attrs.perspective : existing.perspective;
    const movement = attrs.movement !== undefined ? attrs.movement : existing.movement;
    const equipment = attrs.equipment !== undefined ? attrs.equipment : existing.equipment;
    const focalLength = attrs.focalLength !== undefined ? attrs.focalLength : existing.focalLength;
    const aspectRatio = attrs.aspectRatio !== undefined ? attrs.aspectRatio : existing.aspectRatio;
    const notes = attrs.notes !== undefined ? attrs.notes : existing.notes;

    db.prepare(`
        UPDATE shots
        SET content = ?, description = ?, dialogue = ?, ert = ?, size = ?, perspective = ?, movement = ?, equipment = ?, focal_length = ?, aspect_ratio = ?, notes = ?, updated_at = ?
        WHERE id = ?
    `).run(content, description, dialogue, ert, size, perspective, movement, equipment, focalLength, aspectRatio, notes, now, id);

    return getShot(id);
}

/**
 * Update assets for a specific shot
 */
export function updateShotAssets(shotId, assetIds) {
    const shot = getShot(shotId);
    if (!shot) return null;

    const db = getDb();

    db.transaction(() => {
        // Clear existing
        db.prepare('DELETE FROM shot_assets WHERE shot_id = ?').run(shotId);

        // Insert new
        if (assetIds && assetIds.length > 0) {
            const stmt = db.prepare(`
                INSERT INTO shot_assets (id, shot_id, asset_id, asset_order)
                VALUES (?, ?, ?, ?)
            `);

            assetIds.forEach((assetId, index) => {
                try {
                    stmt.run(randomUUID(), shotId, assetId, index);
                } catch (e) {
                    console.error(`[ShotStore] Failed to link asset ${assetId} to shot ${shotId}`, e);
                }
            });
        }
    })();

    return getShot(shotId);
}

/**
 * Delete a single shot
 */
export function deleteShot(id) {
    const db = getDb();
    const result = db.prepare('DELETE FROM shots WHERE id = ?').run(id);
    return result.changes > 0;
}

/**
 * Delete all shots for a scene
 */
export function deleteShotsByScene(sceneId) {
    const db = getDb();
    const result = db.prepare('DELETE FROM shots WHERE scene_id = ?').run(sceneId);
    return result.changes;
}
