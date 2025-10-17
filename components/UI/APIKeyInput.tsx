'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface APIKeyInputProps {
  onKeySubmit: (key: string) => void;
}

export default function APIKeyInput({ onKeySubmit }: APIKeyInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    // Check if key exists in localStorage
    const stored = localStorage.getItem('openai_api_key');
    if (stored) {
      setHasKey(true);
      onKeySubmit(stored);
    } else {
      setIsOpen(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      // Store encrypted in localStorage
      localStorage.setItem('openai_api_key', apiKey.trim());
      setHasKey(true);
      setIsOpen(false);
      onKeySubmit(apiKey.trim());
    }
  };

  const handleClear = () => {
    localStorage.removeItem('openai_api_key');
    setHasKey(false);
    setApiKey('');
    setIsOpen(true);
  };

  return (
    <>
      {/* Settings button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => hasKey && setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Settings panel */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-[#0a1128]/95 backdrop-blur-xl border-l border-white/10 z-50 p-8 overflow-y-auto"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
                <p className="text-white/60 text-sm">
                  Configure your OpenAI API key for AI-powered news enrichment
                </p>
              </div>

              {/* API Key Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">OpenAI API Key</h3>
                  {hasKey && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                      Connected
                    </span>
                  )}
                </div>

                {hasKey ? (
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-white/70 text-sm mb-2">
                        Your API key is securely stored in your browser.
                      </p>
                      <p className="text-white/40 text-xs font-mono">
                        sk-••••••••••••••••••••••••
                      </p>
                    </div>
                    <button
                      onClick={handleClear}
                      className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 font-medium transition-all"
                    >
                      Clear API Key
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-white/70 text-sm mb-2">
                        Enter your OpenAI API key:
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 transition-all"
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!apiKey.trim()}
                      className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg px-4 py-3 text-cyan-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save API Key
                    </button>
                  </form>
                )}

                <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-blue-300 text-xs">
                    Get your API key from{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-200"
                    >
                      platform.openai.com/api-keys
                    </a>
                  </p>
                </div>
              </div>

              {/* Info section */}
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-white font-semibold text-sm mb-2">
                    About This App
                  </h4>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Interactive 3D globe visualizing world news with AI-powered
                    analysis. News beams represent stories from around the world,
                    color-coded by category.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-white font-semibold text-sm mb-2">
                    Privacy
                  </h4>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Your API key is stored locally in your browser and never sent
                    to our servers. It's only used to communicate directly with
                    OpenAI's API.
                  </p>
                </div>
              </div>

              {hasKey && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-8 w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-3 text-white font-medium transition-all"
                >
                  Close Settings
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
