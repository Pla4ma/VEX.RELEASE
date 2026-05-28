import type { DataValidationResult } from "./dataValidation-types";

export const validateEmail = (email: string): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedEmail = email;
  if (!email || typeof email !== "string") {
    errors.push("Email is required and must be a string");
    return { isValid: false, errors, warnings };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push("Invalid email format");
  }
  if (email.length > 254) {
    errors.push("Email is too long (maximum 254 characters)");
    sanitizedEmail = email.substring(0, 254);
    warnings.push("Email was truncated");
  }
  const [localPart, domain] = email.split("@");
  if (localPart && localPart.length > 64) {
    errors.push("Email local part is too long");
  }
  if (domain && domain.length > 253) {
    errors.push("Email domain is too long");
  }
  const suspiciousDomains = [
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
  ];
  if (domain && suspiciousDomains.some((suspicious) => domain.includes(suspicious))) {
    warnings.push("Using temporary email service");
  }
  sanitizedEmail = sanitizedEmail.toLowerCase().trim();
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedEmail,
  };
};

export const validateURL = (url: string): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedURL = url;
  if (!url || typeof url !== "string") {
    errors.push("URL is required and must be a string");
    return { isValid: false, errors, warnings };
  }
  try {
    const parsedURL = new URL(url);
    const allowedProtocols = ["http:", "https:", "ftp:", "ftps:"];
    if (!allowedProtocols.includes(parsedURL.protocol)) {
      errors.push("Protocol not allowed");
    }
    if (parsedURL.protocol !== "https:") {
      warnings.push("Consider using HTTPS for better security");
    }
    if (url.length > 2048) {
      errors.push("URL is too long (maximum 2048 characters)");
      sanitizedURL = url.substring(0, 2048);
      warnings.push("URL was truncated");
    }
  } catch (error) {
    errors.push("Invalid URL format");
  }
  sanitizedURL = sanitizedURL.trim();
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedURL,
  };
};

export const validateUUID = (uuid: string): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedUUID = uuid;
  if (!uuid || typeof uuid !== "string") {
    errors.push("UUID is required and must be a string");
    return { isValid: false, errors, warnings };
  }
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    errors.push("Invalid UUID format");
  }
  sanitizedUUID = sanitizedUUID.toLowerCase();
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedUUID,
  };
};

export const validateJSON = (
  json: string,
  schema?: Record<string, unknown>,
): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedData: unknown = null;
  if (!json || typeof json !== "string") {
    errors.push("JSON is required and must be a string");
    return { isValid: false, errors, warnings };
  }
  try {
    sanitizedData = JSON.parse(json);
    if (schema) {
      if (typeof schema === "object" && schema.type) {
        if (schema.type === "object" && typeof sanitizedData !== "object") {
          errors.push("JSON must be an object");
        } else if (schema.type === "array" && !Array.isArray(sanitizedData)) {
          errors.push("JSON must be an array");
        }
      }
    }
    if (json.length > 1048576) {
      warnings.push("JSON is large (>1MB)");
    }
  } catch (error) {
    errors.push("Invalid JSON format");
  }
  return { isValid: errors.length === 0, errors, warnings, sanitizedData };
};
