import { useState, useCallback } from 'react';

// Generic API hook for handling async operations with loading states
export const useApi = <T = any>() => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiFunction: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      if (result.success) {
        setData(result.data || result);
        return result;
      } else {
        setError(result.error || 'An error occurred');
        return result;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    isSuccess: !loading && !error && data !== null,
    isError: !loading && error !== null
  };
};
