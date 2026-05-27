import type { ApiConfig, AuthProvider, ApiRequestConfig, ApiResponse, ApiError } from './client-types';

export type { ApiConfig, AuthProvider, ApiRequestConfig, ApiResponse, ApiError };

export type RequestInterceptor = (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;
