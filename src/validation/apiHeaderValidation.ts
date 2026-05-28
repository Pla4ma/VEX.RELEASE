import type { APIValidationResult } from "./apiTypes";

export const validateHeaders = (
  headers: Record<string, string>,
  allowedHeaders?: string[],
): APIValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (!headers || typeof headers !== "object") {
    errors.push("Headers must be an object");
    return { isValid: false, errors, warnings, securityLevel };
  }
  if (allowedHeaders && allowedHeaders.length > 0) {
    for (const headerName of Object.keys(headers)) {
      if (!allowedHeaders.includes(headerName.toLowerCase())) {
        warnings.push(`Header not allowed: ${headerName}`);
      }
    }
  }
  const contentType = headers["content-type"] || headers["Content-Type"];
  if (contentType) {
    const validContentTypes = [
      "application/json",
      "application/xml",
      "text/plain",
      "multipart/form-data",
      "application/x-www-form-urlencoded",
    ];
    const mainType = contentType.split(";")[0]!.toLowerCase();
    if (!validContentTypes.some((type) => mainType.includes(type))) {
      warnings.push(`Unusual Content-Type: ${contentType}`);
    }
  }
  const authHeader = headers.authorization || headers.Authorization;
  if (authHeader) {
    const authParts = authHeader.split(" ");
    if (authParts.length !== 2) {
      errors.push("Invalid Authorization header format");
      securityLevel = "low";
    } else {
      const [scheme, credentials] = authParts;
      if (scheme !== "Bearer" && scheme !== "Basic") {
        warnings.push(`Unusual authentication scheme: ${scheme}`);
      }
      if (scheme === "Bearer" && credentials!.length < 20) {
        warnings.push("Bearer token appears too short");
        securityLevel = "low";
      }
      if (scheme === "Basic") {
        try {
          const decoded = atob(credentials!);
          const [username, password] = decoded.split(":");
          if (!username || !password) {
            errors.push("Invalid Basic authentication credentials");
            securityLevel = "low";
          }
        } catch (error: unknown) {
          errors.push("Invalid Basic authentication encoding");
          securityLevel = "low";
        }
      }
    }
  }
  const securityHeaders = [
    "x-frame-options",
    "x-content-type-options",
    "x-xss-protection",
    "strict-transport-security",
  ];
  const missingSecurityHeaders = securityHeaders.filter(
    (header) => !(headers[header] || headers[header.toLowerCase()]),
  );
  if (missingSecurityHeaders.length > 0) {
    warnings.push(`Missing security headers: ${missingSecurityHeaders.join(", ")}`);
    securityLevel = "low";
  }
  if (JSON.stringify(headers).length > 8192) {
    errors.push("Headers too large (maximum 8KB)");
  }
  return { isValid: errors.length === 0, errors, warnings, securityLevel };
};
