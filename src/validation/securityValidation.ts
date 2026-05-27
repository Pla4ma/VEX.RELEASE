export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  threats: string[];
  sanitizedData?: unknown;
  securityLevel: "low" | "medium" | "high";
}
export interface SecurityConfig {
  enableXSSProtection: boolean;
  enableSQLInjectionProtection: boolean;
  enableCSRFProtection: boolean;
  enableInputSanitization: boolean;
  maxInputLength: number;
  allowedTags?: string[];
  allowedAttributes?: string[];
  blockedPatterns?: RegExp[];
}
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
export const validateCSRF = (
  token: string,
  sessionToken: string,
): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const threats: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (!token) {
    errors.push("CSRF token is missing");
    threats.push("Missing CSRF protection");
    securityLevel = "low";
  }
  if (!sessionToken) {
    errors.push("Session token is missing");
    threats.push("Missing session validation");
    securityLevel = "low";
  }
  if (token && sessionToken) {
    if (token.length < 20) {
      errors.push("CSRF token is too short");
      threats.push("Weak CSRF token");
      securityLevel = "low";
    }
    if (sessionToken.length < 20) {
      errors.push("Session token is too short");
      threats.push("Weak session token");
      securityLevel = "low";
    }
    const tokenRegex = /^[a-zA-Z0-9_-]+$/;
    if (!tokenRegex.test(token)) {
      errors.push("Invalid CSRF token format");
      threats.push("Malformed CSRF token");
      securityLevel = "low";
    }
    if (!tokenRegex.test(sessionToken)) {
      errors.push("Invalid session token format");
      threats.push("Malformed session token");
      securityLevel = "low";
    }
    const uniqueChars = new Set(token).size;
    if (uniqueChars < token.length * 0.3) {
      warnings.push("CSRF token may have low entropy");
      securityLevel = "medium";
    }
    const sessionUniqueChars = new Set(sessionToken).size;
    if (sessionUniqueChars < sessionToken.length * 0.3) {
      warnings.push("Session token may have low entropy");
      securityLevel = "medium";
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
export const sanitizeInput = (
  input: string,
  config: SecurityConfig,
): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const threats: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  let sanitizedInput = input;
  if (!input || typeof input !== "string") {
    return { isValid: true, errors, warnings, threats, securityLevel };
  }
  if (input.length > config.maxInputLength) {
    errors.push(`Input exceeds maximum length (${config.maxInputLength})`);
    sanitizedInput = input.substring(0, config.maxInputLength);
    warnings.push("Input was truncated to maximum length");
  }
  if (config.enableInputSanitization) {
    const tagPattern = /<[^>]*>/g;
    const tagMatches = input.match(tagPattern);
    if (tagMatches) {
      warnings.push(
        `HTML tags detected and removed: ${tagMatches.length} tags`,
      );
      sanitizedInput = sanitizedInput.replace(tagPattern, "");
    }
    if (config.allowedTags && config.allowedTags.length > 0) {
      const allowedTagPattern = new RegExp(
        `<(?!\\/?(${config.allowedTags.join("|")})\\b)[^>]*>`,
        "gi",
      );
      const disallowedMatches = sanitizedInput.match(allowedTagPattern);
      if (disallowedMatches) {
        warnings.push(
          `Disallowed HTML tags removed: ${disallowedMatches.length} tags`,
        );
        sanitizedInput = sanitizedInput.replace(allowedTagPattern, "");
      }
    }
  }
  if (config.allowedAttributes && config.allowedAttributes.length > 0) {
    const attributePattern = /\b(\w+)=/g;
    const attributes = [];
    let match;
    while ((match = attributePattern.exec(sanitizedInput)) !== null) {
      attributes.push(match[1]!);
    }
    const disallowedAttributes = attributes.filter(
      (attr) => !config.allowedAttributes!.includes(attr),
    );
    if (disallowedAttributes.length > 0) {
      warnings.push(
        `Disallowed attributes detected: ${disallowedAttributes.join(", ")}`,
      );
      for (const attr of disallowedAttributes) {
        const attrPattern = new RegExp(
          `\\b${attr}\\s*=\\s*["'][^"']*["']`,
          "gi",
        );
        sanitizedInput = sanitizedInput.replace(attrPattern, "");
      }
    }
  }
  if (config.blockedPatterns && config.blockedPatterns.length > 0) {
    for (const pattern of config.blockedPatterns) {
      const matches = sanitizedInput.match(pattern);
      if (matches) {
        warnings.push(
          `Blocked pattern detected and removed: ${pattern.source}`,
        );
        sanitizedInput = sanitizedInput.replace(pattern, "");
        threats.push("Blocked content detected");
        securityLevel = "low";
      }
    }
  }
  sanitizedInput = sanitizedInput.replace(/\s+/g, " ").trim();
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    threats,
    securityLevel,
    sanitizedData: sanitizedInput,
  };
};
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
    warnings.push(
      `Approaching rate limit: ${requestCount}/${maxRequests} requests`,
    );
    securityLevel = "medium";
  }
  if (requestCount > maxRequests * 2) {
    errors.push(
      `Suspicious activity: ${requestCount} requests (limit: ${maxRequests})`,
    );
    threats.push("Potential DDoS attack");
    securityLevel = "low";
  }
  const requestsPerSecond = requestCount / (windowMs / 1000);
  if (requestsPerSecond > 10) {
    warnings.push(
      `High request rate: ${requestsPerSecond.toFixed(2)} requests/second`,
    );
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
export const validateSecurity = (
  data: unknown,
  config: SecurityConfig,
  _context: "input" | "output" | "file" | "api" = "input",
): SecurityValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const allThreats: string[] = [];
  let overallSecurityLevel: "low" | "medium" | "high" = "medium";
  if (typeof data === "string") {
    if (config.enableXSSProtection) {
      const xssResult = validateXSS(data, config);
      allErrors.push(...xssResult.errors);
      allWarnings.push(...xssResult.warnings);
      allThreats.push(...xssResult.threats);
    }
    if (config.enableSQLInjectionProtection) {
      const sqlResult = validateSQLInjection(data);
      allErrors.push(...sqlResult.errors);
      allWarnings.push(...sqlResult.warnings);
      allThreats.push(...sqlResult.threats);
    }
    if (config.enableInputSanitization) {
      const sanitizeResult = sanitizeInput(data, config);
      allErrors.push(...sanitizeResult.errors);
      allWarnings.push(...sanitizeResult.warnings);
      allThreats.push(...sanitizeResult.threats);
      if (sanitizeResult.sanitizedData !== undefined) {
        data = sanitizeResult.sanitizedData;
      }
    }
  }
  if (typeof data === "object" && data !== null) {
    const validateObject = (
      obj: Record<string, unknown>,
      path: string = "",
    ): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof value === "string") {
          if (config.enableXSSProtection) {
            const xssResult = validateXSS(value, config);
            if (xssResult.errors.length > 0) {
              allErrors.push(
                ...xssResult.errors.map((err) => `${currentPath}: ${err}`),
              );
            }
            if (xssResult.warnings.length > 0) {
              allWarnings.push(
                ...xssResult.warnings.map((warn) => `${currentPath}: ${warn}`),
              );
            }
            if (xssResult.threats.length > 0) {
              allThreats.push(
                ...xssResult.threats.map(
                  (threat) => `${currentPath}: ${threat}`,
                ),
              );
            }
          }
          if (config.enableSQLInjectionProtection) {
            const sqlResult = validateSQLInjection(value);
            if (sqlResult.errors.length > 0) {
              allErrors.push(
                ...sqlResult.errors.map((err) => `${currentPath}: ${err}`),
              );
            }
            if (sqlResult.warnings.length > 0) {
              allWarnings.push(
                ...sqlResult.warnings.map((warn) => `${currentPath}: ${warn}`),
              );
            }
            if (sqlResult.threats.length > 0) {
              allThreats.push(
                ...sqlResult.threats.map(
                  (threat) => `${currentPath}: ${threat}`,
                ),
              );
            }
          }
        } else if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          validateObject(value as Record<string, unknown>, currentPath);
        }
      }
    };
    validateObject(data as Record<string, unknown>);
  }
  if (Array.isArray(data)) {
    if (data.length > 1000) {
      allWarnings.push("Large array detected");
    }
    data.forEach((item, index) => {
      if (typeof item === "string") {
        if (config.enableXSSProtection) {
          const xssResult = validateXSS(item, config);
          if (xssResult.errors.length > 0) {
            allErrors.push(
              ...xssResult.errors.map((err) => `Array[${index}]: ${err}`),
            );
          }
        }
      }
    });
  }
  if (allThreats.length > 0) {
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
    threats: allThreats,
    securityLevel: overallSecurityLevel,
    sanitizedData: data,
  };
};
