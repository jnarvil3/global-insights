'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import APIKeyInput from '@/components/UI/APIKeyInput';
import TimelineCarousel from '@/components/UI/TimelineCarousel';
import StoryModal from '@/components/UI/StoryModal';
import type { GeolocatedStory } from '@/lib/types';

// Dynamic import to avoid SSR issues with Three.js
const Scene = dynamic(() => import('@/components/Scene'), { ssr: false });

export default function Home() {
  const [stories, setStories] = useState<GeolocatedStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<GeolocatedStory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Fetch news on mount
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setIsLoading(true);

      // Use streaming API for progressive loading
      const response = await fetch('/api/news?stream=true');

      if (!response.body) {
        // Fallback to non-streaming
        const data = await response.json();
        if (data.success) {
          setStories(data.stories);
        }
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const loadedStories: GeolocatedStory[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const message = JSON.parse(line);

            if (message.type === 'story') {
              loadedStories.push(message.data);
              setStories([...loadedStories]); // Update state with new story

              // Hide loading overlay after first story
              if (loadedStories.length === 1) {
                setIsLoading(false);
              }
            } else if (message.type === 'complete') {
              console.log('Streaming complete:', message.data);
            } else if (message.type === 'error') {
              console.error('Streaming error:', message.data);
            }
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      setIsLoading(false);
    }
  };

  const handleStoryClick = (story: GeolocatedStory) => {
    setSelectedStory(story);
    setIsModalOpen(true);
  };

  const handleAPIKeySubmit = (key: string) => {
    setApiKey(key);
  };

  return (
    <main className="w-screen h-screen relative">
      {/* API Key Input */}
      <APIKeyInput onKeySubmit={handleAPIKeySubmit} />

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Loading global news...</p>
          </div>
        </div>
      )}

      {/* 3D Globe Scene */}
      {!isLoading && (
        <>
          <Scene stories={stories} onStoryClick={handleStoryClick} />

          {/* Title overlay */}
          <div className="fixed top-4 left-4 z-10">
            <h1 className="text-4xl font-bold text-white mb-1">
              News Globe
            </h1>
            <p className="text-white/60 text-sm">
              {stories.length} stories from around the world
            </p>
          </div>

          {/* Legend */}
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="glass rounded-full px-6 py-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#4ecdc4]" />
                <span className="text-white/80 text-xs">Politics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff6b6b]" />
                <span className="text-white/80 text-xs">Conflict</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#95e1d3]" />
                <span className="text-white/80 text-xs">Environment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f9ca24]" />
                <span className="text-white/80 text-xs">Tech</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#6c5ce7]" />
                <span className="text-white/80 text-xs">Health</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#fd79a8]" />
                <span className="text-white/80 text-xs">Economy</span>
              </div>
            </div>
          </div>

          {/* Controls hint */}
          <div className="fixed bottom-4 left-4 z-10 glass rounded-lg px-4 py-2">
            <p className="text-white/60 text-xs">
              Click and drag to rotate • Scroll to zoom • Click beams for details
            </p>
          </div>

          {/* Timeline Carousel */}
          <TimelineCarousel stories={stories} onStorySelect={handleStoryClick} />

          {/* Story Modal */}
          <StoryModal
            story={selectedStory}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </>
      )}
    </main>
  );
}
