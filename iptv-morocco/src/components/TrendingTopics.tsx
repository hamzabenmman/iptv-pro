'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Hash, RefreshCw } from 'lucide-react';

interface TrendingTopicsProps {
  topics: string[];
  onTopicClick: (topic: string) => void;
  activeTopic?: string | null;
  loading?: boolean;
}

// Assign colors based on topic position
const TOPIC_COLORS = [
  { bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/20', hover: 'hover:bg-brand-500/20 hover:text-brand-300' },
  { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', hover: 'hover:bg-blue-500/20 hover:text-blue-300' },
  { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', hover: 'hover:bg-purple-500/20 hover:text-purple-300' },
  { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', hover: 'hover:bg-green-500/20 hover:text-green-300' },
  { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', hover: 'hover:bg-rose-500/20 hover:text-rose-300' },
  { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', hover: 'hover:bg-cyan-500/20 hover:text-cyan-300' },
  { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', hover: 'hover:bg-amber-500/20 hover:text-amber-300' },
  { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', hover: 'hover:bg-indigo-500/20 hover:text-indigo-300' },
];

export default function TrendingTopics({ topics, onTopicClick, activeTopic, loading }: TrendingTopicsProps) {
  const handleClear = () => onTopicClick('');
  const [displayTopics, setDisplayTopics] = useState<string[]>(topics);

  useEffect(() => {
    setDisplayTopics(topics);
  }, [topics]);

  if (loading) {
    return (
      <div className="bg-dark-800/30 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-brand-400 animate-pulse" />
          <h3 className="text-white text-xs font-semibold uppercase tracking-wider">Trending</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 rounded-full bg-dark-700/50 animate-pulse shimmer-premium" style={{ width: `${60 + Math.random() * 60}px` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!displayTopics || displayTopics.length === 0) {
    return (
      <div className="bg-dark-800/30 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-brand-400" />
          <h3 className="text-white text-xs font-semibold uppercase tracking-wider">Trending</h3>
        </div>
        <p className="text-gray-500 text-xs">No trending topics right now</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-800/30 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-400" />
          <h3 className="text-white text-xs font-semibold uppercase tracking-wider">Trending Now</h3>
        </div>
        {activeTopic && (
          <button
            onClick={handleClear}
            className="text-[10px] text-gray-500 hover:text-brand-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {displayTopics.map((topic, i) => {
          const color = TOPIC_COLORS[i % TOPIC_COLORS.length];
          const isActive = activeTopic?.toLowerCase() === topic.toLowerCase();
          // Size varies based on position (first = biggest)
          const size = i < 3 ? 'text-xs' : 'text-[11px]';

          return (
            <button
              key={topic}
              onClick={() => onTopicClick(topic)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 ${
                isActive
                  ? 'bg-brand-500 text-dark-950 border-brand-500 shadow-lg shadow-brand-500/20 font-bold scale-105'
                  : `${color.bg} ${color.text} ${color.border} ${color.hover}`
              } ${size} font-medium`}
            >
              {isActive ? (
                <Hash className="w-3 h-3" />
              ) : (
                <span className={`w-1.5 h-1.5 rounded-full ${color.text.replace('text-', 'bg-')}`} />
              )}
              {topic}
            </button>
          );
        })}
      </div>

      {/* Source indicator */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <span className="text-[10px] text-gray-600">From live news</span>
        {displayTopics.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <RefreshCw className="w-2.5 h-2.5" />
            <span>Auto-updated</span>
          </div>
        )}
      </div>
    </div>
  );
}
