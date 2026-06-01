import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '../../../icons';
import { Text } from '../../../components/primitives/Text';
import { launchColors } from '@theme/tokens/launch-colors';

export function HomeHeroSecondaryActions({
  onPress,
  rowStyle,
  buttonStyle,
  textStyle,
}: {
  onPress?: () => void;
  rowStyle: object;
  buttonStyle: object;
  textStyle: object;
}): JSX.Element {
  return (
    <View style={rowStyle}>
      <Pressable
        onPress={onPress}
        style={buttonStyle}
        android_ripple={{ color: launchColors.rgb_255_255_255_0_1 }}
      >
        <Icon
          name="settings"
          size={14}
          color={launchColors.rgb_255_255_255_0_8}
          style={{ marginRight: 6 }}
        />
        <Text
          variant="label"
          style={textStyle}
          color={launchColors.rgb_255_255_255_0_8}
        >
          Customize
        </Text>
      </Pressable>
      <Pressable
        onPress={onPress}
        style={buttonStyle}
        android_ripple={{ color: launchColors.rgb_255_255_255_0_1 }}
      >
        <Icon
          name="calendar"
          size={14}
          color={launchColors.rgb_255_255_255_0_8}
          style={{ marginRight: 6 }}
        />
        <Text
          variant="label"
          style={textStyle}
          color={launchColors.rgb_255_255_255_0_8}
        >
          Schedule
        </Text>
      </Pressable>
    </View>
  );
}
