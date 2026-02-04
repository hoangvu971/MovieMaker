import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/client';
import { useEditorStore } from '../store/editorStore';
import { PROJECT_STATES } from '../constants';

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
        onSuccess: (updatedProject, variables) => {
            // Update cache with server response
            queryClient.setQueryData(projectKeys.detail(variables.projectId), updatedProject);

            // Update local state and transition to SCENES_GENERATED
            const { setLocalScenes, setSaveStatus, setProjectState } = useEditorStore.getState();
            if (updatedProject.screenplayScenes) {
                setLocalScenes(updatedProject.screenplayScenes);
            }

            // Transition project state (server already saved, so this is just local sync)
            setProjectState(PROJECT_STATES.SCENES_GENERATED);

            // Mark as saved (auto-save already happened on server)
            setSaveStatus('saved');
        },
    });
}
