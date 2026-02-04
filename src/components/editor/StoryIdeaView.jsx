import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEditorStore } from '../../store/editorStore';

function StoryIdeaView({ project }) {
    const { localScript } = useEditorStore();

    const editor = useEditor({
        extensions: [StarterKit],
        content: localScript || '',
        editable: false, // Make editor read-only
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] text-zinc-300',
            },
        },
    });

    useEffect(() => {
        if (editor && localScript && editor.getHTML() !== localScript) {
            editor.commands.setContent(localScript);
        }
    }, [editor, localScript]);

    return (
        <div className="max-w-4xl mx-auto px-8 py-12">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-2">Script</h2>
                <p className="text-zinc-400">
                    View your uploaded script (read-only)
                </p>
            </div>

            {/* Editor - Read Only */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 backdrop-blur-sm min-h-[500px]">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

export default StoryIdeaView;
