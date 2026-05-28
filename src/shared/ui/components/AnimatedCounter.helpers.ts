import type { TextStyle, ViewStyle } from "react-native";

export type CounterSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";
export type CounterVariant = "default" | "currency" | "percentage" | "compact";

export interface AnimatedCounterProps {
  value: number;
  previousValue?: number;
  variant?: CounterVariant;
  currency?: "coins" | "gems" | "xp" | string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  size?: CounterSize;
  color?: string;
  increaseColor?: string;
  decreaseColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  duration?: number;
  useSpring?: boolean;
  springConfig?: { damping?: number; stiffness?: number };
  animateOnMount?: boolean;
  showTrendIndicator?: boolean;
  compactThreshold?: number;
  locale?: string;
}

export function formatNumber(
  value: number,
  variant: CounterVariant,
  decimals: number,
  compactThreshold: number,
  locale: string,
): string {
  "worklet";
  if (
    variant === "compact" ||
    (variant === "currency" && Math.abs(value) >= compactThreshold)
  ) {
    return Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  if (variant === "percentage") {
    return `${value.toFixed(decimals)}%`;
  }
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    coins: "🪙",
    gems: "💎",
    xp: "⭐",
    usd: "$",
    eur: "€",
    gbp: "£",
  };
  return symbols[currency] || currency;
}

export function getSizeConfig(size: CounterSize): {
  fontSize: number;
  fontWeight: TextStyle["fontWeight"];
  trendSize: number;
} {
  const configs: Record<
    CounterSize,
    { fontSize: number; fontWeight: TextStyle["fontWeight"]; trendSize: number }
  > = {
    xs: { fontSize: 12, fontWeight: "500", trendSize: 8 },
    sm: { fontSize: 14, fontWeight: "600", trendSize: 10 },
    md: { fontSize: 18, fontWeight: "700", trendSize: 12 },
    lg: { fontSize: 24, fontWeight: "700", trendSize: 14 },
    xl: { fontSize: 32, fontWeight: "800", trendSize: 16 },
    hero: { fontSize: 48, fontWeight: "900", trendSize: 20 },
  };
  return configs[size];
}
