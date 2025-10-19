// src/components/archives/CoverPhotoUpload.tsx - Upload cover photo for folder
import React, { useState } from 'react';
import { X, Upload, Image } from 'lucide-react';

interface CoverPhotoUploadProps {
  folderId: string;
  currentPhotoUrl: string | null;
  onClose: () => void;
  onUploaded: () => void;
}

export function CoverPhotoUpload({
  folderId,
  currentPhotoUrl,
  onClose,
  onUploaded
}: CoverPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // TODO: Upload to Supabase Storage
      // For now, just show a message that this feature will be implemented
      alert('Cover photo upload will be connected to Supabase Storage. Preview shown for now.');

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      onUploaded();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#5a4033]">
            Upload Cover Photo
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <div className="aspect-video bg-gradient-to-br from-[#68a395] to-[#5a9285] rounded-xl overflow-hidden relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image size={64} className="text-white/50" />
              </div>
            )}
          </div>
        </div>

        {/* Upload Button */}
        <label className="block">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <div className="px-6 py-3 bg-[#68a395] text-white rounded-xl font-medium hover:bg-[#5a9285] transition-colors cursor-pointer text-center flex items-center justify-center gap-2">
            <Upload size={20} />
            {uploading ? 'Uploading...' : 'Choose Photo'}
          </div>
        </label>

        <p className="text-sm text-gray-600 mt-3 text-center">
          Recommended: 1200x600px or larger. Max 5MB.
        </p>
      </div>
    </div>
  );
}
