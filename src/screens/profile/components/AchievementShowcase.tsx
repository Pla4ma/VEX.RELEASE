import { vexFire } from "@/theme/tokens/vex-fire";

import React, { useState, useCallback, useMemo } from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Box } from '../../../components/primitives/Box'
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';

import {
  type FeaturedAchievement,
  AchievementSlot,
  LockedSlot,
} from './AchievementShowcaseCard';

export type { FeaturedAchievement } from './AchievementShowcaseCard';

interface AchievementShowcaseProps {
  achievements: FeaturedAchievement[];
  onReorder?: (newOrder: FeaturedAchievement[]) => void;
  onSelectSlot?: (slotIndex: number) => void;
  style?: ViewStyle;
  isEditable?: boolean;
}

export const AchievementShowcase: React.ComponentType<AchievementShowcaseProps> = ({
  achievements,
  onReorder,
  onSelectSlot,
  style,
  isEditable = false,
}) => {
  const { theme: _theme } = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedIndex, _setDraggedIndex] = useState<number | null>(null);
  const slots = useMemo(() => {
    const nextSlots: (FeaturedAchievement | null)[] = [...achievements];
    while (nextSlots.length < 3) {
      nextSlots.push(null);
    }
    return nextSlots;
  }, [achievements]);
  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      onReorder?.(slots.filter((s): s is FeaturedAchievement => s !== null));
    }
  };
  const handleSlotPress = (index: number) => {
    if (!slots[index]) {
      onSelectSlot?.(index);
    }
  };
  const _handleSwap = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) {
        return;
      }
      const newSlots = [...slots];
      const temp = newSlots[fromIndex];
      newSlots[fromIndex] = newSlots[toIndex]!;
      newSlots[toIndex] = temp!;
      onReorder?.(newSlots.filter((s): s is FeaturedAchievement => s !== null));
    },
    [slots, onReorder],
  );
  const unlockedCount = achievements.length;
  const totalSlots = 3;
  return (
    <Box style={style}>
      {}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb={16}
      >
        <Box>
          <Text variant="h4" style={{ marginBottom: 4 }}>
            Featured Achievements
          </Text>
          <Text variant="caption" color={vexFire.textSecondary}>
            {unlockedCount} of {totalSlots} unlocked
          </Text>
        </Box>

        {unlockedCount >= 2 && (
          <Pressable
            onPress={handleEditToggle}
            accessibilityLabel={
              isEditMode
                ? 'Finish editing featured achievements'
                : 'Edit featured achievements'
            }
            accessibilityRole="button"
            accessibilityHint="Changes the order of the achievements shown on this profile"
          >
            <Box
              px={12}
              py={8}
              borderRadius={8}
              style={{
                backgroundColor: isEditMode
                  ? vexFire.panelSoft || vexFire.panelSoft
                  : vexFire.panel,
                borderWidth: 1,
                borderColor: isEditMode
                  ? vexFire.success
                  : vexFire.border,
              }}
            >
              <Box flexDirection="row" alignItems="center">
                <Icon
                  name={isEditMode ? 'check' : 'edit-2'}
                  size={14}
                  color={
                    isEditMode
                      ? vexFire.success
                      : vexFire.textMuted
                  }
                />
                <Text
                  variant="caption"
                  style={{
                    marginLeft: 6,
                    fontWeight: '600',
                    color: isEditMode
                      ? vexFire.success
                      : vexFire.textSecondary,
                  }}
                >
                  {isEditMode ? 'Done' : 'Edit'}
                </Text>
              </Box>
            </Box>
          </Pressable>
        )}
      </Box>

      {}
      <Box flexDirection="row" style={{ gap: 12 }}>
        {slots
          .slice(0, 3)
          .map((slot, index) =>
            slot ? (
              <AchievementSlot
                key={slot.id}
                achievement={slot}
                slotIndex={index}
                isDragging={draggedIndex === index}
                onPress={() => handleSlotPress(index)}
                isEditable={isEditMode}
              />
            ) : (
              <LockedSlot
                key={`locked-slot-${String(index)}`}
                slotIndex={index}
                onPress={() => handleSlotPress(index)}
                isEditable={isEditable || isEditMode}
              />
            ),
          )}
      </Box>

      {}
      {isEditMode && (
        <Box
          mt={16}
          p={12}
          borderRadius={10}
          style={{
            backgroundColor: vexFire.ember,
            borderWidth: 1,
            borderColor: vexFire.ember + '30',
          }}
        >
          <Box flexDirection="row" alignItems="center">
            <Icon name="info" size={16} color={vexFire.ember} />
            <Text
              variant="caption"
              style={{
                marginLeft: 8,
                color: vexFire.ember,
                fontWeight: '500',
              }}
            >
              Tap and drag to rearrange featured achievements
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};