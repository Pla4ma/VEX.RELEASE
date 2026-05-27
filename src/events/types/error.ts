/**
 * Error Events
 */

import type { AppError } from "../../types/global";

export interface ErrorEventDefinitions {
  "error:handler": {
    originalEvent: string;
    error: unknown;
    data: unknown;
    timestamp: number;
  };
  "error:captured": { error: AppError; context?: Record<string, unknown> };
  "error:fatal": { error: Error; stack?: string };
}
