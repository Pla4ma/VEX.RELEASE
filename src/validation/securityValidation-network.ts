import type { SecurityValidationResult } from "./securityValidation-types";

export const validateRateLimit = (
  identifier: string,
  requestCount: number,
  windowMs: number,
  maxRequests: number,
): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const threats: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (requestCount >= maxRequests) {
    errors.push(`Rate limit exceeded: ${requestCount}/${maxRequests} requests`);
    threats.push("Rate limit violation");
    securityLevel = "low";
  } else if (requestCount >= maxRequests * 0.8) {
    warnings.push(`Approaching rate limit: ${requestCount}/${maxRequests} requests`);
    securityLevel = "medium";
  }
  if (requestCount > maxRequests * 2) {
    errors.push(`Suspicious activity: ${requestCount} requests (limit: ${maxRequests})`);
    threats.push("Potential DDoS attack");
    securityLevel = "low";
  }
  const requestsPerSecond = requestCount / (windowMs / 1000);
  if (requestsPerSecond > 10) {
    warnings.push(`High request rate: ${requestsPerSecond.toFixed(2)} requests/second`);
    securityLevel = "medium";
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    threats,
    securityLevel,
  };
};

export const validateIPAddressSecurity = (
  ip: string,
  context: "client" | "server" | "proxy",
): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const threats: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (!ip) {
    errors.push("IP address is required");
    return { isValid: false, errors, warnings, threats, securityLevel };
  }
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
    errors.push("Invalid IP address format");
    threats.push("Invalid IP address");
    securityLevel = "low";
  }
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
  ];
  const isPrivate = privateRanges.some((range) => range.test(ip));
  if (context === "client" && isPrivate) {
    warnings.push("Client IP is from private range");
    securityLevel = "medium";
  }
  if (context === "server" && isPrivate) {
    errors.push("Server IP cannot be from private range");
    threats.push("Invalid server IP");
    securityLevel = "low";
  }
  const knownMalicious = [/^0\./, /^255\./, /^224\./, /^240\./];
  if (knownMalicious.some((range) => range.test(ip))) {
    errors.push("IP address from reserved or malicious range");
    threats.push("Malicious IP address");
    securityLevel = "low";
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    threats,
    securityLevel,
  };
};
