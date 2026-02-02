import 'iconify-icon';
import '../api.js';
import '../app.css';
/**
 * Project page entry: load/save project, bind UI, init Sortable
 */

import {
  setCurrentProjectId,
  getProjectName,
  saveProjectNow,
  scheduleSave,
} from './save.js';
import {
  sceneBlockHtml,
  toggleHandleMenu,
  handleMenuAction,
  initSortableAndAssets,
} from './screenplay.js';
import { switchSidebar, switchProjectTab } from './views.js';

// --- URL ---
function getProjectIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

// --- Apply loaded project to DOM ---
function applyProject(project) {
  const titleEl = document.getElementById('project-title');
  const inputOnboarding = document.getElementById('input-onboarding');
  const inputScript = document.getElementById('input-project-script');
  if (titleEl) titleEl.textContent = project.name || 'Untitled Project';
  const script = project.script || '';
  if (inputOnboarding) inputOnboarding.value = script;
  if (inputScript) inputScript.value = script;
  if (project.screenplayScenes?.length > 0) {
    const list = document.getElementById('screenplay-list');
    if (list)
      list.innerHTML = project.screenplayScenes
        .map((s, i) => sceneBlockHtml(s.id, s.order !== undefined ? s.order : i, s.content, s.assets || []))
        .join('');
  }

  // If project already has a script or scenes, jump to the idea tab
  if (script || project.screenplayScenes?.length > 0) {
    const viewScript = document.getElementById('view-script');
    if (viewScript) viewScript.classList.add('hidden');
    switchProjectTab('idea');
  }

  // Render library assets
  renderLibraryAssets(project.assets || []);

  // Always re-initialize sortable when project scenes are updated/applied
  initSortableAndAssets();

  // Initialize upload handlers if not already done
  if (!document.documentElement.dataset.uploadInit) {
    initUploadHandlers();
    document.documentElement.dataset.uploadInit = 'true';
  }
}

function renderLibraryAssets(assets) {
  const list = document.getElementById('library-assets-list');
  if (!list) return;

  if (assets.length === 0) {
    list.innerHTML = '<div class="col-span-2 text-center py-8 text-zinc-600 italic text-xs">No assets uploaded yet<br>Drag files here or click Upload</div>';
    return;
  }

  list.innerHTML = assets.map(asset => `
    <div class="asset-card aspect-square bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden relative group cursor-grab active:cursor-grabbing" data-id="${asset.id}">
      <img src="${asset.url.startsWith('http') ? asset.url : window.location.origin + asset.url}" class="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt="${asset.name}">
      <div class="absolute bottom-0 inset-x-0 bg-black/60 p-1.5">
        <p class="text-[10px] text-white truncate">${asset.name}</p>
      </div>
      <button type="button" class="delete-library-asset absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Asset">
        <iconify-icon icon="solar:trash-bin-trash-linear" width="12"></iconify-icon>
      </button>
    </div>
  `).join('');
}

function bindLibraryActions() {
  const list = document.getElementById('library-assets-list');
  if (list) {
    list.addEventListener('click', async (e) => {
      const btn = e.target.closest('.delete-library-asset');
      if (!btn) return;

      e.stopPropagation();
      const card = btn.closest('.asset-card');
      const assetId = card.dataset.id;

      if (confirm('Delete this asset from project? This will also remove it from any scenes using it.')) {
        try {
          await fetch('/api/assets/' + assetId, { method: 'DELETE' });
          card.remove();

          // Remove from any scenes in the UI immediately
          if (assetId) {
            document.querySelectorAll(`.scene-assets-list .asset-card[data-id="${assetId}"]`).forEach(el => {
              const parent = el.parentElement;
              el.remove();
              // Check if scene list is now empty
              if (parent) {
                const emptyMsg = parent.querySelector('.empty-msg');
                if (parent.querySelectorAll('.asset-card').length === 0 && emptyMsg) {
                  emptyMsg.style.display = 'flex';
                }
              }
            });
          }

          // Check if library list is now empty
          if (list.querySelectorAll('.asset-card').length === 0) {
            list.innerHTML = '<div class="col-span-2 text-center py-8 text-zinc-600 italic text-xs">No assets uploaded yet<br>Drag files here or click Upload</div>';
          }
        } catch (err) {
          console.error(err);
          alert('Failed to delete asset');
        }
      }
    });
  }
}

