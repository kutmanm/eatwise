import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(dateString: string): string {
  return format(new Date(dateString), 'HH:mm');
}

export function formatDate(dateString: string, formatStr: string = 'MMM dd, yyyy'): string {
  return format(new Date(dateString), formatStr);
}

export function formatNutrition(value: number): string {
  return Math.round(value).toString();
}

export function calculatePercentage(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.round((current / target) * 100);
}

export function getActivityLevelLabel(level: string): string {
  switch (level) {
    case 'low':
      return 'Sedentary';
    case 'medium':
      return 'Moderately Active';
    case 'high':
      return 'Very Active';
    default:
      return 'Unknown';
  }
}

export function getGoalLabel(goal: string): string {
  switch (goal) {
    case 'weight_loss':
      return 'Weight Loss';
    case 'muscle_gain':
      return 'Muscle Gain';
    case 'maintain':
      return 'Maintain Weight';
    default:
      return 'Unknown';
  }
}

// Mobile detection utilities
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Camera utilities
export function isCameraSupported(): boolean {
  if (typeof navigator === 'undefined') return false;
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// File utilities
export function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Form utilities
export function preventZoomOnFocus(element: HTMLElement) {
  // Prevent iOS zoom on input focus
  if (isMobile()) {
    element.addEventListener('focus', () => {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    });

    element.addEventListener('blur', () => {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    });
  }
}

// Animation utilities
export function fadeIn(element: HTMLElement, duration: number = 300) {
  element.style.opacity = '0';
  element.style.transition = `opacity ${duration}ms ease-in-out`;
  
  setTimeout(() => {
    element.style.opacity = '1';
  }, 10);
}

export function slideUp(element: HTMLElement, duration: number = 300) {
  element.style.transform = 'translateY(20px)';
  element.style.opacity = '0';
  element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
  
  setTimeout(() => {
    element.style.transform = 'translateY(0)';
    element.style.opacity = '1';
  }, 10);
}