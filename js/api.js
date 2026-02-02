// Use same origin as the page so API works when served by the backend
function apiUrl(path) {
  const base = typeof window !== 'undefined' && window.location && window.location.origin
    ? window.location.origin
    : '';
  return base + path;
}

export async function listProjects() {
  const res = await fetch(apiUrl('/api/projects'));
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function getProject(id) {
  // Parallel fetch: project and its assets
  const [projectRes, assetsRes] = await Promise.all([
    fetch(apiUrl('/api/projects/' + encodeURIComponent(id))),
    fetch(apiUrl('/api/projects/' + encodeURIComponent(id) + '/assets'))
  ]);

  if (!projectRes.ok) throw new Error('Failed to fetch project');

  const project = await projectRes.json();
  const assets = assetsRes.ok ? await assetsRes.json() : [];

  // Attach real assets to project object
  project.assets = assets;
  return project;
}

export async function createProject(data) {
  const res = await fetch(apiUrl('/api/projects'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {}),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function updateProject(id, data) {
  const res = await fetch(apiUrl('/api/projects/' + encodeURIComponent(id)), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
}

export async function deleteProject(id) {
  const res = await fetch(apiUrl('/api/projects/' + encodeURIComponent(id)), { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete project');
}

export async function uploadAssets(projectId, formData) {
  const res = await fetch(apiUrl('/api/projects/' + encodeURIComponent(projectId) + '/upload'), {
    method: 'POST',
    body: formData, // No Content-Type header needed for FormData
  });
  if (!res.ok) throw new Error('Failed to upload assets');
  return res.json();
}

export async function listProjectAssets(projectId) {
  const res = await fetch(apiUrl('/api/projects/' + encodeURIComponent(projectId) + '/assets'));
  if (!res.ok) throw new Error('Failed to fetch assets');
  return res.json();
}

// API Settings
export async function getApiSettings() {
  const res = await fetch(apiUrl('/api/settings/api'));
  if (!res.ok) throw new Error('Failed to fetch API settings');
  return res.json();
}

export async function saveApiSettings(googleAiApiKey) {
  const res = await fetch(apiUrl('/api/settings/api'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ googleAiApiKey }),
  });
  if (!res.ok) throw new Error('Failed to save API settings');
  return res.json();
}

export async function getApiKey() {
  const res = await fetch(apiUrl('/api/settings/api/key'));
  if (!res.ok) throw new Error('Failed to fetch API key');
  return res.json();
}

export async function generateScenes(projectId, script) {
  const res = await fetch(apiUrl('/api/projects/' + encodeURIComponent(projectId) + '/generate-scenes'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ script }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to generate scenes');
  }
  return res.json();
}

export const StoryboardAPI = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  uploadAssets,
  listProjectAssets,
  getApiSettings,
  saveApiSettings,
  getApiKey,
  generateScenes,
};

// Also keep global for easy console debugging or old scripts
if (typeof window !== 'undefined') {
  window.StoryboardAPI = StoryboardAPI;
}
