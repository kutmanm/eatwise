'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { mealsApi } from '@/lib/api';
import type { ChatLogResponse } from '@/types';

interface TextEntryProps {
  onAnalysisComplete: (analysis: ChatLogResponse) => void;
  onError: (error: string) => void;
}

export function TextEntry({ onAnalysisComplete, onError }: TextEntryProps) {
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!description.trim()) {
      onError('Please enter a meal description');
      return;
    }

    setAnalyzing(true);
    
    try {
      const response = await mealsApi.parseChatLog(description);
      
      if (response.error) {
        onError(response.error);
      } else if (response.data) {
        onAnalysisComplete(response.data);
      }
    } catch (err) {
      onError('Failed to analyze meal description. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="description">Describe your meal</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., Grilled chicken breast with steamed broccoli and brown rice"
          className="form-input min-h-[100px] resize-none"
          disabled={analyzing}
        />
        <p className="text-xs text-neutral-500 mt-1">
          Be as detailed as possible for better nutrition estimates
        </p>
      </div>

      <Button
        onClick={handleAnalyze}
        loading={analyzing}
        disabled={!description.trim()}
        className="w-full"
      >
        {analyzing ? 'Analyzing...' : 'Analyze Meal'}
      </Button>

      {/* Quick suggestions */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-700">Quick examples:</p>
        <div className="flex flex-wrap gap-2">
          {[
            'Oatmeal with banana and nuts',
            'Caesar salad with grilled chicken',
            'Spaghetti with meat sauce',
            'Greek yogurt with berries'
          ].map((example) => (
            <button
              key={example}
              onClick={() => setDescription(example)}
              className="text-xs px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full hover:bg-neutral-200 transition-colors"
              disabled={analyzing}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}