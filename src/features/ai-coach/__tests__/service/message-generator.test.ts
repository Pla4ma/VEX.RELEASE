import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { generateMessage } from '../../service/message-generator';
import { markMessageAction } from '../../message/message-generator';
import * as analytics from '../../analytics';
import * as repository from '../../repository';
import type { CoachMessage } from '../../schemas';
import { mockUserId } from './helpers';

jest.mock('../../repository');
jest.mock('../../analytics', () => ({
  trackMessageAction: jest.fn(),
  trackMessageGenerationError: jest.fn(),
}));

const mockedRepository = jest.mocked(repository);

const validCoachState = {
  userId: mockUserId,
  currentState: 'ACTIVE',
  previousState: null,
  stateEnteredAt: Date.now(),
  personaId: '00000000-0000-4000-a000-000000000001',
  behaviorProfile: null,
  lastInterventionAt: null,
  interventionsToday: 0,
  muteUntil: null,
  reduceNotifications: false,
};

describe('Message Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (repository.fetchCoachHistory as jest.Mock).mockResolvedValue({
      messages: [],
      mutedCategories: [],
    });
    (repository.fetchMessageTemplates as jest.Mock).mockResolvedValue([
      {
        id: 'template-1',
        personaId: '00000000-0000-4000-a000-000000000001',
        category: 'MOTIVATION_BOOST',
        priority: 8,
        content: 'You are doing great, {{name}}!',
        conditions: [],
        variations: [],
        cooldownHours: 4,
      },
    ]);
  });

  it('generates message from template', async () => {
    (repository.fetchCoachState as jest.Mock).mockResolvedValue(validCoachState);
    const message = await generateMessage({
      userId: mockUserId,
      category: 'MOTIVATION_BOOST',
      context: { name: 'User' },
      preferredDelivery: 'BOTH',
    });
    expect(message).not.toBeNull();
    expect(message?.content).toContain('User');
  });

  it('returns null when user is muted', async () => {
    (repository.fetchCoachState as jest.Mock).mockResolvedValue({
      ...validCoachState,
      muteUntil: Date.now() + 86400000,
      reduceNotifications: true,
    });
    const message = await generateMessage({
      userId: mockUserId,
      category: 'MOTIVATION_BOOST',
      context: {},
      preferredDelivery: 'BOTH',
    });
    expect(message).toBeNull();
  });

  it('validates generated content', async () => {
    (repository.fetchCoachState as jest.Mock).mockResolvedValue(validCoachState);
    (repository.fetchMessageTemplates as jest.Mock).mockResolvedValue([
      {
        id: 'template-1',
        personaId: '00000000-0000-4000-a000-000000000001',
        category: 'MOTIVATION_BOOST',
        priority: 8,
        content: '<script>alert("hack")</script>',
        conditions: [],
        variations: [],
        cooldownHours: 4,
      },
    ]);
    const message = await generateMessage({
      userId: mockUserId,
      category: 'MOTIVATION_BOOST',
      context: {},
      preferredDelivery: 'BOTH',
    });
    expect(message?.content).not.toContain('<script>');
  });

  it('records message-action analytics after the repository update', async () => {
    const createdAt = Date.now() - 30_000;
    const message = {
      id: '00000000-0000-4000-a000-000000000002',
      userId: mockUserId,
      personaId: '00000000-0000-4000-a000-000000000001',
      category: 'MOTIVATION_BOOST',
      content: 'Keep going.',
      deliveryMethod: 'BOTH',
      priority: 5,
      status: 'DISMISSED',
      createdAt,
      scheduledFor: null,
      deliveredAt: createdAt,
      readAt: null,
      dismissedAt: Date.now(),
      actionTaken: 'start_session',
      actionTakenAt: Date.now(),
    } satisfies CoachMessage;
    mockedRepository.markMessageAction.mockResolvedValue(message);

    await markMessageAction({
      messageId: message.id,
      action: 'start_session',
    });

    expect(analytics.trackMessageAction).toHaveBeenCalledWith(
      mockUserId,
      message.id,
      'start_session',
      expect.any(Number),
    );
  });

  it('captures generation failures before returning the safe fallback', async () => {
    const failure = new Error('invalid persisted coach state');
    mockedRepository.fetchCoachState.mockRejectedValue(failure);

    const result = await generateMessage({
      userId: mockUserId,
      category: 'MOTIVATION_BOOST',
      context: {},
      preferredDelivery: 'BOTH',
    });

    expect(result).toBeNull();
    expect(analytics.trackMessageGenerationError).toHaveBeenCalledWith(
      mockUserId,
      'MOTIVATION_BOOST',
      expect.objectContaining({ message: expect.stringContaining(failure.message) }),
    );
  });
});
