// src/components/archives/ContextItemRow.tsx - Individual context item with checkbox and edit
import React, { useState } from 'react';
import { CheckSquare, Square, Edit2, Trash2, Save, X } from 'lucide-react';
import type { ArchiveContextItem } from '../../types/archives';

interface ContextItemRowProps {
  item: ArchiveContextItem;
  onToggle: (checked: boolean) => void;
  onUpdate: (newValue: string) => void;
  onDelete: () => void;
}

export function ContextItemRow({ item, onToggle, onUpdate, onDelete }: ContextItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.context_value);

  function handleSave() {
    onUpdate(editValue);
    setIsEditing(false);
  }

  function handleCancel() {
    setEditValue(item.context_value);
    setIsEditing(false);
  }

  // Format field name for display
  const fieldName = item.context_field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-[#68a395] transition-colors">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(!item.use_for_context)}
          className="mt-1"
        >
          {item.use_for_context ? (
            <CheckSquare size={20} className="text-[#68a395]" />
          ) : (
            <Square size={20} className="text-gray-400" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-[#5a4033]">{fieldName}</h4>
            {item.suggested_by_lila && (
              <span className="text-xs bg-[#f0f8f6] text-[#68a395] px-2 py-0.5 rounded-full">
                ✨ From LiLa
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full p-3 border-2 border-[#68a395] rounded-lg outline-none resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-[#68a395] text-white rounded-lg text-sm hover:bg-[#5a9285] transition-colors flex items-center gap-1"
                >
                  <Save size={14} /> Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 bg-gray-200 text-[#5a4033] rounded-lg text-sm hover:bg-gray-300 transition-colors flex items-center gap-1"
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[#5a4033] leading-relaxed">{item.context_value}</p>
          )}

          {/* Metadata */}
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            <span>Added: {item.added_by}</span>
            <span>•</span>
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 size={16} className="text-[#68a395]" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={16} className="text-red-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
