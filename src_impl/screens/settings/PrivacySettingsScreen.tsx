/**
 * Privacy Settings Screen
 *
 * Phase 14.5 - Complete privacy and data management.
 *
 * Features:
 * - Profile visibility selector (Public, Friends Only, Private)
 * - Feed post settings (auto-post, squad feed visibility)
 * - Analytics toggle
 * - Data export request
 * - Account deletion with GDPR compliance
 */

import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useTheme } from '../../theme';
import { Box, Text, Card } from '../../components/primitives';
import { Icon } from '../../icons';
import { useAuthStore, useUIStore } from '../../store/index';
import type { SettingsStackParams } from '../../navigation';

type Props = NativeStackScreenProps<SettingsStackParams, 'PrivacySettings'>;

type ProfileVisibility = 'public' | 'friends' | 'private';

interface VisibilityOption {
  id: ProfileVisibility;
  label: string;
  icon: string;
  description: string;
}

const VISIBILITY_OPTIONS: VisibilityOption[] = [
  {
    id: 'public',
    label: 'Public',
    icon: 'globe',
    description: 'Anyone can see your profile and activity',
  },
  {
    id: 'friends',
    label: 'Friends Only',
    icon: 'users',
    description: 'Only squad members and rivals can see your activity',
  },
  {
    id: 'private',
    label: 'Private',
    icon: 'lock',
    description: 'Only you can see your profile and activity',
  },
];

