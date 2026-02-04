import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'storyboard.db');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

let db = null;

export function getDb() {
  if (db) return db;
  ensureDataDir();
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  runMigrations(db);
  return db;
}

function runMigrations(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'Untitled Project',
      script TEXT DEFAULT '',
      screenplay_scenes TEXT DEFAULT '[]',
      assets TEXT DEFAULT '[]',
      shot_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      project_state TEXT DEFAULT 'NO_SCRIPT',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT,
      size INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_assets_project_id ON assets(project_id);
    CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at DESC);

    CREATE TABLE IF NOT EXISTS scenes (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      scene_order INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON scenes(project_id);
    CREATE INDEX IF NOT EXISTS idx_scenes_order ON scenes(project_id, scene_order);

    CREATE TABLE IF NOT EXISTS scene_assets (
      id TEXT PRIMARY KEY,
      scene_id TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE,
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
    );
     
    CREATE INDEX IF NOT EXISTS idx_scene_assets_scene_id ON scene_assets(scene_id);
    
    -- Ensure unique asset per scene (if we want to enforce no duplicates)
    CREATE UNIQUE INDEX IF NOT EXISTS idx_scene_assets_unique ON scene_assets(scene_id, asset_id);

    -- Shots table: individual shots within a scene
    CREATE TABLE IF NOT EXISTS shots (
      id TEXT PRIMARY KEY,
      scene_id TEXT NOT NULL,
      shot_order INTEGER NOT NULL,
      content TEXT DEFAULT '',
      description TEXT DEFAULT '',
      dialogue TEXT DEFAULT '',
      ert TEXT DEFAULT '',
      size TEXT DEFAULT '',
      perspective TEXT DEFAULT '',
      movement TEXT DEFAULT '',
      equipment TEXT DEFAULT '',
      focal_length TEXT DEFAULT '',
      aspect_ratio TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_shots_scene_id ON shots(scene_id);
    CREATE INDEX IF NOT EXISTS idx_shots_order ON shots(scene_id, shot_order);

    -- Shot assets table: links shots to assets (subset of scene assets)
    CREATE TABLE IF NOT EXISTS shot_assets (
      id TEXT PRIMARY KEY,
      shot_id TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      asset_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (shot_id) REFERENCES shots(id) ON DELETE CASCADE,
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_shot_assets_shot_id ON shot_assets(shot_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_shot_assets_unique ON shot_assets(shot_id, asset_id);

    -- API settings table (global settings, not per-project)
    CREATE TABLE IF NOT EXISTS api_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      google_ai_api_key TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Migration: Add project_state column to existing projects table
  try {
    // Check if column exists
    const columns = database.pragma('table_info(projects)');
    const hasProjectState = columns.some(col => col.name === 'project_state');

    if (!hasProjectState) {
      console.log('Running migration: Adding project_state column...');
      database.exec(`
        ALTER TABLE projects ADD COLUMN project_state TEXT DEFAULT 'NO_SCRIPT';
      `);

      // Backfill existing projects with scenes to SCENES_GENERATED
      database.exec(`
        UPDATE projects 
        SET project_state = 'SCENES_GENERATED' 
        WHERE (screenplay_scenes IS NOT NULL AND screenplay_scenes != '[]')
           OR EXISTS (SELECT 1 FROM scenes WHERE scenes.project_id = projects.id);
      `);
      console.log('Migration complete: project_state column added and backfilled');
    }
  } catch (err) {
    console.error('Migration error:', err);
  }
}
