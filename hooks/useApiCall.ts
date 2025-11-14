import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { ApiResponse } from '../services/apiClient';
import { ProblemDetails } from '../types/api';

/**
 * Custom hook for handling API calls with loading and error states
 */

interface UseApiCallOptions {
  showErrorAlert?: boolean;
  errorTitle?: string;
}

interface UseApiCallReturn<T> {
  data: T | null;
  error: ProblemDetails | string | null;
  isLoading: boolean;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApiCall<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiCallOptions = {}
): UseApiCallReturn<T> {
  const { showErrorAlert = true, errorTitle = 'Error' } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ProblemDetails | string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFunction(...args);

        if (response.ok && response.data) {
          setData(response.data);
          return response.data;
        } else {
          const errorMessage = formatError(response.error);
          setError(response.error || 'An error occurred');

          if (showErrorAlert) {
            Alert.alert(errorTitle, errorMessage);
          }

          return null;
        }
      } catch (err: any) {
        const errorMessage = err.message || 'An unexpected error occurred';
        setError(errorMessage);

        if (showErrorAlert) {
          Alert.alert(errorTitle, errorMessage);
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, showErrorAlert, errorTitle]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  };
}

/**
 * Format error for display
 */
function formatError(error: ProblemDetails | string | undefined): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  if (typeof error === 'string') {
    return error;
  }

  // ProblemDetails object
  if (error.title || error.detail) {
    return error.detail || error.title || 'An error occurred';
  }

  return 'An error occurred';
}

/**
 * Hook for executing API calls without storing state
 * Useful for one-off operations like delete, update status, etc.
 */

export function useApiAction<T = void>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiCallOptions = {}
) {
  const { showErrorAlert = true, errorTitle = 'Error' } = options;
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (...args: any[]): Promise<boolean> => {
      try {
        setIsLoading(true);

        const response = await apiFunction(...args);

        if (response.ok) {
          return true;
        } else {
          const errorMessage = formatError(response.error);

          if (showErrorAlert) {
            Alert.alert(errorTitle, errorMessage);
          }

          return false;
        }
      } catch (err: any) {
        const errorMessage = err.message || 'An unexpected error occurred';

        if (showErrorAlert) {
          Alert.alert(errorTitle, errorMessage);
        }

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, showErrorAlert, errorTitle]
  );

  return {
    isLoading,
    execute,
  };
}
