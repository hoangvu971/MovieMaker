import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEditorStore } from '../../store/editorStore';
import SceneBlock from './SceneBlock';
import ConfirmDialog from '../common/ConfirmDialog';
import { useToast } from '../common/ToastProvider';

function ScreenplayView({ project }) {
    const { localScenes, setLocalScenes, updateScene, deleteScene, reorderScenes } = useEditorStore();
    const { showToast } = useToast();
    const [deleteDialogState, setDeleteDialogState] = useState({ isOpen: false, sceneId: null, sceneIndex: null });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = localScenes.findIndex((scene) => scene.id === active.id);
            const newIndex = localScenes.findIndex((scene) => scene.id === over.id);

            const reordered = arrayMove(localScenes, oldIndex, newIndex);
            reorderScenes(reordered);
        }
    };

    const handleSceneUpdate = (sceneId, updates) => {
        updateScene(sceneId, updates);
    };

    const handleSceneDelete = (sceneId) => {
        const sceneIndex = localScenes.findIndex((scene) => scene.id === sceneId);
        setDeleteDialogState({ isOpen: true, sceneId, sceneIndex });
    };

    const confirmSceneDelete = () => {
        const { sceneId } = deleteDialogState;
        deleteScene(sceneId);
        setDeleteDialogState({ isOpen: false, sceneId: null, sceneIndex: null });
        showToast('Scene deleted successfully', 'success');
    };

    const handleAddScene = () => {
        const newScene = {
            id: `scene-${Date.now()}`,
            order: localScenes.length,
            content: '',
            assets: [],
        };
        setLocalScenes([...localScenes, newScene]);
        // Also need to set unsaved for manually adding scene via setLocalScenes
        useEditorStore.getState().setSaveStatus('unsaved');
    };


    if (!localScenes || localScenes.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-8 py-16 text-center">
                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-12">
                    <iconify-icon icon="solar:notes-minimalistic-linear" className="text-zinc-600 mx-auto mb-4" width="64" height="64"></iconify-icon>
                    <h2 className="text-2xl font-semibold text-white mb-3">No scenes yet</h2>
                    <p className="text-zinc-400 mb-8">
                        Start by writing a script in the Script tab and generate scenes with AI, or add scenes manually.
                    </p>
                    <button
                        onClick={handleAddScene}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-medium transition-colors"
                    >
                        <iconify-icon icon="solar:add-circle-linear" width="20"></iconify-icon>
                        Add First Scene
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-8 py-12">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-white mb-2">Screenplay Breakdown</h2>
                    <p className="text-zinc-400">{localScenes.length} scene{localScenes.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Scenes List */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={localScenes.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4">
                        {localScenes.map((scene, index) => (
                            <SceneBlock
                                key={scene.id}
                                scene={scene}
                                index={index}
                                onUpdate={handleSceneUpdate}
                                onDelete={handleSceneDelete}
                                projectId={project.id}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Add Scene Button at the bottom */}
            <div className="mt-8 pt-8 border-t border-zinc-900 flex justify-center">
                <button
                    onClick={handleAddScene}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all hover:scale-[1.02] active:scale-95 group"
                >
                    <iconify-icon
                        icon="solar:add-circle-bold"
                        width="20"
                        className="text-cyan-500 group-hover:rotate-90 transition-transform duration-300"
                    ></iconify-icon>
                    <span className="font-medium">Add New Scene</span>
                </button>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialogState.isOpen}
                onClose={() => setDeleteDialogState({ isOpen: false, sceneId: null, sceneIndex: null })}
                onConfirm={confirmSceneDelete}
                title="Delete Scene"
                message={`Are you sure you want to delete Scene ${(deleteDialogState.sceneIndex ?? 0) + 1}? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}

export default ScreenplayView;
