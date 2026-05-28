import type { ValidationError, ValidationResult } from "./types";

const VALID_OPERATORS = ["eq", "ne", "gt", "gte", "lt", "lte", "in"] as const;

const VALID_DIMENSIONS = [
  "day_of_week",
  "hour_of_day",
  "session_category",
  "streak_milestone",
  "boss_type",
  "item_type",
  "challenge_difficulty",
  "social_activity_type",
  "time_of_day",
  "device_type",
] as const;

export function validateFilter(filter: {
  dimension: string;
  operator: string;
  value: unknown;
}): ValidationResult {
  const errors: ValidationError[] = [];

  if (!(VALID_DIMENSIONS as readonly string[]).includes(filter.dimension)) {
    errors.push({
      field: "dimension",
      code: "INVALID_DIMENSION",
      message: `Dimension "${filter.dimension}" is not valid`,
      severity: "error",
      recoveryHint: `Valid dimensions: ${VALID_DIMENSIONS.join(", ")}`,
      value: filter.dimension,
    });
  }

  if (!(VALID_OPERATORS as readonly string[]).includes(filter.operator)) {
    errors.push({
      field: "operator",
      code: "INVALID_OPERATOR",
      message: `Operator "${filter.operator}" is not valid`,
      severity: "error",
      recoveryHint: `Valid operators: ${VALID_OPERATORS.join(", ")}`,
      value: filter.operator,
    });
  }

  if (filter.operator === "in" && !Array.isArray(filter.value)) {
    errors.push({
      field: "value",
      code: "INVALID_VALUE_TYPE",
      message: 'Value must be an array for "in" operator',
      severity: "error",
      recoveryHint: "Provide an array of values",
      value: filter.value,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
    sanitized: errors.length === 0 ? filter : undefined,
  };
}
