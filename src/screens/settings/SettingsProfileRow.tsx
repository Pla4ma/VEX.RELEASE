import React from 'react';
import type { Theme } from '../../theme';
import { Box } from '../../components/primitives/Box'
import { Card } from '../../components/primitives'
import { Text } from '../../components/primitives/Text';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { VexIcon } from '../../shared/ui/vex/VexIcon';
import { vexFire } from '../../theme/tokens/vex-fire';

interface SettingsProfileRowProps {
  displayName: string;
  userId: string;
  theme: Theme;
  onPress: () => void;
}

export function SettingsProfileRow({
  displayName,
  userId,
  theme: _theme,
  onPress,
}: SettingsProfileRowProps) {
  return (
    <Card
      style={{ backgroundColor: vexFire.panel, borderColor: vexFire.border, borderWidth: 1, marginHorizontal: 16, marginBottom: 24 }}
      size="lg"
      onPress={onPress}
      accessibilityLabel={`${displayName} profile`}
      accessibilityRole="button"
      accessibilityHint="Opens your profile details"
    >
      <Box flexDirection="row" alignItems="center" flex={1}>
        <Avatar name={displayName} size="lg" />
        <Box ml={16} flex={1}>
          <Text variant="h3" style={{ color: vexFire.cream }}>{displayName}</Text>
          <Text variant="body" style={{ color: vexFire.textSecondary }}>
            {userId}
          </Text>
          <Box flexDirection="row" mt={8}>
            <Badge variant="primary" size="sm" leftIcon="star" label="Pro" />
          </Box>
        </Box>
      </Box>
      <VexIcon name="arrow-right" size="md" color={vexFire.textMuted} variant="solid" />
    </Card>
  );
}
