import React from "react";
import {
  View,
  Pressable,
  StyleProp,
  ViewStyle,
  Image,
  ImageSourcePropType,
} from "react-native";
import { useTheme } from "../theme";
import { Text } from "./primitives";
import { Icon } from "../icons";
import { Button } from "./primitives";
import { buttonTap } from "../utils/haptics";
import {
  getVariantStyles,
  sizeStyles,
  styles,
  type BannerVariant,
} from "./Banner.config";

export interface BannerProps {
  title: string;
  description?: string;
  variant?: BannerVariant;
  size?: "sm" | "md" | "lg";
  icon?: string;
  backgroundImage?: ImageSourcePropType;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  onDismiss?: () => void;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Banner: React.FC<BannerProps> = ({
  title,
  description,
  variant = "default",
  size = "md",
  icon,
  backgroundImage,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  onDismiss,
  fullWidth = true,
  style,
}) => {
  const { theme } = useTheme();
  const variantStyles = getVariantStyles(variant, theme.colors);
  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          padding: currentSize.padding,
          borderRadius: size === "sm" ? 8 : size === "md" ? 12 : 16,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {backgroundImage && (
        <Image
          source={backgroundImage}
          resizeMode="cover"
          style={[
            styles.backgroundImage,
            { borderRadius: size === "sm" ? 8 : size === "md" ? 12 : 16 },
          ]}
        />
      )}

      <View style={styles.content}>
        {icon && (
          <View
            style={[styles.iconContainer, { marginRight: currentSize.padding }]}
          >
            <Icon
              name={icon}
              size={currentSize.iconSize as number}
              color={variantStyles.iconColor}
            />
          </View>
        )}

        <View style={styles.textContainer}>
          <Text
            variant={currentSize.titleSize}
            style={{ color: variantStyles.textColor, fontWeight: "600" }}
          >
            {title}
          </Text>
          {description && (
            <Text
              variant={currentSize.descSize}
              style={{
                color: variantStyles.textColor,
                opacity: 0.9,
                marginTop: 4,
              }}
            >
              {description}
            </Text>
          )}

          {(actionText || secondaryActionText) && (
            <View style={styles.actions}>
              {actionText && onAction && (
                <Button
                  variant={variantStyles.buttonVariant}
                  size="sm"
                  onPress={onAction}
                  style={{ marginRight: secondaryActionText ? 8 : 0 }}
                  accessibilityLabel={actionText ?? "Perform action"}
                  accessibilityRole="button"
                  accessibilityHint="Performs the primary banner action"
                >
                  {actionText}
                </Button>
              )}
              {secondaryActionText && onSecondaryAction && (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={onSecondaryAction}
                  accessibilityLabel={secondaryActionText ?? "Perform secondary action"}
                  accessibilityRole="button"
                  accessibilityHint="Performs the secondary banner action"
                >
                  {secondaryActionText}
                </Button>
              )}
            </View>
          )}
        </View>

        {onDismiss && (
          <Pressable
            onPress={() => { buttonTap(); onDismiss(); }}
            style={({ pressed }) => [
              styles.dismissButton,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityLabel={`Dismiss ${title}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to dismiss"
          >
            <Icon name="close" size={20} color={variantStyles.textColor} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default Banner;
