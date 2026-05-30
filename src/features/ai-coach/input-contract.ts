import {
  CoachInputContractSchema,
  type CoachInputContract,
} from "./input-contract-schema";
import { sanitizeCoachInput } from "./input-contract-privacy";

export {
  CoachInputContractSchema,
  type CoachInputContract,
} from "./input-contract-schema";
export {
  FORBIDDEN_DATA_FIELDS,
  containsForbiddenPII,
} from "./input-contract-privacy";
export { createFallbackInsight } from "./input-contract-fallback";

export function validateCoachInput(rawInput: unknown): CoachInputContract {
  const parsed = CoachInputContractSchema.parse(rawInput);
  return sanitizeCoachInput(parsed);
}
