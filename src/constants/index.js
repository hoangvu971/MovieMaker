/**
 * Application constants
 */

// Debounce delays
export const AUTO_SAVE_DELAY = 1000; // 1 second
export const SEARCH_DELAY = 300; // 300ms

// Save status
export const SAVE_STATUS = {
    SAVED: 'saved',
    SAVING: 'saving',
    UNSAVED: 'unsaved',
};

// Editor tabs
export const EDITOR_TABS = {
    SCRIPT: 'script',
    BREAKDOWN: 'breakdown',
    SHOTLIST: 'shotlist',
};

// Sidebar panels
export const SIDEBAR_PANELS = {
    ASSETS: 'assets',
    API: 'api',
};

// Project states
export const PROJECT_STATES = {
    NO_SCRIPT: 'NO_SCRIPT',
    SCENES_GENERATED: 'SCENES_GENERATED',
    SHOTLIST_GENERATED: 'SHOTLIST_GENERATED',
    STORYBOARD_GENERATED: 'STORYBOARD_GENERATED',
};
