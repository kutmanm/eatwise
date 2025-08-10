import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { symptomsApi } from '@/lib/api/symptoms';
import {
  SymptomLog,
  SymptomLogCreate,
  LifestyleLog,
  LifestyleLogCreate,
  SymptomCorrelationData,
  SymptomSummary,
  SymptomAnalysisRequest
} from '@/types/symptoms';

export function useSymptomLogs(params?: {
  start_date?: string;
  end_date?: string;
  symptom_domain?: string;
}) {
  const { data, error, mutate } = useSWR(
    ['symptom-logs', params],
    async () => {
      const response = await symptomsApi.getSymptomLogs(params);
      if (response.error) throw new Error(response.error);
      return response.data!;
    }
  );

  return {
    symptoms: data || [],
    loading: !error && !data,
    error,
    mutate,
  };
}

export function useLifestyleLogs(params?: {
  start_date?: string;
  end_date?: string;
}) {
  const { data, error, mutate } = useSWR(
    ['lifestyle-logs', params],
    async () => {
      const response = await symptomsApi.getLifestyleLogs(params);
      if (response.error) throw new Error(response.error);
      return response.data!;
    }
  );

  return {
    lifestyleLogs: data || [],
    loading: !error && !data,
    error,
    mutate,
  };
}

export function useSymptomSummary(days: number = 30) {
  const { data, error, mutate } = useSWR(
    ['symptom-summary', days],
    async () => {
      const response = await symptomsApi.getSymptomSummary(days);
      if (response.error) throw new Error(response.error);
      return response.data!;
    }
  );

  return {
    summary: data,
    loading: !error && !data,
    error,
    mutate,
  };
}

export function useSymptomCreator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSymptom = useCallback(async (data: SymptomLogCreate) => {
    setLoading(true);
    setError(null);

    try {
      const response = await symptomsApi.createSymptomLog(data);
      if (response.error) {
        setError(response.error);
        return null;
      }
      return response.data!;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createSymptom,
    loading,
    error,
  };
}

export function useLifestyleCreator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLifestyleLog = useCallback(async (data: LifestyleLogCreate) => {
    setLoading(true);
    setError(null);

    try {
      const response = await symptomsApi.createLifestyleLog(data);
      if (response.error) {
        setError(response.error);
        return null;
      }
      return response.data!;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createLifestyleLog,
    loading,
    error,
  };
}

export function useSymptomCorrelation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [correlationData, setCorrelationData] = useState<SymptomCorrelationData | null>(null);

  const analyzeCorrelations = useCallback(async (request: SymptomAnalysisRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await symptomsApi.analyzeSymptomCorrelations(request);
      if (response.error) {
        setError(response.error);
        return null;
      }
      setCorrelationData(response.data!);
      return response.data!;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analyzeCorrelations,
    correlationData,
    loading,
    error,
  };
}

export function useAISymptomAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const getAIAnalysis = useCallback(async (symptomData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await symptomsApi.getAISymptomAnalysis(symptomData);
      if (response.error) {
        setError(response.error);
        return null;
      }
      setAnalysis(response.data!.analysis);
      return response.data!.analysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getAIAnalysis,
    analysis,
    loading,
    error,
    clearAnalysis: () => setAnalysis(null),
  };
}

export function useSymptomTypes() {
  const { data, error } = useSWR(
    'symptom-types',
    async () => {
      const response = await symptomsApi.getSymptomTypes();
      if (response.error) throw new Error(response.error);
      return response.data!.symptom_types;
    }
  );

  return {
    symptomTypes: data || [],
    loading: !error && !data,
    error,
  };
}

export function useSymptomDomains() {
  const { data, error } = useSWR(
    'symptom-domains',
    async () => {
      const response = await symptomsApi.getSymptomDomains();
      if (response.error) throw new Error(response.error);
      return response.data!.symptom_domains;
    }
  );

  return {
    symptomDomains: data || [],
    loading: !error && !data,
    error,
  };
}
