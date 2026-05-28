// Barrel — schema/type definitions live in day0-surface-types.ts,
// enforcement logic lives in day0-surface-enforcement.ts

export {
  Day0PolicyLimitSchema,
  type Day0PolicyLimits,
  DEFAULT_DAY0_POLICY,
  type Day0PolicyResult,
} from "./day0-surface-types";

export {
  enforceDay0SurfacePolicy,
  isDay0SurfacePolicyValid,
} from "./day0-surface-enforcement";
