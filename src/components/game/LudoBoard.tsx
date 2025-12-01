import React from 'react';
import { RoundedBox, Sparkles, Environment } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { Fence, Tree, Rock } from './Decorations';

const TILE_SIZE = 1;
const TILE_HEIGHT = 0.2;
const BOARD_HEIGHT = 0.5;

// Enhanced Colors with more vibrancy
const COLORS = {
    RED: '#ef4444',
    GREEN: '#22c55e',
    BLUE: '#3b82f6',
    YELLOW: '#eab308',
    WHITE: '#f8fafc',
    STONE: '#94a3b8',
    DARK_STONE: '#475569',
    GRASS: '#16a34a',
    ISLAND_BASE: '#14532d',
    GOLD: '#fbbf24'
};

const LudoBoard: React.FC = () => {

    // Helper to create a path of tiles
    const PathTiles = ({ startPos, direction, count, color }: { startPos: [number, number, number], direction: [number, number, number], count: number, color: string }) => {
        return (
            <group>
                {Array.from({ length: count }).map((_, i) => (
                    <RoundedBox
                        key={i}
                        args={[TILE_SIZE * 0.9, TILE_HEIGHT, TILE_SIZE * 0.9]}
                        radius={0.05}
                        smoothness={4}
                        position={[
                            startPos[0] + direction[0] * i * TILE_SIZE,
                            startPos[1],
                            startPos[2] + direction[2] * i * TILE_SIZE
                        ]}
                        receiveShadow
                        castShadow
                    >
                        <meshStandardMaterial
                            color={color}
                            roughness={0.1}
                            metalness={0.1}
                            envMapIntensity={1}
                        />
                    </RoundedBox>
                ))}
            </group>
        );
    };

    // Arm Component
    const BoardArm = ({ position, rotation, color }: { position: [number, number, number], rotation: [number, number, number], color: string }) => {
        return (
            <group position={position} rotation={rotation}>
                {/* The 3 rows of the arm */}

                {/* Left Row (White tiles mostly) */}
                <PathTiles startPos={[-TILE_SIZE, 0, TILE_SIZE * 1.5]} direction={[0, 0, 1]} count={6} color={COLORS.WHITE} />

                {/* Middle Row (Home path - Colored) */}
                <PathTiles startPos={[0, 0.05, TILE_SIZE * 1.5]} direction={[0, 0, 1]} count={5} color={color} />

                {/* Right Row (White tiles mostly) */}
                <PathTiles startPos={[TILE_SIZE, 0, TILE_SIZE * 1.5]} direction={[0, 0, 1]} count={6} color={COLORS.WHITE} />

                {/* Start Spot (Special Tile) */}
                <RoundedBox
                    args={[TILE_SIZE * 0.9, TILE_HEIGHT + 0.05, TILE_SIZE * 0.9]}
                    radius={0.1}
                    smoothness={4}
                    position={[TILE_SIZE, 0, TILE_SIZE * 1.5 + TILE_SIZE * 4]} // 5th tile
                    receiveShadow
                    castShadow
                >
                    <meshStandardMaterial color={color} roughness={0.2} metalness={0.3} />
                </RoundedBox>
                {/* Start Spot Indicator */}
                <group position={[TILE_SIZE, 0.2, TILE_SIZE * 1.5 + TILE_SIZE * 4]}>
                    <Sparkles count={8} scale={1.5} size={3} speed={0.4} opacity={0.6} color={color} />
                    <pointLight distance={2} intensity={0.5} color={color} />
                </group>


                {/* Arrow at the end of home path */}
                <mesh position={[0, 0.05, TILE_SIZE * 0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <coneGeometry args={[0.4, 0.8, 3]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
                </mesh>

                {/* Safe Spot Star (Left Row, 2nd tile) */}
                <group position={[-TILE_SIZE, 0.1, TILE_SIZE * 2.5]}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
                        <cylinderGeometry args={[0.35, 0.35, 0.05, 5]} />
                        <meshStandardMaterial color={COLORS.GOLD} metalness={0.8} roughness={0.2} />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                        <coneGeometry args={[0.2, 0.1, 5]} />
                        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.8} />
                    </mesh>
                    <pointLight distance={1.5} intensity={0.8} color={COLORS.GOLD} />
                    <Sparkles count={3} scale={0.8} size={2} speed={0.2} opacity={0.5} color={COLORS.GOLD} />
                </group>

            </group>
        );
    };

    const HomeBase = ({ position, color, rotation }: { position: [number, number, number], color: string, rotation: [number, number, number] }) => (
        <group position={position} rotation={rotation}>
            {/* Raised Platform */}
            <RoundedBox args={[TILE_SIZE * 5, BOARD_HEIGHT, TILE_SIZE * 5]} radius={0.2} smoothness={4} position={[0, 0, 0]} receiveShadow castShadow>
                <meshStandardMaterial color={COLORS.WHITE} roughness={0.5} />
            </RoundedBox>

            {/* Colored Border Area */}
            <RoundedBox args={[TILE_SIZE * 4.5, BOARD_HEIGHT + 0.02, TILE_SIZE * 4.5]} radius={0.1} smoothness={4} position={[0, 0, 0]} receiveShadow>
                <meshStandardMaterial color={color} roughness={0.3} />
            </RoundedBox>

            {/* Inner White Area */}
            <RoundedBox args={[TILE_SIZE * 3.5, 0.1, TILE_SIZE * 3.5]} radius={0.1} smoothness={4} position={[0, BOARD_HEIGHT / 2 + 0.05, 0]} receiveShadow>
                <meshStandardMaterial color={COLORS.WHITE} roughness={0.5} />
            </RoundedBox>

            {/* 4 Spawn Points */}
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map((offset, i) => (
                <group key={i} position={[offset[0] * 1.2, BOARD_HEIGHT / 2 + 0.1, offset[1] * 1.2]}>
                    <RoundedBox args={[TILE_SIZE * 0.8, 0.1, TILE_SIZE * 0.8]} radius={0.4} smoothness={8} receiveShadow>
                        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
                    </RoundedBox>
                    <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.3, 0.35, 32]} />
                        <meshStandardMaterial color="white" opacity={0.6} transparent />
                    </mesh>
                </group>
            ))}

            {/* Fences around the base */}
            <Fence position={[-2.4, BOARD_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} />
            <Fence position={[2.4, BOARD_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} />
            <Fence position={[0, BOARD_HEIGHT / 2, -2.4]} rotation={[0, 0, 0]} />
        </group>
    );

    return (
        <group>
            <Environment preset="park" background={false} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />

            {/* Main Island Base */}
            <RigidBody type="fixed" colliders="trimesh">
                <mesh position={[0, -0.5, 0]} receiveShadow>
                    <cylinderGeometry args={[16, 14, 4, 64]} />
                    <meshStandardMaterial color={COLORS.ISLAND_BASE} roughness={1} />
                </mesh>
                {/* Top Grass Layer */}
                <mesh position={[0, 1.5, 0]} receiveShadow>
                    <cylinderGeometry args={[15.5, 16, 0.5, 64]} />
                    <meshStandardMaterial color={COLORS.GRASS} roughness={0.8} />
                </mesh>
            </RigidBody>

            {/* Center Platform */}
            <group position={[0, 1.8, 0]}>
                <RoundedBox args={[TILE_SIZE * 3, 0.2, TILE_SIZE * 3]} radius={0.1} smoothness={4} receiveShadow castShadow>
                    <meshStandardMaterial color={COLORS.WHITE} roughness={0.2} />
                </RoundedBox>
                {/* Center Triangles */}
                <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[2.8, 2.8]} />
                    <meshStandardMaterial color="#333" />
                </mesh>

                {/* 4 Colored Triangles for Center */}
                {/* Top Green */}
                <mesh position={[0, 0.12, -0.7]} rotation={[-Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[1.4, 1.4, 3]} />
                    <meshStandardMaterial color={COLORS.GREEN} emissive={COLORS.GREEN} emissiveIntensity={0.2} />
                </mesh>
                {/* Bottom Yellow */}
                <mesh position={[0, 0.12, 0.7]} rotation={[-Math.PI / 2, 0, Math.PI]}>
                    <coneGeometry args={[1.4, 1.4, 3]} />
                    <meshStandardMaterial color={COLORS.YELLOW} emissive={COLORS.YELLOW} emissiveIntensity={0.2} />
                </mesh>
                {/* Left Blue */}
                <mesh position={[-0.7, 0.12, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
                    <coneGeometry args={[1.4, 1.4, 3]} />
                    <meshStandardMaterial color={COLORS.BLUE} emissive={COLORS.BLUE} emissiveIntensity={0.2} />
                </mesh>
                {/* Right Red */}
                <mesh position={[0.7, 0.12, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
                    <coneGeometry args={[1.4, 1.4, 3]} />
                    <meshStandardMaterial color={COLORS.RED} emissive={COLORS.RED} emissiveIntensity={0.2} />
                </mesh>

                {/* Center Winner's Podium Effect */}
                <pointLight position={[0, 2, 0]} intensity={1.5} distance={6} decay={2} color="white" />
                <Sparkles count={20} scale={4} size={2} speed={0.2} opacity={0.3} color="white" position={[0, 1, 0]} />
            </group>

            {/* Arms */}
            <group position={[0, 1.8, 0]}>
                <BoardArm position={[0, 0, 0]} rotation={[0, 0, 0]} color={COLORS.YELLOW} /> {/* Bottom */}
                <BoardArm position={[0, 0, 0]} rotation={[0, Math.PI, 0]} color={COLORS.GREEN} /> {/* Top */}
                <BoardArm position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} color={COLORS.RED} /> {/* Right */}
                <BoardArm position={[0, 0, 0]} rotation={[0, -Math.PI / 2, 0]} color={COLORS.BLUE} /> {/* Left */}
            </group>

            {/* Home Bases */}
            <group position={[0, 1.5, 0]}>
                <HomeBase position={[5.5, 0, 5.5]} color={COLORS.YELLOW} rotation={[0, 0, 0]} />
                <HomeBase position={[-5.5, 0, 5.5]} color={COLORS.BLUE} rotation={[0, 0, 0]} />
                <HomeBase position={[-5.5, 0, -5.5]} color={COLORS.GREEN} rotation={[0, 0, 0]} />
                <HomeBase position={[5.5, 0, -5.5]} color={COLORS.RED} rotation={[0, 0, 0]} />
            </group>

            {/* Decorations scattered around */}
            <group position={[0, 1.5, 0]}>
                <Tree position={[9, 0, 0]} scale={2} />
                <Tree position={[-9, 0, 2]} scale={1.8} />
                <Tree position={[0, 0, -9]} scale={2.2} />
                <Tree position={[10, 0, 10]} scale={2.5} />
                <Tree position={[-10, 0, -10]} scale={2.3} />
                <Rock position={[8, 0, 8]} scale={1.5} />
                <Rock position={[-8, 0, -8]} scale={2} />
                <Rock position={[11, 0, -5]} scale={1.2} />
            </group>

        </group>
    );
};

export default LudoBoard;
