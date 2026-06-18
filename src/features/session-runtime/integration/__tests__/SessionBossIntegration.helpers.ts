/**
 * Shared fixtures for SessionBossIntegration tests.
 *
 * No jest.mock() calls here — each test file sets up its own mocks.
 * This file only exports typed availability fixtures.
 */

import type { FeatureAvailability } from '../../../features/liveops-config/FeatureFlagService';

export const ENABLED_AVAILABILITY: FeatureAvailability = {
  state: 'unlocked',
  canRenderEntryPoint: true,
  canNavigate: true,
  canQuery: true,
  canUseBackend: true,
  canRegisterRoute: true,
  canSubscribeToEvents: true,
  canShowNotification: true,
  reason: 'Feature is unlocked',
};

export const LOCKED_AVAILABILITY: FeatureAvailability = {
  state: 'locked',
  canRenderEntryPoint: false,
  canNavigate: false,
  canQuery: false,
  canUseBackend: false,
  canRegisterRoute: false,
  canSubscribeToEvents: false,
  canShowNotification: false,
  reason: 'Feature is locked',
};

export const HIDDEN_AVAILABILITY: FeatureAvailability = {
  state: 'hidden',
  canRenderEntryPoint: false,
  canNavigate: false,
  canQuery: false,
  canUseBackend: false,
  canRegisterRoute: false,
  canSubscribeToEvents: false,
  canShowNotification: false,
  reason: 'Feature is hidden',
};
