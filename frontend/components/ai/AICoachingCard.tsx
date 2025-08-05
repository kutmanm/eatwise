'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAIQuestion, useDailyTip } from '@/hooks/useAI';

export function AICoachingCard() {
  const [question, setQuestion] = useState('');
  const { askQuestion, answer, loading: questionLoading, error } = useAIQuestion();
  const { tip, loading: tipLoading } = useDailyTip();
  
  const [responses, setResponses] = useState<Array<{ question: string; answer: string; timestamp: Date }>>([]);
  const [lastQuestion, setLastQuestion] = useState<string>('');

  useEffect(() => {
    if (answer && lastQuestion) {
      setResponses(prev => [...prev, {
        question: lastQuestion,
        answer: answer,
        timestamp: new Date()
      }]);
      setQuestion('');
      setLastQuestion('');
    }
  }, [answer, lastQuestion]);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setLastQuestion(question.trim());
    await askQuestion(question);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="mr-2">🤖</span>
          AI Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily Tip */}
        <div className="bg-primary-50 p-4 rounded-lg">
          <h4 className="font-medium text-primary-800 mb-2">Daily Tip</h4>
          {tipLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-primary-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-primary-200 rounded w-1/2" />
            </div>
          ) : (
            <p className="text-sm text-primary-700">
              {tip || 'Stay consistent with your nutrition goals and remember that small changes lead to big results!'}
            </p>
          )}
        </div>

        {/* Question Input */}
        <div className="space-y-3">
          <h4 className="font-medium text-neutral-900">Ask your coach</h4>
          <div className="flex space-x-2">
            <Input
              placeholder="Ask about nutrition, meals, or goals..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
              disabled={questionLoading}
            />
            <Button 
              onClick={handleAskQuestion}
              loading={questionLoading}
              disabled={!question.trim()}
            >
              Ask
            </Button>
          </div>
          
          {error && (
            <p className="text-xs text-error">{error}</p>
          )}
        </div>

        {/* Chat History */}
        {responses.length > 0 && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <h4 className="font-medium text-neutral-900">Recent conversations</h4>
            {responses.slice(-3).reverse().map((response, index) => (
              <div key={index} className="space-y-2">
                <div className="bg-neutral-100 p-3 rounded-lg">
                  <p className="text-sm font-medium text-neutral-900">You:</p>
                  <p className="text-sm text-neutral-700">{response.question}</p>
                </div>
                <div className="bg-primary-100 p-3 rounded-lg">
                  <p className="text-sm font-medium text-primary-900">AI Coach:</p>
                  <p className="text-sm text-primary-800">{response.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}