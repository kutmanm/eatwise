'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { usersApi } from '@/lib/api/users';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Get user email (for now use placeholder, will be improved when auth is available)
  const getUserEmail = () => {
    // Try to get from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        // In a real app, you might store user data in localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed.email) {
            return parsed.email;
          }
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }
    
    // Fallback for anonymous users
    return 'anonymous@eatwise.com';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await usersApi.createUserFeedback({
        message: feedback.trim(),
      });

      if (response.data) {
        setIsSubmitted(true);
        setFeedback('');
        setTimeout(() => {
          setIsSubmitted(false);
          onClose();
        }, 2000);
      } else {
        console.error('Failed to submit feedback:', response.error);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFeedback('');
      setIsSubmitted(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {isSubmitted ? (
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Thank you!
            </h3>
            <p className="text-gray-600">
              Your feedback has been submitted successfully.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">

              <p className="text-sm text-gray-600 text-center">
              Help us get better!
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={!feedback.trim() || isSubmitting}
                  className="flex-1"
                >
                  Send
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}