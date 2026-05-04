/**
 * Calendar Connection Screen
 *
 * UI for connecting external calendars (Google, Apple).
 * Shows connection status and allows management.
 *
 * @phase 4
 */

import React, { useCallback, useMemo } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../theme';
import { VStack, HStack, Text, Card, Button } from '../../../components/primitives';
import { LoadingState } from '../../../components/states';
import { Icon } from '../../../components/Icon';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('calendar:connection-screen');

// ============================================================================
// Types
// ============================================================================

interface CalendarConnection {
  id: string;
  type: 'GOOGLE' | 'APPLE';
  name: string;
  email: string;
  isConnected: boolean;
  lastSyncAt?: number;
  permissions: string[];
  canSync: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const CalendarConnectionScreen: React.FC = () => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const [connecting, setConnecting] = React.useState<string | null>(null);

  // Mock data - would come from calendar service
  const connections: CalendarConnection[] = useMemo(() => [
    {
      id: 'google-1',
      type: 'GOOGLE',
      name: 'Google Calendar',
      email: 'user@gmail.com',
      isConnected: false,
      permissions: ['read', 'write'],
      canSync: true,
    },
    {
      id: 'apple-1',
      type: 'APPLE',
      name: 'Apple Calendar',
      email: 'user@icloud.com',
      isConnected: false,
      permissions: ['read'],
      canSync: true,
    },
  ], []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Would refresh connection status
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleConnectGoogle = useCallback(async () => {
    setConnecting('google');
    try {
      // Would initiate Google OAuth flow
      debug.info('Connecting Google Calendar');
      // Simulate connection
      setTimeout(() => {
        setConnecting(null);
        debug.info('Google Calendar connected');
      }, 2000);
    } catch (error) {
      debug.error('Failed to connect Google Calendar', error);
      setConnecting(null);
    }
  }, []);

  const handleConnectApple = useCallback(async () => {
    setConnecting('apple');
    try {
      // Would initiate Apple Calendar connection
      debug.info('Connecting Apple Calendar');
      // Simulate connection
      setTimeout(() => {
        setConnecting(null);
        debug.info('Apple Calendar connected');
      }, 2000);
    } catch (error) {
      debug.error('Failed to connect Apple Calendar', error);
      setConnecting(null);
    }
  }, []);

  const handleDisconnect = useCallback(async (connectionId: string) => {
    try {
      // Would disconnect calendar
      debug.info('Disconnecting calendar', { connectionId });
      // Simulate disconnection
      setTimeout(() => {
        debug.info('Calendar disconnected', { connectionId });
      }, 1000);
    } catch (error) {
      debug.error('Failed to disconnect calendar', error);
    }
  }, []);

  const handleSyncNow = useCallback(async (connectionId: string) => {
    try {
      // Would trigger manual sync
      debug.info('Syncing calendar', { connectionId });
      // Simulate sync
      setTimeout(() => {
        debug.info('Calendar synced', { connectionId });
      }, 3000);
    } catch (error) {
      debug.error('Failed to sync calendar', error);
    }
  }, []);

  // ============================================================================
  // Render Connection Card
  // ============================================================================

  const renderConnectionCard = (connection: CalendarConnection) => (
    <Card
      key={connection.id}
      variant="elevated"
      padding="lg"
      background="card"
    >
      <VStack gap="md">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack gap="sm" align="center">
            <Icon
              name={connection.type === 'GOOGLE' ? 'calendar' : 'calendar-days'}
              size={24}
              color={connection.isConnected ? theme.colors.success.DEFAULT : theme.colors.text.secondary}
            />
            <VStack gap="xs">
              <Text variant="body" weight="semibold">
                {connection.name}
              </Text>
              <Text variant="caption" color="secondary">
                {connection.email}
              </Text>
            </VStack>
          </HStack>
          
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: theme.radius.full,
              backgroundColor: connection.isConnected 
                ? theme.colors.success.DEFAULT 
                : theme.colors.text.secondary,
            }}
          />
        </HStack>

