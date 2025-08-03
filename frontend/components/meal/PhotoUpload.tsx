'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/Button';
import { mealsApi } from '@/lib/api';
import type { PhotoAnalysisResponse } from '@/types';

interface PhotoUploadProps {
  onAnalysisComplete: (analysis: PhotoAnalysisResponse) => void;
  onError: (error: string) => void;
}

export function PhotoUpload({ onAnalysisComplete, onError }: PhotoUploadProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Upload to Supabase Storage (simplified - you'd implement actual upload)
    try {
      setAnalyzing(true);
      
      // For now, we'll simulate image URL - in real implementation:
      // 1. Upload to Supabase Storage
      // 2. Get public URL
      // 3. Send to backend for analysis
      
      const imageUrl = previewUrl; // This would be the actual uploaded URL
      
      const response = await mealsApi.analyzePhoto(imageUrl);
      
      if (response.error) {
        onError(response.error);
      } else if (response.data) {
        onAnalysisComplete(response.data);
      }
    } catch (err) {
      onError('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }, [onAnalysisComplete, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: analyzing
  });

  const handleCameraCapture = () => {
    // Trigger camera input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onDrop([file]);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Meal preview" 
            className="w-full h-64 object-cover rounded-lg"
          />
          {analyzing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
                <p className="text-sm">Analyzing meal...</p>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPreview(null);
              if (preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
              }
            }}
            className="absolute top-2 right-2 bg-white"
          >
            ✕
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-neutral-300 hover:border-primary-400'
            }
            ${analyzing ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="text-4xl">📸</div>
            <div>
              <p className="text-lg font-medium text-neutral-900">
                {isDragActive ? 'Drop your meal photo here' : 'Upload a meal photo'}
              </p>
              <p className="text-sm text-neutral-600">
                Drag and drop or click to select
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={handleCameraCapture}
          disabled={analyzing}
          className="flex-1"
        >
          📷 Camera
        </Button>
        <Button
          variant="outline"
          onClick={() => document.querySelector('input[type="file"]')?.click()}
          disabled={analyzing}
          className="flex-1"
        >
          📁 Gallery
        </Button>
      </div>
    </div>
  );
}