import { SessionMode } from '../../../session/modes';
import * as repository from '../repository';
import {
  checkAndUpdatePersonalBest,
  getBestPreview,
  getDurationBucket,
} from '../service';

jest.mock('../repository');

const userId = '123e4567-e89b-12d3-a456-426614174000';
const best = {
  id: '123e4567-e89b-12d3-a456-426614174111',
  userId,
  sessionMode: SessionMode.SPRINT,
  durationBucket: '15',
  bestPurityScore: 82,
  bestGrade: 'B',
  totalSessions: 3,
  achievedAt: '2026-05-14T12:00:00.000Z',
  updatedAt: '2026-05-14T12:00:00.000Z',
} as const;

describe('personal bests service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    [0, '10'],
    [749, '10'],
    [750, '15'],
    [1199, '15'],
    [1200, '25'],
    [2099, '25'],
    [2100, '45'],
    [3299, '45'],
    [3300, '60+'],
  ] as const)('resolves %i seconds to bucket %s', (seconds, bucket) => {
    expect(getDurationBucket(seconds)).toBe(bucket);
  });

  it('creates a first personal best when no current record exists', async () => {
    jest.mocked(repository.getPersonalBest).mockResolvedValue(null);
    jest.mocked(repository.upsertPersonalBest).mockResolvedValue(best);

    const result = await checkAndUpdatePersonalBest(
      userId,
      SessionMode.SPRINT,
      900,
      82,
      'B',
    );

    expect(result.isNewRecord).toBe(true);
    expect(result.previousBest).toBeNull();
    expect(repository.upsertPersonalBest).toHaveBeenCalledWith({
      userId,
      sessionMode: SessionMode.SPRINT,
      durationBucket: '15',
      bestPurityScore: 82,
      bestGrade: 'B',
    });
  });

  it('returns a margin when the session beats the current record', async () => {
    jest.mocked(repository.getPersonalBest).mockResolvedValue(best);
    jest.mocked(repository.upsertPersonalBest).mockResolvedValue({
      ...best,
      bestPurityScore: 91,
      bestGrade: 'A',
    });

    const result = await checkAndUpdatePersonalBest(
      userId,
      SessionMode.SPRINT,
      900,
      91,
      'A',
    );

    expect(result.isNewRecord).toBe(true);
    expect(result.previousBest).toBe(82);
    expect(result.margin).toBe(9);
  });

  it('does not upsert when the current record is better', async () => {
    jest.mocked(repository.getPersonalBest).mockResolvedValue(best);

    const result = await checkAndUpdatePersonalBest(
      userId,
      SessionMode.SPRINT,
      900,
      80,
      'B',
    );

    expect(result.isNewRecord).toBe(false);
    expect(result.current).toEqual(best);
    expect(repository.upsertPersonalBest).not.toHaveBeenCalled();
  });

  it('fetches a setup preview by mode and bucket', async () => {
    jest.mocked(repository.getPersonalBest).mockResolvedValue(best);

    await expect(
      getBestPreview(userId, SessionMode.SPRINT, 900),
    ).resolves.toEqual(best);
  });
});
