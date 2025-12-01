import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CuboidCollider } from '@react-three/rapier';
import { RoundedBox, Trail } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';
import { soundManager } from '../../utils/SoundManager';

const DOT_COLOR = '#000000';
const DICE_COLOR = '#ffffff';
const DICE_SIZE = 1;

// Helper to create dots for a face
const FaceDots = ({ value }: { value: number }) => {
    const positions: [number, number, number][] = useMemo(() => {
        const offset = 0.25;
        switch (value) {
            case 1: return [[0, 0, 0]];
            case 2: return [[-offset, -offset, 0], [offset, offset, 0]];
            case 3: return [[-offset, -offset, 0], [0, 0, 0], [offset, offset, 0]];
            case 4: return [[-offset, -offset, 0], [offset, -offset, 0], [-offset, offset, 0], [offset, offset, 0]];
            case 5: return [[-offset, -offset, 0], [offset, -offset, 0], [0, 0, 0], [-offset, offset, 0], [offset, offset, 0]];
            case 6: return [
                [-offset, -offset, 0], [offset, -offset, 0],
                [-offset, 0, 0], [offset, 0, 0],
                [-offset, offset, 0], [offset, offset, 0]
            ];
            default: return [];
        }
    }, [value]);

    return (
        <group>
            {positions.map((pos, i) => (
                <mesh key={i} position={[pos[0], pos[1], pos[2] + 0.51]} receiveShadow>
                    <sphereGeometry args={[0.08, 32, 16]} />
                    <meshStandardMaterial color={DOT_COLOR} roughness={0.5} />
                </mesh>
            ))}
        </group>
    );
};

