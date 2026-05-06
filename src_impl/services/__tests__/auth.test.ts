/**
 * Auth Service Tests
 *
 * Comprehensive tests for auth service with:
 * - Token management
 * - Token refresh
 * - Biometric auth
 * - Session validation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService, LoginCredentials, RegisterData } from '../auth';
import { getApiClient } from '../../api/client';
import { useAuthStore } from '../../store';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../api/client');
jest.mock('../../store', () => ({
  useAuthStore: {
    getState: jest.fn().mockReturnValue({
      login: jest.fn(),
      logout: jest.fn(),
    }),
  },
}));
jest.mock('../../utils/debug', () => ({
  createDebugger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    time: jest.fn(),
    timeEnd: jest.fn(),
  }),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockGetApiClient = getApiClient as jest.Mock;

describe('AuthService', () => {
  let authService: AuthService;
  let mockApiClient: {
    post: jest.Mock;
    get: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockApiClient = {
      post: jest.fn(),
      get: jest.fn(),
    };
    mockGetApiClient.mockReturnValue(mockApiClient);

    authService = new AuthService();
  });

  describe('Initialization', () => {
    it('should restore session from storage on init', async () => {
      const now = Date.now();
      mockAsyncStorage.getItem.mockImplementation((key: string) => {
        switch (key) {
          case 'auth:access_token':
            return Promise.resolve('test-token');
          case 'auth:refresh_token':
            return Promise.resolve('test-refresh');
          case 'auth:token_expires':
            return Promise.resolve((now + 3600000).toString());
          case 'auth:user_data':
            return Promise.resolve(JSON.stringify({ id: '123', email: 'test@test.com' }));
          default:
            return Promise.resolve(null);
        }
      });

      await authService.initialize();

      const token = await authService.getAccessToken();
      expect(token).toBe('test-token');
    });

    it('should refresh expired token on init', async () => {
      const now = Date.now();
      mockAsyncStorage.getItem.mockImplementation((key: string) => {
        switch (key) {
          case 'auth:access_token':
            return Promise.resolve('expired-token');
          case 'auth:refresh_token':
            return Promise.resolve('test-refresh');
          case 'auth:token_expires':
            return Promise.resolve((now - 1000).toString());
          default:
            return Promise.resolve(null);
        }
      });

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          accessToken: 'new-token',
          expiresIn: 3600,
        },
      });

      await authService.initialize();

      const token = await authService.getAccessToken();
      expect(token).toBe('new-token');
    });

    it('should clear storage on init failure', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      await authService.initialize();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth:access_token');
    });
  });

  describe('Login', () => {
    it('should login and store tokens', async () => {
      const credentials: LoginCredentials = {
        email: 'test@test.com',
        password: 'password123',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600,
          user: {
            id: '123',
            email: 'test@test.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'user',
          },
        },
      });

      const user = await authService.login(credentials);

      expect(user.email).toBe('test@test.com');
      expect(user.firstName).toBe('Test');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('auth:access_token', 'access-token');
      expect(useAuthStore.getState().login).toHaveBeenCalled();
    });

    it('should throw on invalid credentials', async () => {
      mockApiClient.post.mockRejectedValueOnce({
        code: 'AUTH_ERROR',
        message: 'Invalid credentials',
      });

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should transform API user to full User model', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          accessToken: 'token',
          refreshToken: 'refresh',
          expiresIn: 3600,
          user: {
            id: '123',
            email: 'test@test.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'user',
          },
        },
      });

      const user = await authService.login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(user.username).toBe('test'); // From email
      expect(user.displayName).toBe('Test User');
      expect(user.verified).toBe(false);
      expect(user.status).toBe('active');
    });
  });

  describe('Token Refresh', () => {
    beforeEach(async () => {
      // Setup initial tokens
      const now = Date.now();
      await authService.storeTokens({
        accessToken: 'old-token',
        refreshToken: 'refresh-token',
        expiresAt: now - 1000, // Expired
      });
    });

    it('should refresh access token', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          accessToken: 'new-token',
          expiresIn: 3600,
        },
      });

      const refreshed = await authService.refreshToken();

      expect(refreshed).toBe(true);
      const token = await authService.getAccessToken();
      expect(token).toBe('new-token');
    });

    it('should return false if no refresh token', async () => {
      await authService.clearTokens();

      const refreshed = await authService.refreshToken();

      expect(refreshed).toBe(false);
    });

    it('should clear tokens on refresh failure', async () => {
      mockApiClient.post.mockRejectedValueOnce({
        code: 'AUTH_ERROR',
        message: 'Invalid refresh token',
      });

      const refreshed = await authService.refreshToken();

      expect(refreshed).toBe(false);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth:access_token');
    });

    it('should deduplicate concurrent refresh calls', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          accessToken: 'new-token',
          expiresIn: 3600,
        },
      });

      // Start two concurrent refreshes
      const [r1, r2] = await Promise.all([
        authService.refreshToken(),
        authService.refreshToken(),
      ]);

      // Both should succeed but API should only be called once
      expect(r1).toBe(true);
      expect(r2).toBe(true);
      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('Proactive Token Refresh', () => {
    it('should refresh token proactively when near expiry', async () => {
      const now = Date.now();

      // Token expires in 4 minutes (within 5 min threshold)
      await authService.storeTokens({
        accessToken: 'old-token',
        refreshToken: 'refresh-token',
        expiresAt: now + 240000,
      });

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          accessToken: 'new-token',
          expiresIn: 3600,
        },
      });

      const token = await authService.getAccessToken();

      expect(token).toBe('new-token');
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh', expect.any(Object));
    });

    it('should not refresh if token is fresh', async () => {
      const now = Date.now();

      await authService.storeTokens({
        accessToken: 'fresh-token',
        refreshToken: 'refresh-token',
        expiresAt: now + 3600000, // 1 hour
      });

      const token = await authService.getAccessToken();

      expect(token).toBe('fresh-token');
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });
  });

  describe('Logout', () => {
    it('should clear all tokens on logout', async () => {
      await authService.logout();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth:access_token');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth:refresh_token');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth:token_expires');
      expect(useAuthStore.getState().logout).toHaveBeenCalled();
    });

    it('should notify server of logout', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: {} });

      await authService.logout();

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('Session Info', () => {
    it('should return valid session info', async () => {
      const now = Date.now();
      await authService.storeTokens({
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: now + 3600000,
      });

      mockAsyncStorage.getItem.mockResolvedValue(now.toString());

      const info = await authService.getSessionInfo();

      expect(info.isValid).toBe(true);
      expect(info.timeRemaining).toBeGreaterThan(0);
    });

    it('should return invalid for expired session', async () => {
      const now = Date.now();
      await authService.storeTokens({
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: now - 1000,
      });

      const info = await authService.getSessionInfo();

      expect(info.isValid).toBe(false);
    });
  });

  describe('Biometric Auth', () => {
    it('should check availability on init', async () => {
      // Biometric availability checked in constructor
      expect(authService.isBiometricAvailable()).toBe(false); // Mocked as unavailable
    });

    it('should enable/disable biometric', async () => {
      await authService.setBiometricEnabled(true);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'auth:biometric_enabled',
        'true'
      );

      const enabled = await authService.isBiometricEnabled();
      expect(enabled).toBe(true);
    });
  });
});
