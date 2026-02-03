import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/client';

// Query keys for caching
export const projectKeys = {
    all: ['projects'],
    lists: () => [...projectKeys.all, 'list'],
    list: () => [...projectKeys.lists()],
    details: () => [...projectKeys.all, 'detail'],
    detail: (id) => [...projectKeys.details(), id],
};

/**
 * Fetch all projects
 */
export function useProjects() {
    return useQuery({
        queryKey: projectKeys.list(),
        queryFn: api.listProjects,
    });
}

/**
 * Fetch single project by ID
 */
export function useProject(projectId) {
    return useQuery({
        queryKey: projectKeys.detail(projectId),
        queryFn: () => api.getProject(projectId),
        enabled: !!projectId,
    });
}

/**
 * Create new project
 */
export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => api.createProject(data),
        onSuccess: (newProject) => {
            // Invalidate projects list to refetch
            queryClient.invalidateQueries({ queryKey: projectKeys.list() });
            // Optimistically add to cache
            queryClient.setQueryData(projectKeys.detail(newProject.id), newProject);
        },
    });
}

/**
 * Update project
 */
export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => api.updateProject(id, data),
        onSuccess: (updatedProject, variables) => {
            // Update project detail cache
            queryClient.setQueryData(projectKeys.detail(variables.id), updatedProject);
            // Invalidate list to show updated metadata
            queryClient.invalidateQueries({ queryKey: projectKeys.list() });
        },
    });
}

/**
 * Delete project
 */
export function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (projectId) => api.deleteProject(projectId),
        onSuccess: (_, projectId) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
            // Refetch list
            queryClient.invalidateQueries({ queryKey: projectKeys.list() });
        },
    });
}

/**
 * Generate scenes using AI
 */
export function useGenerateScenes() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, script }) => api.generateScenes(projectId, script),
        onSuccess: (_, variables) => {
            // Invalidate project to refetch with new scenes
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
        },
    });
}
