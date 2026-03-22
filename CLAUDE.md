# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs Vite on :5173 + Express on :3000 concurrently)
npm run dev

# Run backend only (with file watching)
npm run server

# Run frontend only
npm run vite

# Build frontend for production
npm run build

# Run production server (serves dist/ + API on :3000)
npm start

# Run tests
npm test
```

## Architecture

Full-stack app for AI-assisted storyboard creation from scripts.

- **Frontend:** React 18 + Vite (port 5173 in dev) — Vite proxies `/api` and `/uploads` to Express
- **Backend:** Express.js (port 3000) — REST API + serves `dist/` in production
- **Database:** SQLite via `better-sqlite3` at `data/storyboard.db` (auto-created on startup)
- **AI:** Google Gemini API (`@google/generative-ai`) — API key stored in the `api_settings` DB table
- **State:** Zustand for UI state (`src/store/editorStore.js`), React Query for server state with 1-second debounced auto-save

## Project State Machine

Projects progress through these states tracked in the DB:

`NO_SCRIPT` → `SCENES_GENERATED` → `SHOTLIST_GENERATED` → `STORYBOARD_GENERATED`

Script editing is disabled once scenes exist. State transitions are triggered by AI generation endpoints.

## Key Files

| File | Purpose |
|------|---------|
| `server/index.js` | All Express routes |
| `server/db.js` | SQLite schema + auto-migrations |
| `server/aiService.js` + `aiConfig.js` | Gemini integration and system prompts |
| `src/api/client.js` | Fetch wrapper — all frontend API calls go here |
| `src/store/editorStore.js` | Zustand UI state (active tab, sidebar, dirty flags) |
| `src/pages/EditorPage.jsx` | Main editor with auto-save logic |
| `src/hooks/` | React Query hooks per domain (projects, assets, shots, characters) |

## Data Layer

Server-side store files handle DB operations:
- `server/store.js` — projects
- `server/sceneStore.js` — scenes
- `server/shotStore.js` — shots (shotlist)
- `server/assetStore.js` — uploaded file metadata
- `server/characterStore.js` — characters extracted from scripts

Assets are uploaded via Multer and stored in `uploads/` (served at `/uploads/*`).

## Frontend Structure

```
src/
├── components/
│   ├── editor/    # Script, screenplay, shotlist view components
│   ├── home/      # Project grid, modals, sidebar
│   └── common/    # Toast, ConfirmDialog, shared UI
├── hooks/         # React Query data hooks
├── pages/         # HomePage, EditorPage
├── store/         # Zustand stores
├── api/client.js  # API client
└── constants/     # Tab names, project states, timing constants
```

Path alias `@` maps to `./src`.
