'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface EarthProps {
  children?: React.ReactNode;
}

export default function Earth({ children }: EarthProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Load textures using useLoader (this handles async loading properly)
  const [earthTexture, normalTexture] = useLoader(THREE.TextureLoader, [
    '/textures/earth_diffuse.jpg',
    '/textures/earth_normal.jpg',
  ]);

  // Configure textures
  useMemo(() => {
    if (earthTexture) {
      earthTexture.wrapS = THREE.RepeatWrapping;
      earthTexture.wrapT = THREE.ClampToEdgeWrapping;
      earthTexture.colorSpace = THREE.SRGBColorSpace;
    }
    if (normalTexture) {
      normalTexture.wrapS = THREE.RepeatWrapping;
      normalTexture.wrapT = THREE.ClampToEdgeWrapping;
    }
  }, [earthTexture, normalTexture]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          normalMap={normalTexture}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          roughness={0.8}
          metalness={0.2}
          emissive={new THREE.Color(0x0a1a2e)}
          emissiveIntensity={0.3}
        />
      </mesh>
      {children}
    </group>
  );
}
