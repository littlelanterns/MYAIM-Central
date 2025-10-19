// src/components/promptLibrary/PromptCard.tsx - Individual prompt card
import React from 'react';
import { Star, Copy, Archive as ArchiveIcon } from 'lucide-react';
import type { PersonalPrompt } from '../../types/archives';

interface PromptCardProps {
  prompt: PersonalPrompt;
  onClick: () => void;
  onRefresh: () => void;
}

const platformColors: Record<string, string> = {
  chatgpt: 'bg-green-100 text-green-700',
  claude: 'bg-orange-100 text-orange-700',
  gemini: 'bg-blue-100 text-blue-700',
  copilot: 'bg-purple-100 text-purple-700',
  perplexity: 'bg-cyan-100 text-cyan-700',
  generic: 'bg-gray-100 text-gray-700'
};

export function PromptCard({ prompt, onClick, onRefresh }: PromptCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 border-2 border-transparent hover:border-[#68a395]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#5a4033] flex-1 pr-2">
          {prompt.prompt_title}
        </h3>
        <Star
          size={20}
          className={prompt.is_favorite ? 'text-[#d4a661]' : 'text-gray-300'}
          fill={prompt.is_favorite ? '#d4a661' : 'none'}
        />
      </div>

      {/* Description */}
      {prompt.prompt_description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {prompt.prompt_description}
        </p>
      )}

      {/* Tags */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {prompt.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-[#f0f8f6] text-[#68a395] rounded-full"
            >
              #{tag}
            </span>
          ))}
          {prompt.tags.length > 3 && (
            <span className="text-xs px-2 py-1 text-gray-500">
              +{prompt.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${platformColors[prompt.target_platform]}`}>
            {prompt.target_platform.toUpperCase()}
          </span>
          {prompt.is_archived && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
              <ArchiveIcon size={12} />
              Archived
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Copy size={12} />
          <span>{prompt.times_used}</span>
        </div>
      </div>
    </div>
  );
}
