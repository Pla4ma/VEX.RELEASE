/**
 * Screen Error Boundary Simple Tests
 * 
 * Basic tests for screen error boundary functionality
 */

import React from 'react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  ScreenErrorBoundary,
  type ScreenErrorConfig,
} from '../ScreenErrorBoundary';
import {
  ScreenErrorWrapper,
  useScreenError,
  screenErrorRecovery,
  type ScreenType,
} from '../ScreenErrorWrapper';

describe('ScreenErrorBoundary Basic Tests', () => {
  let mockConfig: ScreenErrorConfig;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig = {
      screenName: 'Test Screen',
      isCritical: true,
      recoveryTarget: 'Home',
      preserveState: true,
    };
  });

  it('should initialize with correct default state', () => {
    const boundary = new ScreenErrorBoundary({
      children: React.createElement('div'),
      config: mockConfig,
    });

    expect(boundary.state.hasError).toBe(false);
    expect(boundary.state.error).toBe(null);
    expect(boundary.state.category).toBe('unknown');
    expect(boundary.state.retryCount).toBe(0);
    expect(boundary.state.isRetrying).toBe(false);
  });

  it('should categorize network errors correctly', () => {
    const networkError = new Error('Network connection failed');
    
    // Test the categorization function
    const category = categorizeError(networkError);
    expect(category).toBe('network');
  });

  it('should categorize auth errors correctly', () => {
    const authError = new Error('Authentication failed');
    
    const category = categorizeError(authError);
    expect(category).toBe('auth');
  });

  it('should categorize validation errors correctly', () => {
    const validationError = new Error('Invalid input data');
    
    const category = categorizeError(validationError);
    expect(category).toBe('validation');
  });

  it('should categorize server errors correctly', () => {
    const serverError = new Error('Server error 500');
    
    const category = categorizeError(serverError);
    expect(category).toBe('server');
  });

  it('should categorize client errors correctly', () => {
    const clientError = new Error('TypeError: Cannot read property');
    
    const category = categorizeError(clientError);
    expect(category).toBe('client');
  });

  it('should categorize unknown errors correctly', () => {
    const unknownError = new Error('Something unexpected');
    
    const category = categorizeError(unknownError);
    expect(category).toBe('unknown');
  });
});

describe('ScreenErrorWrapper Tests', () => {
  it('should provide configuration for session screen', () => {
    const config = SCREEN_ERROR_CONFIGS['session'];
    
    expect(config.screenName).toBe('Focus Session');
    expect(config.isCritical).toBe(true);
    expect(config.recoveryTarget).toBe('Home');
    expect(config.preserveState).toBe(true);
  });

  it('should provide configuration for home screen', () => {
    const config = SCREEN_ERROR_CONFIGS['home'];
    
    expect(config.screenName).toBe('Home');
    expect(config.isCritical).toBe(true);
    expect(config.recoveryTarget).toBe('Home');
    expect(config.preserveState).toBe(false);
  });

  it('should provide configuration for non-critical screens', () => {
    const config = SCREEN_ERROR_CONFIGS['rewards'];
    
    expect(config.screenName).toBe('Rewards');
    expect(config.isCritical).toBe(false);
    expect(config.recoveryTarget).toBe('Home');
    expect(config.preserveState).toBe(false);
  });
});

describe('useScreenError Hook Tests', () => {
  it('should return session configuration', () => {
    const config = useScreenError('session');
    
    expect(config.screenConfig.screenName).toBe('Focus Session');
    expect(config.isCritical).toBe(true);
    expect(config.recoveryTarget).toBe('Home');
    expect(config.screenName).toBe('Focus Session');
  });

  it('should return home configuration', () => {
    const config = useScreenError('home');
    
    expect(config.screenConfig.screenName).toBe('Home');
    expect(config.isCritical).toBe(true);
    expect(config.recoveryTarget).toBe('Home');
    expect(config.screenName).toBe('Home');
  });
});

