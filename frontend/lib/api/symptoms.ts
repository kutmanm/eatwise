import { apiClient } from './client';
import {
  SymptomLog,
  SymptomLogCreate,
  LifestyleLog,
  LifestyleLogCreate,
  SymptomCorrelationData,
  SymptomSummary,
  SymptomAnalysisRequest,
  SymptomType,
  SymptomDomain
} from '@/types/symptoms';

export const symptomsApi = {
  // Symptom Logs
  createSymptomLog: (data: SymptomLogCreate) =>
    apiClient.post<SymptomLog>('/api/symptoms/logs', data),

  getSymptomLogs: (params?: {
    skip?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
    symptom_domain?: string;
  }) =>
    apiClient.get<SymptomLog[]>('/api/symptoms/logs', { params }),

  getSymptomLog: (id: number) =>
    apiClient.get<SymptomLog>(`/api/symptoms/logs/${id}`),

  updateSymptomLog: (id: number, data: Partial<SymptomLogCreate>) =>
    apiClient.put<SymptomLog>(`/api/symptoms/logs/${id}`, data),

  deleteSymptomLog: (id: number) =>
    apiClient.delete(`/api/symptoms/logs/${id}`),

  // Lifestyle Logs
  createLifestyleLog: (data: LifestyleLogCreate) =>
    apiClient.post<LifestyleLog>('/api/symptoms/lifestyle', data),

  getLifestyleLogs: (params?: {
    skip?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }) =>
    apiClient.get<LifestyleLog[]>('/api/symptoms/lifestyle', { params }),

  getLifestyleLog: (id: number) =>
    apiClient.get<LifestyleLog>(`/api/symptoms/lifestyle/${id}`),

  updateLifestyleLog: (id: number, data: Partial<LifestyleLogCreate>) =>
    apiClient.put<LifestyleLog>(`/api/symptoms/lifestyle/${id}`, data),

  deleteLifestyleLog: (id: number) =>
    apiClient.delete(`/api/symptoms/lifestyle/${id}`),

  // Analysis
  analyzeSymptomCorrelations: (data: SymptomAnalysisRequest) =>
    apiClient.post<SymptomCorrelationData>('/api/symptoms/analysis', data),

  getSymptomSummary: (days?: number) =>
    apiClient.get<SymptomSummary>('/api/symptoms/summary', { 
      params: { days: days || 30 } 
    }),

  // Reference Data
  getSymptomTypes: () =>
    apiClient.get<{ symptom_types: SymptomType[] }>('/api/symptoms/types'),

  getSymptomDomains: () =>
    apiClient.get<{ symptom_domains: SymptomDomain[] }>('/api/symptoms/domains'),

  // AI Analysis
  getAISymptomAnalysis: (symptomData: any) =>
    apiClient.post<{ analysis: string }>('/api/ai/symptom-analysis', {
      symptom_data: symptomData
    }),
};
