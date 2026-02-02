/**
 * Project page: sidebar panel, project tabs (idea / breakdown)
 */

export function switchSidebar(mode) {
  const assetsPanel = document.getElementById('panel-assets');
  const apiPanel = document.getElementById('panel-api');
  const btnAssets = document.getElementById('btn-assets');
  const btnApi = document.getElementById('btn-api');

  if (!assetsPanel || !apiPanel || !btnAssets || !btnApi) return;

  // Hide all panels
  assetsPanel.classList.add('hidden');
  apiPanel.classList.add('hidden');

  // Reset all buttons to inactive
  btnAssets.classList.remove('sidebar-btn-active');
  btnAssets.classList.add('sidebar-btn');
  btnApi.classList.remove('sidebar-btn-active');
  btnApi.classList.add('sidebar-btn');

  // Show selected panel and activate button
  if (mode === 'assets') {
    assetsPanel.classList.remove('hidden');
    btnAssets.classList.remove('sidebar-btn');
    btnAssets.classList.add('sidebar-btn-active');
  } else if (mode === 'api') {
    apiPanel.classList.remove('hidden');
    btnApi.classList.remove('sidebar-btn');
    btnApi.classList.add('sidebar-btn-active');
  }
}

export function switchProjectTab(tab) {
  const scriptView = document.getElementById('view-script');
  const loadingView = document.getElementById('view-loading');
  const ideaView = document.getElementById('view-story-idea');
  const breakdownView = document.getElementById('view-screenplay');
  const scrollArea = document.getElementById('main-scroll-area');
  if (!ideaView || !breakdownView) return;

  // Ensure only one main view is visible: hide script and loading when showing idea or breakdown
  if (scriptView) scriptView.classList.add('hidden');
  if (loadingView) loadingView.classList.add('hidden');
  ideaView.classList.add('hidden');
  breakdownView.classList.add('hidden');

  if (tab === 'idea') ideaView.classList.remove('hidden');
  else if (tab === 'breakdown') breakdownView.classList.remove('hidden');
  if (scrollArea) scrollArea.scrollTop = 0;
}
