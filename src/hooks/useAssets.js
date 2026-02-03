import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/client';

// Query keys
export const assetKeys = {
    all: ['assets'],
    project: (projectId) => [...assetKeys.all, 'project', projectId],
};

/**
 * Fetch assets for a project
 */
export function useProjectAssets(projectId) {
    return useQuery({
        queryKey: assetKeys.project(projectId),
        queryFn: () => api.listProjectAssets(projectId),
        enabled: !!projectId,
    });
}

/**
 * Upload assets to a project
 */
export function useUploadAssets() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, formData }) => api.uploadAssets(projectId, formData),
        onSuccess: (_, variables) => {
            // Invalidate assets list for this project
            queryClient.invalidateQueries({ queryKey: assetKeys.project(variables.projectId) });
            // Also invalidate project details to update assets count
            queryClient.invalidateQueries({ queryKey: ['projects', 'detail', variables.projectId] });
        },
    });
}

/**
 * Delete an asset
 */
export function useDeleteAsset() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (assetId) => api.deleteAsset(assetId),
        onSuccess: () => {
            // Invalidate all asset queries (we don't know which project it belongs to from this context)
            queryClient.invalidateQueries({ queryKey: assetKeys.all });
            // Also invalidate all projects
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}
