import type { APIValidationResult } from "./apiTypes";

export const validateHTTPMethod = (method: string): APIValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (!method || typeof method !== "string") {
    errors.push("HTTP method is required and must be a string");
    return { isValid: false, errors, warnings, securityLevel };
  }
  const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
  const upperMethod = method.toUpperCase();
  if (!validMethods.includes(upperMethod)) {
    errors.push(`Invalid HTTP method: ${method}`);
    return { isValid: false, errors, warnings, securityLevel };
  }
  if (["POST", "PUT", "PATCH", "DELETE"].includes(upperMethod)) {
    securityLevel = "high";
  } else if (["GET", "HEAD"].includes(upperMethod)) {
    securityLevel = "medium";
  } else {
    securityLevel = "low";
  }
  return { isValid: true, errors, warnings, securityLevel };
};

export const validateURL = (
  url: string,
  allowedDomains?: string[],
): APIValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (!url || typeof url !== "string") {
    errors.push("URL is required and must be a string");
    return { isValid: false, errors, warnings, securityLevel };
  }
  try {
    const parsedURL = new URL(url);
    if (!["http:", "https:"].includes(parsedURL.protocol)) {
      errors.push(`Protocol not allowed: ${parsedURL.protocol}`);
      securityLevel = "low";
    }
    if (parsedURL.protocol !== "https:") {
      warnings.push("Consider using HTTPS for better security");
      securityLevel = "low";
    }
    if (allowedDomains && allowedDomains.length > 0 && !allowedDomains.includes(parsedURL.hostname)) {
      errors.push(`Domain not allowed: ${parsedURL.hostname}`);
      securityLevel = "low";
    }
    if (["localhost", "127.0.0.1", "0.0.0.0"].includes(parsedURL.hostname)) {
      warnings.push("Using local development domain");
      securityLevel = "low";
    }
    if (parsedURL.pathname.length > 2048) {
      errors.push("URL path is too long (maximum 2048 characters)");
    }
    if (parsedURL.pathname.includes("../") || parsedURL.pathname.includes("..\\")) {
      errors.push("Path traversal detected in URL");
      securityLevel = "low";
    }
    if (parsedURL.search.length > 4096) {
      errors.push("Query string is too long (maximum 4096 characters)");
    }
    const sqlPatterns = ["union", "select", "insert", "update", "delete", "drop"];
    const queryString = parsedURL.search.toLowerCase();
    if (sqlPatterns.some((pattern) => queryString.includes(pattern))) {
      errors.push("Potential SQL injection detected in query parameters");
      securityLevel = "low";
    }
  } catch (error) {
    errors.push("Invalid URL format");
  }
  return { isValid: errors.length === 0, errors, warnings, securityLevel };
};
