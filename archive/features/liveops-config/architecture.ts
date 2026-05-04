import { z } from 'zod';

export const CanonicalProductSpineSchema = z.enum([
  'HOME',
  'START_SESSION',
  'ACTIVE_SESSION',
  'SESSION_COMPLETE',
  'RETURN_REASON',
]);
export type CanonicalProductSpine = z.infer<typeof CanonicalProductSpineSchema>;

export const DomainOwnerSchema = z.object({
  domain: z.string(),
  ownerPath: z.string(),
  notes: z.string(),
});
export type DomainOwner = z.infer<typeof DomainOwnerSchema>;

export const CANONICAL_PRODUCT_SPINE: CanonicalProductSpine[] = [
  'HOME',
  'START_SESSION',
  'ACTIVE_SESSION',
  'SESSION_COMPLETE',
  'RETURN_REASON',
];

export const DOMAIN_OWNERS: DomainOwner[] = [
  {
    domain: 'focus-session',
    ownerPath: 'src/session',
    notes: 'Primary source of truth for session orchestration and completion.',
  },
  {
    domain: 'liveops-access',
    ownerPath: 'src/features/liveops-config',
    notes: 'Primary source of truth for feature exposure, tiering, and unlock sequencing.',
  },
  {
    domain: 'premium-access',
    ownerPath: 'src/shared/monetization',
    notes: 'Primary source of truth for subscription entitlements and paywall messaging.',
  },
];
