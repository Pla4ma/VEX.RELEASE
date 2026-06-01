import { SessionMode } from '../../../session/modes';
import * as repository from '../repository';
import { checkAndUpdatePersonalBest } from '../service';

jest.mock('../repository');

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

describe('checkAndUpdatePersonalBest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns isNewRecord=false when existing score is higher', async () => {
    jest.mocked(repository.getPersonalBest).mockResolvedValue(makeBest());

    const result = await checkAndUpdatePersonalBest(
      userId,
      SessionMode.SPRINT,
      900,
      70,
      'C',
    );

    expect(result.isNewRecord).toBe(false);
    expect(result.current).toEqual(makeBest());
    expect(result.previousBest).toBe(82);
    expect(repository.upsertPersonalBest).not.toHaveBeenCalled();
  });

  it('returns isNewRecord=false when score equals existing best', async () => {
    jest.mocked(repository.getPersonalBest).mockResolvedValue(makeBest());

    const result = await checkAndUpdatePersonalBest(
      userId,
      SessionMode.SPRINT,
      900,
      82,
      'B',
    );

    expect(result.isNewRecord).toBe(false);
    expect(repository.upsertPersonalBest).not.toHaveBeenCalled();
  });

  it('returns isNewRecord=true and margin when score beats existing', async () => {
    jest.mocked(repository.getPersonalBest).mockResolvedValue(makeBest());
    jest
      .mocked(repository.upsertPersonalBest)
      .mockResolvedValue(makeBest({ bestPurityScore: 95, bestGrade: 'S' }));

    const result = await checkAndUpdatePersonalBest(
      userId,
      SessionMode.SPRINT,
      900,
      95,
      'S',
    );

    expect(result.isNewRecord).toBe(true);
    expect(result.previousBest).toBe(82);
    expect(result.margin).toBe(13);
  });

  it('creates first record when none exists', async () => {
    jest.mocked(repository.getPersonalBest).mockResolvedValue(null);
    jest
      .mocked(repository.upsertPersonalBest)
      .mockResolvedValue(makeBest({ bestPurityScore: 75, bestGrade: 'B' }));

    const result = await checkAndUpdatePersonalBest(
      userId,
      SessionMode.SPRINT,
      900,
      75,
      'B',
    );

    expect(result.isNewRecord).toBe(true);
    expect(result.previousBest).toBeNull();
    expect(result.margin).toBeNull();
    expect(repository.upsertPersonalBest).toHaveBeenCalled();
  });

  it('resolves duration bucket correctly for 10-minute session', async () => {
    jest.mocked(repository.getPersonalBest).mockResolvedValue(null);
    jest
      .mocked(repository.upsertPersonalBest)
      .mockResolvedValue(makeBest({ durationBucket: '10' }));

    await checkAndUpdatePersonalBest(userId, SessionMode.SPRINT, 600, 80, 'B');

    expect(repository.getPersonalBest).toHaveBeenCalledWith(
      userId,
      SessionMode.SPRINT,
      '10',
    );
  });

  it('passes mode through to repository', async () => {
    jest.mocked(repository.getPersonalBest).mockResolvedValue(null);
    jest
      .mocked(repository.upsertPersonalBest)
      .mockResolvedValue(makeBest({ sessionMode: SessionMode.STUDY }));

    await checkAndUpdatePersonalBest(userId, SessionMode.STUDY, 1200, 85, 'A');

    expect(repository.getPersonalBest).toHaveBeenCalledWith(
      userId,
      SessionMode.STUDY,
      '25',
    );
  });

  it('validates the output through the schema', async () => {
    jest.mocked(repository.getPersonalBest).mockResolvedValue(makeBest());

    const result = await checkAndUpdatePersonalBest(
      userId,
      SessionMode.SPRINT,
      900,
      80,
      'B',
    );

    expect(result).toHaveProperty('current');
    expect(result).toHaveProperty('isNewRecord');
    expect(result).toHaveProperty('previousBest');
    expect(result).toHaveProperty('margin');
  });
});
