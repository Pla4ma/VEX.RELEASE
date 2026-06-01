import { SessionMode } from '../../../session/modes';
import * as repository from '../repository';
import {
  getBestPreview,
  getUserPersonalBests,
} from '../service';

jest.mock('../repository');

// ── Fixtures ───────────────────────────────────────────────────────────────

const userId = '123e4567-e89b-12d3-a456-426614174000';

function makeBest(overrides: Record<string, unknown> = {}) {
  return {
    id: '123e4567-e89b-12d3-a456-426614174111',
    userId,
    sessionMode: SessionMode.SPRINT,
    durationBucket: '15' as const,
    bestPurityScore: 82,
    bestGrade: 'B' as const,
    totalSessions: 3,
    achievedAt: '2026-05-14T12:00:00.000Z',
    updatedAt: '2026-05-14T12:00:00.000Z',
    ...overrides,
  };
}

// ── getBestPreview ─────────────────────────────────────────────────────────

describe('getBestPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a personal best when one exists', async () => {
    const best = makeBest();
    jest.mocked(repository.getPersonalBest).mockResolvedValue(best);

    const result = await getBestPreview(userId, SessionMode.SPRINT, 900);
    expect(result).toEqual(best);
  });

  it('returns null when no best exists', async () => {
    jest.mocked(repository.getPersonalBest).mockResolvedValue(null);

    const result = await getBestPreview(userId, SessionMode.SPRINT, 900);
    expect(result).toBeNull();
  });

  it('correctly resolves duration bucket for query', async () => {
    jest.mocked(repository.getPersonalBest).mockResolvedValue(null);

    await getBestPreview(userId, SessionMode.DEEP_WORK, 3600);
    expect(repository.getPersonalBest).toHaveBeenCalledWith(
      userId,
      SessionMode.DEEP_WORK,
      '60+',
    );
  });
});

// ── getUserPersonalBests ───────────────────────────────────────────────────

describe('getUserPersonalBests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all personal bests for a user', async () => {
    const bests = [
      makeBest({ id: '11111111-1111-1111-1111-111111111111' }),
      makeBest({
        id: '22222222-2222-2222-2222-222222222222',
        sessionMode: SessionMode.STUDY,
      }),
    ];
    jest.mocked(repository.getUserPersonalBests).mockResolvedValue(bests);

    const result = await getUserPersonalBests(userId);
    expect(result).toHaveLength(2);
    expect(repository.getUserPersonalBests).toHaveBeenCalledWith(userId);
  });

  it('returns empty array when user has no records', async () => {
    jest.mocked(repository.getUserPersonalBests).mockResolvedValue([]);

    const result = await getUserPersonalBests(userId);
    expect(result).toEqual([]);
  });
});
