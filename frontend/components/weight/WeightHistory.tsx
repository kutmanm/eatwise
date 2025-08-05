'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import type { WeightLog } from '@/types';

interface WeightHistoryProps {
  limit?: number;
  showTitle?: boolean;
}

export function WeightHistory({ limit = 10, showTitle = true }: WeightHistoryProps) {
  const { weightLogs, deleteWeightLog, loading } = useWeightLogs();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const displayLogs = limit ? weightLogs.slice(0, limit) : weightLogs;

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this weight entry?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteWeightLog(id);
    } catch (error) {
      console.error('Failed to delete weight log:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const getWeightTrend = (currentWeight: number, index: number) => {
    if (index === displayLogs.length - 1) return null;
    
    const previousWeight = displayLogs[index + 1]?.weight;
    if (!previousWeight) return null;
    
    const difference = currentWeight - previousWeight;
    if (Math.abs(difference) < 0.1) return null;
    
    return {
      direction: difference > 0 ? 'up' : 'down',
      amount: Math.abs(difference),
    };
  };

  const content = (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b800] mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading weight history...</p>
        </div>
      ) : displayLogs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No weight entries yet</p>
          <p className="text-sm text-gray-400">Start logging your weight to track progress</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayLogs.map((log, index) => {
            const trend = getWeightTrend(log.weight, index);
            
            return (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium text-lg">
                      {log.weight} kg
                    </div>
                    {trend && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          trend.direction === 'down'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {trend.direction === 'down' ? '↓' : '↑'} {trend.amount.toFixed(1)} kg
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(log.logged_at), 'MMM d, yyyy - h:mm a')}
                  </div>
                  {log.notes && (
                    <div className="text-sm text-gray-500 mt-1 italic">
                      "{log.notes}"
                    </div>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(log.id)}
                  loading={deletingId === log.id}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (!showTitle) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight History</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}