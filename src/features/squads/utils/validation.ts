/**
 * Squad Validation Utilities
 *
 * Validates squad operations, member limits, permissions.
 *
 * @phase 4 - Deepening: Squad validation
 */

import { z } from 'zod';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('squads:validation');

// ============================================================================
// Schemas
// ============================================================================

export const SquadRoleSchema = z.enum(['FOUNDER', 'LEADER', 'ELITE', 'MEMBER']);
export type SquadRole = z.infer<typeof SquadRoleSchema>;

export const SquadLimits = {
  MAX_NAME_LENGTH: 30,
  MIN_NAME_LENGTH: 3,
  MAX_DESCRIPTION_LENGTH: 200,
  MAX_MEMBERS: 10,
  MAX_ELITE: 3,
  MAX_LEADERS: 2,
  MAX_SQUADS_PER_USER: 1,
  INVITE_EXPIRY_HOURS: 48,
} as const;

// ============================================================================
// Validation Functions
// ============================================================================

export function validateSquadName(name: string): {
  valid: boolean;
  errors: string[];
  normalized?: string;
} {
  const errors: string[] = [];

  const trimmed = name.trim();

  if (trimmed.length < SquadLimits.MIN_NAME_LENGTH) {
    errors.push(`Squad name must be at least ${SquadLimits.MIN_NAME_LENGTH} characters`);
  }

  if (trimmed.length > SquadLimits.MAX_NAME_LENGTH) {
    errors.push(`Squad name must be ${SquadLimits.MAX_NAME_LENGTH} characters or less`);
  }

  // Check for profanity (simplified - would use actual filter in production)
  const bannedWords = ['admin', 'moderator', 'support', 'official'];
  if (bannedWords.some(word => trimmed.toLowerCase().includes(word))) {
    errors.push('Squad name contains reserved words');
  }

  // Check for special characters
  if (!/^[a-zA-Z0-9\s_-]+$/.test(trimmed)) {
    errors.push('Squad name can only contain letters, numbers, spaces, hyphens, and underscores');
  }

  return {
    valid: errors.length === 0,
    errors,
    normalized: trimmed,
  };
}

export function validateSquadDescription(description: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (description.length > SquadLimits.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be ${SquadLimits.MAX_DESCRIPTION_LENGTH} characters or less`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateMemberRoleChange(
  currentRole: SquadRole,
  newRole: SquadRole,
  requesterRole: SquadRole,
  targetUserId: string,
  requesterUserId: string
): { valid: boolean; error?: string } {
  // Can't change own role
  if (targetUserId === requesterUserId) {
    return { valid: false, error: 'Cannot change your own role' };
  }

  // Role hierarchy
  const roleHierarchy: Record<SquadRole, number> = {
    FOUNDER: 4,
    LEADER: 3,
    ELITE: 2,
    MEMBER: 1,
  };

  // Must have higher role than target to modify them
  if (roleHierarchy[requesterRole] <= roleHierarchy[currentRole]) {
    return { valid: false, error: 'Cannot modify a member with equal or higher rank' };
  }

  // Can't promote beyond own rank
  if (roleHierarchy[newRole] >= roleHierarchy[requesterRole]) {
    return { valid: false, error: 'Cannot promote member to your rank or higher' };
  }

  // Only founder can create new leaders
  if (newRole === 'LEADER' && requesterRole !== 'FOUNDER') {
    return { valid: false, error: 'Only the founder can appoint leaders' };
  }

  return { valid: true };
}

export function validateKickMember(
  targetRole: SquadRole,
  requesterRole: SquadRole,
  isFounder: boolean
): { valid: boolean; error?: string } {
  const roleHierarchy: Record<SquadRole, number> = {
    FOUNDER: 4,
    LEADER: 3,
    ELITE: 2,
    MEMBER: 1,
  };

  // Can't kick founder
  if (targetRole === 'FOUNDER') {
    return { valid: false, error: 'Cannot remove the founder' };
  }

  // Must have higher rank
  if (roleHierarchy[requesterRole] <= roleHierarchy[targetRole]) {
    return { valid: false, error: 'Cannot kick a member with equal or higher rank' };
  }

  return { valid: true };
}

export function validateSquadLimits(
  currentMembers: Array<{ role: SquadRole }>,
  proposedChange: { role: SquadRole; action: 'ADD' | 'REMOVE' | 'UPDATE' }
): { valid: boolean; error?: string } {
  const roleCounts = {
    FOUNDER: currentMembers.filter(m => m.role === 'FOUNDER').length,
    LEADER: currentMembers.filter(m => m.role === 'LEADER').length,
    ELITE: currentMembers.filter(m => m.role === 'ELITE').length,
    MEMBER: currentMembers.filter(m => m.role === 'MEMBER').length,
  };

  if (proposedChange.action === 'ADD') {
    const totalMembers = currentMembers.length + 1;

    if (totalMembers > SquadLimits.MAX_MEMBERS) {
      return { valid: false, error: `Squad is full (${SquadLimits.MAX_MEMBERS} members max)` };
    }

    if (proposedChange.role === 'ELITE' && roleCounts.ELITE >= SquadLimits.MAX_ELITE) {
      return { valid: false, error: `Maximum ${SquadLimits.MAX_ELITE} elite members allowed` };
    }

    if (proposedChange.role === 'LEADER' && roleCounts.LEADER >= SquadLimits.MAX_LEADERS) {
      return { valid: false, error: `Maximum ${SquadLimits.MAX_LEADERS} leaders allowed` };
    }
  }

  if (proposedChange.action === 'REMOVE' && proposedChange.role === 'FOUNDER') {
    // Can't remove founder without transferring ownership
    if (roleCounts.FOUNDER === 1) {
      return { valid: false, error: 'Transfer ownership before removing founder' };
    }
  }

  return { valid: true };
}

export function validateSynergyLevel(level: number): { valid: boolean; error?: string } {
  if (level < 1) {
    return { valid: false, error: 'Synergy level cannot be less than 1' };
  }

  if (level > 50) {
    return { valid: false, error: 'Maximum synergy level is 50' };
  }

  return { valid: true };
}

// ============================================================================
// Export
// ============================================================================

export const SquadValidation = {
  validateSquadName,
  validateSquadDescription,
  validateMemberRoleChange,
  validateKickMember,
  validateSquadLimits,
  validateSynergyLevel,
  SquadLimits,
  SquadRoleSchema,
};

export default SquadValidation;
