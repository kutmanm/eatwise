import { apiClient } from './client';
import type { 
  WeightLog, WeightStats,
  WeightLogFormData, WeightLogUpdateFormData
} from '@/types';

export const weightLogsApi = {
  createWeightLog: (data: WeightLogFormData) =>
    apiClient.post<WeightLog>('/api/weight-logs/', data),

  getWeightLogs: (limit: number = 30) =>
    apiClient.get<WeightLog[]>(`/api/weight-logs/?limit=${limit}`),

  updateWeightLog: (id: number, data: WeightLogUpdateFormData) =>
    apiClient.put<WeightLog>(`/api/weight-logs/${id}`, data),

  deleteWeightLog: (id: number) =>
    apiClient.delete<{ message: string }>(`/api/weight-logs/${id}`),

  getWeightStats: () =>
    apiClient.get<WeightStats>('/api/weight-logs/stats'),
};