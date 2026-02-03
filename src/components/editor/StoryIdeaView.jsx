import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useGenerateScenes } from '../../hooks/useProjects';
import { useEditorStore } from '../../store/editorStore';
import { EDITOR_TABS } from '../../constants';

function StoryIdeaView({ project, onSave }) {
    const { setActiveTab } = useEditorStore();
    const generateScenes = useGenerateScenes();

    const editor = useEditor({
        extensions: [StarterKit],
        content: project?.script || '',
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] text-zinc-300',
            },
        },
        onUpdate: ({ editor }) => {
            const content = editor.getText();
            onSave({ script: content });
        },
    });

    useEffect(() => {
        if (editor && project?.script && editor.getText() !== project.script) {
            editor.commands.setContent(project.script);
        }
    }, [editor, project?.script]);

    const handleModifyAndRegenerate = async () => {
        if (!editor) return;

        const script = editor.getText();
        if (!script.trim()) {
            alert('Please write something first');
            return;
        }

        try {
            await generateScenes.mutateAsync({
                projectId: project.id,
                script,
            });
            setActiveTab(EDITOR_TABS.BREAKDOWN);
        } catch (error) {
            console.error('Scene generation failed:', error);
            alert(error.message || 'Failed to generate scenes. Please check your API key and try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-8 py-12">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-2">Story Idea</h2>
                <p className="text-zinc-400">
                    Refine your script and regenerate the breakdown when you're ready
                </p>
            </div>

            {/* Editor */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 backdrop-blur-sm min-h-[500px]">
                <EditorContent editor={editor} />
            </div>

            {/* Toolbar */}
            {editor && (
                <div className="mt-6 flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${editor.isActive('bold')
                                ? 'bg-cyan-500 text-black'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            }`}
                    >
                        <iconify-icon icon="solar:text-bold-linear" width="18"></iconify-icon>
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${editor.isActive('italic')
                                ? 'bg-cyan-500 text-black'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            }`}
                    >
                        <iconify-icon icon="solar:text-italic-linear" width="18"></iconify-icon>
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${editor.isActive('heading', { level: 2 })
                                ? 'bg-cyan-500 text-black'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            }`}
                    >
                        H2
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${editor.isActive('bulletList')
                                ? 'bg-cyan-500 text-black'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            }`}
                    >
                        <iconify-icon icon="solar:list-linear" width="18"></iconify-icon>
                    </button>

                    <div className="flex-1"></div>

                    <button
                        onClick={handleModifyAndRegenerate}
                        disabled={generateScenes.isPending}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-medium transition-colors"
                    >
                        {generateScenes.isPending ? (
                            <>
                                <iconify-icon icon="line-md:loading-loop"></iconify-icon>
                                Regenerating...
                            </>
                        ) : (
                            <>
                                <iconify-icon icon="solar:restart-linear" width="18"></iconify-icon>
                                Modify & Regenerate
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

export default StoryIdeaView;
