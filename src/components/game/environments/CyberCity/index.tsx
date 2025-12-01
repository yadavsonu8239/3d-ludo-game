import React from 'react';
import { Environment, Sky, ContactShadows, Box } from '@react-three/drei';

const Building: React.FC<{ position: [number, number, number], args: [number, number, number], color: string }> = ({ position, args, color }) => (
    <group position={position}>
        <Box args={args} castShadow receiveShadow>
            <meshStandardMaterial color="#1a1a2e" roughness={0.2} metalness={0.8} />
        </Box>
        {/* Neon Strip */}
        <Box args={[args[0] + 0.1, 0.2, args[2] + 0.1]} position={[0, args[1] / 2 - 1, 0]}>
            <meshBasicMaterial color={color} toneMapped={false} />
        </Box>
        {/* Windows */}
        {Array.from({ length: Math.floor(args[1] / 2) }).map((_, i) => (
            <Box key={i} args={[args[0] + 0.05, 0.5, args[2] + 0.05]} position={[0, -args[1] / 2 + 2 + i * 2, 0]}>
                <meshStandardMaterial color="#000" emissive={color} emissiveIntensity={0.5} />
            </Box>
        ))}
    </group>
);

const CyberCity: React.FC = () => {
    return (
        <group>
            {/* Lighting & Sky */}
            <ambientLight intensity={0.2} />
            <directionalLight
                position={[-10, 20, -10]}
                intensity={0.5}
                color="#a855f7"
                castShadow
            />
            <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />

            <Sky sunPosition={[100, 10, 100]} turbidity={10} rayleigh={0.1} mieCoefficient={0.005} mieDirectionalG={0.8} />
            <Environment preset="city" />

            {/* Fog for depth */}
            <fog attach="fog" args={['#1e1b4b', 10, 50]} />

            {/* Ground Shadows */}
            <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={40} blur={2} far={4} color="#000" />

            {/* City Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
            </mesh>

            {/* Scenery - Skyscrapers */}
            <Building position={[-15, 10, -15]} args={[4, 20, 4]} color="#d946ef" />
            <Building position={[15, 8, -15]} args={[5, 16, 5]} color="#3b82f6" />
            <Building position={[-15, 12, 15]} args={[4, 24, 4]} color="#8b5cf6" />
            <Building position={[15, 9, 15]} args={[5, 18, 5]} color="#06b6d4" />

            <Building position={[-20, 6, 0]} args={[3, 12, 3]} color="#f43f5e" />
            <Building position={[20, 7, 0]} args={[3, 14, 3]} color="#10b981" />
            <Building position={[0, 8, -20]} args={[6, 16, 3]} color="#eab308" />
            <Building position={[0, 6, 20]} args={[6, 12, 3]} color="#ec4899" />
        </group>
    );
};

export default CyberCity;
