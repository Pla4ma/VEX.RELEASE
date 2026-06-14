import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Icon } from '../../../icons';
import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { spacing } from '../../../theme/tokens/spacing';
import { springPresets } from '../../../theme/tokens/motion';
import type { CaptureType } from '../types';

const CAPTURE_TYPES: Array<{
  type: CaptureType;
  label: string;
  icon: string;
  color: string;
}> = [
  { type: 'voice', label: 'Voice', icon: 'mic', color: '#FF8A24' },
  { type: 'photo', label: 'Photo', icon: 'camera', color: '#54AEEA' },
  { type: 'link', label: 'Link', icon: 'link', color: '#18B894' },
  { type: 'braindump', label: 'Note', icon: 'file-text', color: '#8B5CF6' },
];

interface CaptureTypeSelectorProps {
  selectedType: CaptureType;
  onSelect: (type: CaptureType) => void;
}

export function CaptureTypeSelector({
  selectedType,
  onSelect,
}: CaptureTypeSelectorProps): JSX.Element {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: spacing[3],
        paddingHorizontal: spacing[4],
      }}
    >
      {CAPTURE_TYPES.map((item) => (
        <CaptureTypeButton
          key={item.type}
          item={item}
          isSelected={selectedType === item.type}
          onPress={() => onSelect(item.type)}
        />
      ))}
    </View>
  );
}

function CaptureTypeButton({
  item,
  isSelected,
  onPress,
}: {
  item: (typeof CAPTURE_TYPES)[0];
  isSelected: boolean;
  onPress: () => void;
}): JSX.Element {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: isSelected
      ? `${item.color}22`
      : vexLightGlass.glass.fillSubtle,
    borderColor: isSelected ? item.color : vexLightGlass.glass.borderSubtle,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, springPresets.tactile);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springPresets.tactile);
  };

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          borderRadius: 20,
          borderWidth: 2,
          padding: spacing[3],
          alignItems: 'center',
          gap: spacing[2],
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={item.label}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        style={{ alignItems: 'center', gap: spacing[2] }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            backgroundColor: `${item.color}18`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={item.icon} size={24} color={item.color} />
        </View>
        <Text
          variant="caption"
          color={isSelected ? 'text.primary' : 'text.tertiary'}
          style={{ fontWeight: isSelected ? '700' : '500' }}
        >
          {item.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
