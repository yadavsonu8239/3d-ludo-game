import React, { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

const WaterMaterial = shaderMaterial(
  {
    time: 0,
    colorStart: new THREE.Color('#00aaff'),
    colorEnd: new THREE.Color('#0055aa'),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float time;
    uniform vec3 colorStart;
    uniform vec3 colorEnd;
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      float wave = sin(uv.x * 10.0 + time) * 0.5 + 0.5;
      vec3 color = mix(colorStart, colorEnd, wave);
      gl_FragColor = vec4(color, 0.8);
    }
  `
);

extend({ WaterMaterial });

const Water: React.FC = () => {
  const ref = useRef<any>(null);

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.time += delta;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
      <planeGeometry args={[100, 100, 32, 32]} />
      {/* @ts-ignore */}
      <waterMaterial ref={ref} transparent />
    </mesh>
  );
};

export default Water;
