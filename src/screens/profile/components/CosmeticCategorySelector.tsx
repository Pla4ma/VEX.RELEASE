import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeContext';
import { Box } from '../../../components/primitives/Box'
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';


import type { CosmeticType } from './CosmeticPreviewCard';

export const TYPE_CONFIG: Record<CosmeticType, { label: string; icon: string }> = {
  'avatar-frame': { label: 'Avatar Frames', icon: 'circle' },
  badge: { label: 'Badges', icon: 'award' },
  background: { label: 'Backgrounds', icon: 'image' },
  title: { label: 'Titles', icon: 'type' },
};

export const CosmeticCategoryHeader: React.ComponentType<{
  type: CosmeticType;
  ownedCount: number;
  onClose: () => void;
}> = ({ type, ownedCount, onClose }) => {
  const { theme: _theme } = useTheme();
  const config = TYPE_CONFIG[type];
  return (
    <Box flexDirection="row" alignItems="center" mb={16}>
      <Box
        width={44}
        height={44}
        borderRadius={12}
        justifyContent="center"
        alignItems="center"
        style={{ backgroundColor: vexFire.ember }}
      >
        <Icon
          name={config.icon}
          size={22}
          color={vexFire.ember}
        />
      </Box>
      <Box ml={12} flex={1}>
        <Text variant="h3">{config.label}</Text>
        <Text variant="caption" color={vexFire.textSecondary}>
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
          style={{ backgroundColor: vexFire.panel }}
        >
          <Icon name="x" size={20} color={vexFire.textMuted} />
        </Box>
      </Pressable>
    </Box>
  );
};

export const CosmeticEquipBar: React.ComponentType<{
  selectedId: string | null;
  currentEquippedId?: string | null;
  isEquipping: boolean;
  onEquip: () => void;
}> = ({ selectedId, currentEquippedId, isEquipping, onEquip }) => {
  const { theme: _theme } = useTheme();
  return (
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      p={16}
      style={{
        backgroundColor: vexFire.background,
        borderTopWidth: 1,
        borderTopColor: vexFire.border,
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
              ? vexFire.ember
              : vexFire.backgroundSoft,
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
              borderColor: vexFire.cream,
              borderTopColor: 'transparent',
            }}
          />
        ) : (
          <Icon name="check" size={20} color={vexFire.cream} />
        )}
        <Text
          style={{
            color: vexFire.cream,
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
