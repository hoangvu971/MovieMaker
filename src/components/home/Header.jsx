import React from 'react';
import { Link } from 'react-router-dom';

function Header({ onOpenApiSettings, hasApiKey }) {
    return (
        <header className="bg-black border-b border-zinc-900 flex-shrink-0">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                        <iconify-icon icon="solar:video-frame-cut-linear" className="text-white" width="18" height="18"></iconify-icon>
                    </div>
                    <h1 className="text-lg font-semibold text-white hidden sm:block">
                        Movie<span className="text-cyan-400">Maker</span>
                    </h1>
                </Link>

                {/* Right side buttons */}
                <div className="flex items-center gap-2">
                    {/* API Settings Button */}
                    <button
                        onClick={onOpenApiSettings}
                        className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all text-zinc-400 hover:text-white"
                    >
                        <iconify-icon icon="solar:settings-linear" width="18" height="18"></iconify-icon>
                        <span className="hidden sm:inline text-sm">API Settings</span>
                        {hasApiKey && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;
