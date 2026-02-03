import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeleteProject, useUpdateProject } from '../../hooks/useProjects';
import { formatRelativeTime } from '../../utils/helpers';

function ProjectCard({ project }) {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(project.name || 'Untitled Project');

    const deleteProject = useDeleteProject();
    const updateProject = useUpdateProject();

    const shotsLabel = project.shotCount > 0 ? `${project.shotCount} shots` : 'Draft';
    const timeLabel = project.updatedAt ? formatRelativeTime(project.updatedAt) : 'Created recently';

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        try {
            await deleteProject.mutateAsync(project.id);
        } catch (error) {
            alert('Failed to delete project');
        }
    };

    const handleRename = async () => {
        if (newName === project.name || !newName.trim()) {
            setIsEditingName(false);
            return;
        }

        try {
            await updateProject.mutateAsync({
                id: project.id,
                data: { name: newName.trim() },
            });
            setIsEditingName(false);
        } catch (error) {
            alert('Failed to update project name');
            setNewName(project.name || 'Untitled Project');
        }
    };

    const handleDuplicate = async () => {
        // TODO: Implement duplicate (create new project with same data)
        alert('Duplicate feature coming soon!');
    };

    return (
        <div className="relative group">
            <Link to={`/editor/${project.id}`} className="cursor-pointer block">
                <div className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 group-hover:border-zinc-600 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>
                    <div className="grid grid-cols-3 h-full gap-0.5 opacity-60 group-hover:opacity-80 transition-opacity group-hover:scale-105 duration-500">
                        <div className="bg-zinc-700"></div>
                        <div className="bg-zinc-600"></div>
                        <div className="bg-zinc-800"></div>
                    </div>
                    <div className="absolute bottom-3 right-3 z-20">
                        <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                            {shotsLabel}
                        </span>
                    </div>
                </div>
                <div className="mt-3">
                    <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white truncate">
                        {project.name || 'Untitled Project'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-zinc-500">{timeLabel}</span>
                    </div>
                </div>
            </Link>

            {/* Menu Toggle */}
            <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                    <iconify-icon icon="solar:menu-dots-linear" className="text-white"></iconify-icon>
                </button>
            </div>

            {/* Dropdown Menu */}
            {showMenu && (
                <>
                    {/* Backdrop to close menu */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                    ></div>

                    <div className="absolute top-12 right-3 z-50 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden w-48">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                                setIsEditingName(true);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors"
                        >
                            <iconify-icon icon="solar:pen-linear" width="16"></iconify-icon>
                            Edit name
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                                handleDuplicate();
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors"
                        >
                            <iconify-icon icon="solar:copy-linear" width="16"></iconify-icon>
                            Duplicate
                        </button>
                        <div className="h-px bg-zinc-800 my-1"></div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                                handleDelete();
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                        >
                            <iconify-icon icon="solar:trash-bin-trash-linear" width="16"></iconify-icon>
                            Delete
                        </button>
                    </div>
                </>
            )}

            {/* Edit Name Modal */}
            {isEditingName && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-white mb-4">Edit Project Name</h3>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename();
                                if (e.key === 'Escape') setIsEditingName(false);
                            }}
                            autoFocus
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setIsEditingName(false)}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRename}
                                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProjectCard;
