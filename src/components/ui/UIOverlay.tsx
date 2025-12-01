import React, { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Dice5, Settings, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsModal from './SettingsModal';

// Color mapping for vibrant player colors
const PLAYER_COLORS: Record<string, string> = {
    yellow: '#EAB308', // vibrant yellow
    red: '#EF4444',    // vibrant red
    green: '#22C55E',  // vibrant green
    blue: '#3B82F6'    // vibrant blue
};

const UIOverlay: React.FC = () => {
    const { currentTurn, rollDice, isRolling, diceValue, playerNames, playerCount, winner, resetGame } = useGameStore();
    const [showSettings, setShowSettings] = React.useState(false);

    useEffect(() => {
        if (winner) {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const random = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [winner]);

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 font-sans select-none overflow-hidden">
            {/* Header / Scoreboard */}
            <div className="flex justify-between items-start w-full max-w-6xl mx-auto z-10">
                {/* Game Title & Player Info */}
                <div className="flex flex-col gap-2 md:gap-4 w-full">
                    <div className="flex justify-between items-center w-full">
                        <motion.h1
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-wider filter"
                            style={{ filter: 'drop-shadow(2px 2px 0px #000)' }}
                        >
                            LUDO 3D
                        </motion.h1>

                        {/* Settings Button (Mobile: Top Right, Desktop: separate) */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowSettings(true)}
                            className="pointer-events-auto p-2 md:p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white shadow-lg"
                        >
                            <Settings className="w-6 h-6 md:w-8 md:h-8" />
                        </motion.button>
                    </div>

                    {/* Player Cards */}
                    <div className="flex flex-wrap gap-2 md:gap-4 pointer-events-auto">
                        {/* Player Card Component */}
                        {[
                            { id: 'yellow', name: playerNames.yellow, icon: '🐯', color: 'yellow' },
                            { id: 'red', name: playerNames.red, icon: '🦁', color: 'red' },
                            ...(playerCount === 4 ? [
                                { id: 'green', name: playerNames.green, icon: '🐸', color: 'green' },
                                { id: 'blue', name: playerNames.blue, icon: '🐧', color: 'blue' }
                            ] : [])
                        ].map((player) => (
                            <motion.div
                                key={player.id}
                                animate={{
                                    scale: currentTurn === player.id ? 1.05 : 1,
                                    y: currentTurn === player.id ? 2 : 0,
                                    opacity: currentTurn === player.id ? 1 : 0.7
                                }}
                                className={`relative p-2 md:p-3 rounded-xl md:rounded-2xl backdrop-blur-xl border-2 transition-colors duration-300 flex-1 min-w-[80px] md:min-w-[140px] max-w-[160px]
                                    ${currentTurn === player.id
                                        ? `bg-${player.color}-500/30 border-${player.color}-400 shadow-[0_0_30px_rgba(0,0,0,0.3)]`
                                        : 'bg-black/40 border-white/10'
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 text-center md:text-left">
                                    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-white shadow-inner flex items-center justify-center text-lg md:text-2xl bg-${player.color}-500`}>
                                        {player.icon}
                                    </div>
                                    <div className="text-white font-bold overflow-hidden w-full">
                                        <div className="text-[10px] md:text-xs opacity-70 uppercase tracking-wider hidden md:block">Player {player.id === 'yellow' ? 1 : player.id === 'red' ? 2 : player.id === 'green' ? 3 : 4}</div>
                                        <div className="flex items-center gap-2">
                                            <div className="truncate text-xs md:text-lg">{player.name}</div>
                                            {currentTurn === player.id && (
                                                <motion.div
                                                    layoutId="active-player-dot"
                                                    className="w-2 h-2 md:w-3 md:h-3 rounded-full"
                                                    style={{
                                                        backgroundColor: PLAYER_COLORS[player.color],
                                                        boxShadow: `0 0 8px ${PLAYER_COLORS[player.color]}`
                                                    }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex flex-col items-center gap-3 md:gap-8 pointer-events-auto pb-4 md:pb-10 lg:pb-12 z-10 w-full max-w-6xl mx-auto">
                {/* Dice Display */}
                <AnimatePresence mode='wait'>
                    {diceValue && (
                        <motion.div
                            key={diceValue}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="relative z-50 pointer-events-none"
                        >
                            <div className="absolute inset-0 bg-white/50 blur-2xl rounded-full animate-pulse"></div>
                            <div className="relative w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-white to-gray-200 rounded-2xl md:rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex items-center justify-center text-4xl md:text-6xl font-black text-indigo-600 border-2 md:border-4 border-indigo-100 transform rotate-3">
                                {diceValue}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Roll Button */}
                <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95, y: 0 }}
                    onClick={rollDice}
                    disabled={isRolling}
                    className={`
                        group relative px-8 py-3 md:px-16 md:py-6 rounded-full font-black text-lg md:text-3xl text-white shadow-[0_4px_0_rgb(55,48,163)] md:shadow-[0_10px_0_rgb(55,48,163)] active:shadow-none transition-all
                        ${isRolling
                            ? 'bg-gray-500 cursor-not-allowed shadow-[0_4px_0_rgb(75,85,99)] md:shadow-[0_10px_0_rgb(75,85,99)]'
                            : 'bg-gradient-to-b from-indigo-500 to-indigo-700 hover:brightness-110'
                        }
                    `}
                >
                    <div className="flex items-center gap-2 md:gap-4 relative z-10">
                        <Dice5 className={`w-5 h-5 md:w-10 md:h-10 ${isRolling ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
                        <span className="tracking-wider drop-shadow-md">{isRolling ? 'ROLLING...' : 'ROLL DICE'}</span>
                    </div>
                    {/* Shine effect */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-full"></div>
                </motion.button>
            </div>

            {/* Game Over Modal */}
            <AnimatePresence>
                {winner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 100 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-gradient-to-b from-gray-900 to-black p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] max-w-lg w-full text-center shadow-2xl border-4 border-yellow-400"
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <Trophy className="w-20 h-20 md:w-32 md:h-32 text-yellow-400 mx-auto mb-4 md:mb-8 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
                            </motion.div>
                            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4 md:mb-6">WINNER!</h2>
                            <div className="text-2xl md:text-4xl font-bold text-white mb-6 md:mb-10">
                                {playerNames[winner]} <span className="text-yellow-400">Wins!</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={resetGame}
                                className="w-full py-4 md:py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-xl md:text-2xl rounded-2xl shadow-lg"
                            >
                                PLAY AGAIN
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Settings Modal */}
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div>
    );
};

export default UIOverlay;
