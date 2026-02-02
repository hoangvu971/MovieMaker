/**
 * Project page: screenplay list, scene blocks, Sortable, scene menu
 */

import Sortable from 'sortablejs';
import { scheduleSave } from './save.js';


let currentDragItem = null;

// Helper to create asset DOM element
function createAssetElement(srcElement) {
  const imgEl = srcElement.querySelector('img');
  const nameEl = srcElement.querySelector('p');
  const assetUrl = imgEl ? imgEl.src : '';
  const assetName = nameEl ? nameEl.textContent.trim() : 'Unknown';
  // Get asset ID from the source element's data-id attribute
  const assetId = srcElement.dataset.id || '';

  const div = document.createElement('div');
  div.className = 'asset-card w-16 h-16 relative shrink-0 group/asset';
  // Preserve the ID on the new scene asset element
  if (assetId) div.dataset.id = assetId;

  div.innerHTML = `
    <div class="w-full h-full rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800 relative">
        <img src="${assetUrl}" class="w-full h-full object-cover" alt="${assetName}">
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/asset:opacity-100 transition-opacity flex items-center justify-center">
        <p class="hidden">${assetName}</p>
        </div>
    </div>
    <div class="delete-asset absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-400 z-10 shadow-sm opacity-0 group-hover/asset:opacity-100 transition-opacity">
      <iconify-icon icon="solar:close-circle-bold" class="text-white text-[10px]"></iconify-icon>
    </div>
  `;

  // Bind delete functionality immediately
  const deleteBtn = div.querySelector('.delete-asset');
  if (deleteBtn) {
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      const parent = div.parentElement;
      div.remove();
      if (parent) {
        const emptyMsg = parent.querySelector('.empty-msg');
        // Check if this was the last asset
        if (parent.querySelectorAll('.asset-card').length === 0 && emptyMsg) {
          emptyMsg.style.display = 'flex';
        }
      }
      scheduleSave();
    };
  }
  return div;
}

export function sceneBlockHtml(id, order, content, assets = []) {
  const escaped = (content || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const assetsHtml = assets.map(asset => `
    <div class="asset-card w-16 h-16 relative shrink-0 group/asset" data-id="${asset.id || ''}">
      <div class="w-full h-full rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800 relative">
          <img src="${asset.url}" class="w-full h-full object-cover" alt="">
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/asset:opacity-100 transition-opacity flex items-center justify-center">
             <p class="hidden">${asset.name}</p>
          </div>
      </div>
      <div class="delete-asset absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-400 z-10 shadow-sm opacity-0 group-hover/asset:opacity-100 transition-opacity">
        <iconify-icon icon="solar:close-circle-bold" class="text-white text-[10px]"></iconify-icon>
      </div>
    </div>
  `).join('');

  return (
    '<div class="scene-block group relative pl-8 hover:bg-zinc-900/50 rounded-lg p-2 transition-colors -ml-2" data-id="' + id + '" data-order="' + order + '">' +
    '<div class="absolute left-0 top-1.5 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity text-zinc-500">' +
    '<button type="button" class="p-1 hover:text-white hover:bg-zinc-800 rounded transition-colors" title="Add Scene"><iconify-icon icon="solar:add-circle-linear" class="text-lg"></iconify-icon></button>' +
    '<div class="relative">' +
    '<button type="button" data-action="toggle-handle-menu" class="handle p-1 hover:text-white hover:bg-zinc-800 rounded cursor-grab active:cursor-grabbing transition-colors" title="Drag to move"><iconify-icon icon="solar:menu-dots-grid-linear" class="text-lg"></iconify-icon></button>' +
    '<div class="handle-menu hidden absolute top-full left-0 mt-1 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden text-sm flex-col">' +
    '<div class="p-2 border-b border-zinc-800"><div class="bg-zinc-800/50 rounded flex items-center px-2 py-1.5 gap-2 text-zinc-400"><iconify-icon icon="solar:magnifer-linear"></iconify-icon><input type="text" placeholder="Filter" class="bg-transparent border-none outline-none text-xs w-full text-zinc-200 placeholder:text-zinc-600"></div></div>' +
    '<button type="button" data-action="menu-up" class="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors"><iconify-icon icon="solar:arrow-up-linear"></iconify-icon> Move up</button>' +
    '<button type="button" data-action="menu-delete" class="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"><iconify-icon icon="solar:trash-bin-trash-linear"></iconify-icon> Delete</button>' +
    '<button type="button" data-action="menu-down" class="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors"><iconify-icon icon="solar:arrow-down-linear"></iconify-icon> Move down</button>' +
    '</div></div></div>' +
    '<div class="mb-2"><span class="text-xs font-bold text-zinc-500 uppercase tracking-wider select-none">Scene ' + (parseInt(order) + 1) + '</span></div>' +
    '<div contenteditable="true" class="w-full bg-transparent text-zinc-300 leading-relaxed outline-none focus:text-white empty:before:content-[attr(placeholder)] empty:before:text-zinc-700" placeholder="Type scene details...">' +
    escaped +
    '</div>' +
    '<div class="mt-3"><p class="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2 flex items-center gap-2"><iconify-icon icon="solar:paperclip-linear"></iconify-icon> Attached Assets</p>' +
    '<div class="scene-assets-list flex flex-nowrap overflow-x-auto gap-2 h-24 p-2 bg-black/20 border border-dashed border-zinc-700 rounded-lg transition-colors hover:border-zinc-600 relative items-center">' +
    assetsHtml +
    '<div class="text-xs text-zinc-700 w-full h-full absolute inset-0 flex items-center justify-center italic pointer-events-none empty-msg" ' + (assets.length > 0 ? 'style="display:none"' : '') + '>Drag assets here</div></div></div></div>'
  );
}

export function toggleHandleMenu(btn, event) {
  event.stopPropagation();
  const wrapper = btn.closest('.relative');
  const menu = wrapper?.querySelector('.handle-menu');
  if (!menu) return;
  document.querySelectorAll('.handle-menu').forEach((m) => {
    if (m !== menu) {
      m.classList.add('hidden');
      m.classList.remove('flex');
    }
  });
  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
    menu.classList.add('flex');
  } else {
    menu.classList.add('hidden');
    menu.classList.remove('flex');
  }
}

