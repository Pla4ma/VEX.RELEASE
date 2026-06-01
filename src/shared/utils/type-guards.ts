import { captureSilentFailure } from '../../utils/silent-failure';

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

export function isValidEmail(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function isValidUUID(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function isValidURL(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  try {
    void new URL(value);
    return true;
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'shared',
      operation: 'safe-fallback',
      type: 'data',
    });
    return false;
  }
}

export function isValidImageURL(value: unknown): boolean {
  if (!isValidURL(value)) {
    return false;
  }
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const url = (value as string).toLowerCase();
  return imageExtensions.some((ext) => url.endsWith(ext));
}
