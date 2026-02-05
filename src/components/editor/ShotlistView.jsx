import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import SceneShotList from './SceneShotList';
import { SHOT_SIZES, SHOT_PERSPECTIVES, SHOT_MOVEMENTS, SHOT_EQUIPMENT, ASPECT_RATIOS } from '../../constants/shotOptions';

function ShotlistView({ project }) {
    const { activeSidebar, toggleSidebar } = useEditorStore();

    // We will group shots by scene
    // scenes come from project.screenplayScenes

    return (
        <div className="p-8 max-w-6xl mx-auto pb-40">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Shotlist</h1>
                <p className="text-zinc-400">Manage shots for your scenes</p>
            </header>

            <div className="space-y-8">
                {project.screenplayScenes && project.screenplayScenes.length > 0 ? (
                    project.screenplayScenes.map((scene, index) => (
                        <SceneShotList key={scene.id} scene={scene} index={index} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
                        <iconify-icon icon="solar:clapperboard-text-linear" width="48" className="text-zinc-600 mb-4"></iconify-icon>
                        <h3 className="text-xl font-medium text-white mb-2">No Scenes Available</h3>
                        <p className="text-zinc-500">Generate or add scenes in the Breakdown tab first.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ShotlistView;
