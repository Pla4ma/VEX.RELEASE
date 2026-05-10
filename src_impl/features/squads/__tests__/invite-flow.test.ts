import { acceptSquadInvite, advanceOnboardingStep, createSquadInvite, createSquadInviteNotification, createSquadOnboarding, declineSquadInvite, generateSquadInviteLink, getInviteExpirationMessage, getOnboardingStepMessage, getPendingSquadInvites, isSquadInviteExpired, validateSquadInviteCode, SquadInviteSchema } from '../invite-flow';

describe('Squad Invite Flow', () => {
  describe('SquadInviteSchema', () => {
    it('validates valid invite', () => {
      const validInvite = {
        id: 'invite-1',
        squadId: 'squad-1',
        squadName: 'Test Squad',
        squadAvatar: 'https://example.com/avatar.png',
        invitedByUserId: 'user-1',
        invitedByName: 'Alice',
        invitedUserId: 'user-2',
        status: 'pending',
        message: 'Join us!',
        createdAt: Date.now(),
        expiresAt: Date.now() + 48 * 60 * 60 * 1000,
        respondedAt: null,
        role: 'member',
      };

      expect(SquadInviteSchema.parse(validInvite)).toEqual(validInvite);
    });

    it('validates without optional avatar', () => {
      const validInvite = {
        id: 'invite-1',
        squadId: 'squad-1',
        squadName: 'Test Squad',
        invitedByUserId: 'user-1',
        invitedByName: 'Alice',
        invitedUserId: 'user-2',
        status: 'pending',
        message: 'Join us!',
        createdAt: Date.now(),
        expiresAt: Date.now() + 48 * 60 * 60 * 1000,
        respondedAt: null,
        role: 'member',
      };

      expect(SquadInviteSchema.parse(validInvite)).toEqual(validInvite);
    });

    it('rejects invalid status', () => {
      expect(() =>
        SquadInviteSchema.parse({
          id: 'invite-1',
          squadId: 'squad-1',
          squadName: 'Test',
          invitedByUserId: 'user-1',
          invitedByName: 'Alice',
          invitedUserId: 'user-2',
          status: 'invalid',
          message: 'Join us!',
          createdAt: Date.now(),
          expiresAt: Date.now() + 48 * 60 * 60 * 1000,
          respondedAt: null,
          role: 'member',
        }),
      ).toThrow();
    });
  });

  describe('createSquadInvite', () => {
    it('creates invite with default message', async () => {
      const invite = await createSquadInvite('squad-1', 'Test Squad', 'user-1', 'Alice', 'user-2');

      expect(invite.squadId).toBe('squad-1');
      expect(invite.invitedUserId).toBe('user-2');
      expect(invite.status).toBe('pending');
      expect(invite.message).toContain('Alice');
      expect(invite.message).toContain('Test Squad');
      expect(invite.expiresAt).toBeGreaterThan(invite.createdAt);
    });

    it('creates invite with custom message', async () => {
      const invite = await createSquadInvite('squad-1', 'Test Squad', 'user-1', 'Alice', 'user-2', { message: 'Custom message', role: 'vice_captain', expiresInHours: 24 });

      expect(invite.message).toBe('Custom message');
      expect(invite.role).toBe('vice_captain');
      expect(invite.expiresAt - invite.createdAt).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe('isSquadInviteExpired', () => {
    it('returns true for expired invite', () => {
      const expiredInvite = {
        id: 'invite-1',
        squadId: 'squad-1',
        squadName: 'Test',
        invitedByUserId: 'user-1',
        invitedByName: 'Alice',
        invitedUserId: 'user-2',
        status: 'pending' as const,
        message: 'Join us!',
        createdAt: Date.now() - 48 * 60 * 60 * 1000,
        expiresAt: Date.now() - 1,
        respondedAt: null,
        role: 'member' as const,
      };

      expect(isSquadInviteExpired(expiredInvite)).toBe(true);
    });

    it('returns false for active invite', () => {
      const activeInvite = {
        id: 'invite-1',
        squadId: 'squad-1',
        squadName: 'Test',
        invitedByUserId: 'user-1',
        invitedByName: 'Alice',
        invitedUserId: 'user-2',
        status: 'pending' as const,
        message: 'Join us!',
        createdAt: Date.now(),
        expiresAt: Date.now() + 48 * 60 * 60 * 1000,
        respondedAt: null,
        role: 'member' as const,
      };

      expect(isSquadInviteExpired(activeInvite)).toBe(false);
    });
  });

  describe('getInviteExpirationMessage', () => {
    it('returns expired message', () => {
      const expiredInvite = {
        id: 'invite-1',
        squadId: 'squad-1',
        squadName: 'Test',
        invitedByUserId: 'user-1',
        invitedByName: 'Alice',
        invitedUserId: 'user-2',
        status: 'pending' as const,
        message: 'Join us!',
        createdAt: Date.now() - 48 * 60 * 60 * 1000,
        expiresAt: Date.now() - 1,
        respondedAt: null,
        role: 'member' as const,
      };

      expect(getInviteExpirationMessage(expiredInvite)).toContain('expired');
    });

    it('returns 1 hour message', () => {
      const invite = {
        id: 'invite-1',
        squadId: 'squad-1',
        squadName: 'Test',
        invitedByUserId: 'user-1',
        invitedByName: 'Alice',
        invitedUserId: 'user-2',
        status: 'pending' as const,
        message: 'Join us!',
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000, // 30 min
        respondedAt: null,
        role: 'member' as const,
      };

      expect(getInviteExpirationMessage(invite)).toContain('1 hour');
    });

    it('returns hours remaining message', () => {
      const invite = {
        id: 'invite-1',
        squadId: 'squad-1',
        squadName: 'Test',
        invitedByUserId: 'user-1',
        invitedByName: 'Alice',
        invitedUserId: 'user-2',
        status: 'pending' as const,
        message: 'Join us!',
        createdAt: Date.now(),
        expiresAt: Date.now() + 12 * 60 * 60 * 1000,
        respondedAt: null,
        role: 'member' as const,
      };

      expect(getInviteExpirationMessage(invite)).toContain('12 hours');
    });
  });

  describe('createSquadInviteNotification', () => {
    it('creates notification content', () => {
      const invite = {
        id: 'invite-1',
        squadId: 'squad-1',
        squadName: 'Awesome Squad',
        invitedByUserId: 'user-1',
        invitedByName: 'Alice',
        invitedUserId: 'user-2',
        status: 'pending' as const,
        message: 'Join us!',
        createdAt: Date.now(),
        expiresAt: Date.now() + 48 * 60 * 60 * 1000,
        respondedAt: null,
        role: 'member' as const,
      };

      const notification = createSquadInviteNotification(invite);

      expect(notification.title).toBe('Squad Invitation');
      expect(notification.body).toContain('Alice');
      expect(notification.body).toContain('Awesome Squad');
      expect(notification.actionType).toBe('squad_invite');
    });
  });

  describe('createSquadOnboarding', () => {
    it('creates initial onboarding state', () => {
      const state = createSquadOnboarding('squad-1');

      expect(state.squadId).toBe('squad-1');
      expect(state.currentStep).toBe('view_squad_hub');
      expect(state.completedSteps).toEqual([]);
      expect(state.joinedAt).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('advanceOnboardingStep', () => {
    it('advances to next step', () => {
      const initial = createSquadOnboarding('squad-1');

      const advanced = advanceOnboardingStep(initial);

      expect(advanced.currentStep).toBe('meet_members');
      expect(advanced.completedSteps).toContain('view_squad_hub');
    });

    it('reaches complete after all steps', () => {
      let state = createSquadOnboarding('squad-1');

      // Advance through all steps
      for (let i = 0; i < 5; i++) {
        state = advanceOnboardingStep(state);
      }

      expect(state.currentStep).toBe('complete');
    });
  });

  describe('getOnboardingStepMessage', () => {
    it('returns message for each step', () => {
      expect(getOnboardingStepMessage('view_squad_hub')).toContain('Welcome');
      expect(getOnboardingStepMessage('meet_members')).toContain('squadmates');
      expect(getOnboardingStepMessage('check_war_status')).toContain('war');
      expect(getOnboardingStepMessage('join_first_war')).toContain('first');
      expect(getOnboardingStepMessage('complete')).toContain('set');
    });
  });

  describe('generateSquadInviteLink', () => {
    it('generates shareable link', () => {
      const link = generateSquadInviteLink('squad-1', 'ABC12345');

      expect(link).toContain('squadId=squad-1');
      expect(link).toContain('code=ABC12345');
    });
  });

  describe('validateSquadInviteCode', () => {
    it('validates 8-character alphanumeric code', () => {
      expect(validateSquadInviteCode('ABC12345')).toBe(true);
      expect(validateSquadInviteCode('ABCDEFGH')).toBe(true);
      expect(validateSquadInviteCode('12345678')).toBe(true);
    });

    it('rejects invalid codes', () => {
      expect(validateSquadInviteCode('ABC1234')).toBe(false); // too short
      expect(validateSquadInviteCode('ABC123456')).toBe(false); // too long
      expect(validateSquadInviteCode('abc12345')).toBe(false); // lowercase
      expect(validateSquadInviteCode('ABC-1234')).toBe(false); // special chars
    });
  });

  describe('getPendingSquadInvites', () => {
    it('returns empty array', async () => {
      const invites = await getPendingSquadInvites('user-1');

      expect(invites).toEqual([]);
    });
  });

  describe('acceptSquadInvite', () => {
    it('returns null', async () => {
      const result = await acceptSquadInvite('invite-1');

      expect(result).toBeNull();
    });
  });

  describe('declineSquadInvite', () => {
    it('returns null', async () => {
      const result = await declineSquadInvite('invite-1', 'Too busy');

      expect(result).toBeNull();
    });
  });
});
