export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

export function sanitizeString(
  input: string,
  options: {
    maxLength?: number;
    trim?: boolean;
    lowercase?: boolean;
    removeSpecialChars?: boolean;
  } = {},
): string {
  let result = input;
  if (options.trim !== false) {
    result = result.trim();
  }
  if (options.lowercase) {
    result = result.toLowerCase();
  }
  if (options.removeSpecialChars) {
    result = result.replace(/[^a-zA-Z0-9\s]/g, '');
  }
  if (options.maxLength && result.length > options.maxLength) {
    result = result.slice(0, options.maxLength);
  }
  return result;
}

export function truncateString(
  input: string,
  maxLength: number,
  suffix: string = '...',
): string {
  if (input.length <= maxLength) {
    return input;
  }
  return input.slice(0, maxLength - suffix.length) + suffix;
}

export function formatNumber(
  value: number,
  options: { decimals?: number; compact?: boolean; locale?: string } = {},
): string {
  const { decimals = 0, compact = false, locale = 'en-US' } = options;
  if (compact && Math.abs(value) >= 1000) {
    return Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: decimals,
    }).format(value);
  }
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function parseNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}
