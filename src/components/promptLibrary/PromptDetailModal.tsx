// src/components/promptLibrary/PromptDetailModal.tsx - Full prompt view with copy, archive, delete
import React, { useState } from 'react';
import { X, Copy, Star, Archive as ArchiveIcon, Trash2, CheckCircle } from 'lucide-react';
import { promptLibraryService } from '../../lib/promptLibraryService';
import type { PersonalPrompt } from '../../types/archives';

interface PromptDetailModalProps {
  prompt: PersonalPrompt;
  onClose: () => void;
  onUpdate: () => void;
}

const platformColors: Record<string, string> = {
  chatgpt: 'bg-green-100 text-green-700',
  claude: 'bg-orange-100 text-orange-700',
  gemini: 'bg-blue-100 text-blue-700',
  copilot: 'bg-purple-100 text-purple-700',
  perplexity: 'bg-cyan-100 text-cyan-700',
  generic: 'bg-gray-100 text-gray-700'
};

export function PromptDetailModal({ prompt, onClose, onUpdate }: PromptDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt.optimized_prompt);
    await promptLibraryService.incrementUsage(prompt.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onUpdate();
  }

  async function handleToggleFavorite() {
    await promptLibraryService.toggleFavorite(prompt.id, prompt.is_favorite);
    onUpdate();
  }

  async function handleArchive() {
    if (prompt.is_archived) {
      await promptLibraryService.unarchivePrompt(prompt.id);
    } else {
      await promptLibraryService.archivePrompt(prompt.id);
    }
    onClose();
    onUpdate();
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await promptLibraryService.deletePrompt(prompt.id);
    onClose();
    onUpdate();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-[#5a4033]">
                  {prompt.prompt_title}
                </h2>
                <button onClick={handleToggleFavorite}>
                  <Star
                    size={24}
                    className={prompt.is_favorite ? 'text-[#d4a661]' : 'text-gray-300'}
                    fill={prompt.is_favorite ? '#d4a661' : 'none'}
                  />
                </button>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className={`px-3 py-1 rounded-full font-medium ${platformColors[prompt.target_platform]}`}>
                  {prompt.target_platform.toUpperCase()}
                </span>
                <span className="text-gray-600">
                  Used {prompt.times_used} {prompt.times_used === 1 ? 'time' : 'times'}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  Created {new Date(prompt.created_at).toLocaleDateString()}
                </span>
                {prompt.is_archived && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                      📦 Archived
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#f0f8f6] text-[#68a395] rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Original Request */}
          {prompt.original_request && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Original Request:
              </h3>
              <div className="p-4 bg-gray-50 rounded-xl text-[#5a4033] italic">
                "{prompt.original_request}"
              </div>
            </div>
          )}

          {/* Optimized Prompt */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Optimized Prompt:
            </h3>
            <div className="p-4 bg-[#f0f8f6] border-2 border-[#68a395] rounded-xl text-[#5a4033] whitespace-pre-wrap leading-relaxed">
              {prompt.optimized_prompt}
            </div>
          </div>

          {/* Context Used */}
          {prompt.folders_used && prompt.folders_used.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Context Used:
              </h3>
              <div className="flex flex-wrap gap-2">
                {prompt.folders_used.map(folder => (
                  <span
                    key={folder}
                    className="px-3 py-1 bg-white border border-[#68a395] text-[#68a395] rounded-lg text-sm"
                  >
                    📁 {folder}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {prompt.prompt_description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Notes:
              </h3>
              <p className="text-[#5a4033]">{prompt.prompt_description}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 min-w-[200px] py-3 px-6 bg-[#68a395] text-white rounded-xl font-medium hover:bg-[#5a9285] transition-colors flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle size={20} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={20} />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>

            <button
              onClick={handleArchive}
              className="py-3 px-6 bg-white border-2 border-gray-300 text-[#5a4033] rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <ArchiveIcon size={20} />
              {prompt.is_archived ? 'Unarchive' : 'Archive'}
            </button>

            <button
              onClick={handleDelete}
              className={`py-3 px-6 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                confirmDelete
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white border-2 border-red-300 text-red-600 hover:bg-red-50'
              }`}
            >
              <Trash2 size={20} />
              {confirmDelete ? 'Confirm Delete' : 'Delete'}
            </button>

            {confirmDelete && (
              <button
                onClick={() => setConfirmDelete(false)}
                className="py-3 px-6 bg-gray-200 text-[#5a4033] rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          {confirmDelete && (
            <p className="mt-3 text-sm text-red-600 text-center">
              ⚠️ This will permanently delete this prompt. Are you sure?
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
