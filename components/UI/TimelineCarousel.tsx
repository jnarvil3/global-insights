'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import type { GeolocatedStory } from '@/lib/types';

interface TimelineCarouselProps {
  stories: GeolocatedStory[];
  onStorySelect: (story: GeolocatedStory) => void;
}

const categoryColors = {
  politics: 'bg-[#4ecdc4]',
  conflict: 'bg-[#ff6b6b]',
  environment: 'bg-[#95e1d3]',
  tech: 'bg-[#f9ca24]',
  health: 'bg-[#6c5ce7]',
  economy: 'bg-[#fd79a8]',
};

export default function TimelineCarousel({
  stories,
  onStorySelect,
}: TimelineCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 p-4">
      <div className="relative max-w-7xl mx-auto">
        {/* Scroll buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-12 py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {stories.map((story, index) => (
            <motion.div
              key={`${story.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-80 cursor-pointer group"
              onClick={() => onStorySelect(story)}
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all h-full">
                {/* Category badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`${
                      categoryColors[story.category]
                    } w-2 h-2 rounded-full`}
                  />
                  <span className="text-xs text-white/60 uppercase tracking-wider">
                    {story.category}
                  </span>
                  {story.urgency === 'breaking' && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
                      BREAKING
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                  {story.title}
                </h3>

                {/* Summary */}
                <p className="text-white/70 text-xs line-clamp-2 mb-2">
                  {story.summary}
                </p>

                {/* Location and time */}
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {story.location}
                  </span>
                  <span>
                    {new Date(story.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
