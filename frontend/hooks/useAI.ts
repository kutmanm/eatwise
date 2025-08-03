import { useState } from 'react';
import useSWR from 'swr';
import { aiApi } from '@/lib/api';

export function useDailyTip() {
  const { data, error, mutate } = useSWR(
    'daily-tip',
    async () => {
      const response = await aiApi.getDailyTip();
      if (response.error) throw new Error(response.error);
      return response.data!;
    }
  );

  return {
    tip: data?.tip,
    loading: !error && !data,
    error,
    mutate,
  };
}

export function useMealFeedback() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getFeedback = async (mealId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiApi.getMealFeedback(mealId);
      if (response.error) {
        setError(response.error);
      } else {
        setFeedback(response.data!.feedback);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    feedback,
    loading,
    error,
    getFeedback,
    clearFeedback: () => setFeedback(null),
  };
}

export function useNutritionQuestion() {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const askQuestion = async (question: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiApi.askNutritionQuestion(question);
      if (response.error) {
        setError(response.error);
      } else {
        setAnswer(response.data!.answer);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    answer,
    loading,
    error,
    askQuestion,
    clearAnswer: () => setAnswer(null),
  };
}

export function useMealSuggestions() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = async (mealId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiApi.getMealSuggestions(mealId);
      if (response.error) {
        setError(response.error);
      } else {
        setSuggestions(response.data!.suggestions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    suggestions,
    loading,
    error,
    getSuggestions,
    clearSuggestions: () => setSuggestions(null),
  };
}