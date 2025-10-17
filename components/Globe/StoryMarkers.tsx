'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { latLngToVector3 } from '@/lib/coordConverter';
import type { GeolocatedStory } from '@/lib/types';

interface StoryMarkersProps {
  stories: GeolocatedStory[];
  onStoryClick?: (story: GeolocatedStory) => void;
}

const categoryColors: Record<string, THREE.Color> = {
  politics: new THREE.Color(0x4ecdc4),
  conflict: new THREE.Color(0xff6b6b),
  environment: new THREE.Color(0x95e1d3),
  tech: new THREE.Color(0xf9ca24),
  health: new THREE.Color(0x6c5ce7),
  economy: new THREE.Color(0xfd79a8),
};

export default function StoryMarkers({ stories, onStoryClick }: StoryMarkersProps) {
  const groupRef = useRef<THREE.Group>(null);

  const markers = useMemo(() => {
    return stories.map((story, index) => ({
      story,
      position: latLngToVector3(story.coords.lat, story.coords.lng, 2.02),
      color: categoryColors[story.category] || new THREE.Color(0x4ecdc4),
      index,
    }));
  }, [stories]);

  useFrame((state) => {
    // Pulse effect for all markers
    const time = state.clock.getElapsedTime();
    const scale = Math.sin(time * 2) * 0.2 + 1.0;

    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.scale.setScalar(scale);

          // Breaking news pulse faster
          if (markers[i]?.story.urgency === 'breaking') {
            const breakingScale = Math.sin(time * 4) * 0.3 + 1.2;
            child.scale.setScalar(breakingScale);
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {markers.map(({ story, position, color, index }) => (
        <Marker
          key={`marker-${index}`}
          position={position}
          color={color}
          story={story}
          onClick={onStoryClick}
        />
      ))}
    </group>
  );
}

interface MarkerProps {
  position: THREE.Vector3;
  color: THREE.Color;
  story: GeolocatedStory;
  onClick?: (story: GeolocatedStory) => void;
}

function Marker({ position, color, story, onClick }: MarkerProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={position}
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
    >
      <sphereGeometry args={[0.04, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={hovered ? 1.0 : 0.9}
      />

      {/* Glow ring */}
      {hovered && (
        <mesh scale={[2, 2, 0.1]}>
          <ringGeometry args={[0.04, 0.06, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </mesh>
  );
}
