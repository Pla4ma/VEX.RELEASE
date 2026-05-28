import type { APIValidationResult } from "./apiTypes";

export const validateQueryParams = (
  params: Record<string, string>,
  allowedParams?: string[],
): APIValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (!params || typeof params !== "object") {
    errors.push("Query parameters must be an object");
    return { isValid: false, errors, warnings, securityLevel };
  }
  if (allowedParams && allowedParams.length > 0) {
    for (const paramName of Object.keys(params)) {
      if (!allowedParams.includes(paramName)) {
        warnings.push(`Parameter not allowed: ${paramName}`);
      }
    }
  }
  for (const [key, value] of Object.entries(params)) {
    if (key.length > 100) errors.push(`Parameter name too long: ${key}`);
    if (value.length > 1000) errors.push(`Parameter value too long: ${key}`);
    const lowerValue = value.toLowerCase();
    if (["union", "select", "insert", "update", "delete", "drop"].some((pattern) => lowerValue.includes(pattern))) {
      errors.push(`Potential SQL injection in parameter: ${key}`);
      securityLevel = "low";
    }
    if (["<script", "javascript:", "onload=", "onerror="].some((pattern) => lowerValue.includes(pattern))) {
      errors.push(`Potential XSS in parameter: ${key}`);
      securityLevel = "low";
    }
  }
  const paramCount = Object.keys(params).length;
  if (paramCount > 50) {
    warnings.push(`Too many query parameters: ${paramCount}`);
  }
  return { isValid: errors.length === 0, errors, warnings, securityLevel };
};

export const validatePathParams = (
  params: Record<string, string>,
  requiredParams?: string[],
): APIValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (!params || typeof params !== "object") {
    errors.push("Path parameters must be an object");
    return { isValid: false, errors, warnings, securityLevel };
  }
  if (requiredParams && requiredParams.length > 0) {
    for (const requiredParam of requiredParams) {
      if (!params[requiredParam]) {
        errors.push(`Required path parameter missing: ${requiredParam}`);
      }
    }
  }
  for (const [key, value] of Object.entries(params)) {
    if (key.length > 50) errors.push(`Path parameter name too long: ${key}`);
    if (value.length > 200) errors.push(`Path parameter value too long: ${key}`);
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      errors.push(`Invalid characters in path parameter: ${key}`);
      securityLevel = "low";
    }
    if (value.includes("../") || value.includes("..\\")) {
      errors.push(`Path traversal detected in parameter: ${key}`);
      securityLevel = "low";
    }
  }
  return { isValid: errors.length === 0, errors, warnings, securityLevel };
};
