import type { ViewStyle, TextStyle, ImageStyle } from "react-native";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function createSheet<T extends NamedStyles<T>>(styles: T): T {
  return styles;
}
