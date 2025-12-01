import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Volume2, VolumeX, Monitor, LogOut, X } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { soundManager } from '../../utils/SoundManager';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { settings, updateSettings, resetGame, gameStatus } = useGameStore();

    const handleVolumeChange = (type: 'master' | 'music' | 'sfx', value: number) => {
        updateSettings({ [`${type}Volume`]: value });
        if (type === 'master') {
            soundManager.toggleSound(value > 0);
        }
        // In a real implementation, we'd update individual channel volumes here
    };

    const handleGraphicsToggle = () => {
        updateSettings({ graphicsQuality: settings.graphicsQuality === 'high' ? 'low' : 'high' });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-xl">
                                    <Settings className="w-6 h-6 text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Settings</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-8">
                            {/* Audio Settings */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Audio</h3>

                                {/* Master Volume */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-white/80 text-sm">
                                        <span>Master Volume</span>
                                        <span>{Math.round(settings.masterVolume * 100)}%</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleVolumeChange('master', settings.masterVolume > 0 ? 0 : 0.5)}>
                                            {settings.masterVolume > 0 ? <Volume2 className="w-5 h-5 text-white/70" /> : <VolumeX className="w-5 h-5 text-white/70" />}
                                        </button>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={settings.masterVolume}
                                            onChange={(e) => handleVolumeChange('master', parseFloat(e.target.value))}
                                            className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 hover:[&::-webkit-slider-thumb]:bg-blue-400 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* SFX Volume */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-white/80 text-sm">
                                        <span>Sound Effects</span>
                                        <span>{Math.round(settings.sfxVolume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={settings.sfxVolume}
                                        onChange={(e) => handleVolumeChange('sfx', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500 hover:[&::-webkit-slider-thumb]:bg-green-400 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Graphics Settings */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Graphics</h3>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Monitor className="w-5 h-5 text-purple-400" />
                                        <div>
                                            <div className="font-medium text-white">High Quality</div>
                                            <div className="text-xs text-white/50">Better shadows & effects</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleGraphicsToggle}
                                        className={`w-12 h-7 rounded-full transition-colors relative ${settings.graphicsQuality === 'high' ? 'bg-purple-500' : 'bg-slate-600'}`}
                                    >
                                        <motion.div
                                            layout
                                            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md ${settings.graphicsQuality === 'high' ? 'left-6' : 'left-1'}`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Game Actions */}
                            {gameStatus === 'PLAYING' && (
                                <div className="pt-4 border-t border-white/10">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            resetGame();
                                            onClose();
                                        }}
                                        className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Quit Game
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
