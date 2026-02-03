import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useCreateProject } from '../hooks/useProjects';
import { useApiSettings } from '../hooks/useApiSettings';
import Header from '../components/home/Header';
import Sidebar from '../components/home/Sidebar';
import ProjectGrid from '../components/home/ProjectGrid';
import ApiSettingsModal from '../components/home/ApiSettingsModal';

function HomePage() {
    const navigate = useNavigate();
    const [isApiModalOpen, setIsApiModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: projects, isLoading, error } = useProjects();
    const { data: apiSettings } = useApiSettings();
    const createProject = useCreateProject();

    const handleCreateProject = async (projectData = {}) => {
        try {
            const newProject = await createProject.mutateAsync({
                name: projectData.name || 'Untitled Project',
                ...projectData,
            });
            navigate(`/editor/${newProject.id}`);
        } catch (error) {
            console.error('Failed to create project:', error);
            alert('Failed to create project. Please try again.');
        }
    };

    const filteredProjects = projects?.filter((project) =>
        project.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="bg-zinc-950 text-zinc-300 h-screen flex flex-col overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
            <Header
                onOpenApiSettings={() => setIsApiModalOpen(true)}
                hasApiKey={apiSettings?.hasKey}
            />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar onCreateProject={handleCreateProject} />

                <main className="flex-1 overflow-y-auto bg-zinc-950 p-8 lg:p-10 relative">
                    <div className="max-w-7xl mx-auto space-y-10">
                        {/* Search Header */}
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-semibold text-white tracking-tight">Welcome back</h1>
                            <div className="relative w-64 md:w-80">
                                <div className="absolute left-3 top-2.5 text-zinc-500 flex items-center">
                                    <iconify-icon icon="solar:magnifer-linear" width="16" height="16"></iconify-icon>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-600 text-zinc-200"
                                />
                            </div>
                        </div>

                        {/* Start New Project Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-medium text-zinc-400">Start a new project</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <CreateProjectCard
                                    icon="solar:add-circle-linear"
                                    title="Blank Project"
                                    description="Start from scratch with an empty storyboard"
                                    bgColor="cyan"
                                    onClick={() => handleCreateProject()}
                                />
                                <CreateProjectCard
                                    icon="solar:magic-stick-3-linear"
                                    title="AI Generator"
                                    description="Turn a simple prompt into a full script & storyboard"
                                    bgColor="purple"
                                />
                                <CreateProjectCard
                                    icon="solar:document-text-linear"
                                    title="Import Script"
                                    description="Upload PDF, FDX or Fountain files"
                                    bgColor="blue"
                                />
                                <CreateProjectCard
                                    icon="solar:list-check-linear"
                                    title="Import Shotlist"
                                    description="Create from Excel or CSV shotlist"
                                    bgColor="emerald"
                                />
                            </div>
                        </div>

                        {/* Recent Projects */}
                        <ProjectGrid
                            projects={filteredProjects}
                            isLoading={isLoading}
                            error={error}
                            searchQuery={searchQuery}
                        />
                    </div>

                    {/* FAB for mobile */}
                    <button
                        onClick={() => handleCreateProject()}
                        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-cyan-400 rounded-full shadow-xl shadow-cyan-900/30 flex items-center justify-center hover:scale-105 transition-transform group z-50"
                    >
                        <iconify-icon icon="solar:add-linear" width="24" height="24" className="text-black"></iconify-icon>
                    </button>
                </main>
            </div>

            {/* API Settings Modal */}
            {isApiModalOpen && (
                <ApiSettingsModal onClose={() => setIsApiModalOpen(false)} />
            )}
        </div>
    );
}

// Create Project Card component
function CreateProjectCard({ icon, title, description, bgColor, onClick }) {
    const colorMap = {
        cyan: {
            bg: 'bg-cyan-400/10',
            text: 'text-cyan-400',
            hoverBg: 'group-hover:bg-cyan-400',
            hoverText: 'group-hover:text-black',
        },
        purple: {
            bg: 'bg-purple-500/10',
            text: 'text-purple-400',
            hoverBg: 'group-hover:bg-purple-500',
            hoverText: 'group-hover:text-white',
        },
        blue: {
            bg: 'bg-blue-500/10',
            text: 'text-blue-400',
            hoverBg: 'group-hover:bg-blue-500',
            hoverText: 'group-hover:text-white',
        },
        emerald: {
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-400',
            hoverBg: 'group-hover:bg-emerald-500',
            hoverText: 'group-hover:text-white',
        },
    };

    const colors = colorMap[bgColor];

    return (
        <button
            type="button"
            onClick={onClick}
            className="flex flex-col items-start gap-4 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 p-5 rounded-xl transition-all group text-left h-40 w-full"
        >
            <div className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center ${colors.hoverBg} ${colors.hoverText} transition-colors`}>
                <iconify-icon icon={icon} width="22" height="22"></iconify-icon>
            </div>
            <div>
                <h3 className="font-medium text-white">{title}</h3>
                <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{description}</p>
            </div>
        </button>
    );
}

export default HomePage;
