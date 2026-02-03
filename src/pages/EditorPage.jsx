import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useUpdateProject } from '../hooks/useProjects';
import { useEditorStore } from '../store/editorStore';
import { debounce } from '../utils/helpers';
import { AUTO_SAVE_DELAY, EDITOR_TABS } from '../constants';

import EditorHeader from '../components/editor/EditorHeader';
import SidebarNav from '../components/editor/SidebarNav';
import SidebarPanel from '../components/editor/SidebarPanel';
import ScriptView from '../components/editor/ScriptView';
import StoryIdeaView from '../components/editor/StoryIdeaView';
import ScreenplayView from '../components/editor/ScreenplayView';
import LoadingView from '../components/editor/LoadingView';

function EditorPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const { data: project, isLoading, error } = useProject(projectId);
    const updateProject = useUpdateProject();

    const {
        activeTab,
        setActiveTab,
        setCurrentProjectId,
        localScenes,
        setLocalScenes,
        saveStatus,
        setSaveStatus,
        resetEditor,
    } = useEditorStore();

    // Initialize editor when project loads (only once)
    useEffect(() => {
        if (project && !localScenes.length && project.screenplayScenes?.length > 0) {
            // Only initialize if we don't have local scenes yet
            setLocalScenes(project.screenplayScenes);
        }
    }, [project?.id]); // Only run when project ID changes

    // Set current project ID and auto-switch tabs
    useEffect(() => {
        if (project) {
            setCurrentProjectId(project.id);

            // Show Assets panel by default
            const { setActiveSidebar } = useEditorStore.getState();
            if (!useEditorStore.getState().activeSidebar) {
                setActiveSidebar('assets');
            }

            // Auto-switch to appropriate tab based on project state
            if (project.screenplayScenes?.length > 0 && activeTab === EDITOR_TABS.SCRIPT) {
                setActiveTab(EDITOR_TABS.BREAKDOWN);
            } else if (project.script && activeTab === EDITOR_TABS.SCRIPT) {
                setActiveTab(EDITOR_TABS.IDEA);
            }
        }
    }, [project?.id, activeTab]);

    // Cleanup on unmount
    useEffect(() => {
        return () => resetEditor();
    }, [resetEditor]);

    // Debounced save function
    const debouncedSave = useCallback(
        debounce(async (projectId, data) => {
            try {
                setSaveStatus('saving');
                await updateProject.mutateAsync({ id: projectId, data });
                setSaveStatus('saved');
            } catch (error) {
                console.error('Auto-save failed:', error);
                setSaveStatus('unsaved');
            }
        }, AUTO_SAVE_DELAY),
        [updateProject, setSaveStatus]
    );

    // Save project data
    const handleSave = useCallback((data) => {
        if (!projectId) return;
        setSaveStatus('unsaved');
        debouncedSave(projectId, data);
    }, [projectId, debouncedSave, setSaveStatus]);

    // Save now (immediate)
    const handleSaveNow = useCallback(async () => {
        if (!projectId) return;

        try {
            setSaveStatus('saving');
            const data = {
                screenplayScenes: localScenes,
            };
            await updateProject.mutateAsync({ id: projectId, data });
            setSaveStatus('saved');
        } catch (error) {
            console.error('Save failed:', error);
            setSaveStatus('unsaved');
        }
    }, [projectId, localScenes, updateProject, setSaveStatus]);

    if (isLoading) {
        return (
            <div className="h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-zinc-400">Loading project...</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <iconify-icon icon="solar:danger-circle-linear" width="48" className="text-red-400 mx-auto mb-4"></iconify-icon>
                    <h2 className="text-xl font-semibold text-white mb-2">Project Not Found</h2>
                    <p className="text-zinc-400 mb-6">The project you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black text-zinc-300 h-screen flex flex-col overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
            <EditorHeader
                project={project}
                onSave={handleSaveNow}
            />

            <div className="flex flex-1 overflow-hidden">
                <SidebarNav />
                <SidebarPanel projectId={projectId} />

                <main className="flex-1 bg-zinc-950 relative overflow-hidden flex flex-col">
                    {/* Background Elements */}
                    <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
                        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]"></div>
                    </div>

                    {/* Main Scrolling Area */}
                    <div className="relative z-10 flex-1 overflow-y-auto scroll-smooth">
                        {activeTab === EDITOR_TABS.SCRIPT && (
                            <ScriptView projectId={projectId} />
                        )}
                        {activeTab === EDITOR_TABS.IDEA && (
                            <StoryIdeaView
                                project={project}
                                onSave={handleSave}
                            />
                        )}
                        {activeTab === EDITOR_TABS.BREAKDOWN && (
                            <ScreenplayView
                                project={project}
                                onSave={handleSave}
                            />
                        )}
                    </div>

                    {/* Bottom CTA */}
                    <div className="relative z-10 mt-8 flex justify-center gap-6 text-sm text-zinc-500 pb-8">
                        <button className="hover:text-zinc-300 transition-colors">Start with a template</button>
                        <span className="w-1 h-1 rounded-full bg-zinc-700 self-center"></span>
                        <button className="hover:text-zinc-300 transition-colors">Import existing script</button>
                    </div>
                </main>
            </div>

            {/* Loading overlay for AI generation */}
            <LoadingView />
        </div>
    );
}

export default EditorPage;
