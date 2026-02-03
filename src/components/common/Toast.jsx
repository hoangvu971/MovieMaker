import React from 'react';

function Toast({ message, variant = 'success', onClose }) {
    const variantStyles = {
        success: {
            bg: 'bg-green-500/10 border-green-500/20',
            text: 'text-green-400',
            icon: 'solar:check-circle-bold',
        },
        error: {
            bg: 'bg-red-500/10 border-red-500/20',
            text: 'text-red-400',
            icon: 'solar:close-circle-bold',
        },
        info: {
            bg: 'bg-cyan-500/10 border-cyan-500/20',
            text: 'text-cyan-400',
            icon: 'solar:info-circle-bold',
        },
    };

    const style = variantStyles[variant] || variantStyles.success;

    return (
        <div
            className={`${style.bg} ${style.text} border backdrop-blur-sm rounded-lg p-4 shadow-2xl pointer-events-auto animate-in slide-in-from-right-5 fade-in duration-300 min-w-[300px] max-w-md`}
        >
            <div className="flex items-center gap-3">
                <iconify-icon icon={style.icon} width="20" height="20"></iconify-icon>
                <p className="text-sm font-medium flex-1">{message}</p>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-zinc-400 hover:text-white transition-colors"
                >
                    <iconify-icon icon="solar:close-circle-linear" width="18" height="18"></iconify-icon>
                </button>
            </div>
        </div>
    );
}

export default Toast;
