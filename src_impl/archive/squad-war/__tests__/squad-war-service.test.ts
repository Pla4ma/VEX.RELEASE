import { SquadAnalytics } from '../analytics';
import {
  loadActiveSquadWar,
  submitSquadWarDamage,
  watchActiveSquadWar,
} from '../squad-war-service';
import * as repository from '../squad-war-repository';

jest.mock('../squad-war-repository');
jest.mock('../analytics', () => ({
  SquadAnalytics: {
    squadWarViewed: jest.fn(),
    squadWarDamageRecorded: jest.fn(),
    squadWarRealtimeDegraded: jest.fn(),
  },
}));

const mockWar = {
  id: '44444444-4444-4444-8444-444444444444',
  squadId: '55555555-5555-4555-8555-555555555555',
  opponentSquadId: null,
  bossName: 'The Null Titan',
  bossMaxHealth: 150000,
  bossCurrentHealth: 90000,
  weekStartsAt: '2026-04-13T00:00:00.000Z',
  weekEndsAt: '2026-04-20T00:00:00.000Z',
  members: [
    {
      userId: '66666666-6666-4666-8666-666666666666',
      displayName: 'Alex',
      isCurrentlyFocusing: true,
      sessionStartedAt: Date.now(),
      damageContributed: 340,
      lastSeenAt: Date.now(),
    },
  ],
  status: 'active' as const,
  rewardMultiplier: 1.5,
};

describe('squad-war-service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads and validates the active squad war before tracking analytics', async () => {
    jest.mocked(repository.getActiveSquadWar).mockResolvedValue(mockWar);

    const result = await loadActiveSquadWar(mockWar.squadId);

    expect(result).toEqual(mockWar);
    expect(SquadAnalytics.squadWarViewed).toHaveBeenCalledWith(
      mockWar.squadId,
      mockWar.id,
      mockWar.bossName,
      mockWar.members.length
    );
  });

  it('normalizes and records war damage through the repository', async () => {
    jest.mocked(repository.recordWarDamage).mockResolvedValue(undefined);

    await submitSquadWarDamage({
      squadId: mockWar.squadId,
      userId: mockWar.members[0].userId,
      damage: 123.8,
      sessionId: '77777777-7777-4777-8777-777777777777',
    });

    expect(repository.recordWarDamage).toHaveBeenCalledWith({
      squadId: mockWar.squadId,
      userId: mockWar.members[0].userId,
      damage: 123,
      sessionId: '77777777-7777-4777-8777-777777777777',
    });
    expect(SquadAnalytics.squadWarDamageRecorded).toHaveBeenCalledWith(
      mockWar.squadId,
      mockWar.members[0].userId,
      123,
      '77777777-7777-4777-8777-777777777777'
    );
  });

  it('routes invalid realtime payloads to the error callback', () => {
    let realtimeHandler: ((war: unknown) => void) | null = null;
    jest.mocked(repository.subscribeToSquadWar).mockImplementation((_squadId, onUpdate) => {
      realtimeHandler = onUpdate as (war: unknown) => void;
      return () => undefined;
    });

    const onWar = jest.fn();
    const onError = jest.fn();

    const unsubscribe = watchActiveSquadWar(mockWar.squadId, onWar, onError);
    realtimeHandler?.({
      ...mockWar,
      members: [
        {
          ...mockWar.members[0],
          userId: 'not-a-uuid',
        },
      ],
    });

    expect(onWar).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();

    unsubscribe();
  });
});
