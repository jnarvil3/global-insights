'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { latLngToVector3 } from '@/lib/coordConverter';
import type { GeolocatedStory } from '@/lib/types';

const BEAM_COLORS: Record<string, THREE.Color> = {
  politics: new THREE.Color(0x4ecdc4),
  conflict: new THREE.Color(0xff6b6b),
  environment: new THREE.Color(0x95e1d3),
  tech: new THREE.Color(0xf9ca24),
  health: new THREE.Color(0x6c5ce7),
  economy: new THREE.Color(0xfd79a8),
};

interface NewsBeamProps {
  story: GeolocatedStory;
  onClick?: (story: GeolocatedStory) => void;
}

export default function NewsBeam({ story, onClick }: NewsBeamProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const baseColor = BEAM_COLORS[story.category] || new THREE.Color(0x4ecdc4);
  const tipColor = new THREE.Color(0xffffff);

  // Create beam geometry
  const { geometry, position } = useMemo(() => {
    const basePos = latLngToVector3(story.coords.lat, story.coords.lng, 2.01);

    // Create beam from surface to peak
    const height = 1.5;
    const segments = 20;
    const positions: number[] = [];
    const uvs: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const radius = 0.02 * (1 - t * 0.7); // Taper towards tip

      // Create ring
      const segmentsAround = 8;
      for (let j = 0; j <= segmentsAround; j++) {
        const angle = (j / segmentsAround) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = t * height;

        positions.push(x, y, z);
        uvs.push(j / segmentsAround, t);
      }
    }

    const geometry = new THREE.BufferGeometry();
    const positionArray = new Float32Array(positions);
    const uvArray = new Float32Array(uvs);

    geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));

    // Create indices for triangle strip
    const indices: number[] = [];
    const verticesPerRing = 9;
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < verticesPerRing - 1; j++) {
        const a = i * verticesPerRing + j;
        const b = a + verticesPerRing;
        const c = a + 1;
        const d = b + 1;

        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return { geometry, position: basePos };
  }, [story.coords.lat, story.coords.lng]);

  // Shader material for beam
  const material = useMemo(() => {
    const vertexShader = `
      uniform float time;
      varying vec2 vUv;
      varying float vHeight;

      void main() {
        vUv = uv;
        vHeight = position.y / 1.5;

        vec3 pos = position;
        float wave = sin(time * 2.0 + position.y * 3.0) * 0.01;
        pos.x += wave;
        pos.z += wave;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 baseColor;
      uniform vec3 tipColor;
      uniform float time;
      uniform float opacity;
      uniform float hoverIntensity;
      varying vec2 vUv;
      varying float vHeight;

      void main() {
        vec3 color = mix(baseColor, tipColor, vHeight);

        float glow = 1.0 - abs(vUv.x - 0.5) * 2.0;
        glow = pow(glow, 2.0);

        float pulse = sin(time * 1.5 + vHeight * 2.0) * 0.1 + 0.9;
        pulse *= (1.0 + hoverIntensity * 0.3);

        color *= glow * pulse;

        float alpha = smoothstep(0.0, 0.1, vHeight) * smoothstep(1.0, 0.9, vHeight);
        alpha *= glow * opacity;

        gl_FragColor = vec4(color, alpha);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: {
        baseColor: { value: baseColor },
        tipColor: { value: tipColor },
        time: { value: 0 },
        opacity: { value: story.urgency === 'breaking' ? 1.0 : 0.7 },
        hoverIntensity: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, [baseColor, tipColor, story.urgency]);

  useFrame((state) => {
    if (meshRef.current) {
      material.uniforms.time.value = state.clock.getElapsedTime();
      material.uniforms.hoverIntensity.value = THREE.MathUtils.lerp(
        material.uniforms.hoverIntensity.value,
        hovered ? 1 : 0,
        0.1
      );
    }

    if (groupRef.current && hovered) {
      groupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(groupRef.current.scale.x, 1.1, 0.1)
      );
    } else if (groupRef.current) {
      groupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(groupRef.current.scale.x, 1, 0.1)
      );
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(story);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      />
    </group>
  );
}
