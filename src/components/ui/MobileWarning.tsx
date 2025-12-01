import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileWarning: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] md:hidden bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full"
            >
                <div className="relative w-24 h-24 mx-auto mb-6">
                    <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 flex items-center justify-center text-red-500"
                    >
                        <Smartphone size={64} />
                    </motion.div>
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        className="absolute inset-0 flex items-center justify-center text-green-500"
                        style={{ transform: 'translate(10px, -10px)' }}
                    >
                        <Monitor size={48} />
                    </motion.div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">Desktop View Required</h2>
                <p className="text-slate-300 mb-6">
                    This game is optimized for larger screens. Please switch to a desktop device or maximize your browser window for the best experience.
                </p>

                <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                    Ludo 3D Experience
                </div>
            </motion.div>
        </div>
    );
};

export default MobileWarning;
