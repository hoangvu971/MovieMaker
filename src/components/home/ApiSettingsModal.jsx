import React, { useState, useEffect } from 'react';
import { useApiSettings, useSaveApiSettings } from '../../hooks/useApiSettings';

function ApiSettingsModal({ onClose }) {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [status, setStatus] = useState(null); // {type: 'success'|'error'|'loading', message: '...'}

    const { data: settings } = useApiSettings();
    const saveSettings = useSaveApiSettings();

    useEffect(() => {
        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleSave = async () => {
        const trimmedKey = apiKey.trim();

        if (!trimmedKey) {
            setStatus({ type: 'error', message: 'Please enter an API key' });
            return;
        }

        setStatus({ type: 'loading', message: 'Saving API key...' });

        try {
            await saveSettings.mutateAsync(trimmedKey);
            setStatus({ type: 'success', message: 'API key saved successfully!' });
            setApiKey('');
            setTimeout(onClose, 1500);
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to save API key' });
        }
    };

    const placeholder = settings?.hasKey
        ? `${settings.maskedKey} (saved)`
        : 'Enter your Google AI API key...';

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl">
                {/* Header */}
                <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">API Settings</h2>
                        <p className="text-xs text-zinc-500 mt-0.5">Configure your Google AI API key</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                    >
                        <iconify-icon icon="solar:close-circle-linear" width="20" height="20"></iconify-icon>
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="google-api-key" className="text-xs font-medium text-zinc-400">
                            Google AI API Key
                        </label>
                        <div className="relative">
                            <input
                                type={showKey ? 'text' : 'password'}
                                id="google-api-key"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave();
                                }}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 pr-10 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 font-mono"
                                placeholder={placeholder}
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                            >
                                <iconify-icon
                                    icon={showKey ? 'solar:eye-closed-linear' : 'solar:eye-linear'}
                                    width="18"
                                    height="18"
                                ></iconify-icon>
                            </button>
                        </div>
                        <p className="text-[10px] text-zinc-600">
                            Your API key is stored securely and used for AI generation.
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-800">
                        <div className="flex items-center gap-2 mb-2">
                            <iconify-icon icon="solar:info-circle-linear" width="16" height="16" className="text-cyan-400"></iconify-icon>
                            <span className="text-xs font-medium text-zinc-300">How to get your API key</span>
                        </div>
                        <ol className="text-[11px] text-zinc-500 space-y-1 ml-5 list-decimal">
                            <li>
                                Go to{' '}
                                <a
                                    href="https://aistudio.google.com/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-400 hover:underline"
                                >
                                    Google AI Studio
                                </a>
                            </li>
                            <li>Sign in with your Google account</li>
                            <li>Click "Create API Key"</li>
                            <li>Copy and paste it here</li>
                        </ol>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs ${status.type === 'success'
                                    ? 'bg-green-500/10 text-green-400'
                                    : status.type === 'error'
                                        ? 'bg-red-500/10 text-red-400'
                                        : 'bg-cyan-500/10 text-cyan-400'
                                }`}
                        >
                            <iconify-icon
                                icon={
                                    status.type === 'success'
                                        ? 'solar:check-circle-linear'
                                        : status.type === 'error'
                                            ? 'solar:close-circle-linear'
                                            : 'line-md:loading-loop'
                                }
                                width="16"
                                height="16"
                            ></iconify-icon>
                            <span>{status.message}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-zinc-800 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saveSettings.isPending}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-600 disabled:cursor-not-allowed text-black p-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        <iconify-icon icon="solar:diskette-linear" width="18" height="18"></iconify-icon>
                        Save API Key
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ApiSettingsModal;
