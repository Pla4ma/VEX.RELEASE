/**
 * Squad Invite Flow Service
 *
 * Manages squad invitations, responses, and onboarding.
 */

import { z } from 'zod';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('squads:invite');

// Invite status
export type SquadInviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

// Squad invite schema
export const SquadInviteSchema = z.object({
  id: z.string(),
  squadId: z.string(),
  squadName: z.string(),
  squadAvatar: z.string().optional(),
  invitedByUserId: z.string(),
  invitedByName: z.string(),
  invitedUserId: z.string(),
  status: z.enum(['pending', 'accepted', 'declined', 'expired']),
  message: z.string(),
  createdAt: z.number(),
  expiresAt: z.number(),
  respondedAt: z.number().nullable(),
  role: z.enum(['member', 'captain', 'vice_captain']),
});

export type SquadInvite = z.infer<typeof SquadInviteSchema>;

// Create squad invite
export async function createSquadInvite(
  squadId: string,
  squadName: string,
  invitedByUserId: string,
  invitedByName: string,
  invitedUserId: string,
  options: {
    message?: string;
    role?: SquadInvite['role'];
    expiresInHours?: number;
  } = {}
): Promise<SquadInvite> {
  const now = Date.now();
  const expiresInHours = options.expiresInHours ?? 48;

  const invite: SquadInvite = {
    id: `invite-${squadId}-${invitedUserId}-${now}`,
    squadId,
    squadName,
    invitedByUserId,
    invitedByName,
    invitedUserId,
    status: 'pending',
    message: options.message ?? `${invitedByName} invited you to join ${squadName}!`,
    createdAt: now,
    expiresAt: now + expiresInHours * 60 * 60 * 1000,
    respondedAt: null,
    role: options.role ?? 'member',
  };

  debug.info('Created squad invite: %s for user %s to squad %s', invite.id, invitedUserId, squadId);
  return invite;
}

// Accept squad invite
export async function acceptSquadInvite(inviteId: string): Promise<SquadInvite | null> {
  debug.info('Accepting squad invite: %s', inviteId);

  // In production: update database, add user to squad
  // const updated = await db.squadInvites.update(...)

  return null;
}

// Decline squad invite
export async function declineSquadInvite(
  inviteId: string,
  reason?: string
): Promise<SquadInvite | null> {
  debug.info('Declining squad invite: %s (reason: %s)', inviteId, reason ?? 'none');

  // In production: update database
  // const updated = await db.squadInvites.update(...)

  return null;
}

// Get pending invites for user
export async function getPendingSquadInvites(userId: string): Promise<SquadInvite[]> {
  debug.info('Fetching pending squad invites for user: %s', userId);

  // In production: query database for pending invites
  // return db.squadInvites.findMany({ where: { invitedUserId: userId, status: 'pending' } })

  return [];
}

// Check if invite is expired
export function isSquadInviteExpired(invite: SquadInvite): boolean {
  return invite.expiresAt < Date.now();
}

// Get invite expiration message
export function getInviteExpirationMessage(invite: SquadInvite): string {
  const hoursRemaining = Math.ceil((invite.expiresAt - Date.now()) / (60 * 60 * 1000));

  if (hoursRemaining <= 0) {
    return 'This invite has expired';
  }
  if (hoursRemaining === 1) {
    return 'Expires in 1 hour';
  }
  if (hoursRemaining <= 24) {
    return `Expires in ${hoursRemaining} hours`;
  }

  const daysRemaining = Math.ceil(hoursRemaining / 24);
  return `Expires in ${daysRemaining} days`;
}

// Squad invite notification content
export function createSquadInviteNotification(invite: SquadInvite): {
  title: string;
  body: string;
  actionType: 'squad_invite';
} {
  return {
    title: 'Squad Invitation',
    body: `${invite.invitedByName} invited you to join ${invite.squadName}`,
    actionType: 'squad_invite',
  };
}

// Post-accept onboarding steps
export type OnboardingStep =
  | 'view_squad_hub'
  | 'meet_members'
  | 'check_war_status'
  | 'join_first_war'
  | 'complete';

export interface SquadOnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  squadId: string;
  joinedAt: number;
}

// Create onboarding state for new member
export function createSquadOnboarding(squadId: string): SquadOnboardingState {
  return {
    currentStep: 'view_squad_hub',
    completedSteps: [],
    squadId,
    joinedAt: Date.now(),
  };
}

// Advance onboarding step
export function advanceOnboardingStep(
  state: SquadOnboardingState
): SquadOnboardingState {
  const stepOrder: OnboardingStep[] = [
    'view_squad_hub',
    'meet_members',
    'check_war_status',
    'join_first_war',
    'complete',
  ];

  const currentIndex = stepOrder.indexOf(state.currentStep);
  const nextStep = stepOrder[currentIndex + 1] ?? 'complete';

  return {
    ...state,
    currentStep: nextStep,
    completedSteps: [...state.completedSteps, state.currentStep],
  };
}

// Get onboarding step message
export function getOnboardingStepMessage(step: OnboardingStep): string {
  switch (step) {
    case 'view_squad_hub':
      return 'Welcome to your squad! Explore your squad hub to see what is happening.';
    case 'meet_members':
      return 'Meet your squadmates. They are focusing alongside you.';
    case 'check_war_status':
      return 'Check if your squad is in an active war. Contribute to win!';
    case 'join_first_war':
      return 'Join your first Squad War and compete together!';
    case 'complete':
      return 'You are all set! Start focusing with your squad.';
  }
}

// Generate shareable squad invite link
export function generateSquadInviteLink(squadId: string, inviteCode: string): string {
  return `https://vex.app/squad/join?squadId=${squadId}&code=${inviteCode}`;
}

// Validate invite code
export function validateSquadInviteCode(code: string): boolean {
  // Invite codes should be 8 characters, alphanumeric
  const validPattern = /^[A-Z0-9]{8}$/;
  return validPattern.test(code);
}