export const PrivacySettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { logout } = useAuthStore();
  const { showToast } = useUIStore();

  const [visibility, setVisibility] = useState<ProfileVisibility>('public');
  const [autoPostSessions, setAutoPostSessions] = useState(true);
  const [showInSquadFeed, setShowInSquadFeed] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [dataExportLoading, setDataExportLoading] = useState(false);

  const handleVisibilityChange = useCallback((newVisibility: ProfileVisibility) => {
    setVisibility(newVisibility);
  }, []);

  const handleAutoPostToggle = useCallback(() => {
    setAutoPostSessions((prev) => !prev);
  }, []);

  const handleSquadFeedToggle = useCallback(() => {
    setShowInSquadFeed((prev) => !prev);
  }, []);

  const handleAnalyticsToggle = useCallback(() => {
    setAnalyticsEnabled((prev) => !prev);
  }, []);

  const handleDataExport = useCallback(async () => {
    setDataExportLoading(true);

    // Simulate API call to request data export
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setDataExportLoading(false);

    showToast({
      message: 'Data export requested. Check your email in 24 hours.',
      type: 'success',
      duration: 5000,
    });
  }, [showToast]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Your Account?',
      'This will permanently delete your account and all associated data. You have a 7-day grace period to cancel this action.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Learn More',
          onPress: () => Linking.openURL('https://vex.app/delete-account'),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are You Sure?',
              'This action cannot be undone. Your streak, progress, and all data will be lost forever.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: () => {
                    // In a real app, this would trigger the account deletion flow
                    showToast({
                      message: 'Account deletion scheduled. You have 7 days to cancel.',
                      type: 'warning',
                      duration: 5000,
                    });
                    // After 7 days or immediate logout
                    logout();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, [logout, showToast]);

  const selectedVisibility = VISIBILITY_OPTIONS.find((v) => v.id === visibility);

  return (
    <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Box px={20} pb={16} pt={insets.top + 16} flexDirection="row" alignItems="center">
          <Pressable onPress={() => navigation.goBack()} style={{ marginRight: 12 }}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            <Icon name="arrow-left" size={24} color={theme.colors.text.primary} />
          </Pressable>
          <Text variant="h2">Privacy</Text>
        </Box>

        {/* Current Visibility Card */}
        <Box px={16} mb={24}>
          <Text
            variant="caption"
            color="text.secondary"
            style={{ marginLeft: 12, marginBottom: 8, fontWeight: '600', letterSpacing: 0.5 }}
          >
            CURRENT VISIBILITY
          </Text>
          <Card
            size="md"
            style={{
              backgroundColor: theme.colors.background.secondary,
              flexDirection: 'row',
              alignItems: 'center',
              padding: 20,
            }}
          >
            <Box
              width={56}
              height={56}
              borderRadius={28}
              justifyContent="center"
              alignItems="center"
              style={{ backgroundColor: theme.colors.primary[50] }}
            >
              <Icon name={selectedVisibility?.icon || 'globe'} size={28} color={theme.colors.primary[500]} />
            </Box>
            <Box flex={1} ml={16}>
              <Text variant="h4" style={{ marginBottom: 4 }}>
                {selectedVisibility?.label}
              </Text>
              <Text variant="body" color="text.secondary">
                {selectedVisibility?.description}
              </Text>
            </Box>
          </Card>
        </Box>

        {/* Profile Visibility Selector */}
        <Box px={16} mb={24}>
          <Text
            variant="caption"
            color="text.secondary"
            style={{ marginLeft: 12, marginBottom: 8, fontWeight: '600', letterSpacing: 0.5 }}
          >
            PROFILE VISIBILITY
          </Text>
          <Card size="sm" style={{ overflow: 'hidden' }}>
            {VISIBILITY_OPTIONS.map((option, index) => (
              <React.Fragment key={option.id}>
                <Pressable
                  onPress={() => handleVisibilityChange(option.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                  }}

                accessibilityLabel="Interactive control"
                accessibilityRole="button"
                accessibilityHint="Activates this control">
                  <Box
                    width={40}
                    height={40}
                    borderRadius={10}
                    justifyContent="center"
                    alignItems="center"
                    style={{
                      backgroundColor:
                        visibility === option.id
                          ? theme.colors.primary[50]
                          : theme.colors.background.secondary,
                    }}
                  >
                    <Icon
                      name={option.icon}
                      size={20}
                      color={
                        visibility === option.id
                          ? theme.colors.primary[500]
                          : theme.colors.text.tertiary
                      }
                    />
                  </Box>

                  <Box flex={1} ml={12}>
                    <Text
                      variant="body"
                      style={{
                        fontWeight: visibility === option.id ? '600' : '500',
                        color: theme.colors.text.primary,
                      }}
                    >
                      {option.label}
                    </Text>
                    <Text variant="caption" color="text.secondary" style={{ marginTop: 2 }}>
                      {option.description}
                    </Text>
                  </Box>

                  {visibility === option.id && (
                    <Box
                      width={24}
                      height={24}
                      borderRadius={12}
                      justifyContent="center"
                      alignItems="center"
                      style={{ backgroundColor: theme.colors.primary[500] }}
                    >
                      <Icon name="check" size={14} color="#FFF" />
                    </Box>
                  )}
                </Pressable>
                {index < VISIBILITY_OPTIONS.length - 1 && (
                  <Box height={1} ml={68} style={{ backgroundColor: theme.colors.border.light }} />
                )}
              </React.Fragment>
            ))}
          </Card>
        </Box>

        {/* Feed Settings */}
        <Box px={16} mb={24}>
          <Text
            variant="caption"
            color="text.secondary"
            style={{ marginLeft: 12, marginBottom: 8, fontWeight: '600', letterSpacing: 0.5 }}
          >
            FEED SETTINGS
          </Text>
          <Card size="sm" style={{ overflow: 'hidden' }}>
            {/* Auto-post sessions */}
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 16,
              }}
              onPress={handleAutoPostToggle}

            accessibilityLabel="Interactive control"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
              <Box
                width={40}
                height={40}
                borderRadius={10}
                justifyContent="center"
                alignItems="center"
                style={{
                  backgroundColor: autoPostSessions
                    ? theme.colors.primary[50]
                    : theme.colors.background.secondary,
                }}
              >
                <Icon
                  name="share-2"
                  size={20}
                  color={autoPostSessions ? theme.colors.primary[500] : theme.colors.text.tertiary}
                />
              </Box>

              <Box flex={1} ml={12}>
                <Text
                  variant="body"
                  style={{
                    fontWeight: '500',
                    color: theme.colors.text.primary,
                  }}
                >
                  Auto-post Sessions
                </Text>
                <Text variant="caption" color="text.secondary" style={{ marginTop: 2 }}>
                  Share completed sessions to your feed
                </Text>
              </Box>

              <Switch
                value={autoPostSessions}
                onValueChange={handleAutoPostToggle}
                trackColor={{
                  false: theme.colors.background.tertiary,
                  true: theme.colors.primary[500] + '80',
                }}
                thumbColor={autoPostSessions ? theme.colors.primary[500] : '#FFF'}
              />
            </Pressable>

            <Box height={1} ml={68} style={{ backgroundColor: theme.colors.border.light }} />

            {/* Show in squad feed */}
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 16,
              }}
              onPress={handleSquadFeedToggle}

            accessibilityLabel="Interactive control"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
              <Box
                width={40}
                height={40}
                borderRadius={10}
                justifyContent="center"
                alignItems="center"
                style={{
                  backgroundColor: showInSquadFeed
                    ? theme.colors.primary[50]
                    : theme.colors.background.secondary,
                }}
              >
                <Icon
                  name="users"
                  size={20}
                  color={showInSquadFeed ? theme.colors.primary[500] : theme.colors.text.tertiary}
                />
              </Box>

              <Box flex={1} ml={12}>
                <Text
                  variant="body"
                  style={{
                    fontWeight: '500',
                    color: theme.colors.text.primary,
                  }}
                >
                  Show in Squad Feed
                </Text>
                <Text variant="caption" color="text.secondary" style={{ marginTop: 2 }}>
                  Squad members can see your activity
                </Text>
              </Box>

              <Switch
                value={showInSquadFeed}
                onValueChange={handleSquadFeedToggle}
                trackColor={{
                  false: theme.colors.background.tertiary,
                  true: theme.colors.primary[500] + '80',
                }}
                thumbColor={showInSquadFeed ? theme.colors.primary[500] : '#FFF'}
              />
            </Pressable>
          </Card>
        </Box>

        {/* Analytics */}
        <Box px={16} mb={24}>
          <Text
            variant="caption"
            color="text.secondary"
            style={{ marginLeft: 12, marginBottom: 8, fontWeight: '600', letterSpacing: 0.5 }}
          >
            DATA & ANALYTICS
          </Text>
          <Card size="sm" style={{ overflow: 'hidden' }}>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 16,
              }}
              onPress={handleAnalyticsToggle}

            accessibilityLabel="Interactive control"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
              <Box
                width={40}
                height={40}
                borderRadius={10}
                justifyContent="center"
                alignItems="center"
                style={{
                  backgroundColor: analyticsEnabled
                    ? theme.colors.primary[50]
                    : theme.colors.background.secondary,
                }}
              >
                <Icon
                  name="bar-chart-2"
                  size={20}
                  color={analyticsEnabled ? theme.colors.primary[500] : theme.colors.text.tertiary}
                />
              </Box>

              <Box flex={1} ml={12}>
                <Text
                  variant="body"
                  style={{
                    fontWeight: '500',
                    color: theme.colors.text.primary,
                  }}
                >
                  Anonymous Analytics
                </Text>
                <Text variant="caption" color="text.secondary" style={{ marginTop: 2 }}>
                  Help improve VEX with usage data
                </Text>
              </Box>

              <Switch
                value={analyticsEnabled}
                onValueChange={handleAnalyticsToggle}
                trackColor={{
                  false: theme.colors.background.tertiary,
                  true: theme.colors.primary[500] + '80',
                }}
                thumbColor={analyticsEnabled ? theme.colors.primary[500] : '#FFF'}
              />
            </Pressable>
          </Card>
        </Box>

        {/* Data Export */}
        <Box px={16} mb={24}>
          <Text
            variant="caption"
            color="text.secondary"
            style={{ marginLeft: 12, marginBottom: 8, fontWeight: '600', letterSpacing: 0.5 }}
          >
            DATA EXPORT
          </Text>
          <Pressable
            onPress={handleDataExport}
            disabled={dataExportLoading}
            style={{
              backgroundColor: theme.colors.background.secondary,
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.colors.border.light,
              opacity: dataExportLoading ? 0.6 : 1,
            }}

          accessibilityLabel="Interactive control"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
            <Box
              width={40}
              height={40}
              borderRadius={10}
              justifyContent="center"
              alignItems="center"
              style={{ backgroundColor: theme.colors.primary[50] }}
            >
              <Icon
                name={dataExportLoading ? 'loader' : 'download'}
                size={20}
                color={theme.colors.primary[500]}
              />
            </Box>
            <Box flex={1} ml={12}>
              <Text
                variant="body"
                style={{
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                }}
              >
                {dataExportLoading ? 'Requesting...' : 'Request My Data'}
              </Text>
              <Text variant="caption" color="text.secondary" style={{ marginTop: 2 }}>
                Download all your data (GDPR)
              </Text>
            </Box>
            {!dataExportLoading && (
              <Icon name="arrow-right" size={20} color={theme.colors.text.tertiary} />
            )}
          </Pressable>
        </Box>

        {/* Account Deletion */}
        <Box px={16} mb={24}>
          <Text
            variant="caption"
            color="text.secondary"
            style={{ marginLeft: 12, marginBottom: 8, fontWeight: '600', letterSpacing: 0.5 }}
          >
            DANGER ZONE
          </Text>
          <Pressable
            onPress={handleDeleteAccount}
            style={{
              backgroundColor: theme.colors.error[50] || '#FEF2F2',
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.colors.error.DEFAULT + '30',
            }}

          accessibilityLabel="Interactive control"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
            <Box
              width={40}
              height={40}
              borderRadius={10}
              justifyContent="center"
              alignItems="center"
              style={{ backgroundColor: theme.colors.error.DEFAULT + '20' }}
            >
              <Icon name="trash-2" size={20} color={theme.colors.error.DEFAULT} />
            </Box>
            <Box flex={1} ml={12}>
              <Text
                variant="body"
                style={{
                  fontWeight: '600',
                  color: theme.colors.error.DEFAULT,
                }}
              >
                Delete My Account
              </Text>
              <Text variant="caption" color="text.secondary" style={{ marginTop: 2 }}>
                7-day grace period per GDPR
              </Text>
            </Box>
          </Pressable>
        </Box>

        <Box height={insets.bottom + 20} />
      </ScrollView>
    </Box>
  );
};

export default PrivacySettingsScreen;
