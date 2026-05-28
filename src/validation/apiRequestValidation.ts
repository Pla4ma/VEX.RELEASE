import type { APIEndpoint, APIRequest, APIValidationResult } from "./apiTypes";
import { validateRequestBody } from "./apiBodyValidation";
import { validateHTTPMethod, validateURL } from "./apiCoreValidation";
import { validateHeaders } from "./apiHeaderValidation";
import { validatePathParams, validateQueryParams } from "./apiParamValidation";

export const validateAPIRequest = (
  request: APIRequest,
  endpoint: APIEndpoint,
): APIValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  let overallSecurityLevel: "low" | "medium" | "high" = "medium";
  const methodValidation = validateHTTPMethod(request.method);
  allErrors.push(...methodValidation.errors);
  allWarnings.push(...methodValidation.warnings);
  const urlValidation = validateURL(request.url);
  allErrors.push(...urlValidation.errors);
  allWarnings.push(...urlValidation.warnings);
  if (request.headers) {
    const headersValidation = validateHeaders(request.headers, endpoint.allowedHeaders);
    allErrors.push(...headersValidation.errors);
    allWarnings.push(...headersValidation.warnings);
  }
  if (request.query) {
    const queryValidation = validateQueryParams(request.query);
    allErrors.push(...queryValidation.errors);
    allWarnings.push(...queryValidation.warnings);
  }
  if (request.params) {
    const pathValidation = validatePathParams(request.params, endpoint.requiredParams);
    allErrors.push(...pathValidation.errors);
    allWarnings.push(...pathValidation.warnings);
  }
  if (request.body && ["POST", "PUT", "PATCH"].includes(request.method.toUpperCase())) {
    const contentType = request.headers?.["content-type"];
    const bodyValidation = validateRequestBody(
      request.body,
      contentType,
      endpoint.maxBodySize,
    );
    allErrors.push(...bodyValidation.errors);
    allWarnings.push(...bodyValidation.warnings);
  } else if (request.body && !["POST", "PUT", "PATCH"].includes(request.method.toUpperCase())) {
    allErrors.push("Request body not allowed for this method");
  }
  if (endpoint.authRequired) {
    const authHeader = request.headers?.authorization || request.headers?.Authorization;
    if (!authHeader) {
      allErrors.push("Authentication required for this endpoint");
      overallSecurityLevel = "low";
    }
  }
  if (endpoint.rateLimit && endpoint.rateLimit > 0) {
    allWarnings.push(`Rate limit applies: ${endpoint.rateLimit} requests`);
  }
  if (allErrors.some((error) => error.includes("injection") || error.includes("traversal"))) {
    overallSecurityLevel = "low";
  } else if (allWarnings.length > 5) {
    overallSecurityLevel = "medium";
  } else {
    overallSecurityLevel = "high";
  }
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    securityLevel: overallSecurityLevel,
  };
};