export function handleMenuAction(action, btn) {
  const sceneBlock = btn.closest('.scene-block');
  const menu = btn.closest('.handle-menu');
  if (!sceneBlock || !menu) return;
  menu.classList.add('hidden');
  menu.classList.remove('flex');
  if (action === 'delete') {
    if (confirm('Delete this scene?')) sceneBlock.remove();
  } else if (action === 'up') {
    const prev = sceneBlock.previousElementSibling;
    if (prev) sceneBlock.parentNode.insertBefore(sceneBlock, prev);
  } else if (action === 'down') {
    const next = sceneBlock.nextElementSibling;
    if (next) sceneBlock.parentNode.insertBefore(next, sceneBlock);
  }
}

export function initSceneAssetLists() {
  document.querySelectorAll('.scene-assets-list').forEach((target) => {
    if (target.dataset.sortableInitialized) return;
    Sortable.create(target, {
      group: { name: 'assets', put: true },
      animation: 150,
      ghostClass: 'opacity-50',
      onAdd(evt) {
        // evt.item is the element that was dropped into the list
        // Extract asset info
        const assetId = evt.item.dataset.id;

        // Check if ID is missing (should not happen for library assets)
        if (!assetId) {
          console.warn('Dropped asset has no ID, skipping duplicate check');
        }

        // Check against EXISTING items in the list
        const existingAssets = target.querySelectorAll('.asset-card');
        const isDuplicate = Array.from(existingAssets).some(card => {
          // IMPORTANT: Skip checking against itself (added item is already in list)
          if (card === evt.item) return false;

          // Check ID match
          const cardId = card.dataset.id;
          return assetId && cardId && assetId === cardId;
        });

        if (isDuplicate) {
          // 1. Immediately hide it to prevent visual duplication
          evt.item.style.opacity = '0';
          evt.item.style.pointerEvents = 'none';
          evt.item.style.width = '0';
          evt.item.style.height = '0';
          evt.item.style.margin = '0';

          // 2. Remove it thoroughly
          setTimeout(() => {
            if (evt.item && evt.item.parentNode) {
              evt.item.parentNode.removeChild(evt.item);
            }
          }, 10);

          // Show toast notification
          const toast = document.createElement('div');
          toast.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300';
          toast.innerHTML = '<iconify-icon icon="solar:danger-triangle-linear" class="inline-block mr-2 align-text-bottom text-lg"></iconify-icon> Asset already added to this scene';
          document.body.appendChild(toast);
          setTimeout(() => {
            toast.classList.add('transition-opacity', 'opacity-0', 'duration-300');
            setTimeout(() => toast.remove(), 300);
          }, 3000);

          return;
        }

        // If no ID after all, we might have a problem, but let's try to proceed
        if (!assetId) {
          console.error('Cannot add asset without ID');
          evt.item.remove();
          return;
        }

        const newItem = createAssetElement(evt.item);
        evt.item.replaceWith(newItem);

        const emptyMsg = target.querySelector('.empty-msg');
        if (emptyMsg) emptyMsg.style.display = 'none';

        scheduleSave();
      },
      onRemove() {
        scheduleSave();
      }
    });

    // Handle existing assets delete buttons
    target.addEventListener('click', (e) => {
      const btn = e.target.closest('.delete-asset');
      if (btn) {
        const item = btn.closest('.asset-card');
        item.remove();
        const emptyMsg = target.querySelector('.empty-msg');
        if (target.querySelectorAll('.asset-card').length === 0 && emptyMsg) emptyMsg.style.display = 'flex';
        scheduleSave();
      }
    });

    target.dataset.sortableInitialized = 'true';
  });
}

