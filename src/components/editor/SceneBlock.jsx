import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SceneBlock({ scene, index, onUpdate, onDelete, projectId }) {
    const [showMenu, setShowMenu] = useState(false);
    const [content, setContent] = useState(scene.content || '');
    const [isDragOver, setIsDragOver] = useState(false);
    const contentRef = useRef(null);
    const assetsDropZoneRef = useRef(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: scene.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    useEffect(() => {
        if (contentRef.current && contentRef.current.textContent !== scene.content) {
            contentRef.current.textContent = scene.content || '';
        }
    }, [scene.content]);

    const handleContentChange = () => {
        if (!contentRef.current) return;
        const newContent = contentRef.current.textContent || '';
        if (newContent !== content) {
            setContent(newContent);
            onUpdate(scene.id, { content: newContent });
        }
    };

    // Prevent default drop behavior on contentEditable
    const handleContentDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleContentDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Don't allow drops in the text area
    };

    // Handle asset drops
    const handleAssetDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleAssetDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget === e.target || !assetsDropZoneRef.current?.contains(e.relatedTarget)) {
            setIsDragOver(false);
        }
    };

    const handleAssetDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        // Get asset data from the drag event
        const assetData = e.dataTransfer.getData('application/json');
        if (!assetData) return;

        try {
            const asset = JSON.parse(assetData);

            // Check if asset is already attached
            const isAlreadyAttached = sceneAssets.some(a => a.id === asset.id);
            if (isAlreadyAttached) return;

            // Add asset to scene
            const updatedAssets = [...sceneAssets, asset];
            onUpdate(scene.id, { assets: updatedAssets });
        } catch (error) {
            console.error('Failed to parse asset data:', error);
        }
    };

    const handleMoveUp = () => {
        // Handled by parent via drag-and-drop
        setShowMenu(false);
    };

    const handleMoveDown = () => {
        // Handled by parent via drag-and-drop
        setShowMenu(false);
    };

    const sceneAssets = scene.assets || [];

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`scene-block group relative pl-8 rounded-lg p-4 transition-colors -ml-2 border ${isDragOver
                ? 'bg-zinc-900/50 border-cyan-500'
                : 'border-transparent hover:border-zinc-800 hover:bg-zinc-900/50'
                }`}
        >
            {/* Drag Handle and Actions */}
            <div className="absolute left-0 top-1.5 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity text-zinc-500">
                <button
                    type="button"
                    className="p-1 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                    title="Add Scene"
                >
                    <iconify-icon icon="solar:add-circle-linear" className="text-lg"></iconify-icon>
                </button>

                <div className="relative">
                    <button
                        type="button"
                        {...attributes}
                        {...listeners}
                        className="handle p-1 hover:text-white hover:bg-zinc-800 rounded cursor-grab active:cursor-grabbing transition-colors"
                        title="Drag to move"
                    >
                        <iconify-icon icon="solar:menu-dots-grid-linear" className="text-lg"></iconify-icon>
                    </button>

                    {/* Context Menu */}
                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowMenu(false)}
                            ></div>
                            <div className="absolute top-full left-0 mt-1 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden text-sm">
                                <button
                                    type="button"
                                    onClick={handleMoveUp}
                                    className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors"
                                >
                                    <iconify-icon icon="solar:arrow-up-linear"></iconify-icon>
                                    Move up
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowMenu(false);
                                        onDelete(scene.id);
                                    }}
                                    className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                >
                                    <iconify-icon icon="solar:trash-bin-trash-linear"></iconify-icon>
                                    Delete
                                </button>
                                <button
                                    type="button"
                                    onClick={handleMoveDown}
                                    className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors"
                                >
                                    <iconify-icon icon="solar:arrow-down-linear"></iconify-icon>
                                    Move down
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Scene Number */}
            <div className="mb-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider select-none">
                    Scene {index + 1}
                </span>
            </div>

            {/* Scene Content (Editable) */}
            <div
                ref={contentRef}
                contentEditable
                onBlur={handleContentChange}
                onInput={handleContentChange}
                onDragOver={handleContentDragOver}
                onDrop={handleContentDrop}
                className="w-full bg-transparent text-zinc-300 leading-relaxed outline-none focus:text-white empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-700"
                data-placeholder="Type scene details..."
                suppressContentEditableWarning
            />

            {/* Attached Assets */}
            <div className="mt-4">
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <iconify-icon icon="solar:paperclip-linear"></iconify-icon>
                    Attached Assets
                </p>
                <div
                    ref={assetsDropZoneRef}
                    onDragOver={handleAssetDragOver}
                    onDragLeave={handleAssetDragLeave}
                    onDrop={handleAssetDrop}
                    className={`scene-assets-list flex flex-nowrap overflow-x-auto gap-2 min-h-[80px] p-2 bg-black/20 border border-dashed rounded-lg transition-all relative items-center ${isDragOver
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-zinc-700 hover:border-zinc-600'
                        }`}
                >
                    {sceneAssets.length === 0 && (
                        <div className="text-xs text-zinc-700 w-full h-full absolute inset-0 flex items-center justify-center italic pointer-events-none">
                            Drag assets here
                        </div>
                    )}
                    {sceneAssets.map((asset) => (
                        <div
                            key={asset.id}
                            className="asset-card w-16 h-16 relative shrink-0 group/asset"
                            data-id={asset.id}
                        >
                            <div className="w-full h-full rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800 relative">
                                <img
                                    src={asset.url}
                                    className="w-full h-full object-cover pointer-events-none"
                                    alt={asset.name}
                                    draggable="false"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const updatedAssets = sceneAssets.filter((a) => a.id !== asset.id);
                                    onUpdate(scene.id, { assets: updatedAssets });
                                }}
                                className="delete-asset absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-400 z-10 shadow-sm opacity-0 group-hover/asset:opacity-100 transition-opacity"
                            >
                                <iconify-icon icon="solar:close-circle-bold" className="text-white text-[10px]"></iconify-icon>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SceneBlock;
