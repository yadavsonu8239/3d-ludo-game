import React from 'react';
import { Box, Cylinder, Cone, Dodecahedron } from '@react-three/drei';

export const Tree: React.FC<{ position: [number, number, number], scale?: number }> = ({ position, scale = 1 }) => {
    return (
        <group position={position} scale={scale}>
            {/* Trunk */}
            <Cylinder args={[0.15, 0.25, 1, 8]} position={[0, 0.5, 0]} castShadow receiveShadow>
                <meshStandardMaterial color="#5D4037" roughness={0.9} />
            </Cylinder>

            {/* Foliage - stylized low poly look */}
            <group position={[0, 1.0, 0]}>
                <Cone args={[0.8, 1.2, 8]} position={[0, 0.2, 0]} castShadow receiveShadow>
                    <meshStandardMaterial color="#4CAF50" roughness={0.8} />
                </Cone>
                <Cone args={[0.6, 1.0, 8]} position={[0, 0.8, 0]} castShadow receiveShadow>
                    <meshStandardMaterial color="#66BB6A" roughness={0.8} />
                </Cone>
                <Cone args={[0.4, 0.8, 8]} position={[0, 1.3, 0]} castShadow receiveShadow>
                    <meshStandardMaterial color="#81C784" roughness={0.8} />
                </Cone>
            </group>
        </group>
    );
};

export const Rock: React.FC<{ position: [number, number, number], scale?: number, rotation?: [number, number, number] }> = ({ position, scale = 1, rotation = [0, 0, 0] }) => {
    return (
        <group position={position} scale={scale} rotation={rotation}>
            <Dodecahedron args={[0.5, 0]} castShadow receiveShadow position={[0, 0.25, 0]}>
                <meshStandardMaterial color="#78909C" roughness={0.7} flatShading />
            </Dodecahedron>
            <Dodecahedron args={[0.3, 0]} castShadow receiveShadow position={[0.4, 0.15, 0.2]}>
                <meshStandardMaterial color="#607D8B" roughness={0.7} flatShading />
            </Dodecahedron>
        </group>
    );
};

export const Fence: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Posts */}
            <Box args={[0.1, 0.6, 0.1]} position={[-0.4, 0.3, 0]} castShadow>
                <meshStandardMaterial color="#8D6E63" />
            </Box>
            <Box args={[0.1, 0.6, 0.1]} position={[0.4, 0.3, 0]} castShadow>
                <meshStandardMaterial color="#8D6E63" />
            </Box>
            {/* Rails */}
            <Box args={[1, 0.05, 0.05]} position={[0, 0.4, 0]} castShadow>
                <meshStandardMaterial color="#A1887F" />
            </Box>
            <Box args={[1, 0.05, 0.05]} position={[0, 0.2, 0]} castShadow>
                <meshStandardMaterial color="#A1887F" />
            </Box>
        </group>
    )
}
