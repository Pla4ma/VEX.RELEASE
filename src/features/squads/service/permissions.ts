/**
 * Squads Service Permissions
 * Role and permission management
 */

import { ROLE_PERMISSIONS, ROLE_HIERARCHY } from './constants';
import type { SquadRole, SquadPermission, SquadMember } from '../schemas';

export function getRolePermissions(role: SquadRole): SquadPermission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function hasPermission(member: SquadMember | null | undefined, permission: SquadPermission): boolean {
  if (!member?.isActive) {return false;}
  const permissions = getRolePermissions(member.role);
  return permissions.includes(permission);
}

export function canManageRole(adminRole: SquadRole, targetRole: SquadRole): boolean {
  const adminIndex = ROLE_HIERARCHY.indexOf(adminRole);
  const targetIndex = ROLE_HIERARCHY.indexOf(targetRole);
  return adminIndex < targetIndex;
}
