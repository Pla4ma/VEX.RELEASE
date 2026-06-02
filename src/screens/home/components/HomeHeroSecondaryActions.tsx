import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '../../../icons';
import { Text } from '../../../components/primitives/Text';


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
        android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
      >
        <Icon
          name="settings"
          size={14}
          color={'rgba(255,255,255,0.8)'}
          style={{ marginRight: 6 }}
        />
        <Text
          variant="label"
          style={textStyle}
          color={'rgba(255,255,255,0.8)'}
        >
          Customize
        </Text>
      </Pressable>
      <Pressable
        onPress={onPress}
        style={buttonStyle}
        android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
      >
        <Icon
          name="calendar"
          size={14}
          color={'rgba(255,255,255,0.8)'}
          style={{ marginRight: 6 }}
        />
        <Text
          variant="label"
          style={textStyle}
          color={'rgba(255,255,255,0.8)'}
        >
          Schedule
        </Text>
      </Pressable>
    </View>
  );
}
