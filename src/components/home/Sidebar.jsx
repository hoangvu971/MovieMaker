import React from 'react';

function Sidebar({ onCreateProject }) {
    return (
        <aside className="bg-black border-r border-zinc-900 w-64 flex-shrink-0 hidden lg:flex flex-col">
            <nav className="flex-1 p-4 space-y-2">
                {/* Create New Button */}
                <button
                    onClick={() => onCreateProject()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-medium transition-colors"
                >
                    <iconify-icon icon="solar:add-circle-linear" width="20" height="20"></iconify-icon>
                    <span>Create New</span>
                </button>

                {/* Navigation Links */}
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">
                    <iconify-icon icon="solar:home-2-linear" width="20" height="20"></iconify-icon>
                    <span>Projects</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors">
                    <iconify-icon icon="solar:folder-linear" width="20" height="20"></iconify-icon>
                    <span>Templates</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors">
                    <iconify-icon icon="solar:star-linear" width="20" height="20"></iconify-icon>
                    <span>Favorites</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors">
                    <iconify-icon icon="solar:trash-bin-trash-linear" width="20" height="20"></iconify-icon>
                    <span>Trash</span>
                </button>
            </nav>

            {/* Bottom section */}
            <div className="p-4 border-t border-zinc-900 space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors text-sm">
                    <iconify-icon icon="solar:question-circle-linear" width="18" height="18"></iconify-icon>
                    <span>Help & Support</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
