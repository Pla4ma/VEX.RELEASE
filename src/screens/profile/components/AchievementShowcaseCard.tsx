import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeContext';
import { Box } from '../../../components/primitives/Box'
import { Card } from '../../../components/primitives'
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';



export interface FeaturedAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  emoji: string;
  unlockedAt: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const RARITY_COLORS = {
  common: vexFire.textMuted,
  rare: vexFire.amber,
  epic: vexFire.copper,
  legendary: vexFire.amber,
};

export const LockedSlot: React.ComponentType<{
  slotIndex: number;
  onPress?: () => void;
  isEditable?: boolean;
}> = ({ slotIndex, onPress, isEditable }) => {
  const { theme: _theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!isEditable}
      accessibilityLabel={`Choose achievement showcase slot ${slotIndex + 1}`}
      accessibilityRole="button"
      accessibilityHint="Opens the achievement picker for this profile slot"
    >
      <Box
        flex={1}
        borderRadius={16}
        justifyContent="center"
        alignItems="center"
        style={{
          aspectRatio: 1,
          backgroundColor: vexFire.panel,
          borderWidth: 2,
          borderStyle: 'dashed',
          borderColor: vexFire.border,
          opacity: isEditable ? 0.7 : 0.5,
        }}
      >
        <Text style={{ fontSize: 32, opacity: 0.3 }}>?</Text>
        {isEditable && (
          <Text
            variant="caption"
            color={vexFire.textMuted}
            style={{ marginTop: 8, fontSize: 12 }}
          >
            Tap to add
          </Text>
        )}
      </Box>
    </Pressable>
  );
};

export const AchievementSlot: React.ComponentType<{
  achievement: FeaturedAchievement;
  slotIndex: number;
  isDragging?: boolean;
  onPress?: () => void;
  isEditable?: boolean;
}> = ({ achievement, isDragging, onPress, isEditable }) => {
  const { theme: _theme } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    zIndex: isDragging ? 100 : 1,
  }));
  const handlePressIn = () => {
    if (!isEditable) {
      return;
    }
    scale.value = withTiming(0.95, { duration: 100 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };
  const rarityColor = RARITY_COLORS[achievement.rarity];
  return (
    <Animated.View style={[{ flex: 1, aspectRatio: 1 }, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!isEditable}
        accessibilityLabel={`Open featured achievement ${achievement.name}`}
        accessibilityRole="button"
        accessibilityHint="Selects this featured profile achievement"
      >
        <Card
          size="md"
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: rarityColor + '50',
            backgroundColor: rarityColor + '08',
          }}
        >
          {}
          <Box
            position="absolute"
            width={60}
            height={60}
            borderRadius={30}
            style={{ backgroundColor: rarityColor + '15' }}
          />

          {}
          <Text style={{ fontSize: 40, marginBottom: 8 }}>
            {achievement.emoji}
          </Text>

          {}
          <Text
            variant="caption"
            style={{
              fontWeight: '700',
              textAlign: 'center',
              color: rarityColor,
              fontSize: 12,
            }}
            numberOfLines={1}
          >
            {achievement.name}
          </Text>

          {isEditable && (
            <Box
              position="absolute"
              top={4}
              right={4}
              width={20}
              height={20}
              borderRadius={10}
              justifyContent="center"
              alignItems="center"
              style={{ backgroundColor: vexFire.backgroundSoft }}
            >
              <Icon name="move" size={10} color={vexFire.textMuted} />
            </Box>
          )}
        </Card>
      </Pressable>
    </Animated.View>
  );
};