function initUploadHandlers() {
  const btn = document.getElementById('btn-upload-media');
  const input = document.getElementById('asset-upload-input');
  const panel = document.getElementById('panel-assets');

  if (btn && input) {
    btn.addEventListener('click', () => input.click());
    input.addEventListener('change', async (e) => {
      if (e.target.files.length > 0) {
        await handleFiles(e.target.files);
        // Reset input so same files can be selected again
        input.value = '';
      }
    });
  }

  // Drag and drop for the whole panel
  if (panel) {
    panel.addEventListener('dragover', (e) => {
      e.preventDefault();
      panel.classList.add('bg-zinc-800/50', 'border-cyan-500/50');
    });

    panel.addEventListener('dragleave', (e) => {
      e.preventDefault();
      // Simple check to avoid flickering when dragging over children
      if (e.target === panel || !panel.contains(e.relatedTarget)) {
        panel.classList.remove('bg-zinc-800/50', 'border-cyan-500/50');
      }
    });

    panel.addEventListener('drop', async (e) => {
      e.preventDefault();
      panel.classList.remove('bg-zinc-800/50', 'border-cyan-500/50');

      if (e.dataTransfer.files.length > 0) {
        await handleFiles(e.dataTransfer.files);
      }
    });
  }
}

async function handleFiles(fileList) {
  const projectId = getProjectIdFromUrl();
  if (!projectId) return;

  const btn = document.getElementById('btn-upload-media');
  const originalText = btn ? btn.innerHTML : '';

  try {
    if (btn) btn.innerHTML = '<iconify-icon icon="line-md:loading-loop" class="text-cyan-400"></iconify-icon> Uploading...';

    const formData = new FormData();
    Array.from(fileList).forEach(file => {
      // Basic validation
      if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        formData.append('files', file);
      }
    });

    if (formData.has('files')) {
      // Upload
      await window.StoryboardAPI.uploadAssets(projectId, formData);
      // Fetch updated list
      const assets = await window.StoryboardAPI.listProjectAssets(projectId);
      // Update UI
      renderLibraryAssets(assets);
      initSortableAndAssets();
    }
  } catch (e) {
    console.error('Upload failed', e);
    alert('Failed to upload files');
  } finally {
    if (btn) btn.innerHTML = originalText;
  }
}

// --- Start generation (script → loading → breakdown) ---
async function startGeneration() {
  const inputOnboarding = document.getElementById('input-onboarding');
  const inputScript = document.getElementById('input-project-script');
  const viewScript = document.getElementById('view-script');
  const viewLoading = document.getElementById('view-loading');

  if (inputOnboarding && inputScript) {
    inputScript.value = inputOnboarding.value || 'Enter your script here...';
  }

  if (viewScript) viewScript.classList.add('hidden');
  if (viewLoading) viewLoading.classList.remove('hidden');

  const id = getProjectIdFromUrl();
  if (!id) return;

  try {
    const script = inputScript ? inputScript.value : '';

    // Call AI to generate scenes
    const response = await window.StoryboardAPI.generateScenes(id, script);
    const aiScenes = response.scenes || [];

    // Add IDs to scenes
    const scenesWithIds = aiScenes.map((scene, index) => ({
      id: 'scene-' + Date.now() + '-' + index,
      order: scene.order !== undefined ? scene.order : index,
      content: scene.content
    }));

    // Save scenes to database
    await window.StoryboardAPI.updateProject(id, { screenplayScenes: scenesWithIds });
    const project = await window.StoryboardAPI.getProject(id);
    applyProject(project);

    if (viewLoading) viewLoading.classList.add('hidden');
    switchProjectTab('breakdown');
  } catch (e) {
    console.error("Failed to generate scenes", e);
    if (viewLoading) viewLoading.classList.add('hidden');
    if (viewScript) viewScript.classList.remove('hidden');
    alert(e.message || 'Failed to generate scenes. Please check your API key and try again.');
  }
}

