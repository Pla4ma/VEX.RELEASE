import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import type { BreadcrumbProps } from './TabBar.types';
import { styles } from './TabBar.styles';

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  style,
}) => {
  return (
    <View style={[styles.breadcrumb, style]}>
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          {index > 0 ? (
            <Text
              variant="caption"
              color="text.tertiary"
              style={styles.separator}
            >
              {separator}
            </Text>
          ) : null}

          <Pressable
            onPress={item.onPress}
            disabled={!item.onPress || index === items.length - 1}
            accessibilityLabel="Breadcrumb"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text
              variant="caption"
              color={
                index === items.length - 1 ? 'text.primary' : 'primary.500'
              }
              style={[
                styles.breadcrumbItem,
                index === items.length - 1
                  ? styles.breadcrumbItemActive
                  : undefined,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        </React.Fragment>
      ))}
    </View>
  );
};
