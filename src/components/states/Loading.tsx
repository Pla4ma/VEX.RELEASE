import React from "react";
import { View, type ViewStyle } from "react-native";
import { useTheme } from "../../theme";
import { Box, Text } from "../primitives";
import { Spinner, Dots, Pulse, styles } from "./loading-variants";

export type LoadingVariant = "spinner" | "dots" | "pulse" | "skeleton";
export type LoadingSize = "sm" | "md" | "lg" | "xl";

export interface LoadingProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  text?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
  visible?: boolean;
  accessibilityLabel?: string;
}

const sizeMap: Record<LoadingSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export const Loading: React.FC<LoadingProps> = ({
  variant = "spinner",
  size = "md",
  text,
  fullScreen = false,
  style,
  visible = true,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const sizeValue = sizeMap[size];
  const color = theme.colors.primary[500];
  if (!visible) {
    return null;
  }
  const renderVariant = () => {
    switch (variant) {
      case "dots":
        return <Dots size={sizeValue} color={color} />;
      case "pulse":
        return <Pulse size={sizeValue} color={color} />;
      case "spinner":
      default:
        return <Spinner size={sizeValue} color={color} />;
    }
  };
  const content = (
    <Box
      justifyContent="center"
      alignItems="center"
      style={Object.assign({ gap: theme.spacing[3] }, style || {})}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || text || "Loading"}
    >
      {renderVariant()}
      {text && (
        <Text variant="body" color="text.secondary">
          {text}
        </Text>
      )}
    </Box>
  );
  if (fullScreen) {
    return (
      <View
        style={[
          styles.fullScreen,
          { backgroundColor: theme.colors.background.primary },
        ]}
      >
        {content}
      </View>
    );
  }
  return content;
};

export default Loading;
