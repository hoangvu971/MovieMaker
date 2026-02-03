import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateProject } from '../../hooks/useProjects';
import { useEditorStore } from '../../store/editorStore';

function EditorHeader({ project, onSave }) {
    const navigate = useNavigate();
    const { localName, setLocalName, saveStatus } = useEditorStore();
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(localName || 'Untitled Project');

    // Update local title when store changes (e.g. on load)
    React.useEffect(() => {
        if (localName) setTitle(localName);
    }, [localName]);

    const saveTitle = () => {
        if (title === localName || !title.trim()) {
            setIsEditingTitle(false);
            return;
        }

        setLocalName(title.trim());
        setIsEditingTitle(false);
    };

    const statusConfig = {
        saved: { text: 'Saved', icon: 'solar:check-circle-linear', color: 'text-green-400' },
        saving: { text: 'Saving...', icon: 'line-md:loading-loop', color: 'text-cyan-400' },
        unsaved: { text: 'Unsaved', icon: 'solar:danger-circle-linear', color: 'text-yellow-400' },
    };

    const status = statusConfig[saveStatus] || statusConfig.saved;

    return (
        <header className="bg-black border-b border-zinc-900 flex-shrink-0 z-20">
            <div className="flex items-center justify-between px-6 py-3">
                {/* Left: Back button + Title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="w-8 h-8 rounded-lg hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                        title="Back to home"
                    >
                        <iconify-icon icon="solar:arrow-left-linear" width="20" height="20"></iconify-icon>
                    </button>

                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={saveTitle}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') saveTitle();
                                if (e.key === 'Escape') {
                                    setTitle(project?.name || 'Untitled Project');
                                    setIsEditingTitle(false);
                                }
                            }}
                            autoFocus
                            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1 text-white text-lg font-semibold focus:outline-none focus:border-cyan-500 min-w-[200px]"
                        />
                    ) : (
                        <h1
                            onClick={() => setIsEditingTitle(true)}
                            className="text-lg font-semibold text-white cursor-pointer hover:text-cyan-400 transition-colors"
                            title="Click to edit"
                        >
                            {project?.name || 'Untitled Project'}
                        </h1>
                    )}
                </div>

                {/* Right: Save status + Save button */}
                <div className="flex items-center gap-4">
                    {/* Save Status */}
                    <div className={`flex items-center gap-2 text-sm ${status.color}`}>
                        <iconify-icon icon={status.icon} width="16" height="16"></iconify-icon>
                        <span>{status.text}</span>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={onSave}
                        disabled={saveStatus === 'saved' || saveStatus === 'saving'}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-medium transition-colors text-sm"
                    >
                        <iconify-icon icon="solar:diskette-linear" width="18" height="18"></iconify-icon>
                        <span>Save</span>
                    </button>
                </div>
            </div>
        </header>
    );
}

export default EditorHeader;
