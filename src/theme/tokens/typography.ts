import type { TextStyle } from "react-native";
import type { FontFamilies, FontWeights, TypographyScale } from "../types";

export const fontFamilies: FontFamilies = {
  primary: "Inter",
  secondary: "Inter",
  mono: "JetBrains Mono",
};

export const fontWeights: FontWeights = {
  light: "300",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  heavy: "800",
};

const baseTextStyle: TextStyle = {
  color: "#F8FAFC",
  fontFamily: fontFamilies.primary,
  fontWeight: fontWeights.regular,
};

export const displayTypography: TypographyScale["display"] = {
  large: {
    ...baseTextStyle,
    fontSize: 48,
    fontWeight: fontWeights.heavy,
    letterSpacing: 0,
    lineHeight: 56,
  },
  medium: {
    ...baseTextStyle,
    fontSize: 36,
    fontWeight: fontWeights.heavy,
    letterSpacing: 0,
    lineHeight: 44,
  },
  small: {
    ...baseTextStyle,
    fontSize: 28,
    fontWeight: fontWeights.heavy,
    letterSpacing: 0,
    lineHeight: 36,
  },
};

export const headingTypography: TypographyScale["heading"] = {
  h1: {
    ...baseTextStyle,
    fontSize: 32,
    fontWeight: fontWeights.heavy,
    letterSpacing: 0,
    lineHeight: 40,
  },
  h2: {
    ...baseTextStyle,
    fontSize: 28,
    fontWeight: fontWeights.heavy,
    letterSpacing: 0,
    lineHeight: 36,
  },
  h3: {
    ...baseTextStyle,
    fontSize: 24,
    fontWeight: fontWeights.heavy,
    letterSpacing: 0,
    lineHeight: 30,
  },
  h4: {
    ...baseTextStyle,
    fontSize: 20,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0,
    lineHeight: 28,
  },
  h5: {
    ...baseTextStyle,
    fontSize: 18,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0,
    lineHeight: 26,
  },
  h6: {
    ...baseTextStyle,
    fontSize: 16,
    fontWeight: fontWeights.semibold,
    lineHeight: 24,
  },
};

export const bodyTypography: TypographyScale["body"] = {
  large: {
    ...baseTextStyle,
    fontSize: 18,
    fontWeight: fontWeights.regular,
    lineHeight: 27,
  },
  medium: {
    ...baseTextStyle,
    fontSize: 16,
    fontWeight: fontWeights.regular,
    lineHeight: 24,
  },
  small: {
    ...baseTextStyle,
    fontSize: 14,
    fontWeight: fontWeights.regular,
    lineHeight: 21,
  },
};

export const uiTypography: TypographyScale["ui"] = {
  button: {
    ...baseTextStyle,
    fontSize: 16,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  label: {
    ...baseTextStyle,
    fontSize: 12,
    fontWeight: fontWeights.semibold,
    letterSpacing: 1.2,
    lineHeight: 16,
    textTransform: "uppercase",
  },
  caption: {
    ...baseTextStyle,
    fontSize: 12,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0.4,
    lineHeight: 18,
  },
  overline: {
    ...baseTextStyle,
    fontSize: 11,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.5,
    lineHeight: 16,
    textTransform: "uppercase",
  },
};

export const typography: TypographyScale = {
  body: bodyTypography,
  display: displayTypography,
  heading: headingTypography,
  ui: uiTypography,
};

export function getFontSize(
  category: keyof TypographyScale,
  size: string,
): number {
  const categoryStyles = typography[category];
  const style = categoryStyles[size as keyof typeof categoryStyles] as
    | { fontSize?: number }
    | undefined;
  return style?.fontSize ?? 16;
}

export function getLineHeight(
  category: keyof TypographyScale,
  size: string,
): number {
  const categoryStyles = typography[category];
  const style = categoryStyles[size as keyof typeof categoryStyles] as
    | { lineHeight?: number }
    | undefined;
  return style?.lineHeight ?? 24;
}
