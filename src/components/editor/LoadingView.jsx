import React from 'react';
import { useEditorStore } from '../../store/editorStore';

function LoadingView() {
    const [isVisible, setIsVisible] = React.useState(false);

    // You can control visibility via Zustand store if needed
    // For now, this is a placeholder that can be controlled by parent components

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center max-w-md">
                {/* Animated loader */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-cyan-400/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-transparent border-t-purple-400 rounded-full animate-spin-slow"></div>
                </div>

                {/* Loading text */}
                <h2 className="text-2xl font-semibold text-white mb-2">Generating Scenes</h2>
                <p className="text-zinc-400 mb-6">
                    AI is analyzing your script and creating the perfect breakdown...
                </p>

                {/* Progress steps */}
                <div className="space-y-3 text-sm text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                        <iconify-icon icon="solar:check-circle-linear" className="text-green-400" width="16"></iconify-icon>
                        <span>Reading script</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <iconify-icon icon="line-md:loading-loop" className="text-cyan-400" width="16"></iconify-icon>
                        <span>Identifying scenes</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 opacity-50">
                        <iconify-icon icon="solar:clipboard-list-linear" width="16"></iconify-icon>
                        <span>Creating breakdown</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoadingView;