        {/* Status */}
        <View
          style={{
            backgroundColor: theme.colors.background.secondary,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
          }}
        >
          <VStack gap="sm">
            <HStack justify="space-between" align="center">
              <Text variant="body" size="sm" color="secondary">
                Status
              </Text>
              <Text
                variant="body"
                size="sm"
                weight="semibold"
                color={connection.isConnected ? 'success' : 'secondary'}
              >
                {connection.isConnected ? 'Connected' : 'Not Connected'}
              </Text>
            </HStack>
            
            {connection.isConnected && connection.lastSyncAt && (
              <HStack justify="space-between" align="center">
                <Text variant="body" size="sm" color="secondary">
                  Last Sync
                </Text>
                <Text variant="caption" color="secondary">
                  {new Date(connection.lastSyncAt).toLocaleString()}
                </Text>
              </HStack>
            )}

            <HStack justify="space-between" align="center">
              <Text variant="body" size="sm" color="secondary">
                Permissions
              </Text>
              <Text variant="caption" color="secondary">
                {connection.permissions.join(', ')}
              </Text>
            </HStack>
          </VStack>
        </View>

        {/* Actions */}
        <HStack gap="sm">
          {!connection.isConnected ? (
            <Button
              variant="primary"
              flex={1}
              onPress={() => 
                connection.type === 'GOOGLE' 
                  ? handleConnectGoogle() 
                  : handleConnectApple()
              }
              disabled={connecting !== null}
              leftIcon={
                connecting === (connection.type === 'GOOGLE' ? 'google' : 'apple') ? (
                  <Icon name="loader" size={16} color={theme.colors.text.inverse} />
                ) : (
                  <Icon name="link" size={16} color={theme.colors.text.inverse} />
                )
              }
            >
              {connecting === (connection.type === 'GOOGLE' ? 'google' : 'apple') 
                ? 'Connecting...' 
                : `Connect ${connection.name.split(' ')[0]}`}
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                flex={1}
                onPress={() => handleSyncNow(connection.id)}
                leftIcon={<Icon name="refresh-cw" size={16} color={theme.colors.primary.DEFAULT} />}
              >
                Sync Now
              </Button>
              <Button
                variant="ghost"
                onPress={() => handleDisconnect(connection.id)}
                leftIcon={<Icon name="unlink" size={16} color={theme.colors.text.secondary} />}
              >
                Disconnect
              </Button>
            </>
          )}
        </HStack>
      </VStack>
    </Card>
  );

  // ============================================================================
  // Main UI
  // ============================================================================

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      contentContainerStyle={{ padding: theme.spacing.lg }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <VStack gap="lg">
        {/* Header */}
        <VStack gap="sm">
          <Text variant="heading">Calendar Connections</Text>
          <Text variant="body" color="secondary">
            Connect your calendars to enable smart scheduling and focus time suggestions.
          </Text>
        </VStack>

        {/* Connection Info */}
        <Card
          variant="outlined"
          padding="md"
          background="secondary"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.info.DEFAULT,
          }}
        >
          <HStack gap="sm" align="center">
            <Icon name="info" size={20} color={theme.colors.info.DEFAULT} />
            <Text variant="body" size="sm" color="info">
              Calendar access is used to find optimal study times and avoid conflicts.
            </Text>
          </HStack>
        </Card>

        {/* Calendar Connections */}
        <VStack gap="md">
          <Text variant="heading" size="md">
            Connected Calendars
          </Text>
          {connections.map(renderConnectionCard)}
        </VStack>

        {/* Privacy Notice */}
        <Card variant="outlined" padding="md" background="secondary">
          <VStack gap="sm">
            <Text variant="heading" size="sm">
              Privacy & Security
            </Text>
            <Text variant="body" color="secondary">
              • We only read calendar availability, not event details
            </Text>
            <Text variant="body" color="secondary">
              • Your calendar data is encrypted and stored securely
            </Text>
            <Text variant="body" color="secondary">
              • You can disconnect calendars at any time
            </Text>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Icon name="shield" size={14} color={theme.colors.text.secondary} />}
            >
              Learn More
            </Button>
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
};
