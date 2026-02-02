/**
 * Project page: save/load project data (API + DOM)
 */

const SAVE_DEBOUNCE_MS = 800;

let currentProjectId = null;
let saveTimeout = null;

export function getCurrentProjectId() {
  return currentProjectId;
}

export function setCurrentProjectId(id) {
  currentProjectId = id;
}

export function setSaveStatus(text, isSaving) {
  const el = document.getElementById('project-save-status');
  if (!el) return;
  el.innerHTML = isSaving
    ? '<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Saving...'
    : '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ' + text;
}

export function collectScreenplayScenes() {
  const blocks = document.querySelectorAll('#screenplay-list .scene-block');
  return Array.from(blocks).map((block) => {
    const contentEl = block.querySelector('[contenteditable="true"]');
    const id = block.dataset.id;
    const order = parseInt(block.dataset.order || '0');

    // Collect assets attached to this scene
    const assetEls = block.querySelectorAll('.scene-assets-list .asset-card');
    const assets = Array.from(assetEls).map(el => {
      const nameEl = el.querySelector('p');
      const imgEl = el.querySelector('img');
      return {
        id: el.dataset.id || '', // Include ID
        url: imgEl ? imgEl.src : '',
        name: nameEl ? nameEl.innerText.trim() : 'Unknown'
      };
    });

    return {
      id,
      order,
      content: contentEl ? contentEl.innerText.trim() : '',
      assets
    };
  });
}

export function collectStoryIdea() {
  const el = document.getElementById('input-project-script');
  return el ? el.value.trim() : '';
}

export function getProjectName() {
  const el = document.getElementById('project-title');
  const name = el ? (el.textContent || '').trim() : '';
  return name || 'Untitled Project';
}

export async function saveProjectNow() {
  if (!currentProjectId) return;
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  setSaveStatus('Saving...', true);
  try {
    const storyIdea = collectStoryIdea();
    const screenplayScenes = collectScreenplayScenes();
    await window.StoryboardAPI.updateProject(currentProjectId, {
      name: getProjectName(),
      storyIdea,
      screenplayScenes,
      shotCount: screenplayScenes.length,
    });
    setSaveStatus('Saved', false);
  } catch (e) {
    setSaveStatus('Error saving', false);
  }
}

export function scheduleSave() {
  if (!currentProjectId) return;
  if (saveTimeout) clearTimeout(saveTimeout);
  setSaveStatus('Saving...', true);
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    saveProjectNow();
  }, SAVE_DEBOUNCE_MS);
}
