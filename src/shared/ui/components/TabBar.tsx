import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../../theme';
import type { TabBarProps } from './TabBar.types';
import { styles } from './TabBar.styles';
import TabItemComponent from './TabItemComponent';
import { Breadcrumb } from './Breadcrumb';

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onChange,
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  showLabels = true,
  scrollable = false,
  style,
}) => {
  const { theme } = useTheme();
  const [tabLayouts, setTabLayouts] = useState<
    Record<string, { x: number; width: number }>
  >({});
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  useEffect(() => {
    const layout = tabLayouts[activeTab];
    if (layout) {
      indicatorPosition.value = withSpring(layout.x, { damping: 20 });
      indicatorWidth.value = withSpring(layout.width, { damping: 20 });
    }
  }, [activeTab, indicatorPosition, indicatorWidth, tabLayouts]);

  const handleTabLayout = useCallback(
    (tabId: string) => (event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      setTabLayouts((previous) => ({ ...previous, [tabId]: { x, width } }));
    },
    [],
  );

  const handleTabPress = useCallback(
    (tabId: string) => {
      if (tabs.find((tab) => tab.id === tabId)?.disabled) {
        return;
      }
      onChange(tabId);
    },
    [onChange, tabs],
  );

  const isHorizontal = orientation === 'horizontal';
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
    width: indicatorWidth.value,
  }));

  const renderedTabs = (
    <>
      {tabs.map((tab) => (
        <TabItemComponent
          key={tab.id}
          item={tab}
          isActive={tab.id === activeTab}
          onPress={() => handleTabPress(tab.id)}
          onLayout={handleTabLayout(tab.id)}
          variant={variant}
          size={size}
          showLabels={showLabels}
        />
      ))}

      {variant === 'underline' && isHorizontal ? (
        <Animated.View
          style={[
            styles.underlineIndicator,
            { backgroundColor: theme.colors.primary[500] },
            indicatorStyle,
          ]}
        />
      ) : null}
    </>
  );

  return (
    <View style={[styles.container, style]}>
      {scrollable ? (
        <ScrollView
          horizontal={isHorizontal}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={[
            styles.tabsContainer,
            isHorizontal ? styles.horizontal : styles.vertical,
          ]}
          contentContainerStyle={[
            styles.scrollContent,
            !isHorizontal ? styles.scrollContentVertical : undefined,
          ]}
        >
          {renderedTabs}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.tabsContainer,
            isHorizontal ? styles.horizontal : styles.vertical,
          ]}
        >
          {renderedTabs}
        </View>
      )}
    </View>
  );
};

export { Breadcrumb };
export type { TabBarProps, TabItem, BreadcrumbProps } from './TabBar.types';
export default TabBar;
