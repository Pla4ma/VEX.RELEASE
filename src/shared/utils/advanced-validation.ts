export function validateArray<T>(
  value: unknown,
  itemValidator: (item: unknown) => item is T,
  options: {
    minLength?: number;
    maxLength?: number;
    unique?: boolean;
    uniqueKey?: keyof T;
  } = {},
): { valid: boolean; data: T[]; errors: string[] } {
  const errors: string[] = [];
  if (!Array.isArray(value)) {
    return { valid: false, data: [], errors: ["Value is not an array"] };
  }
  const validItems: T[] = [];
  const invalidIndices: number[] = [];
  value.forEach((item, index) => {
    if (itemValidator(item)) {
      validItems.push(item);
    } else {
      invalidIndices.push(index);
    }
  });
  if (invalidIndices.length > 0) {
    errors.push(`Invalid items at indices: ${invalidIndices.join(", ")}`);
  }
  if (options.minLength !== undefined && validItems.length < options.minLength) {
    errors.push(`Array must have at least ${options.minLength} items`);
  }
  if (options.maxLength !== undefined && validItems.length > options.maxLength) {
    errors.push(`Array must have at most ${options.maxLength} items`);
  }
  if (options.unique) {
    if (options.uniqueKey) {
      const seen = new Set<unknown>();
      validItems.forEach((item, index) => {
        const key = item[options.uniqueKey!];
        if (seen.has(key)) {
          errors.push(
            `Duplicate value at index ${index} for key ${String(options.uniqueKey)}`,
          );
        }
        seen.add(key);
      });
    } else {
      const seen = new Set(validItems);
      if (seen.size !== validItems.length) {
        errors.push("Array contains duplicate values");
      }
    }
  }
  return { valid: errors.length === 0, data: validItems, errors };
}

export function validateDateRange(
  start: Date,
  end: Date,
  options: { maxDuration?: number; allowSame?: boolean } = {},
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!(start instanceof Date) || isNaN(start.getTime())) {
    errors.push("Start date is invalid");
  }
  if (!(end instanceof Date) || isNaN(end.getTime())) {
    errors.push("End date is invalid");
  }
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  if (end < start) {
    errors.push("End date must be after start date");
  }
  if (!options.allowSame && end.getTime() === start.getTime()) {
    errors.push("Start and end dates must be different");
  }
  if (options.maxDuration) {
    const duration = end.getTime() - start.getTime();
    if (duration > options.maxDuration) {
      errors.push(`Duration exceeds maximum of ${options.maxDuration}ms`);
    }
  }
  return { valid: errors.length === 0, errors };
}

export interface PasswordValidationResult {
  valid: boolean;
  strength: "weak" | "medium" | "strong";
  score: number;
  feedback: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const feedback: string[] = [];
  let score = 0;
  if (password.length >= 8) { score += 1; } else {
    feedback.push("Password must be at least 8 characters");
  }
  if (password.length >= 12) { score += 1; }
  if (/[a-z]/.test(password)) { score += 1; } else {
    feedback.push("Add lowercase letters");
  }
  if (/[A-Z]/.test(password)) { score += 1; } else {
    feedback.push("Add uppercase letters");
  }
  if (/\d/.test(password)) { score += 1; } else {
    feedback.push("Add numbers");
  }
  if (/[^a-zA-Z0-9]/.test(password)) { score += 1; } else {
    feedback.push("Add special characters");
  }
  let strength: "weak" | "medium" | "strong";
  if (score >= 5) { strength = "strong"; }
  else if (score >= 3) { strength = "medium"; }
  else { strength = "weak"; }
  return { valid: score >= 3 && password.length >= 8, strength, score, feedback };
}
