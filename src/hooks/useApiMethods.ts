import { useApi, type UseApiOptions, type UseApiReturn } from './useApiCore';

export function useApiPost<T = unknown>(
  endpoint: string,
  options?: Omit<UseApiOptions<T>, 'endpoint' | 'method'>,
): UseApiReturn<T> {
  return useApi({ endpoint, method: 'POST', immediate: false, ...options });
}

export function useApiPut<T = unknown>(
  endpoint: string,
  options?: Omit<UseApiOptions<T>, 'endpoint' | 'method'>,
): UseApiReturn<T> {
  return useApi({ endpoint, method: 'PUT', immediate: false, ...options });
}

export function useApiDelete<T = unknown>(
  endpoint: string,
  options?: Omit<UseApiOptions<T>, 'endpoint' | 'method'>,
): UseApiReturn<T> {
  return useApi({ endpoint, method: 'DELETE', immediate: false, ...options });
}
