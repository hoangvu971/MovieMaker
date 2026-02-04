import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEditorStore } from '../../store/editorStore';
import { useGenerateScenes } from '../../hooks/useProjects';
import { EDITOR_TABS } from '../../constants';
import { useToast } from '../common/ToastProvider';

function ScriptView({ projectId, project }) {
    const navigate = useNavigate();
    const { localScript, setLocalScript, setActiveTab } = useEditorStore();
    const generateScenes = useGenerateScenes();
    const { showToast } = useToast();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: localScript || '',
        editable: false, // Make editor read-only
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] text-zinc-300 px-4 py-3',
            },
        },
    });

    useEffect(() => {
        if (editor && localScript && editor.getHTML() !== localScript) {
            editor.commands.setContent(localScript);
        }
    }, [editor, localScript]);

    const handleStartGeneration = async () => {
        if (!editor) return;

        const script = editor.getText();
        if (!script.trim()) {
            alert('Please enter a script first');
            return;
        }

        try {
            // Generate scenes using AI
            await generateScenes.mutateAsync({ projectId, script: editor.getHTML() });
            // Switch to breakdown tab
            setActiveTab(EDITOR_TABS.BREAKDOWN);
        } catch (error) {
            console.error('Scene generation failed:', error);
            alert(error.message || 'Failed to generate scenes. Please check your API key and try again.');
        }
    };

    const handleCopy = () => {
        if (!editor) return;
        const text = editor.getText();
        navigator.clipboard.writeText(text).then(() => {
            showToast('Script copied to clipboard', 'success');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            showToast('Failed to copy script', 'error');
        });
    };

    const hasScenes = project?.screenplayScenes && project.screenplayScenes.length > 0;

    return (
        <div className="max-w-4xl mx-auto px-8 py-12">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-white mb-2">Script</h2>
                    <p className="text-zinc-400">
                        View your uploaded script (read-only)
                    </p>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-all text-sm font-medium group"
                    title="Copy script to clipboard"
                >
                    <iconify-icon
                        icon="solar:copy-linear"
                        width="18"
                        className="group-hover:scale-110 transition-transform"
                    ></iconify-icon>
                    <span>Copy Script</span>
                </button>
            </div>

            {/* Editor Container */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                {/* Editor - Read Only */}
                <div className="p-8 min-h-[500px]">
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between mt-6">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                    <iconify-icon icon="solar:arrow-left-linear" width="18" height="18"></iconify-icon>
                    <span>Back to Projects</span>
                </button>

                {/* Only show Generate Scenes button if no scenes exist */}
                {!hasScenes && (
                    <button
                        onClick={handleStartGeneration}
                        disabled={!editor || !editor.getText().trim() || generateScenes.isPending}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-semibold transition-colors"
                    >
                        {generateScenes.isPending ? (
                            <>
                                <iconify-icon icon="line-md:loading-loop" className="text-cyan-400"></iconify-icon>
                                Generating...
                            </>
                        ) : (
                            <>
                                <iconify-icon icon="solar:magic-stick-3-linear" width="20" height="20"></iconify-icon>
                                Generate Scenes
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

export default ScriptView;
