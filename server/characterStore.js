import { randomUUID } from 'crypto';
import { getDb } from './db.js';

/**
 * List all characters for a project
 */
export function listCharactersByProject(projectId) {
    const db = getDb();
    return db.prepare(`
        SELECT * FROM characters 
        WHERE project_id = ?
        ORDER BY created_at ASC
    `).all(projectId)
        .map(row => ({
            id: row.id,
            projectId: row.project_id,
            name: row.name,
            description: row.description || '',
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
}

/**
 * Get a single character by ID
 */
export function getCharacter(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
    if (!row) return null;

    return {
        id: row.id,
        projectId: row.project_id,
        name: row.name,
        description: row.description || '',
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

/**
 * Create a new character
 */
export function createCharacter(attrs) {
    if (!attrs.projectId || !attrs.name) {
        throw new Error('projectId and name are required');
    }

    const db = getDb();
    const id = attrs.id || `char-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const result = db.prepare(`
        INSERT INTO characters (id, project_id, name, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        id,
        attrs.projectId,
        attrs.name,
        attrs.description || '',
        now,
        now
    );

    return getCharacter(id);
}

/**
 * Update an existing character
 */
export function updateCharacter(id, attrs) {
    const db = getDb();
    const existing = getCharacter(id);
    if (!existing) return null;

    const now = new Date().toISOString();

    // Dynamic update query
    const updates = [];
    const values = [];

    if (attrs.name !== undefined) {
        updates.push('name = ?');
        values.push(attrs.name);
    }

    if (attrs.description !== undefined) {
        updates.push('description = ?');
        values.push(attrs.description);
    }

    if (updates.length === 0) return existing;

    updates.push('updated_at = ?');
    values.push(now);

    values.push(id); // For WHERE clause

    db.prepare(`
        UPDATE characters 
        SET ${updates.join(', ')} 
        WHERE id = ?
    `).run(...values);

    return getCharacter(id);
}

/**
 * Delete a character
 */
export function deleteCharacter(id) {
    const db = getDb();
    const result = db.prepare('DELETE FROM characters WHERE id = ?').run(id);
    return result.changes > 0;
}

/**
 * Bulk create characters (useful for AI generation)
 * Uses a transaction for performance
 */
export function createCharactersBulk(projectId, charactersData) {
    const db = getDb();
    const now = new Date().toISOString();

    const insert = db.prepare(`
        INSERT INTO characters (id, project_id, name, description, created_at, updated_at)
        VALUES (@id, @projectId, @name, @description, @createdAt, @updatedAt)
    `);

    const createMany = db.transaction((chars) => {
        for (const char of chars) {
            insert.run({
                id: `char-${Date.now()}-${randomUUID().slice(0, 8)}`, // Generate ID if not provided, though typically we assume fresh
                projectId,
                name: char.name,
                description: char.description || '',
                createdAt: now,
                updatedAt: now
            });
        }
    });

    createMany(charactersData);
    return listCharactersByProject(projectId);
}
