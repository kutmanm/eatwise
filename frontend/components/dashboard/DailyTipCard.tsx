'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useDailyTip } from '@/hooks/useAI';

export function DailyTipCard() {
  const { tip, loading, error } = useDailyTip();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <span className="mr-2">💡</span>
          Daily Tip
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-neutral-200 rounded w-1/2" />
          </div>
        ) : error ? (
          <p className="text-neutral-600 text-sm">
            Unable to load daily tip. Try again later.
          </p>
        ) : (
          <p className="text-neutral-700 text-sm leading-relaxed">
            {tip || 'Stay hydrated and eat balanced meals to support your nutrition goals!'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}