// --- Modify script & Re-generate ---
async function handleModifyScript() {
  const inputScript = document.getElementById('input-project-script');
  const viewStoryIdea = document.getElementById('view-story-idea');
  const viewLoading = document.getElementById('view-loading');
  if (!inputScript || !viewStoryIdea || !viewLoading) return;

  // 1. Show loading state
  viewStoryIdea.classList.add('hidden');
  viewLoading.classList.remove('hidden');

  const id = getProjectIdFromUrl();
  if (!id) return;

  try {
    // 2. Save the updated script
    await saveProjectNow();

    // 3. Call AI to generate scenes
    const script = inputScript.value;
    const response = await window.StoryboardAPI.generateScenes(id, script);
    const aiScenes = response.scenes || [];

    // Add IDs to scenes
    const scenesWithIds = aiScenes.map((scene, index) => ({
      id: 'scene-' + Date.now() + '-' + index,
      order: scene.order !== undefined ? scene.order : index,
      content: scene.content
    }));

    // Save scenes to database
    await window.StoryboardAPI.updateProject(id, { screenplayScenes: scenesWithIds });
    const project = await window.StoryboardAPI.getProject(id);
    applyProject(project);

    viewLoading.classList.add('hidden');
    switchProjectTab('breakdown');
  } catch (e) {
    viewLoading.classList.add('hidden');
    viewStoryIdea.classList.remove('hidden');
    console.error(e);
    alert(e.message || 'Failed to generate scenes. Please check your API key and try again.');
  }
}

// --- Event delegation for screenplay list (handle menu, menu actions) ---
function onScreenplayListClick(e) {
  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;
  const action = actionEl.dataset.action;
  if (action === 'toggle-handle-menu') {
    e.preventDefault();
    toggleHandleMenu(actionEl, e);
  } else if (action === 'menu-up' || action === 'menu-delete' || action === 'menu-down') {
    e.preventDefault();
    const subAction = action.replace('menu-', '');
    handleMenuAction(subAction, actionEl);
  }
}

// --- Close handle menus on outside click ---
function onDocumentClick(e) {
  if (!e.target.closest('.handle-menu')) {
    document.querySelectorAll('.handle-menu').forEach((m) => {
      m.classList.add('hidden');
      m.classList.remove('flex');
    });
  }
}

// --- Bind static buttons by data-action ---
function bindActionButtons() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    if (action === 'sidebar:assets') switchSidebar('assets');
    else if (action === 'sidebar:api') switchSidebar('api');
    else if (action === 'tab:idea') switchProjectTab('idea');
    else if (action === 'tab:breakdown') switchProjectTab('breakdown');
    else if (action === 'start-generation') startGeneration();
    else if (action === 'modify-script') handleModifyScript();
  });
}

function bindSaveAndTitle() {
  document.getElementById('btn-save-project')?.addEventListener('click', saveProjectNow);
  const scriptInput = document.getElementById('input-project-script');
  scriptInput?.addEventListener('input', scheduleSave);
  scriptInput?.addEventListener('blur', scheduleSave);
  const screenplayList = document.getElementById('screenplay-list');
  screenplayList?.addEventListener(
    'blur',
    (e) => {
      if (e.target.getAttribute?.('contenteditable') === 'true') scheduleSave();
    },
    true
  );
  const titleEl = document.getElementById('project-title');
  if (titleEl) {
    titleEl.addEventListener('blur', scheduleSave);
    titleEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        titleEl.blur();
      }
    });
  }
}

