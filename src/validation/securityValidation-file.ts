import type { SecurityValidationResult } from "./securityValidation-types";

export const validateFileUpload = (
  file: File,
  allowedTypes: string[],
  maxSize: number,
): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const threats: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (!file) {
    errors.push("No file provided");
    return { isValid: false, errors, warnings, threats, securityLevel };
  }
  if (file.size > maxSize) {
    errors.push(`File too large: ${file.size} bytes (max: ${maxSize})`);
    threats.push("Oversized file upload");
    securityLevel = "low";
  }
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type not allowed: ${file.type}`);
    threats.push("Disallowed file type");
    securityLevel = "low";
  }
  const fileName = file.name.toLowerCase();
  const dangerousExtensions = [
    ".exe",
    ".bat",
    ".cmd",
    ".com",
    ".pif",
    ".scr",
    ".vbs",
    ".js",
    ".jar",
    ".app",
    ".deb",
    ".pkg",
    ".dmg",
    ".rpm",
    ".msi",
    ".php",
    ".asp",
    ".aspx",
    ".jsp",
    ".py",
    ".rb",
    ".pl",
    ".sh",
    ".sql",
    ".mdb",
    ".accdb",
    ".db",
    ".sqlite",
  ];
  const hasDangerousExtension = dangerousExtensions.some((ext) =>
    fileName.endsWith(ext),
  );
  if (hasDangerousExtension) {
    errors.push(`Dangerous file extension detected: ${file.name}`);
    threats.push("Dangerous file type");
    securityLevel = "low";
  }
  const suspiciousPatterns = [
    /\./,
    /^\.+/,
    /[<>:"|?*]/,
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i,
  ];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fileName)) {
      warnings.push(`Suspicious file name: ${file.name}`);
      securityLevel = "medium";
    }
  }
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "text/plain",
    "text/csv",
    "application/pdf",
    "application/json",
    "application/xml",
  ];
  if (!allowedMimeTypes.includes(file.type)) {
    warnings.push(`Unusual MIME type: ${file.type}`);
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
