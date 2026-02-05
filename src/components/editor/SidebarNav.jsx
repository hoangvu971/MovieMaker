import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { EDITOR_TABS, SIDEBAR_PANELS } from '../../constants';

function SidebarNav() {
    const { activeTab, setActiveTab, activeSidebar, toggleSidebar } = useEditorStore();

    const tabs = [
        { id: EDITOR_TABS.SCRIPT, label: 'Script', icon: 'solar:document-text-linear' },
        { id: EDITOR_TABS.BREAKDOWN, label: 'Breakdown', icon: 'solar:list-check-linear' },
        { id: EDITOR_TABS.SHOTLIST, label: 'Shotlist', icon: 'solar:clapperboard-edit-linear' },
    ];

    return (
        <aside className="bg-black border-r border-zinc-900 w-16 flex-shrink-0 flex flex-col items-center py-4 gap-2">
            {/* Tab buttons */}
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${activeTab === tab.id
                        ? 'bg-cyan-500 text-black'
                        : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                        }`}
                    title={tab.label}
                >
                    <iconify-icon icon={tab.icon} width="22" height="22"></iconify-icon>
                </button>
            ))}

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* API Settings button */}
            <button
                onClick={() => toggleSidebar(SIDEBAR_PANELS.API)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${activeSidebar === SIDEBAR_PANELS.API
                    ? 'bg-purple-500 text-white'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                    }`}
                title="API Settings"
            >
                <iconify-icon icon="solar:settings-linear" width="22" height="22"></iconify-icon>
            </button>
        </aside>
    );
}

export default SidebarNav;
