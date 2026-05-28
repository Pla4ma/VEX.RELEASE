import type { APIResponse, APIValidationResult } from "./apiTypes";

export const validateAPIResponse = (
  response: APIResponse,
  expectedStatus?: number[],
): APIValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (expectedStatus && expectedStatus.length > 0) {
    if (!expectedStatus.includes(response.status)) {
      warnings.push(`Unexpected status code: ${response.status}`);
    }
  }
  if (response.body) {
    const responseSize = JSON.stringify(response.body).length;
    if (responseSize > 10485760) {
      errors.push("Response body too large (maximum 10MB)");
    }
    const sensitiveFields = ["password", "token", "secret", "key", "credential"];
    const bodyString = JSON.stringify(response.body).toLowerCase();
    for (const field of sensitiveFields) {
      if (bodyString.includes(field)) {
        warnings.push(`Potential sensitive data exposure: ${field}`);
        securityLevel = "low";
      }
    }
  }
  if (response.duration) {
    if (response.duration > 30000) {
      warnings.push(`Slow response: ${response.duration}ms`);
    }
  }
  const securityHeaders = [
    "x-content-type-options",
    "x-frame-options",
    "x-xss-protection",
  ];
  if (response.headers) {
    const missingHeaders = securityHeaders.filter(
      (header) =>
        !(response.headers![header] || response.headers![header.toLowerCase()]),
    );
    if (missingHeaders.length > 0) {
      warnings.push(
        `Missing security headers in response: ${missingHeaders.join(", ")}`,
      );
      securityLevel = "medium";
    }
  }
  return { isValid: errors.length === 0, errors, warnings, securityLevel };
};

export const validateRateLimit = (
  currentRequests: number,
  windowMs: number,
  maxRequests: number,
  identifier: string,
): APIValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (currentRequests >= maxRequests) {
    errors.push(
      `Rate limit exceeded for ${identifier}: ${currentRequests}/${maxRequests}`,
    );
    securityLevel = "low";
  } else if (currentRequests >= maxRequests * 0.8) {
    warnings.push(
      `Approaching rate limit for ${identifier}: ${currentRequests}/${maxRequests}`,
    );
    securityLevel = "medium";
  }
  if (currentRequests > maxRequests * 2) {
    errors.push(
      `Suspicious activity detected for ${identifier}: ${currentRequests} requests`,
    );
    securityLevel = "low";
  }
  return { isValid: errors.length === 0, errors, warnings, securityLevel };
};
