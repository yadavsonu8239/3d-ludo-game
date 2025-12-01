import React from 'react';
import { Environment, Sky, ContactShadows, Plane, Sphere } from '@react-three/drei';
import { Rock } from '../../Decorations';
import Water from '../../Water';

const PalmTree: React.FC<{ position: [number, number, number], scale?: number }> = ({ position, scale = 1 }) => (
    <group position={position} scale={scale}>
        {/* Trunk */}
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.15, 0.25, 3, 8]} />
            <meshStandardMaterial color="#8d6e63" roughness={0.8} />
        </mesh>
        {/* Leaves */}
        <group position={[0, 3, 0]}>
            {[0, 1, 2, 3, 4].map((i) => (
                <mesh key={i} rotation={[0, (i * Math.PI * 2) / 5, Math.PI / 3]} position={[0, 0, 0]}>
                    <coneGeometry args={[0.3, 1.5, 4]} />
                    <meshStandardMaterial color="#4ade80" />
                </mesh>
            ))}
        </group>
    </group>
);

const SunsetBeach: React.FC = () => {
    return (
        <group>
            {/* Lighting & Sky */}
            <ambientLight intensity={0.6} color="#fed7aa" />
            <directionalLight
                position={[-20, 10, -20]}
                intensity={1.5}
                color="#fb923c"
                castShadow
                shadow-mapSize={[2048, 2048]}
            />

            <Sky sunPosition={[0, 1, -5]} turbidity={10} rayleigh={3} mieCoefficient={0.005} mieDirectionalG={0.7} />
            <Environment preset="sunset" />

            {/* Ground Shadows */}
            <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={40} blur={2} far={4} color="#7c2d12" />

            {/* Sand Plane */}
            <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <meshStandardMaterial color="#fcd34d" roughness={1} />
            </Plane>

            <Water />

            {/* Scenery */}
            <PalmTree position={[-12, 0, -12]} scale={1.5} />
            <PalmTree position={[14, 0, -10]} scale={1.8} />
            <PalmTree position={[-15, 0, 10]} scale={1.6} />

            <Rock position={[-10, 0, -10]} scale={0.8} rotation={[0, 1, 0]} />
            <Rock position={[12, 0, 12]} scale={1.2} rotation={[0, 2, 0]} />

            {/* Distant Sun/Moon */}
            <Sphere args={[5, 32, 32]} position={[0, 10, -40]}>
                <meshBasicMaterial color="#fbbf24" toneMapped={false} />
            </Sphere>
        </group>
    );
};

export default SunsetBeach;
