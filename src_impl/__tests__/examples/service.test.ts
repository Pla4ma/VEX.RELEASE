/**
 * Service Function Test Example
 *
 * Tests demonstrating Jest + MSW for service layer testing
 * Shows: mocking, success/failure paths, edge cases
 */

import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const request = globalThis.fetch.bind(globalThis);

describe('Service Function Example Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('success paths', () => {
    it('should calculate reward multipliers correctly', () => {
      // Simple business logic test
      const calculateMultiplier = (base: number, streak: number, difficulty: number): number => {
        return base * (1 + streak * 0.05) * difficulty;
      };

      const result = calculateMultiplier(100, 7, 1.5);

      expect(result).toBe(202.5); // 100 * 1.35 * 1.5
    });

    it('should handle API calls with MSW mock', async () => {
      // Override handler for specific test
      server.use(
        http.get('*/rest/v1/wallets', () => {
          return HttpResponse.json([{
            id: 'wallet-test',
            user_id: 'user-test',
            coins: 5000,
            gems: 100,
          }]);
        })
      );

      const response = await request('https://api.example.com/rest/v1/wallets');
      const data = await response.json();

      expect(data).toHaveLength(1);
      expect(data[0].coins).toBe(5000);
    });
  });

  describe('failure paths', () => {
    it('should handle network errors', async () => {
      server.use(
        http.get('*/rest/v1/wallets', () => {
          return HttpResponse.error();
        })
      );

      await expect(request('https://api.example.com/rest/v1/wallets'))
        .rejects.toThrow();
    });

    it('should handle rate limiting', async () => {
      server.use(
        http.get('*/rest/v1/wallets', () => {
          return HttpResponse.json(
            { error: 'Rate limited' },
            { status: 429, headers: { 'Retry-After': '60' } }
          );
        })
      );

      const response = await request('https://api.example.com/rest/v1/wallets');

      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBe('60');
    });
  });

  describe('edge cases', () => {
    it('should handle empty arrays', async () => {
      server.use(
        http.get('*/rest/v1/wallets', () => {
          return HttpResponse.json([]);
        })
      );

      const response = await request('https://api.example.com/rest/v1/wallets');
      const data = await response.json();

      expect(data).toEqual([]);
      expect(data).toHaveLength(0);
    });

    it('should handle large numbers without overflow', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      const result = largeNumber + 1;

      // Should not overflow in safe integer range
      expect(result).toBeGreaterThan(largeNumber);
    });
  });
});
