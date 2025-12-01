import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import LudoBoard from "./LudoBoard"
import Dice from "./Dice";
import Character from './Character';


import { useGameStore, type PlayerColor } from '../../store/useGameStore';

// Environment Components - Lazy Loaded
const CentralPark = React.lazy(() => import('./environments/CentralPark'));
const CyberCity = React.lazy(() => import('./environments/CyberCity'));
const MysticForest = React.lazy(() => import('./environments/MysticForest'));
const SunsetBeach = React.lazy(() => import('./environments/SunsetBeach'));

const ENV_BGS: Record<string, string> = {
    park: 'bg-gradient-to-b from-sky-300 to-green-200',
    city: 'bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900',
    forest: 'bg-gradient-to-b from-teal-900 to-emerald-900',
    sunset: 'bg-gradient-to-b from-orange-400 via-red-400 to-purple-500'
};

const COLOR_MAP: Record<PlayerColor, string> = {
    red: '#e53935',
    green: '#43a047',
    blue: '#1e88e5',
    yellow: '#fdd835'
};

// Responsive Camera Component
const ResponsiveCamera = () => {
    const { camera, size } = useThree();

    useEffect(() => {
        const aspect = size.width / size.height;
        // Adjust camera position based on aspect ratio
        // If aspect ratio is small (portrait/mobile), move camera further back and up
        if (aspect < 1) {
            camera.position.set(20, 35, 20); // Mobile position
        } else if (aspect < 1.5) {
            camera.position.set(18, 25, 18); // Tablet/Small Desktop
        } else {
            camera.position.set(15, 20, 15); // Desktop default
        }
        camera.updateProjectionMatrix();
    }, [size, camera]);

    return null;
};

const GameCanvas: React.FC = () => {
    const { selectedEnvironment, playerCount, tokens, moveToken, currentTurn, diceValue } = useGameStore();
    const bgClass = ENV_BGS[selectedEnvironment] || ENV_BGS['park'];

    const renderEnvironment = () => {
        switch (selectedEnvironment) {
            case 'city': return <CyberCity />;
            case 'forest': return <MysticForest />;
            case 'sunset': return <SunsetBeach />;
            case 'park':
            default: return <CentralPark />;
        }
    };

    return (
        <div className={`w-full h-full absolute inset-0 ${bgClass} transition-colors duration-1000`}>
            <Canvas shadows camera={{ position: [15, 20, 15], fov: 40 }}>
                <Suspense fallback={null}>
                    <ResponsiveCamera />

                    {/* Render Selected Environment */}
                    {renderEnvironment()}

                    <Physics debug={false}>
                        <LudoBoard />

                        {/* Characters - Dynamic Rendering from Store */}
                        {Object.values(tokens).map((token) => {
                            // Only render active players
                            if (playerCount === 2 && (token.color === 'blue' || token.color === 'green')) return null;

                            // Determine if token is movable
                            const isCurrentTurn = token.color === currentTurn;
                            const canMove = isCurrentTurn && diceValue !== null && (
                                (token.position === -1 && diceValue === 6) ||
                                (token.position >= 0 && token.position + diceValue <= 56)
                            );

                            return (
                                <Character
                                    key={token.id}
                                    index={token.position}
                                    tokenId={token.id}
                                    color={COLOR_MAP[token.color]}
                                    colorName={token.color}
                                    onClick={() => canMove && moveToken(token.id)}
                                    isMovable={canMove}
                                />
                            );
                        })}

                        <Dice />
                    </Physics>

                    <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} maxDistance={50} minDistance={5} />


                </Suspense>
            </Canvas>
        </div>
    );
};

export default GameCanvas;
