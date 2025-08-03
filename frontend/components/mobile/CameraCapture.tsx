'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void;
  onError: (error: string) => void;
}

export function CameraCapture({ onCapture, onError }: CameraCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCaptureMode, setIsCaptureMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setIsCaptureMode(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      onError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  }, [onError]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setIsCaptureMode(false);
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
        stopCamera();
      } else {
        onError('Failed to capture photo');
      }
    }, 'image/jpeg', 0.8);
  }, [onCapture, onError, stopCamera]);

  if (!isCaptureMode) {
    return (
      <div className="space-y-4">
        <div className="camera-preview bg-neutral-100 flex items-center justify-center">
          <div className="text-center text-neutral-500">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm">Ready to capture your meal</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            onClick={startCamera}
            className="flex-1 touch-target"
          >
            📸 Open Camera
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  onCapture(file);
                }
              };
              input.click();
            }}
            className="flex-1 touch-target"
          >
            📁 Gallery
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="camera-preview relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Camera overlay for better framing */}
        <div className="camera-overlay" />
        
        {/* Camera controls overlay */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={stopCamera}
            className="bg-white/90 text-neutral-800 touch-target"
          >
            Cancel
          </Button>
          <Button
            onClick={capturePhoto}
            className="bg-primary-500 text-white touch-target px-6"
          >
            📸 Capture
          </Button>
        </div>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}