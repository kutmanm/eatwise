'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { LuScanLine } from 'react-icons/lu';

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void;
  onError: (error: string) => void;
}

export function CameraCapture({ onCapture, onError }: CameraCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCaptureMode, setIsCaptureMode] = useState(true); // Auto start in capture mode
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

  // Auto-start camera when component mounts
  useEffect(() => {
    startCamera();
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  if (!isStreaming) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <LuScanLine size={48} className="mx-auto mb-4" />
          <p className="text-lg">Starting camera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      {/* Camera overlay for better framing */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-8 inset-y-16 border-2 border-white/50 rounded-2xl"></div>
      </div>
      
      {/* Camera controls overlay */}
      <div className="absolute bottom-32 left-0 right-0 flex justify-center">
        <button
          onClick={capturePhoto}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <LuScanLine size={32} className="text-black" />
        </button>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}