// --- API Panel Logic ---
function initApiPanel() {
  const apiKeyInput = document.getElementById('input-google-api-key');
  const toggleBtn = document.getElementById('btn-toggle-api-visibility');
  const saveBtn = document.getElementById('btn-save-api-key');
  const statusDiv = document.getElementById('api-status');
  const statusIcon = document.getElementById('api-status-icon');
  const statusText = document.getElementById('api-status-text');
  const iconShow = document.getElementById('icon-eye-show');
  const iconHide = document.getElementById('icon-eye-hide');

  if (!apiKeyInput || !saveBtn) return;

  // Toggle password visibility
  toggleBtn?.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      iconShow?.classList.add('hidden');
      iconHide?.classList.remove('hidden');
    } else {
      apiKeyInput.type = 'password';
      iconShow?.classList.remove('hidden');
      iconHide?.classList.add('hidden');
    }
  });

  // Show status message
  function showStatus(type, message) {
    if (!statusDiv || !statusIcon || !statusText) return;
    statusDiv.classList.remove('hidden');
    statusText.textContent = message;

    const container = statusDiv.querySelector('div');
    container.className = 'flex items-center gap-2 p-2 rounded-lg text-xs';

    if (type === 'success') {
      container.classList.add('bg-green-500/10', 'text-green-400');
      statusIcon.setAttribute('icon', 'solar:check-circle-linear');
    } else if (type === 'error') {
      container.classList.add('bg-red-500/10', 'text-red-400');
      statusIcon.setAttribute('icon', 'solar:close-circle-linear');
    } else if (type === 'loading') {
      container.classList.add('bg-cyan-500/10', 'text-cyan-400');
      statusIcon.setAttribute('icon', 'line-md:loading-loop');
    }

    // Auto-hide after 3 seconds for success
    if (type === 'success') {
      setTimeout(() => statusDiv.classList.add('hidden'), 3000);
    }
  }

  // Save API key
  saveBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showStatus('error', 'Please enter an API key');
      return;
    }

    showStatus('loading', 'Saving API key...');
    saveBtn.disabled = true;

    try {
      await window.StoryboardAPI.saveApiSettings(apiKey);
      showStatus('success', 'API key saved successfully!');
      // Clear input and show masked version
      apiKeyInput.value = '';
      apiKeyInput.placeholder = '••••••••' + apiKey.slice(-4);
    } catch (err) {
      console.error('Failed to save API key:', err);
      showStatus('error', 'Failed to save API key');
    } finally {
      saveBtn.disabled = false;
    }
  });

  // Load existing API settings
  loadApiSettings();
}

async function loadApiSettings() {
  const apiKeyInput = document.getElementById('input-google-api-key');
  if (!apiKeyInput) return;

  try {
    const settings = await window.StoryboardAPI.getApiSettings();
    if (settings.hasKey) {
      apiKeyInput.placeholder = settings.maskedKey + ' (saved)';
    }
  } catch (err) {
    console.error('Failed to load API settings:', err);
  }
}

function init() {
  bindActionButtons();
  bindLibraryActions();
  initApiPanel();
  document.addEventListener('click', onDocumentClick);
  const screenplayList = document.getElementById('screenplay-list');
  if (screenplayList) screenplayList.addEventListener('click', onScreenplayListClick);
  bindSaveAndTitle();

  const id = getProjectIdFromUrl();
  if (!id) {
    window.StoryboardAPI.createProject({ name: 'Untitled Project' })
      .then((p) => {
        window.location.href = '/editor?id=' + encodeURIComponent(p.id);
      })
      .catch(() => alert('Failed to create project. Is the server running?'));
    return;
  }

  setCurrentProjectId(id);
  window.StoryboardAPI.getProject(id)
    .then((project) => applyProject(project))
    .catch(() => {
      const titleEl = document.getElementById('project-title');
      if (titleEl) titleEl.textContent = 'Project not found';
    });
}

document.addEventListener('DOMContentLoaded', init);
