'use client';

import { useState, useEffect } from 'react';
import { weightLogsApi } from '@/lib/api';
import type { WeightLog, WeightStats, WeightLogFormData, WeightLogUpdateFormData } from '@/types';

export function useWeightLogs() {
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [weightStats, setWeightStats] = useState<WeightStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeightLogs = async (limit: number = 30) => {
    try {
      setLoading(true);
      setError(null);
      const response = await weightLogsApi.getWeightLogs(limit);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setWeightLogs(response.data);
      }
    } catch (err) {
      setError('Failed to fetch weight logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeightStats = async () => {
    try {
      const response = await weightLogsApi.getWeightStats();
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setWeightStats(response.data);
      }
    } catch (err) {
      setError('Failed to fetch weight statistics');
    }
  };

  const createWeightLog = async (data: WeightLogFormData) => {
    try {
      const response = await weightLogsApi.createWeightLog(data);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setWeightLogs(prev => [response.data!, ...prev]);
        // Refresh stats after adding new weight
        await fetchWeightStats();
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create weight log';
      setError(errorMessage);
      throw err;
    }
  };

  const updateWeightLog = async (id: number, data: WeightLogUpdateFormData) => {
    try {
      const response = await weightLogsApi.updateWeightLog(id, data);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setWeightLogs(prev => 
          prev.map(log => log.id === id ? response.data! : log)
        );
        await fetchWeightStats();
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update weight log';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteWeightLog = async (id: number) => {
    try {
      const response = await weightLogsApi.deleteWeightLog(id);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setWeightLogs(prev => prev.filter(log => log.id !== id));
      await fetchWeightStats();
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete weight log';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchWeightLogs();
    fetchWeightStats();
  }, []);

  return {
    weightLogs,
    weightStats,
    loading,
    error,
    createWeightLog,
    updateWeightLog,
    deleteWeightLog,
    refetch: () => {
      fetchWeightLogs();
      fetchWeightStats();
    },
  };
}