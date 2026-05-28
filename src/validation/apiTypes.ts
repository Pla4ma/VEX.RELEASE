export interface APIValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: unknown;
  securityLevel: "low" | "medium" | "high";
}

export interface APIRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

export interface APIResponse {
  status: number;
  headers?: Record<string, string>;
  body?: unknown;
  duration?: number;
}

export interface APIEndpoint {
  method: string;
  path: string;
  authRequired?: boolean;
  rateLimit?: number;
  maxBodySize?: number;
  allowedHeaders?: string[];
  requiredParams?: string[];
  validationSchema?: unknown;
}
