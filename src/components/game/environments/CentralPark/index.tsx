import React from 'react';
import { Environment, Sky, ContactShadows } from '@react-three/drei';
import { Tree, Rock, Fence } from '../../Decorations';

const CentralPark: React.FC = () => {
    return (
        <group>
            {/* Lighting & Sky */}
            <ambientLight intensity={0.7} />
            <directionalLight
                position={[20, 30, 10]}
                intensity={1.8}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0001}
            />
            <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} />
            <Environment preset="park" />

            {/* Ground Shadows */}
            <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={40} blur={2} far={4} />

            {/* Grass Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#4ade80" />
            </mesh>

            {/* Scenery */}
            {/* Trees */}
            <Tree position={[-12, 0, -12]} scale={1.5} />
            <Tree position={[12, 0, -12]} scale={1.2} />
            <Tree position={[-12, 0, 12]} scale={1.3} />
            <Tree position={[12, 0, 12]} scale={1.4} />

            <Tree position={[-15, 0, 0]} scale={1.8} />
            <Tree position={[15, 0, 0]} scale={1.6} />
            <Tree position={[0, 0, -15]} scale={1.7} />
            <Tree position={[0, 0, 15]} scale={1.5} />

            {/* Rocks */}
            <Rock position={[-10, 0, -10]} scale={0.8} rotation={[0, 1, 0]} />
            <Rock position={[10, 0, 10]} scale={0.7} rotation={[0, 2, 0]} />
            <Rock position={[-8, 0, 8]} scale={0.5} />

            {/* Fences */}
            <Fence position={[-8, 0, -8]} rotation={[0, Math.PI / 4, 0]} />
            <Fence position={[8, 0, -8]} rotation={[0, -Math.PI / 4, 0]} />
        </group>
    );
};

export default CentralPark;
