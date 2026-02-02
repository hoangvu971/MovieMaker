import 'iconify-icon';
import './api.js';
import './app.css';
/**
 * Home page (ui.html): recent projects list, create project
 * Depends on: js/api.js (window.StoryboardAPI)
 */

function formatRelativeTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return diffMins <= 1 ? 'Just now' : diffMins + ' minutes ago';
  if (diffHours < 24) return diffHours === 1 ? '1 hour ago' : diffHours + ' hours ago';
  if (diffDays < 7) return diffDays === 1 ? 'Yesterday' : diffDays + ' days ago';
  return 'Last week';
}

function renderProjectCard(project) {
  const shotsLabel = project.shotCount > 0 ? project.shotCount + ' shots' : 'Draft';
  const timeLabel = project.updatedAt ? formatRelativeTime(project.updatedAt) : 'Created recently';
  const name = (project.name || 'Untitled Project').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return (
    '<div class="relative group" data-id="' + project.id + '">' +
    '  <a href="/editor?id=' + encodeURIComponent(project.id) + '" class="cursor-pointer block">' +
    '    <div class="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 group-hover:border-zinc-600 transition-colors">' +
    '      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>' +
    '      <div class="grid grid-cols-3 h-full gap-0.5 opacity-60 group-hover:opacity-80 transition-opacity group-hover:scale-105 duration-500">' +
    '        <div class="bg-zinc-700"></div><div class="bg-zinc-600"></div><div class="bg-zinc-800"></div>' +
    '      </div>' +
    '      <div class="absolute bottom-3 right-3 z-20"><span class="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">' + shotsLabel + '</span></div>' +
    '    </div>' +
    '    <div class="mt-3">' +
    '      <h3 class="text-sm font-medium text-zinc-200 group-hover:text-white truncate">' + name + '</h3>' +
    '      <div class="flex items-center gap-2 mt-1"><span class="text-xs text-zinc-500">' + timeLabel + '</span></div>' +
    '    </div>' +
    '  </a>' +
    '  <!-- Menu Toggle -->' +
    '  <div class="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">' +
    '    <button type="button" data-action="toggle-project-menu" class="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">' +
    '      <iconify-icon icon="solar:menu-dots-linear" class="text-white"></iconify-icon>' +
    '    </button>' +
    '  </div>' +
    '  <!-- Dropdown Menu -->' +
    '  <div class="context-menu hidden absolute top-12 right-3 shadow-2xl">' +
    '    <button type="button" data-action="edit-name" data-id="' + project.id + '" data-name="' + name + '">' +
    '      <iconify-icon icon="solar:pen-linear"></iconify-icon> Edit name' +
    '    </button>' +
    '    <button type="button" data-action="duplicate" data-id="' + project.id + '">' +
    '      <iconify-icon icon="solar:copy-linear"></iconify-icon> Duplicate' +
    '    </button>' +
    '    <div class="h-px bg-zinc-800 my-1"></div>' +
    '    <button type="button" data-action="delete" data-id="' + project.id + '" class="text-red-400">' +
    '      <iconify-icon icon="solar:trash-bin-trash-linear"></iconify-icon> Delete' +
    '    </button>' +
    '  </div>' +
    '</div>'
  );
}

async function loadAndRenderProjects() {
  const grid = document.getElementById('recent-projects-grid');
  if (!grid) return;
  grid.innerHTML = '<p class="text-zinc-500 col-span-full py-8">Loading projects…</p>';
  try {
    const projects = await window.StoryboardAPI.listProjects();
    if (projects.length === 0) {
      grid.innerHTML =
        '<p class="text-zinc-500 col-span-full py-8">No projects yet. Create one to get started.</p>';
    } else {
      grid.innerHTML = projects.map(renderProjectCard).join('');
    }
  } catch (e) {
    grid.innerHTML =
      '<p class="text-zinc-500 col-span-full py-8">Could not load projects. Make sure the server is running (npm start, then open http://localhost:3000).</p>';
  }
}

async function createAndGo(evt) {
  const btn = evt?.currentTarget;
  const labelEl = document.getElementById('btn-create-new-label');
  if (btn) {
    if (btn.getAttribute('aria-busy') === 'true') return;
    btn.setAttribute('aria-busy', 'true');
    btn.disabled = true;
    if (labelEl) labelEl.textContent = 'Creating…';
  }
  try {
    const project = await window.StoryboardAPI.createProject({ name: 'Untitled Project' });
    window.location.href = '/editor?id=' + encodeURIComponent(project.id);
  } catch (e) {
    if (btn) {
      btn.removeAttribute('aria-busy');
      btn.disabled = false;
      if (labelEl) labelEl.textContent = 'Create new';
    }
    alert(
      'Failed to create project. Run the app from the server: npm start then open http://localhost:3000'
    );
  }
}

async function deleteProject(id) {
  if (!confirm('Are you sure you want to delete this project?')) return;
  try {
    await window.StoryboardAPI.deleteProject(id);
    loadAndRenderProjects();
  } catch (e) {
    alert('Failed to delete project');
  }
}

