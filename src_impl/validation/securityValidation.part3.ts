

export const validateFileUpload = (
  file: File,
  allowedTypes: string[],
  maxSize: number
): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const threats: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors, warnings, threats, securityLevel };
  }

  // File size validation
  if (file.size > maxSize) {
    errors.push(`File too large: ${file.size} bytes (max: ${maxSize})`);
    threats.push('Oversized file upload');
    securityLevel = 'low';
  }

  // File type validation
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type not allowed: ${file.type}`);
    threats.push('Disallowed file type');
    securityLevel = 'low';
  }

  // File name validation
  const fileName = file.name.toLowerCase();

  // Dangerous file extensions
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
    '.jar', '.app', '.deb', '.pkg', '.dmg', '.rpm', '.msi',
    '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh',
    '.sql', '.mdb', '.accdb', '.db', '.sqlite',
  ];

  const hasDangerousExtension = dangerousExtensions.some(ext => fileName.endsWith(ext));
  if (hasDangerousExtension) {
    errors.push(`Dangerous file extension detected: ${file.name}`);
    threats.push('Dangerous file type');
    securityLevel = 'low';
  }

  // Suspicious file names
  const suspiciousPatterns = [
    /\./,  // Hidden files
    /^\.+/, // Multiple dots
    /[<>:"|?*]/, // Invalid characters
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i, // Reserved names
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fileName)) {
      warnings.push(`Suspicious file name: ${file.name}`);
      securityLevel = 'medium';
    }
  }

  // MIME type validation
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'text/plain', 'text/csv', 'application/pdf',
    'application/json', 'application/xml',
  ];

  if (!allowedMimeTypes.includes(file.type)) {
    warnings.push(`Unusual MIME type: ${file.type}`);
    securityLevel = 'medium';
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
  maxRequests: number
): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const threats: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  if (requestCount >= maxRequests) {
    errors.push(`Rate limit exceeded: ${requestCount}/${maxRequests} requests`);
    threats.push('Rate limit violation');
    securityLevel = 'low';
  } else if (requestCount >= maxRequests * 0.8) {
    warnings.push(`Approaching rate limit: ${requestCount}/${maxRequests} requests`);
    securityLevel = 'medium';
  }

  // Suspicious activity detection
  if (requestCount > maxRequests * 2) {
    errors.push(`Suspicious activity: ${requestCount} requests (limit: ${maxRequests})`);
    threats.push('Potential DDoS attack');
    securityLevel = 'low';
  }

  // Check for rapid successive requests
  const requestsPerSecond = requestCount / (windowMs / 1000);
  if (requestsPerSecond > 10) {
    warnings.push(`High request rate: ${requestsPerSecond.toFixed(2)} requests/second`);
    securityLevel = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    threats,
    securityLevel,
  };
};

export const validateIPAddressSecurity = (ip: string, context: 'client' | 'server' | 'proxy'): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const threats: string[] = [];
  let securityLevel: 'low' | 'medium' | 'high' = 'medium';

  if (!ip) {
    errors.push('IP address is required');
    return { isValid: false, errors, warnings, threats, securityLevel };
  }

  // IPv4 validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 validation (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
    errors.push('Invalid IP address format');
    threats.push('Invalid IP address');
    securityLevel = 'low';
  }

  // Check for private/internal IPs
  const privateRanges = [
    /^10\./,           // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,     // 192.168.0.0/16
    /^127\./,          // 127.0.0.0/8 (localhost)
    /^169\.254\./,     // 169.254.0.0/16 (link-local)
    /^::1$/,           // IPv6 localhost
    /^fc00:/,          // IPv6 unique local
    /^fe80:/,          // IPv6 link-local
  ];

  const isPrivate = privateRanges.some(range => range.test(ip));

  if (context === 'client' && isPrivate) {
    warnings.push('Client IP is from private range');
    securityLevel = 'medium';
  }

  if (context === 'server' && isPrivate) {
    errors.push('Server IP cannot be from private range');
    threats.push('Invalid server IP');
    securityLevel = 'low';
  }

  // Check for known malicious IPs (simplified)
  const knownMalicious = [
    /^0\./,            // This network
    /^255\./,          // Broadcast
    /^224\./,          // Multicast
    /^240\./,          // Reserved
  ];

  if (knownMalicious.some(range => range.test(ip))) {
    errors.push('IP address from reserved or malicious range');
    threats.push('Malicious IP address');
    securityLevel = 'low';
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    threats,
    securityLevel,
  };
};