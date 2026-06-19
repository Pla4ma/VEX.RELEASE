/**
 * Mobile Optimized Container
 * Ensures proper mobile UX: keyboard handling, safe areas, touch targets
 */

import React from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';
import { getIsSmallScreen, getIsTablet } from './MobileOptimizedContainer.helpers';

interface MobileOptimizedContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  avoidHeader?: boolean;
  avoidBottomNav?: boolean;
  padding?: number;
  backgroundColor?: string;
}

export const MobileOptimizedContainer: React.FC<
  MobileOptimizedContainerProps
> = ({
  children,
  scrollable = true,
  keyboardAvoiding = true,
  avoidHeader = true,
  avoidBottomNav = true,
  padding = 16,
  backgroundColor = lightColors.semantic.background,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isSmallScreen = getIsSmallScreen(height);
  const isTablet = getIsTablet(width);

  // Calculate safe padding for mobile
  const topPadding = avoidHeader ? Math.max(insets.top, 16) : padding;
  const bottomPadding = avoidBottomNav ? Math.max(insets.bottom, 16) : padding;

  // Adjust for small screens (iPhone SE, mini)
  const adjustedPadding = isSmallScreen ? Math.max(padding - 4, 12) : padding;

  const content = (
    <View
      style={[
        styles.container,
        {
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
          paddingHorizontal: isTablet ? 32 : adjustedPadding,
          backgroundColor,
        },
      ]}
    >
      {children}
    </View>
  );

  const scrollableContent = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {content}
    </ScrollView>
  ) : (
    content
  );

  if (keyboardAvoiding && Platform.OS === 'ios') {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.keyboardView}
          keyboardVerticalOffset={avoidHeader ? 0 : 0}
        >
          {scrollableContent}
        </KeyboardAvoidingView>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      {scrollableContent}
    </>
  );
};

const styles = createSheet({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  keyboardView: {
    flex: 1,
  },
});