async function editProjectName(id, currentName) {
  const newName = prompt('Enter new project name:', currentName);
  if (newName === null || newName === currentName) return;
  try {
    await window.StoryboardAPI.updateProject(id, { name: newName });
    loadAndRenderProjects();
  } catch (e) {
    alert('Failed to update project name');
  }
}

async function duplicateProject(id) {
  try {
    const project = await window.StoryboardAPI.getProject(id);
    const { id: oldId, ...data } = project;
    data.name = (data.name || 'Untitled') + ' (Copy)';
    await window.StoryboardAPI.createProject(data);
    loadAndRenderProjects();
  } catch (e) {
    alert('Failed to duplicate project');
  }
}

function handleMenuAction(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;
  const name = btn.dataset.name;

  if (action === 'toggle-project-menu') {
    e.preventDefault();
    e.stopPropagation();
    const menu = btn.closest('.relative').querySelector('.context-menu');
    const isHidden = menu.classList.contains('hidden');
    // Close all other menus
    document.querySelectorAll('.context-menu').forEach((m) => m.classList.add('hidden'));
    if (isHidden) menu.classList.remove('hidden');
  } else if (action === 'delete') {
    deleteProject(id);
  } else if (action === 'edit-name') {
    editProjectName(id, name);
  } else if (action === 'duplicate') {
    duplicateProject(id);
  }
}

// --- API Modal Logic ---
function initApiModal() {
  const modal = document.getElementById('api-modal');
  const openBtn = document.getElementById('btn-api-settings');
  const closeBtn = document.getElementById('btn-close-api-modal');
  const cancelBtn = document.getElementById('btn-cancel-api-modal');
  const saveBtn = document.getElementById('home-btn-save-api-key');
  const apiKeyInput = document.getElementById('home-input-google-api-key');
  const toggleBtn = document.getElementById('home-btn-toggle-api-visibility');
  const statusDiv = document.getElementById('home-api-status');
  const statusIcon = document.getElementById('home-api-status-icon');
  const statusText = document.getElementById('home-api-status-text');
  const iconShow = document.getElementById('home-icon-eye-show');
  const iconHide = document.getElementById('home-icon-eye-hide');
  const statusBadge = document.getElementById('api-status-badge');

  if (!modal || !openBtn) return;

  // Open modal
  openBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    loadApiSettings();
  });

  // Close modal
  function closeModal() {
    modal.classList.add('hidden');
    if (apiKeyInput) apiKeyInput.value = '';
    if (statusDiv) statusDiv.classList.add('hidden');
  }

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

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
  }

  // Load existing API settings
  async function loadApiSettings() {
    try {
      const settings = await window.StoryboardAPI.getApiSettings();
      if (settings.hasKey) {
        apiKeyInput.placeholder = settings.maskedKey + ' (saved)';
        statusBadge?.classList.remove('hidden');
      } else {
        apiKeyInput.placeholder = 'Enter your Google AI API key...';
        statusBadge?.classList.add('hidden');
      }
    } catch (err) {
      console.error('Failed to load API settings:', err);
    }
  }

  // Save API key
  saveBtn?.addEventListener('click', async () => {
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
      statusBadge?.classList.remove('hidden');
      
      // Clear input and update placeholder
      apiKeyInput.value = '';
      apiKeyInput.placeholder = '••••••••' + apiKey.slice(-4) + ' (saved)';
      
      // Close modal after short delay
      setTimeout(closeModal, 1500);
    } catch (err) {
      console.error('Failed to save API key:', err);
      showStatus('error', 'Failed to save API key');
    } finally {
      saveBtn.disabled = false;
    }
  });

  // Check API status on load
  checkApiStatus();
}

async function checkApiStatus() {
  const statusBadge = document.getElementById('api-status-badge');
  if (!statusBadge) return;

  try {
    const settings = await window.StoryboardAPI.getApiSettings();
    if (settings.hasKey) {
      statusBadge.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Failed to check API status:', err);
  }
}

function init() {
  loadAndRenderProjects();
  initApiModal();
  document.getElementById('btn-create-new')?.addEventListener('click', createAndGo);
  document.getElementById('btn-blank-project')?.addEventListener('click', createAndGo);
  document.getElementById('btn-fab-create')?.addEventListener('click', createAndGo);

  // Home page actions delegation
  document.addEventListener('click', (e) => {
    // Handle menu actions
    handleMenuAction(e);

    // Close menu when clicking outside
    if (!e.target.closest('.context-menu') && !e.target.closest('[data-action="toggle-project-menu"]')) {
      document.querySelectorAll('.context-menu').forEach((m) => m.classList.add('hidden'));
    }
  });
}

document.addEventListener('DOMContentLoaded', init);

window.addEventListener('pageshow', (e) => {
  // Refresh projects if page was restored from bfcache
  if (e.persisted) loadAndRenderProjects();
});
