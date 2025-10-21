import React, { useState } from 'react';
import { ColorPickerModal } from './ColorPickerModal';
import { supabase } from '../../lib/supabase';

interface AddFamilyMemberModalProps {
  familyId: string;
  onClose: () => void;
  onCreated: (memberId: string, memberName: string) => void;
}

export function AddFamilyMemberModal({ familyId, onClose, onCreated }: AddFamilyMemberModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#68a395');
  const [selectedColorName, setSelectedColorName] = useState('Sage Teal');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startInterview, setStartInterview] = useState(true);

  async function handleSave() {
    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }

    setSaving(true);
    try {
      // Create the family member
      const { data: newMember, error: memberError } = await supabase
        .from('family_members')
        .insert([
          {
            family_id: familyId,
            name: name.trim(),
            relationship: 'family', // Default relationship
            is_active: true
          }
        ])
        .select()
        .single();

      if (memberError) throw memberError;

      // Wait a moment for the trigger to create the folder
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update the folder color
      const { error: folderError } = await supabase
        .from('archive_folders')
        .update({ color_hex: selectedColor })
        .eq('member_id', newMember.id);

      if (folderError) console.error('Error updating folder color:', folderError);

      // Success!
      onCreated(newMember.id, newMember.name);
    } catch (error) {
      console.error('Error creating family member:', error);
      alert('Error creating family member. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#5a4033]">
                  Add Family Member
                </h2>
                <p className="text-sm text-gray-600">
                  Add someone to your family archives
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-3xl text-gray-400 hover:text-[#5a4033] transition-colors leading-none"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-[#5a4033] mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name (or pet's name!)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#68a395] transition-colors text-[#5a4033]"
                autoFocus
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-semibold text-[#5a4033] mb-2">
                Folder Color
              </label>
              <button
                onClick={() => setShowColorPicker(true)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-[#68a395] transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <div className="text-left">
                    <p className="font-medium text-[#5a4033]">{selectedColorName}</p>
                    <p className="text-sm text-gray-500">{selectedColor}</p>
                  </div>
                </div>
                <span className="text-xl text-gray-400 group-hover:text-[#68a395] transition-colors">🎨</span>
              </button>
            </div>

            {/* Start Interview Option */}
            <div className="bg-[#f0f8f6] rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={startInterview}
                  onChange={(e) => setStartInterview(e.target.checked)}
                  className="mt-1 w-5 h-5 text-[#68a395] rounded focus:ring-[#68a395]"
                />
                <div>
                  <p className="font-medium text-[#5a4033]">
                    Start LiLa Interview
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Get help from LiLa to fill in their context through a friendly conversation
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-medium text-[#5a4033] hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex-1 px-6 py-3 bg-[#68a395] text-white rounded-xl font-medium hover:bg-[#5a9285] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : startInterview ? 'Create & Interview' : 'Create'}
            </button>
          </div>
        </div>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <ColorPickerModal
          currentColor={selectedColor}
          onSelectColor={(color, name) => {
            setSelectedColor(color);
            setSelectedColorName(name);
            setShowColorPicker(false);
          }}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </>
  );
}
