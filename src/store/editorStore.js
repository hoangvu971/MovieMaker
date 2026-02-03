import { create } from 'zustand';

/**
 * Zustand store for editor UI state
 * Manages active tab, sidebar visibility, save status, and local screenplay scenes
 */
export const useEditorStore = create((set, get) => ({
    // Current project ID
    currentProjectId: null,
    setCurrentProjectId: (id) => set({ currentProjectId: id }),

    // Active tab in editor ('script' | 'idea' | 'breakdown')
    activeTab: 'script',
    setActiveTab: (tab) => set({ activeTab: tab }),

    // Active sidebar ('assets' | 'api' | null)
    activeSidebar: null,
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
    reorderScenes: (scenes) => set({ localScenes: scenes }),

    // Reset editor state
    resetEditor: () => set({
        currentProjectId: null,
        activeTab: 'script',
        activeSidebar: null,
        saveStatus: 'saved',
        localScenes: [],
    }),
}));
