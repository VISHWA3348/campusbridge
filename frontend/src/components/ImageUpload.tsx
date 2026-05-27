'use client';

import React, { useState, useRef } from 'react';
import { Camera, X, Upload, Trash2 } from 'lucide-react';
import { getFileUrl } from '@/lib/api';

interface ImageUploadProps {
  currentImage?: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
}

export default function ImageUpload({ currentImage, onUpload, onRemove }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(getFileUrl(currentImage));
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPreview(getFileUrl(currentImage));
  }, [currentImage]);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else resolve(file);
          }, 'image/jpeg', 0.7);
        };
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);

      await onUpload(compressedFile);
    } catch (err) {
      console.error(err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
    setLoading(true);
    try {
      await onRemove();
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center sm:flex-row gap-8 mb-10">
      <div className="relative group">
        <div className="w-40 h-40 bg-slate-100 rounded-[2rem] overflow-hidden flex items-center justify-center border-4 border-white shadow-xl">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-12 h-12 text-slate-300" />
          )}
          {loading && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all"
        >
          <Upload className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center sm:text-left">
        <h4 className="text-lg font-black text-slate-900 mb-1">Profile Picture</h4>
        <p className="text-xs text-slate-400 font-medium mb-4">JPG, PNG or WebP. Max 5MB.</p>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-all"
          >
            Change Photo
          </button>
          {preview && (
            <button 
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 bg-red-50 text-red-500 text-xs font-black rounded-xl hover:bg-red-100 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          )}
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
}
