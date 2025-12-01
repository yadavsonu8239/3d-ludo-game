import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useGLTF, useAnimations, Ring, Sparkles } from '@react-three/drei';
import { useGraph, useFrame } from '@react-three/fiber';
import { SkeletonUtils } from 'three-stdlib';
import { Group, MeshStandardMaterial, Mesh, Vector3 } from 'three';
import * as THREE from 'three';
import { useGameStore, type PlayerColor } from '../../store/useGameStore';
import { getPositionVector } from '../../utils/BoardCoordinates';
import { soundManager } from '../../utils/SoundManager';

interface CharacterProps {
    type?: 'tiger' | 'penguin';
    index: number; // Current board index (0-56, -1 for base)
    tokenId: string;
    color?: string;
    colorName?: PlayerColor;
    onClick?: () => void;
    isMovable?: boolean;
}

const MODEL_URL = '/Soldier.glb';

const SoldierModel: React.FC<{ animation?: string; color: string }> = ({ animation = 'Idle', color }) => {
    const group = useRef<Group>(null);
    const { scene, animations } = useGLTF(MODEL_URL);

    // Properly clone the SkinnedMesh scene using SkeletonUtils
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes } = useGraph(clone);
    const { actions } = useAnimations(animations, group);

    useEffect(() => {
        // Apply color to the model's mesh
        const mesh = nodes.vanguard_Mesh as Mesh;
        if (mesh) {
            mesh.material = (mesh.material as MeshStandardMaterial).clone();
            (mesh.material as MeshStandardMaterial).color.set(color);
        } else {
            clone.traverse((child: any) => {
                if (child.isMesh) {
                    child.material = child.material.clone();
                    child.material.color.set(color);
                }
            });
        }
    }, [clone, nodes, color]);

    useEffect(() => {
        const action = actions[animation];
        if (action) {
            action.reset().fadeIn(0.2).play();
            return () => {
                action.fadeOut(0.2);
            };
        }
    }, [animation, actions]);

    return (
        <group ref={group} dispose={null}>
            <primitive object={clone} />
            {/* Team Indicator Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
                <ringGeometry args={[0.3, 0.5, 32]} />
                <meshStandardMaterial color={color} opacity={0.8} transparent emissive={color} emissiveIntensity={0.5} />
            </mesh>
        </group>
    );
};

useGLTF.preload(MODEL_URL);

const Character: React.FC<CharacterProps> = ({ index, tokenId, color = '#ffffff', colorName, onClick, isMovable }) => {
    // Increase scale slightly to ensure visibility
    const finalScale = 1.2; // Adjusted scale
    const groupRef = useRef<Group>(null);

    // Movement State
    const [targetQueue, setTargetQueue] = useState<Vector3[]>([]);
    const currentPos = useRef(new THREE.Vector3());
    const isMoving = useRef(false);
    const [landingEffect, setLandingEffect] = useState(false);

    // Fight Animation State
    const lastCapture = useGameStore(state => state.lastCapture);
    // const lastCapture = null; // Temporary fix to debug
    const [fightState, setFightState] = useState<'none' | 'attacking' | 'hit'>('none');
    const attackProgress = useRef(0);
    const hitProgress = useRef(0);

    // Rotation State
    const currentRot = useRef(new THREE.Quaternion());
    const targetRot = useRef(new THREE.Quaternion());

    // Initialize Position
    useEffect(() => {
        if (colorName) {
            const startPos = getPositionVector(colorName, index, tokenId);
            currentPos.current.set(startPos.x, startPos.y, startPos.z);

            // Initial Rotation
            let initialY = 0;
            switch (colorName) {
                case 'yellow': initialY = Math.PI; break; // Face North
                case 'red': initialY = -Math.PI / 2; break; // Face West
                case 'green': initialY = 0; break; // Face South
                case 'blue': initialY = Math.PI / 2; break; // Face East
            }
            const euler = new THREE.Euler(0, initialY, 0);
            currentRot.current.setFromEuler(euler);
            targetRot.current.copy(currentRot.current);

            if (groupRef.current) {
                groupRef.current.position.copy(currentPos.current);
                groupRef.current.quaternion.copy(currentRot.current);
            }
        }
    }, []); // Run once on mount

    // Handle Index Changes (Movement)
    useEffect(() => {
        if (!colorName) return;

        // Calculate path from current visual position to new index
        // We need to know the previous index to calculate intermediate steps
        // But since we don't track previous index explicitly, we can infer path
        // However, for simplicity and robustness, if the jump is > 1, we calculate intermediate steps
        // Actually, since we only get the final index, we might miss intermediate steps if we just lerp.
        // To do this properly, we should probably just calculate the path from current index to new index
        // But we don't have "current index" stored in component state, only prop.

        // Better approach: When index changes, if it's a move (not a reset), calculate all steps.
        // If index is -1 (Base), just snap or move to base.

        const newPos = getPositionVector(colorName, index, tokenId);
        const dist = currentPos.current.distanceTo(new Vector3(newPos.x, newPos.y, newPos.z));

        if (dist > 0.1) {
            // If it's a large jump (e.g. from base to start, or start to end), we might want intermediate steps?
            // For Ludo, usually we move 1 by 1 visually.
            // If we are at pos 5 and go to 8 (rolled 3), we want 6, 7, 8.

            // We can't easily know "previous index" without state.
            // Let's assume the store updates index instantly.
            // We can try to reconstruct the path if the distance is reasonable.
            // Or we can just move to the target.
            // BUT user wants "always face direction", so we need the path.

            // Let's use a simple heuristic:
            // If we are moving forward on the board, we can generate the path.
            // Since we don't have "prevIndex", we will just move to the final target for now,
            // BUT we will break it down into small segments if possible?
            // Actually, `useGameStore` updates position instantly.
            // To support step-by-step, we would need the store to provide the path or we calculate it.
            // Since we have `getPositionVector`, we can try to find the path from current visual position.
            // But mapping 3D pos back to index is hard.

            // ALTERNATIVE: Just move to the target. The rotation will face the target.
            // If the target is far (e.g. around a corner), straight line movement clips through board.
            // This is why we need waypoints.

            // Since I can't easily get the full path without previous index, 
            // I will implement a "smart move" that checks if we are cornering.
            // OR, I can just rely on the fact that `moveToken` in store updates position instantly.
            // If I want step-by-step, I should probably ask the store to animate?
            // No, UI should handle animation.

            // Let's try to infer previous index from current 3D position? Hard.
            // Let's just use the target position for now, but ensure rotation faces it.
            // To fix cornering, we really need the path.

            // Wait, I can store `prevIndex` in a ref!

        }
    }, [index, colorName, tokenId]);

    // Ref to store previous index to calculate path
    const prevIndexRef = useRef(index);

    useEffect(() => {
        if (!colorName) return;

        if (index !== prevIndexRef.current) {
            const start = prevIndexRef.current;
            const end = index;
            const queue: Vector3[] = [];

            // Check for Fight Participation
            const isAttacker = lastCapture?.attackerId === tokenId && (Date.now() - lastCapture.timestamp < 2000);
            const isDefender = lastCapture?.defenderId === tokenId && (Date.now() - lastCapture.timestamp < 2000);

            // Handle Base -> Start (Special Case)
            if (start === -1 && end === 0) {
                queue.push(new Vector3(getPositionVector(colorName, 0, tokenId).x, 1.7, getPositionVector(colorName, 0, tokenId).z));
            }
            // Handle Normal Move
            else if (start >= 0 && end > start) {
                for (let i = start + 1; i <= end; i++) {
                    const p = getPositionVector(colorName, i, tokenId);
                    queue.push(new Vector3(p.x, 1.7, p.z));
                }
            }
            else if (end === -1) {
                // Captured! Move to base.
                const p = getPositionVector(colorName, -1, tokenId);

                if (isDefender) {
                    // Delay movement for animation
                    setTimeout(() => {
                        setFightState('hit');
                        soundManager.play('FIGHT_HIT');

                        setTimeout(() => {
                            setFightState('none');
                            setTargetQueue([new Vector3(p.x, 1.7, p.z)]);
                            isMoving.current = true;
                        }, 600); // Duration of hit animation
                    }, 800); // Wait for attacker to arrive

                    prevIndexRef.current = index;
                    return; // Skip default queue setting
                } else {
                    queue.push(new Vector3(p.x, 1.7, p.z));
                }
            }

            setTargetQueue(queue);
            isMoving.current = true;
            prevIndexRef.current = index;

            // If attacker, we need to trigger animation AFTER movement
            if (isAttacker) {
                // We'll handle this in useFrame when queue empties
            }
        }
    }, [index, colorName, tokenId, lastCapture]);


    useFrame((state, delta) => {
        if (groupRef.current && targetQueue.length > 0) {
            const target = targetQueue[0];
            const speed = 8 * delta;
            const dist = currentPos.current.distanceTo(target);

            if (dist > 0.1) {
                // Move towards target
                const direction = new Vector3().subVectors(target, currentPos.current).normalize();
                const moveStep = direction.multiplyScalar(speed);

                // Rotate to face movement
                if (direction.lengthSq() > 0.001) {
                    const targetEuler = new THREE.Euler(0, Math.atan2(direction.x, direction.z) + Math.PI, 0);
                    targetRot.current.setFromEuler(targetEuler);
                }

                currentPos.current.add(moveStep);

                // Hop Effect
                const yOffset = Math.abs(Math.sin(state.clock.elapsedTime * 15)) * 0.5;
                groupRef.current.position.set(
                    currentPos.current.x,
                    currentPos.current.y + yOffset,
                    currentPos.current.z
                );
            } else {
                // Reached current waypoint
                currentPos.current.copy(target); // Snap

                // Remove from queue
                const newQueue = targetQueue.slice(1);
                setTargetQueue(newQueue);

                // Play Step Sound
                soundManager.play('MOVE');

                if (newQueue.length === 0) {
                    // Finished all moves
                    isMoving.current = false;
                    setLandingEffect(true);
                    setTimeout(() => setLandingEffect(false), 500);

                    // Check if we should attack
                    if (lastCapture?.attackerId === tokenId && (Date.now() - lastCapture.timestamp < 2000)) {
                        setFightState('attacking');
                        setTimeout(() => setFightState('none'), 500);
                    }
                }
            }

            // Smooth Rotation
            currentRot.current.slerp(targetRot.current, 15 * delta);
            groupRef.current.quaternion.copy(currentRot.current);

        } else if (groupRef.current) {
            // Fight Animations
            if (fightState === 'attacking') {
                attackProgress.current += delta * 10;
                // Lunge forward and back
                const lunge = Math.sin(attackProgress.current) * 0.5;
                // We need to lunge in the direction we are facing
                const forward = new Vector3(0, 0, 1).applyQuaternion(groupRef.current.quaternion);
                const lungePos = currentPos.current.clone().add(forward.multiplyScalar(lunge > 0 ? lunge : 0));

                groupRef.current.position.copy(lungePos);
                groupRef.current.position.y = 1.7; // Keep on ground
            }
            else if (fightState === 'hit') {
                hitProgress.current += delta * 15;
                // Bounce and shake
                const bounce = Math.abs(Math.sin(hitProgress.current)) * 0.5;
                const shake = Math.sin(hitProgress.current * 2) * 0.2;

                groupRef.current.position.y = 1.7 + bounce;
                groupRef.current.rotation.z = shake;

                // Reset rotation when done
                if (hitProgress.current > Math.PI * 2) {
                    groupRef.current.rotation.z = 0;
                }
            }
            // Idle Animation
            else if (isMovable && !isMoving.current) {
                groupRef.current.position.y = 1.7 + (Math.sin(state.clock.elapsedTime * 5) * 0.1);
                // Ensure position is reset to currentPos
                groupRef.current.position.x = currentPos.current.x;
                groupRef.current.position.z = currentPos.current.z;
            } else {
                groupRef.current.position.y = 1.7;
                groupRef.current.position.x = currentPos.current.x;
                groupRef.current.position.z = currentPos.current.z;
            }

            // Ensure we face the next position even when idle
            if (!isMoving.current && colorName && index < 56 && fightState === 'none') {
                // Calculate direction to next tile
                const nextPos = getPositionVector(colorName, index + 1, tokenId);
                const currentVec = new Vector3(currentPos.current.x, 0, currentPos.current.z);
                const nextVec = new Vector3(nextPos.x, 0, nextPos.z);
                const direction = new Vector3().subVectors(nextVec, currentVec).normalize();

                if (direction.lengthSq() > 0.001) {
                    const targetEuler = new THREE.Euler(0, Math.atan2(direction.x, direction.z) + Math.PI, 0);
                    const targetQuaternion = new THREE.Quaternion().setFromEuler(targetEuler);
                    // Smoothly rotate to idle direction
                    groupRef.current.quaternion.slerp(targetQuaternion, 5 * delta);
                }
            }
        }
    });

    return (
        <group ref={groupRef} onClick={(e) => {
            e.stopPropagation();
            onClick?.();
        }} scale={finalScale}>
            <group position={[0, 0, 0]}>
                <SoldierModel animation={isMoving.current ? "Run" : (isMovable ? "Idle" : "Idle")} color={color} />
            </group>

            {/* Selection Indicator */}
            {isMovable && !isMoving.current && (
                <group>
                    {/* Arrow */}
                    <mesh position={[0, 3, 0]}>
                        <coneGeometry args={[0.3, 0.6, 4]} />
                        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
                    </mesh>
                    {/* Pulsing Ring at feet */}
                    <Ring args={[0.5, 0.7, 32]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                        <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
                    </Ring>
                    <Sparkles count={10} scale={1.5} size={4} speed={0.4} opacity={0.8} color="#fbbf24" position={[0, 1, 0]} />
                    <pointLight distance={2} intensity={2} color="#fbbf24" position={[0, 2, 0]} />
                </group>
            )}

            {/* Landing Effect */}
            {landingEffect && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                    <ringGeometry args={[0.3, 0.8, 32]} />
                    <meshBasicMaterial color="white" transparent opacity={0.5} />
                </mesh>
            )}
        </group>
    );
};

export default Character;
