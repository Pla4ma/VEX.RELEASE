import type {
  SecurityConfig,
  SecurityValidationResult,
} from "./securityValidation-types";

export const validateXSS = (
  input: string,
  _config: SecurityConfig,
): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const threats: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (!input || typeof input !== "string") {
    return { isValid: true, errors, warnings, threats, securityLevel };
  }
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
    /<link\b[^>]*>/gi,
    /<meta\b[^>]*>/gi,
    /<style\b[^>]*>/gi,
    /<img\b[^>]*on\w+\s*=/gi,
    /<\s*script/gi,
    /<\s*\/\s*script/gi,
    /expression\s*\(/gi,
    /@import/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /<\s*body/gi,
    /<\s*html/gi,
  ];
  const detectedPatterns: string[] = [];
  for (const pattern of xssPatterns) {
    const matches = input.match(pattern);
    if (matches) {
      detectedPatterns.push(...matches.map((match) => match.substring(0, 50)));
      threats.push("XSS pattern detected");
      securityLevel = "low";
    }
  }
  if (detectedPatterns.length > 0) {
    errors.push(`XSS attack detected: ${detectedPatterns.join(", ")}`);
  }
  const entityPatterns = [
    /&lt;script/gi,
    /&gt;script/gi,
    /&#x3c;script/gi,
    /&#60;script/gi,
  ];
  for (const pattern of entityPatterns) {
    if (pattern.test(input)) {
      warnings.push("Potential encoded XSS detected");
      securityLevel = "medium";
    }
  }
  const urlSchemes = ["javascript:", "vbscript:", "data:", "file:", "ftp:"];
  const lowerInput = input.toLowerCase();
  for (const scheme of urlSchemes) {
    if (lowerInput.includes(scheme)) {
      errors.push(`Suspicious URL scheme detected: ${scheme}`);
      threats.push("Suspicious URL scheme");
      securityLevel = "low";
    }
  }
  const eventHandlers = [
    "onload",
    "onerror",
    "onclick",
    "onmouseover",
    "onmouseout",
    "onfocus",
    "onblur",
    "onchange",
    "onsubmit",
    "onreset",
    "onkeydown",
    "onkeyup",
    "onkeypress",
    "onmousedown",
    "onmouseup",
    "onmousemove",
    "ondblclick",
  ];
  for (const handler of eventHandlers) {
    if (lowerInput.includes(handler)) {
      errors.push(`Event handler detected: ${handler}`);
      threats.push("Event handler injection");
      securityLevel = "low";
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    threats,
    securityLevel,
  };
};

export const validateSQLInjection = (
  input: string,
): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const threats: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (!input || typeof input !== "string") {
    return { isValid: true, errors, warnings, threats, securityLevel };
  }
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|TRUNCATE)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(\b(OR|AND)\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/gi,
    /(\b(OR|AND)\s+['"]?\w+['"]?\s*LIKE\s*['"]?%?)/gi,
    /(\b(OR|AND)\s+['"]?\w+['"]?\s*IN\s*\()/gi,
    /(\b(OR|AND)\s+['"]?\w+['"]?\s*BETWEEN\s+)/gi,
    /(\b(OR|AND)\s+['"]?\w+['"]?\s*IS\s+(NULL|NOT\s+NULL))/gi,
    /(\/\*.*\*\/)/gi,
    /(--.*$)/gm,
    /(\bxp_cmdshell\b)/gi,
    /(\bsp_executesql\b)/gi,
    /(\bOPENROWSET\b)/gi,
    /(\bOPENDATASOURCE\b)/gi,
    /(\bLOAD_FILE\b)/gi,
    /(\bINTO\s+OUTFILE\b)/gi,
    /(\bINTO\s+DUMPFILE\b)/gi,
    /(\bCONCAT\s*\()/gi,
    /(\bCHAR\s*\()/gi,
    /(\bASCII\s*\()/gi,
    /(\bORD\s*\()/gi,
    /(\bSUBSTRING\s*\()/gi,
    /(\bLENGTH\s*\()/gi,
    /(\bCOUNT\s*\()/gi,
  ];
  const detectedPatterns: string[] = [];
  for (const pattern of sqlPatterns) {
    const matches = input.match(pattern);
    if (matches) {
      detectedPatterns.push(...matches.map((match) => match.substring(0, 50)));
      threats.push("SQL injection pattern detected");
      securityLevel = "low";
    }
  }
  if (detectedPatterns.length > 0) {
    errors.push(`SQL injection detected: ${detectedPatterns.join(", ")}`);
  }
  const commentPatterns = [/\/\*/, /\*\//, /--/, /\#/];
  const commentCount = commentPatterns.reduce((count, pattern) => {
    const patternString = pattern.source;
    return (
      count +
      (
        input.match(
          new RegExp(patternString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        ) || []
      ).length
    );
  }, 0);
  if (commentCount > 2) {
    warnings.push("Multiple SQL comments detected");
    securityLevel = "medium";
  }
  const singleQuotes = (input.match(/'/g) || []).length;
  const doubleQuotes = (input.match(/"/g) || []).length;
  if (singleQuotes > 5 || doubleQuotes > 5) {
    warnings.push("High number of quotes detected");
    securityLevel = "medium";
  }
  const suspiciousChars = [";", "|", "&", "<", ">", "`", "$", "%"];
  const suspiciousCount = suspiciousChars.reduce((count, char) => {
    return (
      count +
      (
        input.match(
          new RegExp(`\\${char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g"),
        ) || []
      ).length
    );
  }, 0);
  if (suspiciousCount > 3) {
    warnings.push("Suspicious characters detected");
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
