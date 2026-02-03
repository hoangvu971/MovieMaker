import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditorStore } from '../../store/editorStore';
import { useGenerateScenes } from '../../hooks/useProjects';
import { EDITOR_TABS } from '../../constants';

function ScriptView({ projectId }) {
    const navigate = useNavigate();
    const { localScript, setLocalScript, setActiveTab } = useEditorStore();
    const generateScenes = useGenerateScenes();

    const handleStartGeneration = async () => {
        if (!localScript.trim()) {
            alert('Please enter a script first');
            return;
        }

        try {
            // Generate scenes using AI
            await generateScenes.mutateAsync({ projectId, script: localScript });
            // Switch to breakdown tab
            setActiveTab(EDITOR_TABS.BREAKDOWN);
        } catch (error) {
            console.error('Scene generation failed:', error);
            alert(error.message || 'Failed to generate scenes. Please check your API key and try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-8 py-16">
            {/* Hero section */}
            <div className="text-center mb-12">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <iconify-icon icon="solar:magic-stick-3-linear" className="text-white" width="32" height="32"></iconify-icon>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Let's create something amazing</h1>
                <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                    Start by writing your script or story idea. Our AI will transform it into a complete storyboard breakdown.
                </p>
            </div>

            {/* Input area */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
                <label className="block text-sm font-medium text-zinc-400 mb-3">Your Script or Story Idea</label>
                <textarea
                    value={localScript}
                    onChange={(e) => setLocalScript(e.target.value)}
                    placeholder="Enter your script, story idea, or scene description here...

For example:
INT. COFFEE SHOP - DAY
Sarah sits alone at a corner table, nervously checking her phone. The door chimes. She looks up to see..."
                    className="w-full h-96 bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none font-mono text-sm leading-relaxed"
                />

                {/* Action buttons */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        <iconify-icon icon="solar:arrow-left-linear" width="18" height="18"></iconify-icon>
                        <span>Back to Projects</span>
                    </button>

                    <button
                        onClick={handleStartGeneration}
                        disabled={!localScript.trim() || generateScenes.isPending}
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
                </div>
            </div>

            {/* Tips */}
            <div className="mt-8 bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-6">
                <div className="flex items-start gap-3">
                    <iconify-icon icon="solar:lightbulb-linear" className="text-cyan-400 mt-1" width="20" height="20"></iconify-icon>
                    <div className="flex-1">
                        <h3 className="font-medium text-white mb-2">Tips for better results:</h3>
                        <ul className="text-sm text-zinc-400 space-y-1">
                            <li>• Include scene headers (INT/EXT, location, time)</li>
                            <li>• Describe key actions and character interactions</li>
                            <li>• Mention important visual elements or props</li>
                            <li>• Be specific about mood and atmosphere</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ScriptView;
