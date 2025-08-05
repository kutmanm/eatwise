'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/Button';
import { mealsApi } from '@/lib/api';
import type { PhotoAnalysisResponse } from '@/types';
import { compressImage } from '@/lib/utils';
import { LuScanLine } from 'react-icons/lu';
import { GoImage } from 'react-icons/go';

interface PhotoUploadProps {
  onAnalysisComplete: (analysis: PhotoAnalysisResponse) => void;
  onError: (error: string) => void;
}

export function PhotoUpload({ onAnalysisComplete, onError }: PhotoUploadProps) {
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

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
            <LuScanLine size={48} className="mx-auto text-neutral-600" />
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
          className="flex-1 flex items-center gap-2"
        >
          <LuScanLine size={20} />
          Camera
        </Button>
        <Button
          variant="outline"
          onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
          disabled={analyzing}
          className="flex-1 flex items-center gap-2"
        >
          <GoImage size={20} />
          Gallery
        </Button>
      </div>
    </div>
  );
}