import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';

interface FocusScreenHeaderProps {
  onSettingsPress?: () => void;
  body?: string;
}

export function FocusScreenHeader({ onSettingsPress, body }: FocusScreenHeaderProps): JSX.Element {
  return (
    <View style={{ marginBottom: 6, width: '100%' }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <View />
        {onSettingsPress ? (
          <Pressable
            accessibilityHint="Open VEX settings"
            accessibilityLabel="Settings"
            accessibilityRole="button"
            onPress={onSettingsPress}
            style={{
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.42)',
              borderColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 19,
              borderWidth: 1,
              height: 38,
              justifyContent: 'center',
              overflow: 'hidden',
              shadowColor: 'rgba(13, 76, 65, 0.16)',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              width: 38,
            }}
          >
            <Icon
              color="#0A1F1A"
              name="gear"
              size="sm"
              variant="outline"
            />
          </Pressable>
        ) : null}
      </View>

      <View style={{ gap: 4, marginBottom: 6 }}>
        <Text
          style={{
            color: '#0A1F1A',
            fontSize: 22,
            fontWeight: '800',
            letterSpacing: -0.6,
            lineHeight: 28,
          }}
        >
          Focus modes
        </Text>
        <Text
          style={{
            color: '#3D5A52',
            fontSize: 14,
            fontWeight: '500',
            letterSpacing: -0.2,
            lineHeight: 20,
          }}
        >
          Choose the shape of this block
        </Text>
        {body ? (
          <Text
            style={{
              color: '#6B8F85',
              fontSize: 13,
              lineHeight: 18,
              fontWeight: '400',
              marginTop: 4,
            }}
          >
            {body}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default FocusScreenHeader;
