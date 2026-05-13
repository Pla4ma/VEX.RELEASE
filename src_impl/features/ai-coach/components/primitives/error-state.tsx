import { captureSilentFailure } from '../../../../utils/silent-failure';
/**
 * Error State Components
 *
 * Premium error states with recovery actions and retry logic
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { Keyframe, FadeIn } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';

// Custom shake animation keyframe
const Shake = new Keyframe({
  0: { transform: [{ translateX: 0 }] },
  10: { transform: [{ translateX: -10 }] },
  20: { transform: [{ translateX: 10 }] },
  30: { transform: [{ translateX: -10 }] },
  40: { transform: [{ translateX: 10 }] },
  50: { transform: [{ translateX: -10 }] },
  60: { transform: [{ translateX: 10 }] },
  70: { transform: [{ translateX: -10 }] },
  80: { transform: [{ translateX: 10 }] },
  90: { transform: [{ translateX: -5 }] },
  100: { transform: [{ translateX: 0 }] },
});

interface ErrorStateProps {
  title?: string;
  message: string;
  errorCode?: string;
  onRetry?: () => Promise<void>;
  onDismiss?: () => void;
  retryAttempts?: number;
  maxRetries?: number;
}

// Specific error states
// Inline error for form fields
// Error boundary fallback
const styles = createSheet({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'theme.colors.background.primary',
    borderRadius: 12,
    margin: 16,
  },
  degradedContainer: {
    backgroundColor: 'theme.colors.error.DEFAULT',
    borderWidth: 1,
    borderColor: 'theme.colors.error.DEFAULT',
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: 'theme.colors.primary[500]',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: 'theme.colors.primary[500]',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  errorCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  errorCodeLabel: {
    fontSize: 12,
    color: 'theme.colors.primary[500]',
  },
  errorCode: {
    fontSize: 12,
    color: 'theme.colors.primary[500]',
    fontFamily: 'monospace',
    backgroundColor: 'theme.colors.primary[500]',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attemptsText: {
    fontSize: 12,
    color: 'theme.colors.primary[500]',
    marginBottom: 12,
  },
  actions: {
    gap: 8,
    width: '100%',
  },
  retryButton: {
    backgroundColor: 'theme.colors.error.DEFAULT',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  retryButtonText: {
    color: 'theme.colors.background.primary',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  dismissButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: 'theme.colors.primary[500]',
    fontSize: 14,
    fontWeight: '500',
  },
  maxRetriesText: {
    fontSize: 12,
    color: 'theme.colors.primary[500]',
    textAlign: 'center',
    marginTop: 8,
  },
  degradedBadge: {
    backgroundColor: 'theme.colors.error.DEFAULT',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  degradedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'theme.colors.primary[500]',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: 'theme.colors.error.DEFAULT',
    borderRadius: 6,
    marginTop: 4,
  },
  inlineIcon: {
    fontSize: 14,
  },
  inlineText: {
    fontSize: 12,
    color: 'theme.colors.primary[500]',
    flex: 1,
  },
});

export * from "./error-state.types";
export * from "./error-state.part1";
