import React from 'react';
import ProjectCard from './ProjectCard';

function ProjectGrid({ projects, isLoading, error, searchQuery }) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <h2 className="text-base font-medium text-zinc-400">Recent projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-video bg-zinc-900 rounded-lg"></div>
                            <div className="mt-3 h-4 bg-zinc-900 rounded w-3/4"></div>
                            <div className="mt-2 h-3 bg-zinc-900 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h2 className="text-base font-medium text-zinc-400">Recent projects</h2>
                <div className="col-span-full py-8 text-center">
                    <div className="inline-flex items-center gap-2 text-red-400">
                        <iconify-icon icon="solar:danger-circle-linear" width="20"></iconify-icon>
                        <span>Could not load projects. Make sure the server is running.</span>
                    </div>
                </div>
            </div>
        );
    }

    const hasProjects = projects && projects.length > 0;
    const displayText = searchQuery
        ? (projects.length === 0 ? `No projects matching "${searchQuery}"` : 'Search results')
        : 'Recent projects';

    return (
        <div className="space-y-4">
            <h2 className="text-base font-medium text-zinc-400">{displayText}</h2>

            {!hasProjects ? (
                <p className="text-zinc-500 col-span-full py-8">
                    {searchQuery ? `No projects matching "${searchQuery}"` : 'No projects yet. Create one to get started.'}
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProjectGrid;