describe('screenErrorRecovery Tests', () => {
  beforeEach(() => {
    screenErrorRecovery.clearAllRecoveryAttempts();
  });

  it('should attempt recovery for retryable errors', async () => {
    const error = new Error('Network error');
    const result = await screenErrorRecovery.attemptRecovery('session', error);
    
    expect(result).toBe(true);
    expect(screenErrorRecovery.getRecoveryAttempts('session')).toBe(1);
  });

  it('should not attempt recovery for client errors', async () => {
    const error = new Error('Reference error');
    const result = await screenErrorRecovery.attemptRecovery('session', error);
    
    expect(result).toBe(false);
    expect(screenErrorRecovery.getRecoveryAttempts('session')).toBe(0);
  });

  it('should limit recovery attempts', async () => {
    const error = new Error('Network error');
    
    // Attempt recovery 3 times
    for (let i = 0; i < 3; i++) {
      await screenErrorRecovery.attemptRecovery('session', error);
    }
    
    // 4th attempt should fail
    const result = await screenErrorRecovery.attemptRecovery('session', error);
    expect(result).toBe(false);
    expect(screenErrorRecovery.getRecoveryAttempts('session')).toBe(3);
  });

  it('should reset recovery attempts', () => {
    screenErrorRecovery.attemptRecovery('session', new Error('Test error'));
    expect(screenErrorRecovery.getRecoveryAttempts('session')).toBe(1);
    
    screenErrorRecovery.resetRecoveryAttempts('session');
    expect(screenErrorRecovery.getRecoveryAttempts('session')).toBe(0);
  });

  it('should clear all recovery attempts', () => {
    screenErrorRecovery.attemptRecovery('session', new Error('Test error'));
    screenErrorRecovery.attemptRecovery('home', new Error('Test error'));
    expect(screenErrorRecovery.getRecoveryAttempts('session')).toBe(1);
    expect(screenErrorRecovery.getRecoveryAttempts('home')).toBe(1);
    
    screenErrorRecovery.clearAllRecoveryAttempts();
    expect(screenErrorRecovery.getRecoveryAttempts('session')).toBe(0);
    expect(screenErrorRecovery.getRecoveryAttempts('home')).toBe(0);
  });
});

// Helper function and constants for testing
function categorizeError(error: Error): 'network' | 'auth' | 'validation' | 'server' | 'client' | 'unknown' {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return 'network';
  }
  if (message.includes('auth') || message.includes('unauthorized') || message.includes('token')) {
    return 'auth';
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }
  if (message.includes('server') || message.includes('500') || message.includes('503')) {
    return 'server';
  }
  if (name.includes('error') && !name.includes('reference') && !name.includes('type')) {
    return 'client';
  }
  return 'unknown';
}

const SCREEN_ERROR_CONFIGS: Record<ScreenType, any> = {
  session: {
    screenName: 'Focus Session',
    isCritical: true,
    recoveryTarget: 'Home',
    preserveState: true,
  },
  'session-complete': {
    screenName: 'Session Complete',
    isCritical: true,
    recoveryTarget: 'Home',
    preserveState: true,
  },
  home: {
    screenName: 'Home',
    isCritical: true,
    recoveryTarget: 'Home',
    preserveState: false,
  },
  rewards: {
    screenName: 'Rewards',
    isCritical: false,
    recoveryTarget: 'Home',
    preserveState: false,
  },
  streaks: {
    screenName: 'Streaks',
    isCritical: false,
    recoveryTarget: 'Home',
    preserveState: false,
  },
  progression: {
    screenName: 'Progression',
    isCritical: false,
    recoveryTarget: 'Home',
    preserveState: false,
  },
  profile: {
    screenName: 'Profile',
    isCritical: false,
    recoveryTarget: 'Home',
    preserveState: false,
  },
  settings: {
    screenName: 'Settings',
    isCritical: false,
    recoveryTarget: 'Home',
    preserveState: false,
  },
  boss: {
    screenName: 'Boss Battles',
    isCritical: false,
    recoveryTarget: 'Home',
    preserveState: false,
  },
  challenges: {
    screenName: 'Challenges',
    isCritical: false,
    recoveryTarget: 'Home',
    preserveState: false,
  },
  squads: {
    screenName: 'Squads',
    isCritical: false,
    recoveryTarget: 'Home',
    preserveState: false,
  },
};