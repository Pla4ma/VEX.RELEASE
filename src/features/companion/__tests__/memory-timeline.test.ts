import { groupCompanionMemories } from '../components/companion-memory-groups';
import type { CompanionMemory } from '../memory-types';

const baseMemory: CompanionMemory = {
  body: 'You showed up.',
  createdAt: '2026-05-15T12:00:00.000Z',
  grade: 'A',
  id: '123e4567-e89b-12d3-a456-426614174000',
  purityScore: 90,
  sessionDate: '2026-05-15',
  sessionId: '123e4567-e89b-12d3-a456-426614174111',
  streakDay: 3,
  title: 'First proof',
  type: 'first_session',
  userId: '123e4567-e89b-12d3-a456-426614174222',
};

function memory(id: string, createdAt: string): CompanionMemory {
  return { ...baseMemory, createdAt, id };
}

describe('groupCompanionMemories', () => {
  it('groups memories by today, yesterday, this week, and earlier', () => {
    const groups = groupCompanionMemories(
      [
        memory('123e4567-e89b-12d3-a456-426614174001', '2026-05-15T10:00:00.000Z'),
        memory('123e4567-e89b-12d3-a456-426614174002', '2026-05-14T10:00:00.000Z'),
        memory('123e4567-e89b-12d3-a456-426614174003', '2026-05-12T10:00:00.000Z'),
        memory('123e4567-e89b-12d3-a456-426614174004', '2026-04-01T10:00:00.000Z'),
      ],
      new Date('2026-05-15T15:00:00.000Z'),
    );

    expect(groups.map((group) => group.title)).toEqual([
      'Today',
      'Yesterday',
      'This Week',
      'Earlier',
    ]);
  });
});
