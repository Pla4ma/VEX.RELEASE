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
import { lightColors } from '@/theme/tokens/colors';


export type CosmeticType = 'avatar-frame' | 'badge' | 'background' | 'title';

export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  type: CosmeticType;
  icon: string;
  emoji: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isEquipped: boolean;
  isOwned: boolean;
  previewColor?: string;
}

export const RARITY_COLORS: Record<string, string> = {
  common: lightColors.text.disabled,
  uncommon: lightColors.semantic.success,
  rare: lightColors.accent.blue,
  epic: lightColors.accent.purple,
  legendary: lightColors.semantic.warning,
};

export const RARITY_ORDER = ['legendary', 'epic', 'rare', 'uncommon', 'common'];

export const CosmeticPreviewCard: React.ComponentType<{
  item: CosmeticItem;
  isSelected: boolean;
  isEquipped: boolean;
  onPress: () => void;
}> = ({ item, isSelected, isEquipped, onPress }) => {
  const { theme } = useTheme();
  const rarityColor = RARITY_COLORS[item.rarity];
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 100 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };
  return (
    <Animated.View
      style={[{ flex: 1, minWidth: '30%', maxWidth: '31%' }, animatedStyle]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel="Cosmetic preview"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Card
          size="sm"
          style={{
            aspectRatio: 0.85,
            padding: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: isSelected ? 3 : isEquipped ? 2 : 1,
            borderColor: isSelected
              ? theme.colors.primary[500]
              : isEquipped
                ? rarityColor
                : theme.colors.border.light,
            backgroundColor: isSelected
              ? theme.colors.primary[50]
              : isEquipped
                ? rarityColor + '08'
                : theme.colors.background.secondary,
          }}
        >
          {}
          {isEquipped && (
            <Box
              position="absolute"
              top={-8}
              right={-8}
              width={24}
              height={24}
              borderRadius={12}
              justifyContent="center"
              alignItems="center"
              style={{ backgroundColor: rarityColor, zIndex: 10 }}
            >
              <Icon name="check" size={14} color={lightColors.text.inverse} />
            </Box>
          )}

          {}
          <Box
            position="absolute"
            top={8}
            left={8}
            width={8}
            height={8}
            borderRadius={4}
            style={{ backgroundColor: rarityColor }}
          />

          {}
          <Box
            width={56}
            height={56}
            borderRadius={28}
            justifyContent="center"
            alignItems="center"
            mb={8}
            style={{
              backgroundColor: item.previewColor || rarityColor + '15',
              borderWidth: 2,
              borderColor: rarityColor + '30',
            }}
          >
            <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
          </Box>

          {}
          <Text
            variant="caption"
            style={{
              fontWeight: isEquipped ? '700' : '600',
              textAlign: 'center',
              color: isEquipped ? rarityColor : theme.colors.text.primary,
              fontSize: 12,
            }}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          {}
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: rarityColor,
              marginTop: 4,
            }}
          >
            {item.rarity}
          </Text>
        </Card>
      </Pressable>
    </Animated.View>
  );
};
