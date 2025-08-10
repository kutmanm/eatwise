'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useWeightLogs } from '@/hooks/useWeightLogs';

export function WeightStats() {
  const { weightStats, loading } = useWeightLogs();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00b800] mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weightStats || weightStats.entries_count === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            No weight data available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'decreasing':
        return { label: 'Decreasing', color: 'text-green-600', emoji: '📉' };
      case 'increasing':
        return { label: 'Increasing', color: 'text-red-600', emoji: '📈' };
      case 'stable':
        return { label: 'Stable', color: 'text-blue-600', emoji: '➡️' };
      default:
        return { label: 'Insufficient data', color: 'text-gray-500', emoji: '📊' };
    }
  };

  const trendInfo = getTrendLabel('insufficient_data');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">
              {weightStats.entries_count}
            </div>
            <div className="text-xs text-gray-600">Total Entries</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {weightStats.current_weight?.toFixed?.(1) || 'N/A'}kg
            </div>
            <div className="text-xs text-blue-700">Latest Weight</div>
          </div>
        </div>

        {(() => {
          const change = (weightStats.current_weight - weightStats.starting_weight);
          return change !== 0;
        })() && (
          <div className={`text-center p-3 rounded-lg ${
            (weightStats.current_weight - weightStats.starting_weight) < 0 ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className={`text-xl font-bold ${
              (weightStats.current_weight - weightStats.starting_weight) < 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {(weightStats.current_weight - weightStats.starting_weight) > 0 ? '+' : ''}
              {(weightStats.current_weight - weightStats.starting_weight).toFixed(1)}kg
            </div>
            <div className={`text-xs ${
              (weightStats.current_weight - weightStats.starting_weight) < 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              Total Change
            </div>
          </div>
        )}

        <div className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg">
          <span className="text-lg">{trendInfo.emoji}</span>
          <div className="text-center">
            <div className={`font-medium ${trendInfo.color}`}>
              {trendInfo.label}
            </div>
            <div className="text-xs text-gray-600">Recent Trend</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}