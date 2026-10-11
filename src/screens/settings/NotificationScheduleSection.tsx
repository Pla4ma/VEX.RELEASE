import { vexFire } from "@/theme/tokens/vex-fire";
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, Switch } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Box } from '../../components/primitives/Box';
import { Card } from '../../components/primitives';
import { Text } from '../../components/primitives/Text';
import { Icon } from '../../icons/components/Icon';


interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
}
export const NotificationScheduleSection: React.ComponentType = () => {
  const { theme: _theme } = useTheme();
  const [quietHours, setQuietHours] = useState<QuietHours>({
    enabled: false,
    start: '22:00',
    end: '08:00',
  });
  const handleQuietHoursToggle = useCallback(() => {
    setQuietHours((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const updateQuietTime = (type: 'start' | 'end', time: string) => {
    setQuietHours((prev) => ({ ...prev, [type]: time }));
  };

  const handleSetQuietHours = useCallback((type: 'start' | 'end') => {
    Alert.alert(
      `Set ${type === 'start' ? 'Start' : 'End'} Time`,
      'Choose a time',
      [
        { text: '20:00', onPress: () => updateQuietTime(type, '20:00') },
        { text: '21:00', onPress: () => updateQuietTime(type, '21:00') },
        { text: '22:00', onPress: () => updateQuietTime(type, '22:00') },
        { text: '23:00', onPress: () => updateQuietTime(type, '23:00') },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }, []);

  return (
    <Box px={16} mb={24}>
      <Text
        variant="caption"
        color={vexFire.textSecondary}
        style={{
          marginLeft: 12,
          marginBottom: 8,
          fontWeight: '600',
          letterSpacing: 0.5,
        }}
      >
        QUIET HOURS
      </Text>
      <Card size="sm" style={{ overflow: 'hidden' }}>
        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}
          onPress={handleQuietHoursToggle}
          accessibilityLabel="Notification schedule"
          accessibilityRole="button"
          accessibilityHint="Double tap to change setting"
        >
          <Box
            width={40}
            height={40}
            borderRadius={10}
            justifyContent="center"
            alignItems="center"
            style={{
              backgroundColor: quietHours.enabled
                ? vexFire.ember
                : vexFire.panel,
            }}
          >
            <Icon
              name="moon"
              size={20}
              color={
                quietHours.enabled
                  ? vexFire.ember
                  : vexFire.textMuted
              }
            />
          </Box>
          <Box flex={1} ml={12}>
            <Text
              variant="body"
              style={{
                fontWeight: '500',
                color: vexFire.cream,
              }}
            >
              Quiet Hours
            </Text>
            <Text
              variant="caption"
              color={vexFire.textSecondary}
              style={{ marginTop: 2 }}
            >
              No notifications during this time
            </Text>
          </Box>
          <Switch
            value={quietHours.enabled}
            onValueChange={handleQuietHoursToggle}
            trackColor={{
              false: vexFire.backgroundSoft,
              true: vexFire.ember + '80',
            }}
            thumbColor={
              quietHours.enabled
                ? vexFire.ember
                : vexFire.cream
            }
          />
        </Pressable>
        {quietHours.enabled && (
          <>
            <Box
              height={1}
              style={{ backgroundColor: vexFire.border }}
            />
            <Box flexDirection="row" px={16} py={12}>
              <Pressable
                style={{ flex: 1, marginRight: 8 }}
                onPress={() => handleSetQuietHours('start')}
                accessibilityLabel="Set notification start time"
                accessibilityRole="button"
                accessibilityHint="Double tap to change setting"
              >
                <Box
                  p={12}
                  borderRadius={8}
                  style={{
                    backgroundColor: vexFire.panel,
                    borderWidth: 1,
                    borderColor: vexFire.border,
                  }}
                >
                  <Text variant="caption" color={vexFire.textSecondary}>
                    Start
                  </Text>
                  <Text
                    variant="body"
                    style={{ fontWeight: '600', marginTop: 4 }}
                  >
                    {quietHours.start}
                  </Text>
                </Box>
              </Pressable>
              <Box justifyContent="center">
                <Icon
                  name="arrow-right"
                  size={16}
                  color={vexFire.textMuted}
                />
              </Box>
              <Pressable
                style={{ flex: 1, marginLeft: 8 }}
                onPress={() => handleSetQuietHours('end')}
                accessibilityLabel="Set notification end time"
                accessibilityRole="button"
                accessibilityHint="Double tap to change setting"
              >
                <Box
                  p={12}
                  borderRadius={8}
                  style={{
                    backgroundColor: vexFire.panel,
                    borderWidth: 1,
                    borderColor: vexFire.border,
                  }}
                >
                  <Text variant="caption" color={vexFire.textSecondary}>
                    End
                  </Text>
                  <Text
                    variant="body"
                    style={{ fontWeight: '600', marginTop: 4 }}
                  >
                    {quietHours.end}
                  </Text>
                </Box>
              </Pressable>
            </Box>
          </>
        )}
      </Card>
    </Box>
  );
};
