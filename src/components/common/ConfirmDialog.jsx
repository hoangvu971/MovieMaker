import React, { useEffect } from 'react';

function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger', // 'danger' or 'primary'
}) {
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onConfirm();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('keydown', handleEnter);

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('keydown', handleEnter);
        };
    }, [isOpen, onClose, onConfirm]);

    if (!isOpen) return null;

    const confirmButtonClass =
        variant === 'danger'
            ? 'bg-red-500 hover:bg-red-400 text-white'
            : 'bg-cyan-500 hover:bg-cyan-400 text-black';

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-5 border-b border-zinc-800">
                    <div className="flex items-start gap-3">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${variant === 'danger'
                                    ? 'bg-red-500/10 text-red-400'
                                    : 'bg-cyan-500/10 text-cyan-400'
                                }`}
                        >
                            <iconify-icon
                                icon={
                                    variant === 'danger'
                                        ? 'solar:danger-triangle-linear'
                                        : 'solar:info-circle-linear'
                                }
                                width="24"
                                height="24"
                            ></iconify-icon>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-white">{title}</h2>
                            <p className="text-sm text-zinc-400 mt-1">{message}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`flex-1 p-2.5 rounded-lg text-sm font-semibold transition-colors ${confirmButtonClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
