/**
 * Settings Navigator
 *
 * Navigation stack for settings screens.
 * Phase 14.6 - Complete settings navigation with all screens.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { LaneModeSettingsScreen } from '../screens/settings/LaneModeSettingsScreen';
import { NotificationSettingsScreen } from '../screens/settings/NotificationSettingsScreen';
import { AppearanceSettingsScreen } from '../screens/settings/AppearanceSettingsScreen';
import { CoachSettingsScreen } from '../screens/settings/CoachSettingsScreen';
import { PrivacySettingsScreen } from '../screens/settings/PrivacySettingsScreen';
import { AccountSettingsScreen } from '../screens/settings/AccountSettingsScreen';
import { DataExportScreen } from '../screens/settings/DataExportScreen';
import type { SettingsStackParams } from './types';
import { lightColors } from '../theme/tokens/colors';

const Stack = createNativeStackNavigator<SettingsStackParams>();

/**
 * Settings navigator component
 */
export const SettingsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: lightColors.background.primary },
        headerShown: false,
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
      />
      <Stack.Screen
        name="AppearanceSettings"
        component={AppearanceSettingsScreen}
      />
      <Stack.Screen name="CoachSettings" component={CoachSettingsScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="LaneMode" component={LaneModeSettingsScreen} />
      <Stack.Screen name="DataExport" component={DataExportScreen} />
    </Stack.Navigator>
  );
};

export { SettingsNavigator }