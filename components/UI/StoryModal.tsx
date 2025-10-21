'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { GeolocatedStory } from '@/lib/types';

interface StoryModalProps {
  story: GeolocatedStory | null;
  isOpen: boolean;
  onClose: () => void;
}

const categoryColors = {
  politics: '#4ecdc4',
  conflict: '#ff6b6b',
  environment: '#95e1d3',
  tech: '#f9ca24',
  health: '#6c5ce7',
  economy: '#fd79a8',
};

export default function StoryModal({ story, isOpen, onClose }: StoryModalProps) {
  if (!story) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-20 right-8 w-full max-w-xl max-h-[85vh] overflow-y-auto z-50"
          >
            <div className="bg-[#0a1128]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Category badge with color */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: categoryColors[story.category] }}
                />
                <span className="text-sm text-white/60 uppercase tracking-wider">
                  {story.category}
                </span>
                {story.urgency === 'breaking' && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30">
                    BREAKING NEWS
                  </span>
                )}
              </div>

              {/* Title */}
              <h2
                className="text-3xl font-bold mb-4"
                style={{ color: categoryColors[story.category] }}
              >
                {story.title}
              </h2>

              {/* Meta info */}
              <div className="flex items-center gap-6 text-sm text-white/50 mb-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
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
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {new Date(story.publishedAt).toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                  {story.source}
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <h3 className="text-white/80 font-semibold mb-2 text-sm uppercase tracking-wide">
                  Summary
                </h3>
                <p className="text-white/90 text-lg leading-relaxed">
                  {story.summary}
                </p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-white/80 font-semibold mb-2 text-sm uppercase tracking-wide">
                  Full Story
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {story.description}
                </p>
              </div>

              {/* Coordinates */}
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <p className="text-white/50 text-sm">
                  Geographic Coordinates: {story.coords.lat.toFixed(4)}°,{' '}
                  {story.coords.lng.toFixed(4)}°
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <a
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-6 py-3 text-center text-white font-medium transition-all"
                >
                  Read Full Article
                </a>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
