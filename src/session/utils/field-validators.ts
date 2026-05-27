import type { ValidationError } from "./validation-types";

export const FieldValidators = {
  duration: (value: number): ValidationError | null => {
    if (value < 60) {
      return {
        field: "duration",
        message: "Session must be at least 1 minute",
        code: "DURATION_TOO_SHORT",
        value,
      };
    }
    if (value > 86400) {
      return {
        field: "duration",
        message: "Session cannot exceed 24 hours",
        code: "DURATION_TOO_LONG",
        value,
      };
    }
    return null;
  },
  name: (value: string): ValidationError | null => {
    if (!value || value.trim().length === 0) {
      return {
        field: "name",
        message: "Session name is required",
        code: "NAME_REQUIRED",
        value,
      };
    }
    if (value.length > 100) {
      return {
        field: "name",
        message: "Session name must be 100 characters or less",
        code: "NAME_TOO_LONG",
        value,
      };
    }
    return null;
  },
  intervals: (value: number, duration: number): ValidationError | null => {
    if (value < 1) {
      return {
        field: "intervals",
        message: "Must have at least 1 interval",
        code: "INTERVALS_TOO_FEW",
        value,
      };
    }
    if (value > 20) {
      return {
        field: "intervals",
        message: "Cannot exceed 20 intervals",
        code: "INTERVALS_TOO_MANY",
        value,
      };
    }
    if (duration / value < 60) {
      return {
        field: "intervals",
        message: "Each interval must be at least 1 minute",
        code: "INTERVALS_TOO_SHORT",
        value,
      };
    }
    return null;
  },
};
