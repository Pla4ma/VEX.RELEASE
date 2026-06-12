import { getRandomMessage, wittyMessages, type LoadingContext } from '../witty-loading-messages';

describe('witty-loading-messages', () => {
  describe('wittyMessages', () => {
    it('has messages for all contexts', () => {
      const contexts: LoadingContext[] = [
        'home', 'boss', 'leaderboard', 'coach', 'achievements',
        'challenges', 'squad', 'profile', 'analytics', 'default',
      ];
      for (const ctx of contexts) {
        expect(wittyMessages[ctx]).toBeDefined();
        expect(wittyMessages[ctx].length).toBeGreaterThan(0);
      }
    });

    it('each context has 4 messages', () => {
      for (const [ctx, messages] of Object.entries(wittyMessages)) {
        expect(messages).toHaveLength(4);
      }
    });

    it('all messages are non-empty strings', () => {
      for (const messages of Object.values(wittyMessages)) {
        for (const msg of messages) {
          expect(typeof msg).toBe('string');
          expect(msg.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('getRandomMessage', () => {
    it('returns a message from the specified context', () => {
      const msg = getRandomMessage('boss');
      expect(wittyMessages.boss).toContain(msg);
    });

    it('returns a message from default for unknown context', () => {
      const msg = getRandomMessage('nonexistent' as LoadingContext);
      expect(wittyMessages.default).toContain(msg);
    });

    it('returns different messages over multiple calls', () => {
      const results = new Set<string>();
      for (let i = 0; i < 50; i++) {
        results.add(getRandomMessage('home'));
      }
      expect(results.size).toBeGreaterThan(1);
    });

    it('returns valid message for each context', () => {
      const contexts: LoadingContext[] = ['home', 'boss', 'leaderboard', 'coach', 'achievements', 'challenges', 'squad', 'profile', 'analytics', 'default'];
      for (const ctx of contexts) {
        const msg = getRandomMessage(ctx);
        expect(wittyMessages[ctx]).toContain(msg);
      }
    });
  });
});
