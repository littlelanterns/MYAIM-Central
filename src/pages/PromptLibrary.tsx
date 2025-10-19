// src/pages/PromptLibrary.tsx - Browse, search, and manage saved prompts
import React, { useState, useEffect } from 'react';
import { Search, Star, Archive } from 'lucide-react';
import { PromptCard } from '../components/promptLibrary/PromptCard';
import { PromptDetailModal } from '../components/promptLibrary/PromptDetailModal';
import { promptLibraryService } from '../lib/promptLibraryService';
import type { PersonalPrompt } from '../types/archives';

export default function PromptLibrary() {
  const [prompts, setPrompts] = useState<PersonalPrompt[]>([]);
  const [favorites, setFavorites] = useState<PersonalPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PersonalPrompt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'homework', name: 'Homework', icon: '📚' },
    { id: 'meals', name: 'Meals', icon: '🍽️' },
    { id: 'behavior', name: 'Behavior', icon: '💙' },
    { id: 'creative', name: 'Creative', icon: '🎨' },
    { id: 'schedule', name: 'Schedule', icon: '📅' },
    { id: 'communication', name: 'Communication', icon: '💬' },
    { id: 'parenting', name: 'Parenting', icon: '👨‍👩‍👧' },
    { id: 'learning', name: 'Learning', icon: '🎓' },
    { id: 'other', name: 'Other', icon: '📁' }
  ];

  useEffect(() => {
    loadPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  async function loadPrompts() {
    setLoading(true);
    try {
      const data = await promptLibraryService.getPrompts(showArchived);
      const favs = data.filter(p => p.is_favorite);
      setPrompts(data);
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = !searchTerm ||
      prompt.prompt_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !selectedCategory || prompt.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff4ec] to-[#d4e3d9] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#68a395] mb-2">
            📚 Prompt Library
          </h1>
          <p className="text-lg text-[#5a4033]">
            Your saved prompts, ready to copy and use
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-md">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search prompts by title or tag..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#68a395] transition-colors"
              />
            </div>

            {/* Archive Toggle */}
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                showArchived
                  ? 'bg-[#68a395] text-white'
                  : 'bg-gray-200 text-[#5a4033] hover:bg-gray-300'
              }`}
            >
              <Archive size={20} />
              {showArchived ? 'Hide' : 'Show'} Archived
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-[#68a395] text-white'
                  : 'bg-gray-100 text-[#5a4033] hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#68a395] text-white'
                    : 'bg-gray-100 text-[#5a4033] hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Favorites Section */}
        {!showArchived && favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#5a4033] mb-4 flex items-center gap-2">
              <Star size={24} className="text-[#d4a661]" fill="#d4a661" />
              Favorites
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map(prompt => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onClick={() => setSelectedPrompt(prompt)}
                  onRefresh={loadPrompts}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Prompts */}
        <div>
          <h2 className="text-2xl font-semibold text-[#5a4033] mb-4">
            {selectedCategory
              ? `${categories.find(c => c.id === selectedCategory)?.name} Prompts`
              : 'All Prompts'
            }
            <span className="text-gray-400 ml-2">({filteredPrompts.length})</span>
          </h2>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin text-4xl mb-4">✨</div>
              <p className="text-[#5a4033]">Loading your prompts...</p>
            </div>
          ) : filteredPrompts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-semibold text-[#5a4033] mb-2">
                No prompts yet!
              </h3>
              <p className="text-gray-600 mb-6">
                Start optimizing prompts with LiLa and save them here
              </p>
              <button
                onClick={() => window.location.href = '/lila-optimizer'}
                className="px-6 py-3 bg-[#68a395] text-white rounded-xl font-medium hover:bg-[#5a9285] transition-colors"
              >
                Open LiLa Optimizer
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrompts.map(prompt => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onClick={() => setSelectedPrompt(prompt)}
                  onRefresh={loadPrompts}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPrompt && (
        <PromptDetailModal
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
          onUpdate={loadPrompts}
        />
      )}
    </div>
  );
}
