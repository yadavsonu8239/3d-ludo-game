import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Play, Settings, Map, Users } from 'lucide-react';
import SettingsModal from '../ui/SettingsModal';

const ENVIRONMENTS = [
    { id: 'park', name: 'Central Park', color: 'from-green-400 to-emerald-600', description: 'A peaceful park setting' },
    { id: 'city', name: 'Cyber City', color: 'from-blue-500 to-purple-600', description: 'Neon lights and skyscrapers' },
    { id: 'forest', name: 'Mystic Forest', color: 'from-teal-400 to-green-800', description: 'Ancient trees and magic' },
    { id: 'sunset', name: 'Sunset Beach', color: 'from-orange-400 to-pink-600', description: 'Relaxing waves and golden sun' },
];

const MainMenu: React.FC = () => {
    const { startGame, playerCount, setPlayerCount, setPlayerNames } = useGameStore();
    const [selectedEnv, setSelectedEnv] = useState('park');
    const [names, setNames] = useState({
        red: 'Player 1',
        blue: 'Player 2',
        green: 'Player 3',
        yellow: 'Player 4'
    });
    const [showSettings, setShowSettings] = useState(false);

    const handleStartGame = () => {
        setPlayerNames(names);
        startGame(selectedEnv);
    };

    return (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-y-auto overflow-x-hidden z-50">
            {/* Background Elements */}
            <div className="fixed inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
                <div className="max-w-6xl w-full flex flex-col items-center gap-6 md:gap-12 my-4 md:my-8">
                    {/* Title */}
                    <div className="text-center space-y-2 md:space-y-4">
                        <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 drop-shadow-2xl tracking-tight"
                            style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))' }}>
                            LUDO 3D
                        </h1>
                        <p className="text-sm md:text-xl text-blue-200 font-medium tracking-widest uppercase opacity-80">Ultimate Board Experience</p>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 w-full items-start">

                        {/* Left Side: Options */}
                        <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
                                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                                    <Map className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                                    <h2 className="text-xl md:text-2xl font-bold text-white">Select Environment</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                    {ENVIRONMENTS.map((env) => (
                                        <button
                                            key={env.id}
                                            onClick={() => setSelectedEnv(env.id)}
                                            className={`relative group p-3 md:p-4 rounded-xl border-2 transition-all duration-300 text-left
                      ${selectedEnv === env.id
                                                    ? 'border-yellow-400 bg-white/10 shadow-[0_0_20px_rgba(250,204,21,0.3)]'
                                                    : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                                                }`}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${env.color} opacity-20 group-hover:opacity-30 transition-opacity rounded-xl`} />
                                            <div className="relative z-10">
                                                <div className="font-bold text-white text-base md:text-lg mb-1">{env.name}</div>
                                                <div className="text-[10px] md:text-xs text-gray-300">{env.description}</div>
                                            </div>
                                            {selectedEnv === env.id && (
                                                <div className="absolute top-2 right-2 md:top-3 md:right-3 w-2 h-2 md:w-4 md:h-4 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.8)] z-10" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
                                <div className="flex items-center gap-3 md:gap-4 mb-4">
                                    <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                                    <h2 className="text-xl md:text-2xl font-bold text-white">Game Mode & Players</h2>
                                </div>
                                <div className="flex gap-3 md:gap-4 mb-6">
                                    <button
                                        onClick={() => setPlayerCount(2)}
                                        className={`flex-1 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 ${playerCount === 2 ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'}`}
                                    >
                                        2 Players
                                    </button>
                                    <button
                                        onClick={() => setPlayerCount(4)}
                                        className={`flex-1 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 ${playerCount === 4 ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'}`}
                                    >
                                        4 Players
                                    </button>
                                </div>

                                {/* Player Name Inputs */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-white shadow-sm flex items-center justify-center text-sm">🐯</div>
                                        <input
                                            type="text"
                                            value={names.yellow}
                                            onChange={(e) => setNames({ ...names, yellow: e.target.value })}
                                            placeholder="Player 1 Name"
                                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm md:text-base text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition-colors"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white shadow-sm flex items-center justify-center text-sm">🦁</div>
                                        <input
                                            type="text"
                                            value={names.red}
                                            onChange={(e) => setNames({ ...names, red: e.target.value })}
                                            placeholder="Player 2 Name"
                                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm md:text-base text-white placeholder-white/30 focus:outline-none focus:border-red-500 transition-colors"
                                        />
                                    </div>
                                    {playerCount === 4 && (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white shadow-sm flex items-center justify-center text-sm">🐸</div>
                                                <input
                                                    type="text"
                                                    value={names.green}
                                                    onChange={(e) => setNames({ ...names, green: e.target.value })}
                                                    placeholder="Player 3 Name"
                                                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm md:text-base text-white placeholder-white/30 focus:outline-none focus:border-green-500 transition-colors"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-sm flex items-center justify-center text-sm">🐧</div>
                                                <input
                                                    type="text"
                                                    value={names.blue}
                                                    onChange={(e) => setNames({ ...names, blue: e.target.value })}
                                                    placeholder="Player 4 Name"
                                                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm md:text-base text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Action */}
                        <div className="flex flex-col items-center justify-center gap-6 md:gap-8 order-1 lg:order-2">
                            <div className="relative group w-full max-w-xs md:max-w-md">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-pulse"></div>
                                <button
                                    onClick={handleStartGame}
                                    className="relative w-full px-8 md:px-16 py-6 md:py-8 bg-gradient-to-r from-yellow-400 to-red-600 rounded-full transform transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl flex items-center justify-center gap-4 md:gap-6 group-hover:shadow-[0_0_40px_rgba(239,68,68,0.6)]"
                                >
                                    <Play className="w-8 h-8 md:w-12 md:h-12 text-white fill-current" />
                                    <span className="text-2xl md:text-4xl font-black text-white tracking-wider uppercase italic">Play Now</span>
                                </button>
                            </div>

                            <button
                                onClick={() => setShowSettings(true)}
                                className="flex items-center gap-3 text-white/50 hover:text-white transition-colors"
                            >
                                <Settings className="w-5 h-5 md:w-6 md:h-6" />
                                <span className="font-medium text-sm md:text-base">Settings</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div>
    );
};

export default MainMenu;
