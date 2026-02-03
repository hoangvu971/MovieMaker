import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/client';

// Query keys
const apiSettingsKeys = {
    all: ['apiSettings'],
    settings: () => [...apiSettingsKeys.all, 'settings'],
};

/**
 * Fetch API settings (Google AI API key status)
 */
export function useApiSettings() {
    return useQuery({
        queryKey: apiSettingsKeys.settings(),
        queryFn: api.getApiSettings,
    });
}

/**
 * Save API settings (Google AI API key)
 */
export function useSaveApiSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (googleAiApiKey) => api.saveApiSettings(googleAiApiKey),
        onSuccess: (updatedSettings) => {
            // Update cache with new settings
            queryClient.setQueryData(apiSettingsKeys.settings(), updatedSettings);
        },
    });
}
