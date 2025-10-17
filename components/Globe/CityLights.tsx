'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { latLngToVector3 } from '@/lib/coordConverter';

// Major cities data for demo
const majorCities = [
  { name: 'New York', lat: 40.7128, lng: -74.006 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Shanghai', lat: 31.2304, lng: 121.4737 },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173 },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
  { name: 'Seoul', lat: 37.5665, lng: 126.978 },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
  { name: 'Bangkok', lat: 13.7563, lng: 100.5018 },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
  { name: 'Toronto', lat: 43.6532, lng: -79.3832 },
  { name: 'Berlin', lat: 52.52, lng: 13.405 },
  { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
  { name: 'Rome', lat: 41.9028, lng: 12.4964 },
];

export default function CityLights() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const color = new THREE.Color(0xffb347);

    majorCities.forEach((city) => {
      const pos = latLngToVector3(city.lat, city.lng, 2.01);
      positions.push(pos.x, pos.y, pos.z);

      // Slight color variation
      const variation = Math.random() * 0.1 + 0.95;
      colors.push(color.r * variation, color.g * variation, color.b * variation);
    });

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
    };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      // Pulse effect
      const time = state.clock.getElapsedTime();
      const scale = Math.sin(time * 2) * 0.3 + 0.8;
      (pointsRef.current.material as THREE.PointsMaterial).size = 0.05 * scale;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
