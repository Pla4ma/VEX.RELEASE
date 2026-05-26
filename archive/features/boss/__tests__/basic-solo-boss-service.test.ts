import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as service from '../basic-solo-boss-service';
import * as repository from '../repository';
import { eventBus } from '../../../events';
import { type BossEncounter, type BossTemplate } from '../schemas';

jest.mock('../repository');
const mockRepository = repository as jest.Mocked<typeof repository>;

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));

describe('Basic Solo Boss Service - PHASE 8', () => {
  const mockUserId = 'user-123';
  const mockSessionId = 'session-123';
  const mockEncounterId = 'encounter-123';

  beforeEach(() => { jest.clearAllMocks(); });

  const mockBossTemplate: BossTemplate = {
    id: 'basic-solo-boss-001',
    name: 'Focus Guardian',
    description: 'Test description',
    avatarUrl: null,
    tier: 1,
    baseHealth: 1000,
    healthScaling: 0.1,
    minLevel: 1,
    previousBossId: null,
    timeLimit: 86400,
    rewardType: 'XP',
    rewardAmount: 50,
    rewardItemId: null,
  };

  const mockEncounter: BossEncounter = {
    id: mockEncounterId,
    bossId: 'basic-solo-boss-001',
    userId: mockUserId,
    squadId: null,
    healthRemaining: 800,
    maxHealth: 1000,
    damageDealt: 200,
    status: 'ACTIVE',
    startedAt: Date.now(),
    expiresAt: Date.now() + 86400000,
    defeatedAt: null,
    contributingSessionIds: ['session-1'],
    createdAt: Date.now(),
  };

  it('should support one active solo boss only', async () => {
    mockRepository.fetchActiveEncounter.mockResolvedValue(null);
    mockRepository.fetchBossTemplate.mockResolvedValue(mockBossTemplate);
    mockRepository.createEncounter.mockResolvedValue(mockEncounter);
    const result = await service.getOrCreateBasicSoloBossEncounter(mockUserId);
    expect(result?.bossName).toBe('Focus Guardian');
    expect(mockRepository.createEncounter).toHaveBeenCalled();
  });

  it('should maintain persistent health across sessions', async () => {
    mockRepository.fetchEncounterById.mockResolvedValue(mockEncounter);
    mockRepository.updateEncounterHealth.mockResolvedValue({ ...mockEncounter, healthRemaining: 750 });
    const result = await service.applyBasicSoloBossDamage(mockEncounterId, mockSessionId, 50);
    expect(result.healthRemaining).toBe(750);
    expect(mockRepository.updateEncounterHealth).toHaveBeenCalledWith(
      mockEncounterId, 750, 250, mockSessionId
    );
  });

  it('should handle defeat rewards properly', async () => {
    const nearDeathEncounter = { ...mockEncounter, healthRemaining: 50, damageDealt: 950 };
    mockRepository.fetchEncounterById.mockResolvedValue(nearDeathEncounter);
    mockRepository.markEncounterDefeated.mockResolvedValue({ ...nearDeathEncounter, status: 'DEFEATED' });
    mockRepository.fetchBossTemplate.mockResolvedValue(mockBossTemplate);
    const result = await service.applyBasicSoloBossDamage(mockEncounterId, mockSessionId, 50);
    expect(result.isDefeated).toBe(true);
    expect(eventBus.publish).toHaveBeenCalledWith('boss:defeated', expect.anything());
  });

  it('should handle timeout with consolation', async () => {
    mockRepository.markEncounterTimeout.mockResolvedValue({ ...mockEncounter, status: 'TIMEOUT' });
    await service.handleBasicSoloBossTimeout(mockEncounterId);
    expect(mockRepository.markEncounterTimeout).toHaveBeenCalledWith(mockEncounterId);
    expect(eventBus.publish).toHaveBeenCalledWith('boss:timeout', expect.anything());
  });

  it('should only allow starting new encounters after timeout/defeat', async () => {
    mockRepository.fetchActiveEncounter.mockResolvedValue(mockEncounter);
    const status = await service.getBasicSoloBossStatus(mockUserId);
    expect(status.hasActiveEncounter).toBe(true);
    expect(status.canStartNewEncounter).toBe(false);
  });
});
