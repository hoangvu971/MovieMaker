import React, { useState, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useProjectAssets, useUploadAssets, useDeleteAsset } from '../../hooks/useAssets';
import { SIDEBAR_PANELS } from '../../constants';
import ApiSettingsModal from '../home/ApiSettingsModal';
import ConfirmDialog from '../common/ConfirmDialog';
import { useToast } from '../common/ToastProvider';

function SidebarPanel({ projectId }) {
    const { activeSidebar, setActiveSidebar } = useEditorStore();
    const { data: assets = [], isLoading } = useProjectAssets(projectId);
    const uploadAssets = useUploadAssets();
    const deleteAsset = useDeleteAsset();
    const { showToast } = useToast();

    const [isDragging, setIsDragging] = useState(false);
    const [deleteDialogState, setDeleteDialogState] = useState({ isOpen: false, assetId: null, assetName: '' });
    const fileInputRef = useRef(null);

    const handleFileSelect = async (files) => {
        if (!files || files.length === 0) return;

        const formData = new FormData();
        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
                formData.append('files', file);
            }
        });

        if (formData.has('files')) {
            try {
                await uploadAssets.mutateAsync({ projectId, formData });
                if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (error) {
                console.error('Upload failed:', error);
                alert('Failed to upload files');
            }
        }
    };

    const handleDelete = (assetId, assetName) => {
        setDeleteDialogState({ isOpen: true, assetId, assetName });
    };

    const confirmDelete = async () => {
        const { assetId } = deleteDialogState;
        setDeleteDialogState({ isOpen: false, assetId: null, assetName: '' });

        try {
            await deleteAsset.mutateAsync(assetId);
            showToast('Asset deleted successfully', 'success');
        } catch (error) {
            console.error('Delete failed:', error);
            showToast('Failed to delete asset', 'error');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        if (e.currentTarget === e.target) {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    return (
        <>
            <aside className="bg-zinc-900 border-r border-zinc-800 w-80 flex-shrink-0 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h2 className="font-semibold text-white">
                        {activeSidebar === SIDEBAR_PANELS.API ? 'API Settings' : 'Project Assets'}
                    </h2>
                    {activeSidebar === SIDEBAR_PANELS.API && (
                        <button
                            onClick={() => setActiveSidebar(SIDEBAR_PANELS.ASSETS)}
                            className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                        >
                            <iconify-icon icon="solar:close-circle-linear" width="20" height="20"></iconify-icon>
                        </button>
                    )}
                </div>

                {/* Content */}
                {activeSidebar === SIDEBAR_PANELS.ASSETS && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Upload button */}
                        <div className="p-4 border-b border-zinc-800">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,video/*,audio/*"
                                onChange={(e) => handleFileSelect(e.target.files)}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadAssets.isPending}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-600 text-black font-medium transition-colors"
                            >
                                {uploadAssets.isPending ? (
                                    <>
                                        <iconify-icon icon="line-md:loading-loop" className="text-cyan-400"></iconify-icon>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <iconify-icon icon="solar:upload-linear" width="18" height="18"></iconify-icon>
                                        Upload Media
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Assets grid */}
                        <div
                            className={`flex-1 overflow-y-auto p-4 ${isDragging ? 'bg-zinc-800/50 border-cyan-500/50' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {isLoading ? (
                                <div className="text-center py-8 text-zinc-500">Loading assets...</div>
                            ) : assets.length === 0 ? (
                                <div className="text-center py-8 text-zinc-600 italic text-xs">
                                    No assets uploaded yet
                                    <br />
                                    Drag files here or click Upload
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {assets.map((asset) => (
                                        <div
                                            key={asset.id}
                                            className="asset-card aspect-square bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden relative group cursor-grab active:cursor-grabbing"
                                            data-id={asset.id}
                                            draggable="true"
                                            onDragStart={(e) => {
                                                // Send asset data with drag event
                                                e.dataTransfer.effectAllowed = 'copy';
                                                e.dataTransfer.setData('application/json', JSON.stringify(asset));

                                                // Create a visible drag ghost
                                                const dragGhost = e.currentTarget.cloneNode(true);
                                                dragGhost.style.position = 'absolute';
                                                dragGhost.style.top = '-1000px';
                                                dragGhost.style.width = e.currentTarget.offsetWidth + 'px';
                                                dragGhost.style.height = e.currentTarget.offsetHeight + 'px';
                                                dragGhost.style.opacity = '0.8';
                                                document.body.appendChild(dragGhost);
                                                e.dataTransfer.setDragImage(dragGhost, e.currentTarget.offsetWidth / 2, e.currentTarget.offsetHeight / 2);

                                                // Clean up the ghost after a short delay
                                                setTimeout(() => {
                                                    document.body.removeChild(dragGhost);
                                                }, 0);
                                            }}
                                        >
                                            <img
                                                src={asset.url.startsWith('http') ? asset.url : window.location.origin + asset.url}
                                                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none"
                                                alt={asset.name}
                                                draggable="false"
                                            />
                                            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1.5 pointer-events-none">
                                                <p className="text-[10px] text-white truncate">{asset.name}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(asset.id, asset.name);
                                                }}
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete Asset"
                                            >
                                                <iconify-icon icon="solar:trash-bin-trash-linear" width="12"></iconify-icon>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeSidebar === SIDEBAR_PANELS.API && (
                    <div className="flex-1 overflow-y-auto p-4">
                        <ApiSettingsModal onClose={() => setActiveSidebar(null)} />
                    </div>
                )}
            </aside>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialogState.isOpen}
                onClose={() => setDeleteDialogState({ isOpen: false, assetId: null, assetName: '' })}
                onConfirm={confirmDelete}
                title="Delete Asset"
                message={`Are you sure you want to delete "${deleteDialogState.assetName}"? It will be removed from all scenes. This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </>
    );
}

export default SidebarPanel;
