'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Earth from './Globe/Earth';
import Atmosphere from './Globe/Atmosphere';
import StoryMarkers from './Globe/StoryMarkers';
import NewsBeam from './Globe/NewsBeam';
import type { GeolocatedStory } from '@/lib/types';

interface SceneProps {
  stories: GeolocatedStory[];
  onStoryClick?: (story: GeolocatedStory) => void;
}

function SceneContent({ stories, onStoryClick }: SceneProps) {
  return (
    <>
      {/* Lighting - increased brightness */}
      <ambientLight intensity={1.0} />
      <directionalLight position={[5, 3, 5]} intensity={2.5} />
      <directionalLight position={[-5, -3, -5]} intensity={1.5} />
      <pointLight position={[0, 5, 0]} intensity={1.2} color="#ffffff" />

      {/* Earth with rotating beams and markers */}
      <Earth>
        {/* Story markers (clickable dots) */}
        <StoryMarkers stories={stories} onStoryClick={onStoryClick} />

        {/* News beams */}
        {stories.map((story, index) => (
          <NewsBeam key={`${story.title}-${index}`} story={story} onClick={onStoryClick} />
        ))}
      </Earth>

      {/* Atmosphere (separate, doesn't rotate) */}
      <Atmosphere />

      {/* Background stars - reduced brightness */}
      <Stars
        radius={300}
        depth={50}
        count={5000}
        factor={1.5}
        saturation={0}
        fade
        speed={0.3}
      />

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={4}
        maxDistance={15}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        autoRotate={false}
      />
    </>
  );
}

export default function Scene({ stories, onStoryClick }: SceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: '#000000' }}
      >
        <Suspense fallback={null}>
          <SceneContent stories={stories} onStoryClick={onStoryClick} />
        </Suspense>
      </Canvas>
    </div>
  );
}
