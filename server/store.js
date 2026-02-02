import { randomUUID } from 'crypto';
import { getDb } from './db.js';

function rowToProject(row) {
  if (!row) return null;
  let screenplayScenes = [];
  let assets = [];
  try {
    screenplayScenes = JSON.parse(row.screenplay_scenes || '[]');
  } catch (_) { }
  try {
    assets = JSON.parse(row.assets || '[]');
  } catch (_) { }
  return {
    id: row.id,
    name: row.name ?? 'Untitled Project',
    storyIdea: row.story_idea ?? '',
    screenplayScenes,
    assets,
    shotCount: row.shot_count ?? 0,
    status: row.status ?? 'draft',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listProjects() {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, name, updated_at, created_at, shot_count, status
       FROM projects
       ORDER BY updated_at DESC`
    )
    .all();
  return rows.map((row) => ({
    id: row.id,
    name: row.name ?? 'Untitled Project',
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    shotCount: row.shot_count ?? 0,
    status: row.status ?? 'draft',
  }));
}

import * as sceneStore from './sceneStore.js';

export function getProject(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  const project = rowToProject(row);
  if (!project) return null;

  // Fetch scenes from new table
  const scenes = sceneStore.listScenesByProject(id);
  if (scenes.length > 0) {
    project.screenplayScenes = scenes;
  }

  return project;
}

export function createProject(attrs = {}) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = attrs.id ?? randomUUID();
  const name = attrs.name ?? 'Untitled Project';
  const storyIdea = attrs.storyIdea ?? '';
  // screenplayScenes in JSON column is legacy/fallback, but we can init it empty
  const screenplayScenes = JSON.stringify([]);
  const assets = JSON.stringify([]); // Legacy assets column
  const shotCount = attrs.shotCount ?? 0;
  const status = attrs.status ?? 'draft';

  db.prepare(
    `INSERT INTO projects (id, name, story_idea, screenplay_scenes, assets, shot_count, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, name, storyIdea, screenplayScenes, assets, shotCount, status, now, now);

  // If initial scenes provided, create them
  if (attrs.screenplayScenes && attrs.screenplayScenes.length > 0) {
    sceneStore.updateProjectScenes(id, attrs.screenplayScenes);
  }

  return getProject(id);
}

export function updateProject(id, attrs) {
  const existing = getProject(id);
  if (!existing) return null;

  const db = getDb();
  const now = new Date().toISOString();

  // Handle scenes update via new store
  if (attrs.screenplayScenes) {
    sceneStore.updateProjectScenes(id, attrs.screenplayScenes);
    // We don't update the JSON column anymore for scenes
  }

  const name = attrs.name !== undefined ? attrs.name : existing.name;
  const storyIdea = attrs.storyIdea !== undefined ? attrs.storyIdea : existing.storyIdea;
  const shotCount = attrs.shotCount !== undefined ? attrs.shotCount : existing.shotCount;
  const status = attrs.status !== undefined ? attrs.status : existing.status;

  db.prepare(
    `UPDATE projects
     SET name = ?, story_idea = ?, shot_count = ?, status = ?, updated_at = ?
     WHERE id = ?`
  ).run(name, storyIdea, shotCount, status, now, id);

  return getProject(id);
}

export function deleteProject(id) {
  const db = getDb();
  const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return result.changes > 0;
}

// --- API Settings ---

export function getApiSettings() {
  const db = getDb();
  const row = db.prepare('SELECT * FROM api_settings WHERE id = ?').get('default');
  if (!row) {
    return {
      id: 'default',
      googleAiApiKey: '',
      hasKey: false
    };
  }
  return {
    id: row.id,
    googleAiApiKey: row.google_ai_api_key || '',
    hasKey: !!(row.google_ai_api_key && row.google_ai_api_key.length > 0),
    updatedAt: row.updated_at
  };
}

export function saveApiSettings(settings) {
  const db = getDb();
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT * FROM api_settings WHERE id = ?').get('default');

  if (existing) {
    db.prepare(
      `UPDATE api_settings SET google_ai_api_key = ?, updated_at = ? WHERE id = ?`
    ).run(settings.googleAiApiKey || '', now, 'default');
  } else {
    db.prepare(
      `INSERT INTO api_settings (id, google_ai_api_key, created_at, updated_at) VALUES (?, ?, ?, ?)`
    ).run('default', settings.googleAiApiKey || '', now, now);
  }

  return getApiSettings();
}
