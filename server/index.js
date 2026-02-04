import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import * as store from './store.js';
import * as assetStore from './assetStore.js';
import * as shotStore from './shotStore.js';
import * as aiService from './aiService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const isProd = process.env.NODE_ENV === 'production';

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

if (isProd) {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
}

// API: List projects (for home)
app.get('/api/projects', (req, res) => {
  try {
    const projects = store.listProjects();
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

// API: Get single project
app.get('/api/projects/:id', (req, res) => {
  const project = store.getProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// API: Create project
app.post('/api/projects', (req, res) => {
  try {
    const project = store.createProject(req.body || {});
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// API: Update project
app.patch('/api/projects/:id', (req, res) => {
  console.log(`[API] PATCH /api/projects/${req.params.id}`, {
    hasOutput: !!req.body,
    keys: Object.keys(req.body),
    sceneCount: req.body.screenplayScenes?.length
  });
  const updated = store.updateProject(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Project not found' });
  res.json(updated);
});

// API: Delete project
app.delete('/api/projects/:id', (req, res) => {
  const deleted = store.deleteProject(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Project not found' });
  res.status(204).send();
});

// API: List assets for a project
app.get('/api/projects/:projectId/assets', (req, res) => {
  try {
    const assets = assetStore.listAssetsByProject(req.params.projectId);
    res.json(assets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list assets' });
  }
});

// API: Get single asset
app.get('/api/assets/:id', (req, res) => {
  const asset = assetStore.getAsset(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  res.json(asset);
});

// API: Create asset
app.post('/api/projects/:projectId/assets', (req, res) => {
  try {
    const asset = assetStore.createAsset({
      ...req.body,
      projectId: req.params.projectId
    });
    res.status(201).json(asset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to create asset' });
  }
});

// API: Upload assets
app.post('/api/projects/:projectId/upload', upload.array('files'), (req, res) => {
  try {
    const projectId = req.params.projectId;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const createdAssets = files.map(file => {
      const url = `/uploads/${file.filename}`;
      return assetStore.createAsset({
        projectId,
        name: file.originalname,
        url,
        type: file.mimetype,
        size: file.size
      });
    });

    res.status(201).json(createdAssets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// API: Update asset
app.patch('/api/assets/:id', (req, res) => {
  const updated = assetStore.updateAsset(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Asset not found' });
  res.json(updated);
});

// API: Delete asset
app.delete('/api/assets/:id', (req, res) => {
  const deleted = assetStore.deleteAsset(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Asset not found' });
  res.status(204).send();
});

// ============ SHOT ENDPOINTS ============

// API: List shots for a scene
app.get('/api/scenes/:sceneId/shots', (req, res) => {
  try {
    const shots = shotStore.listShotsByScene(req.params.sceneId);
    res.json(shots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list shots' });
  }
});

// API: Get single shot
app.get('/api/shots/:id', (req, res) => {
  const shot = shotStore.getShot(req.params.id);
  if (!shot) return res.status(404).json({ error: 'Shot not found' });
  res.json(shot);
});

// API: Bulk create/update shots for a scene
app.post('/api/scenes/:sceneId/shots', (req, res) => {
  try {
    const shotsData = req.body;
    if (!Array.isArray(shotsData)) {
      return res.status(400).json({ error: 'Request body must be an array of shots' });
    }
    const shots = shotStore.updateSceneShots(req.params.sceneId, shotsData);
    res.json(shots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update shots' });
  }
});

// API: Update shot properties
app.patch('/api/shots/:id', (req, res) => {
  const updated = shotStore.updateShotProperties(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Shot not found' });
  res.json(updated);
});

// API: Delete shot
app.delete('/api/shots/:id', (req, res) => {
  const deleted = shotStore.deleteShot(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Shot not found' });
  res.status(204).send();
});

// API: Update shot assets
app.put('/api/shots/:id/assets', (req, res) => {
  try {
    const { assetIds } = req.body;
    if (!Array.isArray(assetIds)) {
      return res.status(400).json({ error: 'assetIds must be an array' });
    }
    const shot = shotStore.updateShotAssets(req.params.id, assetIds);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });
    res.json(shot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update shot assets' });
  }
});

// API: Generate scenes from script using AI
app.post('/api/projects/:id/generate-scenes', async (req, res) => {
  try {
    const { script } = req.body;
    const projectId = req.params.id;

    if (!script || script.trim().length === 0) {
      return res.status(400).json({ error: 'Script content is required' });
    }

    // Fetch API key from settings
    const settings = store.getApiSettings();
    if (!settings.hasKey) {
      return res.status(400).json({
        error: 'Google AI API key not configured. Please add your API key in settings.'
      });
    }

    // Generate scenes using AI
    const scenes = await aiService.generateScenes(script, settings.googleAiApiKey);

    // Save the generated scenes to the project and transition state
    const updatedProject = store.updateProject(projectId, {
      script,
      screenplayScenes: scenes,
      projectState: 'SCENES_GENERATED'
    });

    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Return the updated project with scenes
    res.json(updatedProject);
  } catch (err) {
    console.error('AI generation error:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate scenes. Please try again.'
    });
  }
});


// API: Get API settings (returns masked key for security)
app.get('/api/settings/api', (req, res) => {
  try {
    const settings = store.getApiSettings();
    // Return masked key for display, but indicate if key exists
    res.json({
      hasKey: settings.hasKey,
      maskedKey: settings.hasKey ? '••••••••' + settings.googleAiApiKey.slice(-4) : '',
      updatedAt: settings.updatedAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get API settings' });
  }
});

// API: Get full API key (for internal use when generating)
app.get('/api/settings/api/key', (req, res) => {
  try {
    const settings = store.getApiSettings();
    res.json({
      googleAiApiKey: settings.googleAiApiKey
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get API key' });
  }
});

// API: Save API settings
app.post('/api/settings/api', (req, res) => {
  try {
    const { googleAiApiKey } = req.body;
    const settings = store.saveApiSettings({ googleAiApiKey });
    res.json({
      hasKey: settings.hasKey,
      maskedKey: settings.hasKey ? '••••••••' + settings.googleAiApiKey.slice(-4) : '',
      updatedAt: settings.updatedAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save API settings' });
  }
});

// Serve home page
app.get('/', (req, res) => {
  if (isProd) {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  } else {
    res.redirect('http://localhost:5173');
  }
});

// Serve editor page
app.get('/editor', (req, res) => {
  if (isProd) {
    res.sendFile(path.join(__dirname, '..', 'dist', 'editor.html'));
  } else {
    res.redirect('http://localhost:5173/editor');
  }
});

app.listen(PORT, () => {
  console.log(`Storyboard app running at http://localhost:${PORT}`);
});
