import React from 'react';
import type { Theme } from '../../theme';
import { Box, Card } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Icon } from '../../icons/components/Icon';

interface SettingsProfileRowProps {
  displayName: string;
  userId: string;
  theme: Theme;
  onPress: () => void;
}

export function SettingsProfileRow({
  displayName,
  userId,
  theme,
  onPress,
}: SettingsProfileRowProps) {
  return (
    <Card
      style={{ marginHorizontal: 16, marginBottom: 24 }}
      size="lg"
      onPress={onPress}
      accessibilityLabel={`${displayName} profile`}
      accessibilityRole="button"
      accessibilityHint="Opens your profile details"
    >
      <Box flexDirection="row" alignItems="center" flex={1}>
        <Avatar name={displayName} size="lg" />
        <Box ml={16} flex={1}>
          <Text variant="h3">{displayName}</Text>
          <Text variant="body" color="text.secondary">
            {userId}
          </Text>
          <Box flexDirection="row" mt={8}>
            <Badge variant="primary" size="sm" leftIcon="star">
              <Text>Pro</Text>
            </Badge>
          </Box>
        </Box>
      </Box>
      <Icon name="arrow-right" size={20} color={theme.colors.text.tertiary} />
    </Card>
  );
}
