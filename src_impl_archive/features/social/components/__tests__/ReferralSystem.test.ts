import { describe, expect, it } from 'vitest';

import { buildSquadInviteLink, buildSquadInviteMessage } from '../../referral-links';

describe('ReferralSystem invite helpers', () => {
  it('builds squad-aware invite links', () => {
    expect(buildSquadInviteLink('vex://', 'ABC123', 'Deep Work Crew')).toBe(
      'vex://invite?code=ABC123&squad=Deep%20Work%20Crew'
    );
  });

  it('includes both inviter and invitee rewards in the share message', () => {
    const message = buildSquadInviteMessage({
      code: 'ABC123',
      link: 'vex://invite?code=ABC123',
      squadName: 'Deep Work Crew',
      inviterName: 'Maya',
    });

    expect(message).toContain('Maya invited you to Deep Work Crew');
    expect(message).toContain('50 coins and 2x XP');
    expect(message).toContain('100 coins');
  });
});
