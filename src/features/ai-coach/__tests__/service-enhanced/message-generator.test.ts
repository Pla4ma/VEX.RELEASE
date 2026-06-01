import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { generateMessage } from '../../services/message-generator';
import * as repository from '../../repository';
import { mockUserId } from './helpers';

jest.mock('../../repository');

describe('Message Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates message from template', async () => {
    (repository.fetchCoachState as jest.Mock).mockResolvedValue({
      userId: mockUserId,
      personaId: 'default',
      muteUntil: null,
      reduceNotifications: false,
    });
    (repository.fetchMessageTemplates as jest.Mock).mockResolvedValue([
      {
        id: 'template-1',
        personaId: 'default',
        category: 'MOTIVATION_BOOST',
        priority: 8,
        content: 'You are doing great, {{name}}!',
        conditions: [],
        variations: [],
        cooldownHours: 4,
      },
    ]);
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
      userId: mockUserId,
      personaId: 'default',
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
    (repository.fetchCoachState as jest.Mock).mockResolvedValue({
      userId: mockUserId,
      personaId: 'default',
      muteUntil: null,
      reduceNotifications: false,
    });
    (repository.fetchMessageTemplates as jest.Mock).mockResolvedValue([
      {
        id: 'template-1',
        personaId: 'default',
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
});
