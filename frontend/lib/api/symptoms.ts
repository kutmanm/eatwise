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
    (() => {
      const search = new URLSearchParams();
      if (params?.skip != null) search.set('skip', String(params.skip));
      if (params?.limit != null) search.set('limit', String(params.limit));
      if (params?.start_date) search.set('start_date', params.start_date);
      if (params?.end_date) search.set('end_date', params.end_date);
      if (params?.symptom_domain) search.set('symptom_domain', params.symptom_domain);
      const qs = search.toString();
      return apiClient.get<SymptomLog[]>(`/api/symptoms/logs${qs ? `?${qs}` : ''}`);
    })(),

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
    (() => {
      const search = new URLSearchParams();
      if (params?.skip != null) search.set('skip', String(params.skip));
      if (params?.limit != null) search.set('limit', String(params.limit));
      if (params?.start_date) search.set('start_date', params.start_date);
      if (params?.end_date) search.set('end_date', params.end_date);
      const qs = search.toString();
      return apiClient.get<LifestyleLog[]>(`/api/symptoms/lifestyle${qs ? `?${qs}` : ''}`);
    })(),

  getLifestyleLog: (id: number) =>
    apiClient.get<LifestyleLog>(`/api/symptoms/lifestyle/${id}`),

  updateLifestyleLog: (id: number, data: Partial<LifestyleLogCreate>) =>
    apiClient.put<LifestyleLog>(`/api/symptoms/lifestyle/${id}`, data),

  deleteLifestyleLog: (id: number) =>
    apiClient.delete(`/api/symptoms/lifestyle/${id}`),

  // Analysis
  analyzeSymptomCorrelations: (data: SymptomAnalysisRequest) =>
    apiClient.post<SymptomCorrelationData>('/api/symptoms/analysis', data),

  getSymptomSummary: (days?: number) => {
    const d = days ?? 30;
    return apiClient.get<SymptomSummary>(`/api/symptoms/summary?days=${d}`);
  },

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
