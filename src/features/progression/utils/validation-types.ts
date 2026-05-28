import { z } from "zod";
import { XPTransactionSchema } from "./validation/types";
import { validateXPTransaction } from "./validation/xp-validation";
import { validateLevelUp, validatePrestige } from "./validation/level-validation";
import { validateXPBatch } from "./validation/batch-validation";

export type XPTransaction = z.infer<typeof XPTransactionSchema>;

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  violations: Violation[];
  warnings: Warning[];
  riskScore: number;
}

export interface Violation {
  type: "RATE_LIMIT" | "IMPOSSIBLE" | "SUSPICIOUS" | "POLICY";
  field: string;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  details?: Record<string, unknown>;
}

export interface Warning {
  field: string;
  message: string;
  code: string;
}

export const ProgressionValidation = {
  validateXPTransaction,
  validateLevelUp,
  validatePrestige,
  validateXPBatch,
};
