import React from 'react';
import { Environment, Sky, ContactShadows, Sparkles } from '@react-three/drei';
import { Tree, Rock } from '../../Decorations';

const MysticForest: React.FC = () => {
    return (
        <group>
            {/* Lighting & Sky */}
            <ambientLight intensity={0.4} color="#ccfbf1" />
            <directionalLight
                position={[5, 20, 5]}
                intensity={1}
                color="#2dd4bf"
                castShadow
                shadow-mapSize={[2048, 2048]}
            />

            <Sky sunPosition={[0, 10, 0]} turbidity={8} rayleigh={1} mieCoefficient={0.005} mieDirectionalG={0.7} />
            <Environment preset="forest" />

            {/* Fog */}
            <fog attach="fog" args={['#115e59', 5, 30]} />

            {/* Ground Shadows */}
            <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={40} blur={2} far={4} color="#0f172a" />

            {/* Forest Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#064e3b" roughness={0.9} />
            </mesh>

            {/* Magic Particles */}
            <Sparkles count={100} scale={25} size={4} speed={0.4} opacity={0.7} color="#6ee7b7" />

            {/* Scenery - Dense Forest */}
            {/* Ring 1 */}
            <Tree position={[-14, 0, -14]} scale={2} />
            <Tree position={[14, 0, -14]} scale={2.2} />
            <Tree position={[-14, 0, 14]} scale={2.1} />
            <Tree position={[14, 0, 14]} scale={1.9} />

            {/* Ring 2 */}
            <Tree position={[-18, 0, 0]} scale={2.5} />
            <Tree position={[18, 0, 0]} scale={2.3} />
            <Tree position={[0, 0, -18]} scale={2.4} />
            <Tree position={[0, 0, 18]} scale={2.2} />

            {/* Rocks */}
            <Rock position={[-12, 0, -5]} scale={1.2} rotation={[0, 0.5, 0]} />
            <Rock position={[12, 0, 5]} scale={1.5} rotation={[0, -0.5, 0]} />
            <Rock position={[5, 0, -12]} scale={1} rotation={[0, 1, 0]} />
            <Rock position={[-5, 0, 12]} scale={1.3} rotation={[0, 2, 0]} />
        </group>
    );
};

export default MysticForest;
