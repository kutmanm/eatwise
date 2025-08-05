'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GoImage } from 'react-icons/go';
import { CiKeyboard } from 'react-icons/ci';
import { IoArrowBack } from 'react-icons/io5';
import { Button } from '@/components/ui/Button';
import { mealsApi } from '@/lib/api';
import type { PhotoAnalysisResponse } from '@/types';
import { compressImage } from '@/lib/utils';

interface PhotoUploadProps {
  onAnalysisComplete: (analysis: PhotoAnalysisResponse) => void;
  onError: (error: string) => void;
  onManualEntry: () => void;
}

export function PhotoUpload({ onAnalysisComplete, onError, onManualEntry }: PhotoUploadProps) {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const processPhoto = useCallback(async (file: File) => {
    try {
      setAnalyzing(true);

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Compress the image
      const compressedBlob = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8
      });

      if (!compressedBlob) {
        throw new Error('Failed to compress image');
      }

      // Convert compressed image to base64
      const base64Image = await convertToBase64(new File([compressedBlob], file.name, { type: compressedBlob.type }));
      
      const response = await mealsApi.analyzePhoto(base64Image);
      
      if (response.error) {
        onError(response.error);
      } else if (response.data) {
        onAnalysisComplete(response.data);
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      onError('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }, [onAnalysisComplete, onError]);

  const handleCameraCapture = () => {
    // Trigger camera input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        processPhoto(file);
      }
    };
    input.click();
  };

  const handleGallerySelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        processPhoto(file);
      }
    };
    input.click();
  };

  return (
    <div className="relative min-h-screen bg-black">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
      >
        <IoArrowBack className="w-5 h-5 text-black" />
      </button>

      {/* Camera View Area */}
      <div 
        className="min-h-screen flex items-center justify-center cursor-pointer"
        onClick={handleCameraCapture}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img 
              src={preview} 
              alt="Meal preview" 
              className="w-full h-full object-cover"
            />
            {analyzing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                  <p className="text-lg">Analyzing meal...</p>
                </div>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                if (preview.startsWith('blob:')) {
                  URL.revokeObjectURL(preview);
                }
              }}
              className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <span className="text-black text-xl">✕</span>
            </button>
          </div>
        ) : (
          <div className="text-center text-white">
            <div className="text-8xl mb-4">📸</div>
            <p className="text-xl mb-2">Tap to take photo</p>
            <p className="text-gray-300">Point camera at your meal</p>
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className="absolute bottom-20 left-0 right-0 px-4">
        <div className="flex justify-between">
          {/* Gallery Button */}
          <button
            onClick={handleGallerySelect}
            disabled={analyzing}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
          >
            <GoImage className="w-6 h-6 text-black" />
          </button>

          {/* Manual Entry Button */}
          <button
            onClick={onManualEntry}
            disabled={analyzing}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
          >
            <CiKeyboard className="w-6 h-6 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}