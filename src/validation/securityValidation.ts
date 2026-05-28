import type { AuthValidationResult } from "./authValidationTypes";

export const validateRateLimit = (
  attempts: number,
  windowMs: number,
  maxAttempts: number,
): AuthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (attempts < 0) {
    errors.push("Invalid attempt count");
  }
  if (windowMs <= 0) {
    errors.push("Invalid time window");
  }
  if (maxAttempts <= 0) {
    errors.push("Invalid maximum attempts");
  }
  if (attempts >= maxAttempts) {
    errors.push("Rate limit exceeded");
    securityLevel = "high";
  } else if (attempts >= maxAttempts * 0.8) {
    warnings.push("Approaching rate limit");
    securityLevel = "medium";
  }
  if (attempts > 10 && windowMs < 60000) {
    securityLevel = "low";
    warnings.push("High frequency of attempts detected");
  }
  return { isValid: errors.length === 0, errors, warnings, securityLevel };
};

export const validateSecurityHeaders = (
  headers: Record<string, string>,
): AuthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (!headers["content-security-policy"]) {
    warnings.push("Missing Content Security Policy header");
    securityLevel = "low";
  }
  if (!headers["x-frame-options"]) {
    warnings.push("Missing X-Frame-Options header");
    securityLevel = "low";
  } else if (
    !["DENY", "SAMEORIGIN", "ALLOW-FROM"].includes(headers["x-frame-options"])
  ) {
    warnings.push("Unusual X-Frame-Options value");
  }
  if (!headers["x-content-type-options"]) {
    warnings.push("Missing X-Content-Type-Options header");
    securityLevel = "low";
  } else if (headers["x-content-type-options"] !== "nosniff") {
    warnings.push("Unusual X-Content-Type-Options value");
  }
  if (!headers["strict-transport-security"]) {
    warnings.push("Missing Strict-Transport-Security header");
    securityLevel = "low";
  }
  if (headers.authorization) {
    const authParts = headers.authorization.split(" ");
    if (authParts.length !== 2) {
      errors.push("Invalid Authorization header format");
    } else {
      const [scheme, credentials] = authParts;
      if (scheme !== "Bearer" && scheme !== "Basic") {
        warnings.push("Unusual authentication scheme");
      }
      if (scheme === "Bearer" && credentials!.length < 20) {
        errors.push("Bearer token appears too short");
      }
      if (scheme === "Basic") {
        try {
          const decoded = atob(credentials!);
          const [username, password] = decoded.split(":");
          if (!username || !password) {
            errors.push("Invalid Basic authentication credentials");
          }
        } catch (error: unknown) {
          errors.push("Invalid Basic authentication encoding");
        }
      }
    }
  }
  return { isValid: errors.length === 0, errors, warnings, securityLevel };
};

export const validateIPAddress = (
  ip: string,
  context: "login" | "api" | "admin",
): AuthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (!ip) {
    errors.push("IP address is required");
    return { isValid: false, errors, warnings, securityLevel };
  }
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
    errors.push("Invalid IP address format");
  }
  const privateRanges = ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"];
  if (context === "api" || context === "admin") {
    if (privateRanges.some((range) => isIPInRange(ip, range))) {
      warnings.push("Private IP address for public service");
      securityLevel = "low";
    }
  }
  const knownMalicious = ["192.0.2.0/24", "198.51.100.0/24", "203.0.113.0/24"];
  if (knownMalicious.some((range) => isIPInRange(ip, range))) {
    errors.push("Known malicious IP address");
    securityLevel = "low";
  }
  return { isValid: errors.length === 0, errors, warnings, securityLevel };
};

function isIPInRange(ip: string, range: string): boolean {
  const [network = ""] = range.split("/");
  return ip.startsWith(network.split(".")[0] ?? "");
}
