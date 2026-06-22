import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { buttonTap } from '../utils/haptics';

import { SIZE_MAP, FONT_SIZE_MAP } from './Avatar.types';
import type { AvatarProps, AvatarShape } from './Avatar.types';
import { avatarStyles } from './Avatar.styles';

import { AvatarContentComponent } from './AvatarContent';
import { AvatarStatusComponent } from './AvatarStatus';
import { AvatarBadgeComponent } from './AvatarBadge';

export const Avatar = React.memo(({
  source,
  name = '?',
  size = 'md',
  status = 'none',
  badge,
  borderColor,
  borderWidth = 0,
  onPress,
  style,
  backgroundColor,
  shape = 'circle',
}: AvatarProps) => {
  const { theme } = useTheme();
  const sizeValue = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];

  const AvatarContent = (
    <View
      style={[avatarStyles.container, { width: sizeValue, height: sizeValue }, style]}
    >
      <AvatarContentComponent
        source={source}
        name={name}
        sizeValue={sizeValue}
        fontSize={fontSize}
        shape={shape}
        borderWidth={borderWidth}
        borderColor={borderColor}
        backgroundColor={backgroundColor}
        theme={theme}
      />
      <AvatarStatusComponent status={status} sizeValue={sizeValue} theme={theme} />
      <AvatarBadgeComponent badge={badge} sizeValue={sizeValue} theme={theme} />
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={() => { buttonTap(); onPress(); }}
        style={({ pressed }) => [
          avatarStyles.container,
          { width: sizeValue, height: sizeValue },
          style,
          pressed && { opacity: 0.8 },
        ]}
        accessibilityLabel={`Avatar for ${name}`}
        accessibilityRole="button"
        accessibilityHint="Double tap to view profile"
      >
        {AvatarContent}
      </Pressable>
    );
  }
  return AvatarContent;
});

Avatar.displayName = 'Avatar';

export { Avatar }