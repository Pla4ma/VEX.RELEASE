import { SessionMode } from '../../../session/modes';
import { eventBus } from '../../../events';
import * as repository from '../memory-repository';
import {
  checkAndRecordSessionMemories,
  maybeCreateMemory,
} from '../memory-service';

jest.mock('../memory-repository');

const userId = '123e4567-e89b-12d3-a456-426614174000';
const sessionId = '123e4567-e89b-12d3-a456-426614174111';

const baseContext = {
  grade: 'A' as const,
  purityScore: 90,
  sessionDate: '2026-05-14',
  sessionId,
  streakDay: 1,
};

const baseSession = {
  actualDuration: 1500,
  createdAt: Date.parse('2026-05-14T12:00:00.000Z'),
  sessionId,
  sessionMode: SessionMode.FLOW,
};

describe('companion memory service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    eventBus.clear();
  });

  it('creates a first S-grade memory and emits an event', async () => {
    const created = {
      ...baseContext,
      body: 'Zero pauses. Clean finish. You showed yourself what full focus feels like.',
      createdAt: '2026-05-14T12:00:00.000Z',
      id: '123e4567-e89b-12d3-a456-426614174222',
      title: 'First Perfect Session',
      type: 'first_s_grade' as const,
      userId,
    };
    const events: unknown[] = [];
    eventBus.subscribe('companion:memory_created', (event) => events.push(event));
    jest.mocked(repository.hasMemory).mockResolvedValue(false);
    jest.mocked(repository.createMemory).mockResolvedValue(created);

    const result = await maybeCreateMemory(userId, 'first_s_grade', baseContext);

    expect(result).toEqual(created);
    expect(repository.createMemory).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'You reached grade A with 90% purity. Your companion kept the clean finish.',
        grade: 'A',
        purityScore: 90,
        sessionId,
        title: 'First Perfect Session',
        type: 'first_s_grade',
        userId,
      }),
    );
    expect(events).toHaveLength(1);
  });

  it('does not create a second memory for the same type', async () => {
    jest.mocked(repository.hasMemory).mockResolvedValue(true);

    const result = await maybeCreateMemory(userId, 'first_s_grade', baseContext);

    expect(result).toBeNull();
    expect(repository.createMemory).not.toHaveBeenCalled();
  });

  it('records all eligible session milestones once', async () => {
    jest.mocked(repository.hasMemory).mockResolvedValue(false);
    jest.mocked(repository.createMemory).mockImplementation(async (memory) => ({
      ...memory,
      createdAt: '2026-05-14T12:00:00.000Z',
      id: `123e4567-e89b-12d3-a456-${memory.type.slice(0, 12)}`,
    }));

    const result = await checkAndRecordSessionMemories({
      grade: 'S',
      isPersonalBest: true,
      session: {
        ...baseSession,
        actualDuration: 2700,
        sessionMode: SessionMode.DEEP_WORK,
      },
      sessionCount: 4,
      streakDay: 7,
      userId,
    });

    expect(result.map((memory) => memory.type)).toEqual([
      'first_s_grade',
      'first_7_day_streak',
      'first_deep_work',
      'personal_best_broken',
    ]);
  });

  it('creates a first clean sprint memory only for 100 purity sprint sessions', async () => {
    jest.mocked(repository.hasMemory).mockResolvedValue(false);
    jest.mocked(repository.createMemory).mockImplementation(async (memory) => ({
      ...memory,
      createdAt: '2026-05-14T12:00:00.000Z',
      id: '123e4567-e89b-12d3-a456-426614174333',
    }));

    const result = await checkAndRecordSessionMemories({
      grade: 'S',
      isPersonalBest: false,
      session: { ...baseSession, focusPurityScore: 100, sessionMode: SessionMode.SPRINT },
      sessionCount: 2,
      streakDay: 2,
      userId,
    });

    expect(result.some((memory) => memory.type === 'first_clean_sprint')).toBe(true);
  });

  it('records first-session and 30-day streak milestones', async () => {
    jest.mocked(repository.hasMemory).mockResolvedValue(false);
    jest.mocked(repository.createMemory).mockImplementation(async (memory) => ({
      ...memory,
      createdAt: '2026-05-14T12:00:00.000Z',
      id: '123e4567-e89b-12d3-a456-426614174444',
    }));

    const result = await checkAndRecordSessionMemories({
      grade: 'A',
      isPersonalBest: false,
      session: baseSession,
      sessionCount: 1,
      streakDay: 30,
      userId,
    });

    expect(result.map((memory) => memory.type)).toEqual([
      'first_session',
      'first_30_day_streak',
    ]);
    expect(result[0]?.body).toContain('2026-05-14');
    expect(result[1]?.body).toContain('Day 30');
  });

  it('varies memory copy from session facts across repeated completions', async () => {
    jest.mocked(repository.hasMemory).mockResolvedValue(false);
    jest.mocked(repository.createMemory).mockImplementation(async (memory) => ({
      ...memory,
      createdAt: '2026-05-14T12:00:00.000Z',
      id: '123e4567-e89b-12d3-a456-426614174555',
    }));

    const first = await maybeCreateMemory(userId, 'first_session', baseContext);
    const clean = await maybeCreateMemory(userId, 'first_s_grade', baseContext);
    const best = await maybeCreateMemory(userId, 'personal_best_broken', baseContext);

    expect([first?.body, clean?.body, best?.body]).toEqual([
      'You finished your first session on 2026-05-14 with grade A. This is where the record begins.',
      'You reached grade A with 90% purity. Your companion kept the clean finish.',
      'You moved a saved mark to 90% purity. Your ceiling changed because this session proved it.',
    ]);
  });
});
