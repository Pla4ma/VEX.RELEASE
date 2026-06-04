import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../../theme';
import { Box, Text } from '../../../components/primitives';
import { Icon } from '../../../icons';
import { lightColors } from '@/theme/tokens/colors';

import type { CosmeticType } from './CosmeticPreviewCard';

export const TYPE_CONFIG: Record<CosmeticType, { label: string; icon: string }> = {
  'avatar-frame': { label: 'Avatar Frames', icon: 'circle' },
  badge: { label: 'Badges', icon: 'award' },
  background: { label: 'Backgrounds', icon: 'image' },
  title: { label: 'Titles', icon: 'type' },
};

export const CosmeticCategoryHeader: React.FC<{
  type: CosmeticType;
  ownedCount: number;
  onClose: () => void;
}> = ({ type, ownedCount, onClose }) => {
  const { theme } = useTheme();
  const config = TYPE_CONFIG[type];
  return (
    <Box flexDirection="row" alignItems="center" mb={16}>
      <Box
        width={44}
        height={44}
        borderRadius={12}
        justifyContent="center"
        alignItems="center"
        style={{ backgroundColor: theme.colors.primary[50] }}
      >
        <Icon
          name={config.icon}
          size={22}
          color={theme.colors.primary[500]}
        />
      </Box>
      <Box ml={12} flex={1}>
        <Text variant="h3">{config.label}</Text>
        <Text variant="caption" color="text.secondary">
          {ownedCount} owned
        </Text>
      </Box>
      <Pressable
        onPress={onClose}
        accessibilityLabel="Cosmetic category"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Box
          width={36}
          height={36}
          borderRadius={18}
          justifyContent="center"
          alignItems="center"
          style={{ backgroundColor: theme.colors.background.secondary }}
        >
          <Icon name="x" size={20} color={theme.colors.text.tertiary} />
        </Box>
      </Pressable>
    </Box>
  );
};

export const CosmeticEquipBar: React.FC<{
  selectedId: string | null;
  currentEquippedId?: string | null;
  isEquipping: boolean;
  onEquip: () => void;
}> = ({ selectedId, currentEquippedId, isEquipping, onEquip }) => {
  const { theme } = useTheme();
  return (
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      p={16}
      style={{
        backgroundColor: theme.colors.background.primary,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.light,
      }}
    >
      <Pressable
        onPress={onEquip}
        disabled={
          !selectedId || selectedId === currentEquippedId || isEquipping
        }
        style={{
          backgroundColor:
            selectedId && selectedId !== currentEquippedId
              ? theme.colors.primary[500]
              : theme.colors.background.tertiary,
          paddingVertical: 16,
          borderRadius: 12,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          opacity:
            !selectedId ||
            selectedId === currentEquippedId ||
            isEquipping
              ? 0.5
              : 1,
        }}
        accessibilityLabel="Cosmetic category"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        {isEquipping ? (
          <Animated.View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: lightColors.text.inverse,
              borderTopColor: 'transparent',
            }}
          />
        ) : (
          <Icon name="check" size={20} color={lightColors.text.inverse} />
        )}
        <Text
          style={{
            color: lightColors.text.inverse,
            fontWeight: '700',
            fontSize: 16,
            marginLeft: 8,
          }}
        >
          {isEquipping
            ? 'Equipping...'
            : selectedId === currentEquippedId
              ? 'Already Equipped'
              : 'Equip Item'}
        </Text>
      </Pressable>
    </Box>
  );
};