const Dice: React.FC = () => {
    const rigidBody = useRef<RapierRigidBody>(null);
    const meshRef = useRef<THREE.Group>(null);
    const { isRolling, setDiceValue, rollDice, diceValue, currentTurn, winner } = useGameStore();
    const [rolling, setRolling] = useState(false);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        document.body.style.cursor = hovered && !isRolling && !winner ? 'pointer' : 'auto';
        return () => { document.body.style.cursor = 'auto'; };
    }, [hovered, isRolling, winner]);

    useEffect(() => {
        if (isRolling && rigidBody.current) {
            setRolling(true);
            soundManager.play('DICE_ROLL');

            // Reset position slightly above board
            rigidBody.current.setTranslation({ x: 0, y: 5, z: 0 }, true);
            rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            rigidBody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);

            // Apply random impulse and torque for a chaotic roll
            const impulse = {
                x: (Math.random() - 0.5) * 5,
                y: 5, // Upward pop
                z: (Math.random() - 0.5) * 5
            };
            const torque = {
                x: (Math.random() - 0.5) * 50,
                y: (Math.random() - 0.5) * 50,
                z: (Math.random() - 0.5) * 50
            };

            rigidBody.current.applyImpulse(impulse, true);
            rigidBody.current.applyTorqueImpulse(torque, true);
        }
    }, [isRolling]);

    useFrame(() => {
        if (rolling && rigidBody.current) {
            const vel = rigidBody.current.linvel();
            const angVel = rigidBody.current.angvel();

            // Check if stopped
            if (Math.abs(vel.x) < 0.01 && Math.abs(vel.y) < 0.01 && Math.abs(vel.z) < 0.01 &&
                Math.abs(angVel.x) < 0.01 && Math.abs(angVel.y) < 0.01 && Math.abs(angVel.z) < 0.01) {

                setRolling(false);

                // Determine which face is up
                const currentRotation = rigidBody.current.rotation();
                const quaternion = new THREE.Quaternion(currentRotation.x, currentRotation.y, currentRotation.z, currentRotation.w);

                const up = new THREE.Vector3(0, 1, 0);
                const localUp = up.clone().applyQuaternion(quaternion.clone().invert());

                let maxDot = -Infinity;
                let face = 1;

                const faceNormals = [
                    { face: 1, normal: new THREE.Vector3(0, 0, 1) },
                    { face: 6, normal: new THREE.Vector3(0, 0, -1) },
                    { face: 2, normal: new THREE.Vector3(0, 1, 0) },
                    { face: 5, normal: new THREE.Vector3(0, -1, 0) },
                    { face: 3, normal: new THREE.Vector3(1, 0, 0) },
                    { face: 4, normal: new THREE.Vector3(-1, 0, 0) },
                ];

                faceNormals.forEach(f => {
                    const dot = localUp.dot(f.normal);
                    if (dot > maxDot) {
                        maxDot = dot;
                        face = f.face;
                    }
                });

                // Update store with the rolled value
                setTimeout(() => setDiceValue(face), 200);
            }

            // Safety check: if dice falls below board, reset it
            const pos = rigidBody.current.translation();
            if (pos.y < -5) {
                rigidBody.current.setTranslation({ x: 0, y: 5, z: 0 }, true);
                rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
                rigidBody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
            }
        }
    });

    const handleDiceClick = (e: any) => {
        e.stopPropagation();
        if (!isRolling && diceValue === null && !winner) {
            rollDice();
        }
    };

    return (
        <group>
            {/* Invisible Walls to keep dice in center */}
            <RigidBody type="fixed" colliders={false}>
                <CuboidCollider args={[5, 5, 0.5]} position={[0, 5, -3]} /> {/* Back */}
                <CuboidCollider args={[5, 5, 0.5]} position={[0, 5, 3]} /> {/* Front */}
                <CuboidCollider args={[0.5, 5, 5]} position={[-3, 5, 0]} /> {/* Left */}
                <CuboidCollider args={[0.5, 5, 5]} position={[3, 5, 0]} /> {/* Right */}
                <CuboidCollider args={[5, 0.5, 5]} position={[0, 8, 0]} /> {/* Ceiling */}
            </RigidBody>

            {/* Clickable Area - Invisible Box around the dice area */}
            <mesh
                position={[0, 5, 0]}
                onClick={handleDiceClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                visible={false}
            >
                <boxGeometry args={[6, 6, 6]} />
            </mesh>

            <RigidBody
                ref={rigidBody}
                position={[0, 5, 0]}
                colliders="cuboid"
                restitution={0.3} // Bounciness
                friction={0.8}
                mass={1}
                linearDamping={0.5}
                angularDamping={0.5}
            >
                <group
                    ref={meshRef}
                    onClick={handleDiceClick}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                >
                    {/* Dice Body */}
                    <RoundedBox args={[DICE_SIZE, DICE_SIZE, DICE_SIZE]} radius={0.15} smoothness={4} castShadow receiveShadow>
                        <meshStandardMaterial
                            color={DICE_COLOR}
                            roughness={0.2}
                            metalness={0.1}
                            emissive={!isRolling && diceValue === null ? "#4f46e5" : "black"}
                            emissiveIntensity={!isRolling && diceValue === null ? 0.5 : 0}
                        />
                    </RoundedBox>

                    {/* Glow Effect when waiting to roll */}
                    {!isRolling && diceValue === null && (
                        <pointLight distance={3} intensity={2} color="#4f46e5" />
                    )}

                    {/* Dots */}
                    <group rotation={[0, 0, 0]}><FaceDots value={1} /></group>
                    <group rotation={[0, Math.PI, 0]}><FaceDots value={6} /></group>
                    <group rotation={[-Math.PI / 2, 0, 0]}><FaceDots value={2} /></group>
                    <group rotation={[Math.PI / 2, 0, 0]}><FaceDots value={5} /></group>
                    <group rotation={[0, Math.PI / 2, 0]}><FaceDots value={3} /></group>
                    <group rotation={[0, -Math.PI / 2, 0]}><FaceDots value={4} /></group>

                    {/* Trail Effect when rolling */}
                    {rolling && (
                        <Trail
                            width={1}
                            length={4}
                            color={new THREE.Color(0xffffff)}
                            attenuation={(t) => t * t}
                        >
                            <mesh visible={false}>
                                <boxGeometry args={[0.1, 0.1, 0.1]} />
                            </mesh>
                        </Trail>
                    )}
                </group>
            </RigidBody>
        </group>
    );
};

export default Dice;
