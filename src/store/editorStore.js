import { create } from 'zustand';
import { PROJECT_STATES } from '../constants';

/**
 * Zustand store for editor UI state
 * Manages active tab, sidebar visibility, save status, and local screenplay scenes
 */
export const useEditorStore = create((set, get) => ({
    // Current project ID
    currentProjectId: null,
    setCurrentProjectId: (id) => set({ currentProjectId: id }),

    // Project state (NO_SCRIPT, SCENES_GENERATED, SHOTLIST_GENERATED, STORYBOARD_GENERATED)
    projectState: PROJECT_STATES.NO_SCRIPT,
    setProjectState: (state) => set({ projectState: state }),

    // Local project data (modified before syncing to server)
    localName: '',
    setLocalName: (name) => set({ localName: name }),
    localScript: '',
    setLocalScript: (script) => set({ localScript: script }),

    // Active tab in editor ('script' | 'idea' | 'breakdown')
    activeTab: 'script',
    setActiveTab: (tab) => set({ activeTab: tab }),

    // Active sidebar ('assets' | 'api' | null)
    activeSidebar: 'assets',
    setActiveSidebar: (sidebar) => set({ activeSidebar: sidebar }),
    toggleSidebar: (sidebar) => set((state) => ({
        activeSidebar: state.activeSidebar === sidebar ? null : sidebar,
    })),

    // Save status ('saved' | 'saving' | 'unsaved')
    saveStatus: 'saved',
    setSaveStatus: (status) => set({ saveStatus: status }),

    // Local screenplay scenes (modified before syncing to server)
    localScenes: [],
    setLocalScenes: (scenes) => set({ localScenes: scenes }),
    updateScene: (sceneId, updates) => set((state) => ({
        localScenes: state.localScenes.map((scene) =>
            scene.id === sceneId ? { ...scene, ...updates } : scene
        ),
    })),
    deleteScene: (sceneId) => set((state) => ({
        localScenes: state.localScenes.filter((scene) => scene.id !== sceneId),
    })),
    addScene: (index) => set((state) => {
        const newScene = {
            id: `temp-${Date.now()}`,  // Use temp- prefix so backend generates proper UUID
            content: '',
            assets: [],
        };

        const newScenes = [...state.localScenes];
        if (typeof index === 'number') {
            newScenes.splice(index, 0, newScene);
        } else {
            newScenes.push(newScene);
        }

        return {
            localScenes: newScenes,
        };
    }),
    reorderScenes: (scenes) => set({ localScenes: scenes }),

    // Reset editor state
    resetEditor: () => set({
        currentProjectId: null,
        projectState: PROJECT_STATES.NO_SCRIPT,
        localName: '',
        localScript: '',
        activeTab: 'script',
        activeSidebar: null,
        saveStatus: 'saved',
        localScenes: [],
    }),
}));
