/**
 * API Client for MovieMaker
 * Handles all HTTP requests to the Express backend
 */

const API_BASE_URL = '';  // Use same origin (handled by Vite proxy in dev)

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(url, options = {}) {
    const response = await fetch(API_BASE_URL + url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// ========== PROJECT API ==========

export async function listProjects() {
    return apiFetch('/api/projects');
}

export async function getProject(id) {
    const [project, assets] = await Promise.all([
        apiFetch(`/api/projects/${encodeURIComponent(id)}`),
        apiFetch(`/api/projects/${encodeURIComponent(id)}/assets`).catch(() => []),
    ]);

    project.assets = assets;
    return project;
}

export async function createProject(data = {}) {
    return apiFetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateProject(id, data) {
    return apiFetch(`/api/projects/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function deleteProject(id) {
    return apiFetch(`/api/projects/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
}

// ========== ASSET API ==========

export async function listProjectAssets(projectId) {
    return apiFetch(`/api/projects/${encodeURIComponent(projectId)}/assets`);
}

export async function uploadAssets(projectId, formData) {
    // Don't set Content-Type header for FormData
    const response = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to upload assets');
    }

    return response.json();
}

export async function updateAsset(id, data) {
    return apiFetch(`/api/assets/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function deleteAsset(id) {
    return apiFetch(`/api/assets/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
}

// ========== AI API ==========

export async function generateScenes(projectId, script) {
    return apiFetch(`/api/projects/${encodeURIComponent(projectId)}/generate-scenes`, {
        method: 'POST',
        body: JSON.stringify({ script }),
    });
}

// ========== API SETTINGS ==========

export async function getApiSettings() {
    return apiFetch('/api/settings/api');
}

export async function saveApiSettings(googleAiApiKey) {
    return apiFetch('/api/settings/api', {
        method: 'POST',
        body: JSON.stringify({ googleAiApiKey }),
    });
}

export async function getApiKey() {
    return apiFetch('/api/settings/api/key');
}

// ========== SHOT API ==========

export async function listSceneShots(sceneId) {
    return apiFetch(`/api/scenes/${encodeURIComponent(sceneId)}/shots`);
}

export async function createSceneShots(sceneId, shots) {
    return apiFetch(`/api/scenes/${encodeURIComponent(sceneId)}/shots`, {
        method: 'POST',
        body: JSON.stringify(shots),
    });
}

export async function updateShot(shotId, data) {
    return apiFetch(`/api/shots/${encodeURIComponent(shotId)}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function deleteShot(shotId) {
    return apiFetch(`/api/shots/${encodeURIComponent(shotId)}`, {
        method: 'DELETE',
    });
}

export async function updateShotAssets(shotId, assetIds) {
    return apiFetch(`/api/shots/${encodeURIComponent(shotId)}/assets`, {
        method: 'PUT',
        body: JSON.stringify({ assetIds }),
    });
}
