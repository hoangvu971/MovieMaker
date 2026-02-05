import React, { useState } from 'react';
import { useSceneShots, useDeleteShot, useUpdateShot } from '../../hooks/useShots';
import { SHOT_SIZES, SHOT_PERSPECTIVES, SHOT_MOVEMENTS, SHOT_EQUIPMENT, ASPECT_RATIOS } from '../../constants/shotOptions';

function SceneShotList({ scene, index }) {
    const { data: shots = [], isLoading } = useSceneShots(scene.id);
    const deleteShotMutation = useDeleteShot();
    const updateShotMutation = useUpdateShot();

    // Auto-expand first scene, others collapsed
    const [isExpanded, setIsExpanded] = useState(index === 0);

    const handleDeleteShot = (shotId) => {
        if (confirm('Are you sure you want to delete this shot?')) {
            deleteShotMutation.mutate(shotId);
        }
    };

    const handleUpdateShot = (shotId, field, value) => {
        updateShotMutation.mutate({
            shotId,
            data: { [field]: value }
        });
    };

    if (isLoading) {
        return <div className="p-4 text-zinc-500">Loading shots...</div>;
    }

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden mb-6">
            <div
                className="bg-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center cursor-pointer hover:bg-zinc-800/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <button className="text-zinc-500 hover:text-white transition-colors">
                        <iconify-icon icon={isExpanded ? "solar:alt-arrow-down-linear" : "solar:alt-arrow-right-linear"} width="20"></iconify-icon>
                    </button>
                    <h3 className="font-bold text-lg text-white">
                        <span className="text-cyan-500 mr-2">{index + 1}.</span>
                        {scene.content.split('\n')[0] || `Scene ${index + 1}`}
                    </h3>
                </div>
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
                    {shots.length} shots
                </span>
            </div>

            {isExpanded && (
                <div className="p-4 overflow-x-auto">
                    {shots.length > 0 ? (
                        <table className="w-full text-left text-sm text-zinc-400 border-separate border-spacing-0">
                            <thead className="text-xs uppercase text-zinc-500 font-medium">
                                <tr>
                                    <th className="px-3 py-2 text-center w-10">#</th>
                                    <th className="px-3 py-2 min-w-[200px]">Content</th>
                                    <th className="px-3 py-2 min-w-[150px]">Dialogue</th>
                                    <th className="px-3 py-2 w-20">ERT (s)</th>
                                    <th className="px-3 py-2 w-32">Size</th>
                                    <th className="px-3 py-2 w-32">Perspective</th>
                                    <th className="px-3 py-2 w-32">Movement</th>
                                    <th className="px-3 py-2 w-32">Equip</th>
                                    <th className="px-3 py-2 w-24">Lens (mm)</th>
                                    <th className="px-3 py-2 w-24">Ratio</th>
                                    <th className="px-3 py-2 min-w-[150px]">Notes</th>
                                    <th className="px-3 py-2 w-10 sticky right-0 bg-zinc-900"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {shots.map((shot, sIndex) => (
                                    <tr key={shot.id} className="group hover:bg-zinc-800/20 transition-colors">
                                        <td className="px-3 py-3 text-center text-zinc-500 font-mono text-xs">{sIndex + 1}</td>
                                        <td className="px-3 py-3">
                                            <textarea
                                                defaultValue={shot.content}
                                                onBlur={(e) => handleUpdateShot(shot.id, 'content', e.target.value)}
                                                className="w-full bg-transparent border border-transparent hover:border-zinc-700 focus:border-cyan-500 focus:bg-zinc-900 rounded px-2 py-1 outline-none transition-all text-white placeholder-zinc-600 resize-none overflow-hidden h-auto min-h-[40px]"
                                                placeholder="Action..."
                                                rows={1}
                                            />
                                            <input
                                                type="text"
                                                defaultValue={shot.description}
                                                onBlur={(e) => handleUpdateShot(shot.id, 'description', e.target.value)}
                                                className="w-full mt-1 bg-transparent border border-transparent hover:border-zinc-700 focus:border-cyan-500 focus:bg-zinc-900 rounded px-2 py-1 outline-none text-xs text-zinc-400 placeholder-zinc-700"
                                                placeholder="Visual description..."
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <textarea
                                                defaultValue={shot.dialogue}
                                                onBlur={(e) => handleUpdateShot(shot.id, 'dialogue', e.target.value)}
                                                className="w-full bg-transparent border border-transparent hover:border-zinc-700 focus:border-cyan-500 focus:bg-zinc-900 rounded px-2 py-1 outline-none transition-all text-white placeholder-zinc-600 resize-none h-auto min-h-[40px]"
                                                placeholder="Dialogue..."
                                                rows={1}
                                            />
                                        </td>
                                        <td className="px-2 py-3">
                                            <input
                                                type="text"
                                                defaultValue={shot.ert}
                                                onBlur={(e) => handleUpdateShot(shot.id, 'ert', e.target.value)}
                                                className="w-full bg-transparent border border-transparent hover:border-zinc-700 focus:border-cyan-500 focus:bg-zinc-900 rounded px-2 py-1 outline-none text-center text-white placeholder-zinc-700"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="px-2 py-3">
                                            <select
                                                value={shot.size || ''}
                                                onChange={(e) => handleUpdateShot(shot.id, 'size', e.target.value)}
                                                className="w-full bg-transparent border border-transparent hover:border-zinc-700 focus:border-cyan-500 focus:bg-zinc-900 rounded px-2 py-1 outline-none text-xs appearance-none cursor-pointer"
                                                style={{ textOverflow: 'ellipsis' }}
                                            >
                                                <option value="" className="bg-zinc-900 text-zinc-500">Select...</option>
                                                {SHOT_SIZES.map(opt => (
                                                    <option key={opt.value} value={opt.value} className="bg-zinc-900">{opt.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-2 py-3">
                                            <select
                                                value={shot.perspective || ''}
                                                onChange={(e) => handleUpdateShot(shot.id, 'perspective', e.target.value)}
                                                className="w-full bg-transparent border border-transparent hover:border-zinc-700 focus:border-cyan-500 focus:bg-zinc-900 rounded px-2 py-1 outline-none text-xs appearance-none cursor-pointer"
                                            >
                                                <option value="" className="bg-zinc-900 text-zinc-500">Select...</option>
                                                {SHOT_PERSPECTIVES.map(opt => (
                                                    <option key={opt.value} value={opt.value} className="bg-zinc-900">{opt.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-2 py-3">
                                            <select
                                                value={shot.movement || ''}
                                                onChange={(e) => handleUpdateShot(shot.id, 'movement', e.target.value)}
                                                className="w-full bg-transparent border border-transparent hover:border-zinc-700 focus:border-cyan-500 focus:bg-zinc-900 rounded px-2 py-1 outline-none text-xs appearance-none cursor-pointer"
                                            >
                                                <option value="" className="bg-zinc-900 text-zinc-500">Select...</option>
                                                {SHOT_MOVEMENTS.map(opt => (
                                                    <option key={opt.value} value={opt.value} className="bg-zinc-900">{opt.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-2 py-3">
                                            <select
                                                value={shot.equipment || ''}
                                                onChange={(e) => handleUpdateShot(shot.id, 'equipment', e.target.value)}
                                                className="w-full bg-transparent border border-transparent hover:border-zinc-700 focus:border-cyan-500 focus:bg-zinc-900 rounded px-2 py-1 outline-none text-xs appearance-none cursor-pointer"
                                            >
                                                <option value="" className="bg-zinc-900 text-zinc-500">Select...</option>
                                                {SHOT_EQUIPMENT.map(opt => (
                                                    <option key={opt.value} value={opt.value} className="bg-zinc-900">{opt.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-2 py-3">
                                            <input
                                                type="text"
                                                defaultValue={shot.focalLength}
                                                onBlur={(e) => handleUpdateShot(shot.id, 'focalLength', e.target.value)}
                                                className="w-full bg-transparent border border-transparent hover:border-zinc-700 focus:border-cyan-500 focus:bg-zinc-900 rounded px-2 py-1 outline-none text-center text-white placeholder-zinc-700"
                                                placeholder="mm"
                                            />
                                        </td>
                                        <td className="px-2 py-3">
                                            <input
                                                type="text"
                                                defaultValue={shot.aspectRatio}
                                                onBlur={(e) => handleUpdateShot(shot.id, 'aspectRatio', e.target.value)}
                                                className="w-full bg-transparent border border-transparent hover:border-zinc-700 focus:border-cyan-500 focus:bg-zinc-900 rounded px-2 py-1 outline-none text-center text-white placeholder-zinc-700"
                                                placeholder="Ratio"
                                                list="aspect-ratios"
                                            />
                                            <datalist id="aspect-ratios">
                                                {ASPECT_RATIOS.map(opt => (
                                                    <option key={opt.value} value={opt.value} />
                                                ))}
                                            </datalist>
                                        </td>
                                        <td className="px-3 py-3">
                                            <input
                                                type="text"
                                                defaultValue={shot.notes}
                                                onBlur={(e) => handleUpdateShot(shot.id, 'notes', e.target.value)}
                                                className="w-full bg-transparent border border-transparent hover:border-zinc-700 focus:border-cyan-500 focus:bg-zinc-900 rounded px-2 py-1 outline-none text-xs text-zinc-400 placeholder-zinc-700"
                                                placeholder="Notes..."
                                            />
                                        </td>
                                        <td className="px-3 py-3 text-right sticky right-0 bg-zinc-900/90 backdrop-blur-sm">
                                            <button
                                                onClick={() => handleDeleteShot(shot.id)}
                                                className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Delete Shot"
                                            >
                                                <iconify-icon icon="solar:trash-bin-linear" width="16"></iconify-icon>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-10 bg-zinc-900/30 rounded-lg border border-zinc-800 border-dashed">
                            <p className="text-zinc-500 mb-2">No shots in this scene yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SceneShotList;
