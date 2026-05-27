/**
 * Mobile Optimized Container
 * Ensures proper mobile UX: keyboard handling, safe areas, touch targets
 */

import React from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createSheet } from "@/shared/ui/create-sheet";
import { launchColors } from "@theme/tokens/launch-colors";

interface MobileOptimizedContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  avoidHeader?: boolean;
  avoidBottomNav?: boolean;
  padding?: number;
  backgroundColor?: string;
}

const { height, width } = Dimensions.get("window");
const isSmallScreen = height < 700;
const isTablet = width > 768;

export const MobileOptimizedContainer: React.FC<
  MobileOptimizedContainerProps
> = ({
  children,
  scrollable = true,
  keyboardAvoiding = true,
  avoidHeader = true,
  avoidBottomNav = true,
  padding = 16,
  backgroundColor = launchColors.hex_1a1a2e,
}) => {
  const insets = useSafeAreaInsets();

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

  if (keyboardAvoiding && Platform.OS === "ios") {
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
    minHeight: isSmallScreen ? "auto" : "100%",
  },
  scrollContent: {
    flexGrow: 1,
  },
  keyboardView: {
    flex: 1,
  },
});

/**
 * Mobile Touch Target Wrapper
 * Ensures minimum 44x44 touch targets for accessibility
 */
interface TouchTargetProps {
  children: React.ReactNode;
  minSize?: number;
  onPress?: () => void;
}

export const TouchTarget: React.FC<TouchTargetProps> = ({
  children,
  minSize = 44,
  onPress: _onPress,
}) => {
  return (
    <View
      style={{
        minWidth: minSize,
        minHeight: minSize,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {children}
    </View>
  );
};

/**
 * Responsive Text Sizing
 * Adjusts font sizes for small screens
 */
export const getResponsiveFontSize = (baseSize: number): number => {
  if (isSmallScreen) {
    // Reduce font sizes by ~10% on small screens
    return Math.round(baseSize * 0.9);
  }
  if (isTablet) {
    // Increase slightly on tablets
    return Math.round(baseSize * 1.1);
  }
  return baseSize;
};

/**
 * Mobile Grid - Responsive grid for mobile layouts
 */
interface MobileGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
}

export const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  columns = 2,
  gap = 12,
}) => {
  // Adjust columns based on screen width
  const actualColumns = isTablet ? Math.min(columns + 1, 4) : columns;

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap,
        marginHorizontal: -gap / 2,
      }}
    >
      {React.Children.map(children, (child) => (
        <View
          style={{
            width: `${100 / actualColumns}%`,
            paddingHorizontal: gap / 2,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
};
