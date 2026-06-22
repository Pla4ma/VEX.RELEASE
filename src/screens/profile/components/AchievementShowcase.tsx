import { lightColors } from '@/theme/tokens/colors';
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

export const AchievementShowcase: React.FC<AchievementShowcaseProps> = ({
  achievements,
  onReorder,
  onSelectSlot,
  style,
  isEditable = false,
}) => {
  const { theme } = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedIndex, _setDraggedIndex] = useState<number | null>(null);
  const slots = useMemo(() => {
    const nextSlots: Array<FeaturedAchievement | null> = [...achievements];
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
          <Text variant="caption" color="text.secondary">
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
                  ? theme.colors.success[50] || lightColors.success[50]
                  : theme.colors.background.secondary,
                borderWidth: 1,
                borderColor: isEditMode
                  ? theme.colors.success.DEFAULT
                  : theme.colors.border.light,
              }}
            >
              <Box flexDirection="row" alignItems="center">
                <Icon
                  name={isEditMode ? 'check' : 'edit-2'}
                  size={14}
                  color={
                    isEditMode
                      ? theme.colors.success.DEFAULT
                      : theme.colors.text.tertiary
                  }
                />
                <Text
                  variant="caption"
                  style={{
                    marginLeft: 6,
                    fontWeight: '600',
                    color: isEditMode
                      ? theme.colors.success.DEFAULT
                      : theme.colors.text.secondary,
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
            backgroundColor: theme.colors.primary[50],
            borderWidth: 1,
            borderColor: theme.colors.primary[500] + '30',
          }}
        >
          <Box flexDirection="row" alignItems="center">
            <Icon name="info" size={16} color={theme.colors.primary[500]} />
            <Text
              variant="caption"
              style={{
                marginLeft: 8,
                color: theme.colors.primary[600],
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
export { AchievementShowcase }