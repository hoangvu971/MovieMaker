import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/client';

// Query keys
export const shotKeys = {
    all: ['shots'],
    scene: (sceneId) => [...shotKeys.all, 'scene', sceneId],
    detail: (shotId) => [...shotKeys.all, 'detail', shotId],
};

/**
 * Fetch shots for a scene
 */
export function useSceneShots(sceneId) {
    return useQuery({
        queryKey: shotKeys.scene(sceneId),
        queryFn: () => api.listSceneShots(sceneId),
        enabled: !!sceneId,
    });
}

/**
 * Bulk create/update shots for a scene
 */
export function useUpdateSceneShots() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sceneId, shots }) => api.createSceneShots(sceneId, shots),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: shotKeys.scene(variables.sceneId) });
        },
    });
}

/**
 * Update a single shot's properties
 */
export function useUpdateShot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shotId, data }) => api.updateShot(shotId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: shotKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: shotKeys.scene(data.sceneId) });
        },
    });
}

/**
 * Delete a shot
 */
export function useDeleteShot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (shotId) => api.deleteShot(shotId),
        onSuccess: () => {
            // Since we don't know the sceneId easily from just ID here without extra tracking,
            // we might need to invalidate all shots or require sceneId to be passed.
            // But usually we invalidate 'all' to be safe or the component handles it.
            queryClient.invalidateQueries({ queryKey: shotKeys.all });
        },
    });
}

/**
 * Update a shot's assets
 */
export function useUpdateShotAssets() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shotId, assetIds }) => api.updateShotAssets(shotId, assetIds),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: shotKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: shotKeys.scene(data.sceneId) });
        },
    });
}
