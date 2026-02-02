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
      story_idea TEXT DEFAULT '',
      screenplay_scenes TEXT DEFAULT '[]',
      system_prompt TEXT DEFAULT '',
      assets TEXT DEFAULT '[]',
      shot_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
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

    -- API settings table (global settings, not per-project)
    CREATE TABLE IF NOT EXISTS api_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      google_ai_api_key TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}
