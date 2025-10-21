import React, { useState } from 'react';
import { X, Check, Search } from 'lucide-react';
import { familyMemberColors } from '../../styles/colors';

interface ColorPickerModalProps {
  currentColor: string;
  onSelectColor: (colorHex: string, colorName: string) => void;
  onClose: () => void;
}

export function ColorPickerModal({ currentColor, onSelectColor, onClose }: ColorPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);

  // Get unique color families
  const colorFamilies = Array.from(new Set(familyMemberColors.map(c => c.family)));

  // Filter colors
  const filteredColors = familyMemberColors.filter(colorItem => {
    const matchesSearch = !searchTerm ||
      colorItem.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFamily = !selectedFamily || colorItem.family === selectedFamily;
    return matchesSearch && matchesFamily;
  });

  // Group colors by family for organized display
  const colorsByFamily = colorFamilies.reduce((acc, family) => {
    acc[family] = filteredColors.filter(c => c.family === family);
    return acc;
  }, {} as Record<string, typeof familyMemberColors>);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#5a4033] mb-1">
                Choose a Color
              </h2>
              <p className="text-gray-600">
                Select a color to personalize this folder
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-[#5a4033]" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search colors... (e.g., 'sage', 'warm', 'ocean')"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#68a395] transition-colors"
            />
          </div>

          {/* Family Filter Tabs */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedFamily(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !selectedFamily
                  ? 'bg-[#68a395] text-white'
                  : 'bg-gray-100 text-[#5a4033] hover:bg-gray-200'
              }`}
            >
              All Colors
            </button>
            {colorFamilies.map(family => (
              <button
                key={family}
                onClick={() => setSelectedFamily(family)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  selectedFamily === family
                    ? 'bg-[#68a395] text-white'
                    : 'bg-gray-100 text-[#5a4033] hover:bg-gray-200'
                }`}
              >
                {family === 'brand' ? 'Brand' : `${family}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Color Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedFamily ? (
            // Single family view
            <div>
              <h3 className="text-lg font-semibold text-[#5a4033] mb-4 capitalize">
                {selectedFamily === 'brand' ? 'Brand Colors' : `${selectedFamily} Family`}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {colorsByFamily[selectedFamily]?.map((colorItem) => (
                  <ColorSwatch
                    key={colorItem.name}
                    color={colorItem.color}
                    name={colorItem.name}
                    isSelected={currentColor === colorItem.color}
                    onClick={() => onSelectColor(colorItem.color, colorItem.name)}
                  />
                ))}
              </div>
            </div>
          ) : (
            // All families organized view
            <div className="space-y-6">
              {colorFamilies.map(family => {
                const colors = colorsByFamily[family];
                if (!colors || colors.length === 0) return null;

                return (
                  <div key={family}>
                    <h3 className="text-lg font-semibold text-[#5a4033] mb-3 capitalize">
                      {family === 'brand' ? 'Brand Colors' : `${family} Family`}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {colors.map((colorItem) => (
                        <ColorSwatch
                          key={colorItem.name}
                          color={colorItem.color}
                          name={colorItem.name}
                          isSelected={currentColor === colorItem.color}
                          onClick={() => onSelectColor(colorItem.color, colorItem.name)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredColors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">No colors found</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFamily(null);
                }}
                className="text-[#68a395] hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl border-2 border-gray-300"
                style={{ backgroundColor: currentColor }}
              />
              <div>
                <p className="text-sm text-gray-600">Current Color</p>
                <p className="font-medium text-[#5a4033]">{currentColor}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#68a395] text-white rounded-xl font-medium hover:bg-[#5a9285] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual Color Swatch Component
interface ColorSwatchProps {
  color: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
}

function ColorSwatch({ color, name, isSelected, onClick }: ColorSwatchProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-all"
    >
      {/* Color Circle */}
      <div className="relative">
        <div
          className={`w-16 h-16 rounded-xl shadow-md transition-all group-hover:scale-110 ${
            isSelected ? 'ring-4 ring-[#68a395] ring-offset-2' : ''
          }`}
          style={{ backgroundColor: color }}
        />
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-1">
              <Check size={20} className="text-[#68a395]" strokeWidth={3} />
            </div>
          </div>
        )}
      </div>

      {/* Color Name */}
      <p className="mt-2 text-xs text-center text-[#5a4033] font-medium line-clamp-2">
        {name}
      </p>

      {/* Hex Code (on hover) */}
      <p className="mt-1 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
        {color}
      </p>
    </button>
  );
}
