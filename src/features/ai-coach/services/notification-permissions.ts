import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { STORAGE_KEYS } from '../../../constants/storage';
import { getMMKVStorageAdapter } from '../../../persistence/MMKVStorageAdapter';
import { createDebugger } from '../../../utils/debug';
import { NOTIFICATION_CONFIG } from './notification-config';
import { launchColors } from '@theme/tokens/launch-colors';

const debug = createDebugger('ai-coach:notifications');

type PromptState = Record<string, true>;

async function readPromptState(): Promise<PromptState> {
  const raw = await getMMKVStorageAdapter().getItem(
    STORAGE_KEYS.NOTIFICATION_ONBOARDING_PROMPT,
  );
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as PromptState;
  } catch (error) {
    debug.warn('Failed to parse onboarding notification prompt state', error);
    return {};
  }
}

export async function hasRequestedOnboardingNotificationPrompt(
  userId: string,
): Promise<boolean> {
  const state = await readPromptState();
  return Boolean(state[userId]);
}

export async function markOnboardingNotificationPromptRequested(
  userId: string,
): Promise<void> {
  try {
    const state = await readPromptState();
    await getMMKVStorageAdapter().setItem(
      STORAGE_KEYS.NOTIFICATION_ONBOARDING_PROMPT,
      JSON.stringify({
        ...state,
        [userId]: true,
      }),
    );
  } catch (error) {
    debug.warn('Failed to persist onboarding notification prompt state', error);
  }
}

export async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await Notifications.setNotificationChannelAsync(
      NOTIFICATION_CONFIG.androidChannelId,
      {
        name: NOTIFICATION_CONFIG.androidChannelName,
        description: NOTIFICATION_CONFIG.androidChannelDescription,
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: launchColors.hex_ff6b6b,
      },
    );
  } catch (error) {
    debug.warn('Notification channel setup failed', error);
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    await ensureNotificationChannel();
    const existing = await Notifications.getPermissionsAsync();
    const existingGranted =
      existing.granted ||
      existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

    if (existingGranted) {
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    const granted =
      requested.granted ||
      requested.ios?.status ===
        Notifications.IosAuthorizationStatus.PROVISIONAL;

    if (!granted) {
      debug.warn('Notification permission denied');
    }

    return granted;
  } catch (error) {
    debug.warn('Notification permission request failed', error);
    return false;
  }
}
