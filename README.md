# Storyboard App

Full app for storyboard creation. UI matches the design in `ui.html` (home) and `project.html` (project editor). Backend provides project CRUD with **SQLite**; projects are stored in `data/storyboard.db`.

## Run

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

- **Home**: List recent projects (from DB), create new or blank project (API inserts project and redirects to editor).
- **Project**: Load/save by `?id=`. Story idea and screenplay scenes are persisted to the database; debounced save on edit.

## Database

- **SQLite** file: `data/storyboard.db` (created on first run).
- **Projects table**: `id`, `name`, `story_idea`, `screenplay_scenes` (JSON), `system_prompt`, `assets` (JSON), `shot_count`, `status`, `created_at`, `updated_at`.
- Migrations run automatically in `server/db.js`.

## Frontend (modular)

- **`css/app.css`** — Shared styles (scrollbar, glass panel, sidebar, icons). Used by both pages.
- **`js/api.js`** — API client; sets `window.StoryboardAPI` (listProjects, getProject, createProject, updateProject, deleteProject). Loaded as a classic script before modules.
- **Home (`ui.html`)**  
  - Loads `js/api.js` and `js/home.js` (ES module).  
  - `home.js`: formatRelativeTime, renderProjectCard, loadAndRenderProjects, createAndGo, init + pageshow refresh.
- **Project (`project.html`)**  
  - Loads `js/api.js` and `js/project/main.js` (ES module).  
  - **`js/project/main.js`** — Entry: URL/project load, applyProject, startGeneration, event binding (data-action), init.  
  - **`js/project/save.js`** — Save state, setSaveStatus, collectStoryIdea / collectScreenplayScenes / getProjectName, saveProjectNow, scheduleSave.  
  - **`js/project/screenplay.js`** — sceneBlockHtml, toggleHandleMenu, handleMenuAction, initSortableAndAssets, initSceneAssetLists.  
  - **`js/project/views.js`** — switchSidebar, switchProjectTab.  
- Buttons use **`data-action`** (e.g. `sidebar:assets`, `tab:breakdown`, `start-generation`, `menu-up`) and one document/screenplay-list listener; no inline `onclick`.

## API (project creation and more)

- `GET /api/projects` — list projects (recent first)
- `GET /api/projects/:id` — get project
- `POST /api/projects` — create project (body: optional `name`, `storyIdea`, etc.)
- `PATCH /api/projects/:id` — update project
- `DELETE /api/projects/:id` — delete project