export function initSortableAndAssets() {
  const list = document.getElementById('screenplay-list');
  if (list && !list.dataset.sortableInit) {
    Sortable.create(list, { handle: '.handle', animation: 150, ghostClass: 'bg-zinc-800/50' });
    list.dataset.sortableInit = 'true';
  }

  // Re-initialize library assets FIRST
  const library = document.getElementById('library-assets-list');
  if (library) {
    // Destroy existing instance if any
    if (library.sortableInstance) {
      library.sortableInstance.destroy();
    }
    // Create new instance with simpler configuration
    library.sortableInstance = Sortable.create(library, {
      group: { name: 'assets', pull: 'clone', put: false },
      sort: false,
      animation: 150,
      ghostClass: 'opacity-50',
      onStart: (evt) => {
        currentDragItem = evt.item;
        document.body.classList.add('is-dragging-assets');
      },
      onMove: (evt) => {
        // Prevent dropping into a scene that already has this asset
        const assetId = evt.dragged.dataset.id;
        const target = evt.to;
        if (target && target.classList.contains('scene-assets-list')) {
          const existing = target.querySelectorAll('.asset-card');
          const isDuplicate = Array.from(existing).some(card => {
            // Note: During onMove, the ghost might already be in target, 
            // but Sortable provides it as evt.dragged.
            // Just check if ANY EXISTING card (excluding ghost) has this ID.
            return card.dataset.id === assetId && card !== evt.dragged;
          });
          if (isDuplicate) return false; // This prevents the drop zone from activating
        }
        return true;
      },
      onEnd: () => {
        currentDragItem = null;
        document.body.classList.remove('is-dragging-assets');
        // Clean up any stray drag-over classes
        document.querySelectorAll('.scene-drag-over').forEach(el => el.classList.remove('scene-drag-over'));
      }
    });
  }

  // THEN initialize scene drop zones (they need the library group to exist first)
  initSceneAssetLists();
  initSceneDropZones();
}

function initSceneDropZones() {
  document.querySelectorAll('.scene-block').forEach(scene => {
    if (scene.dataset.dndInit) return;

    scene.addEventListener('dragover', (e) => {
      e.preventDefault(); // allow dropping
      if (currentDragItem) {
        scene.classList.add('scene-drag-over');
      }
    });

    scene.addEventListener('dragleave', (e) => {
      // Only remove if we are leaving the scene block itself, not entering a child
      // But dragleave fires when entering child too. 
      // Simplest check: check if relatedTarget is within scene
      if (!scene.contains(e.relatedTarget)) {
        scene.classList.remove('scene-drag-over');
      }
    });

    scene.addEventListener('drop', (e) => {
      e.preventDefault();
      scene.classList.remove('scene-drag-over');

      if (currentDragItem) {
        const assetsList = scene.querySelector('.scene-assets-list');
        if (assetsList) {
          const assetId = currentDragItem.dataset.id;
          if (!assetId) return;

          // Duplicate check: don't add if this scene already has this asset
          const existingCards = assetsList.querySelectorAll('.asset-card');
          const isDuplicate = Array.from(existingCards).some(
            (card) => card.dataset.id && card.dataset.id === assetId
          );
          if (isDuplicate) {
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300';
            toast.innerHTML = '<iconify-icon icon="solar:danger-triangle-linear" class="inline-block mr-2 align-text-bottom text-lg"></iconify-icon> Asset already added to this scene';
            document.body.appendChild(toast);
            setTimeout(() => {
              toast.classList.add('transition-opacity', 'opacity-0', 'duration-300');
              setTimeout(() => toast.remove(), 300);
            }, 3000);
            return;
          }

          const newAsset = createAssetElement(currentDragItem);
          assetsList.appendChild(newAsset);

          const emptyMsg = assetsList.querySelector('.empty-msg');
          if (emptyMsg) emptyMsg.style.display = 'none';

          scheduleSave();
        }
      }
    });

    scene.dataset.dndInit = 'true';
  });
}
