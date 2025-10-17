'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Import shader code as strings
const vertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform vec3 glowColor;
uniform float opacity;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDirection = normalize(-vPosition);
  float intensity = pow(1.0 - dot(viewDirection, vNormal), 2.5);

  float pulse = sin(vPosition.x * 10.0 + vPosition.y * 10.0) * 0.05 + 0.95;
  intensity *= pulse;

  vec3 glow = glowColor * intensity;
  float alpha = intensity * opacity;

  gl_FragColor = vec4(glow, alpha);
}
`;

export default function Atmosphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          glowColor: { value: new THREE.Color(0x00d9ff) },
          opacity: { value: 0.1 },
        },
        vertexShader,
        fragmentShader,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle rotation slightly faster than Earth
      meshRef.current.rotation.y += 0.0012;
    }
  });

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <sphereGeometry args={[2.15, 64, 64]} />
    </mesh>
  );
}
