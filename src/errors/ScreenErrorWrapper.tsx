import React from "react";
import { ScreenErrorBoundary } from "../shared/ui/components/ScreenErrorBoundary";
import type {
  ScreenErrorConfig,
  ScreenType,
  ScreenErrorWrapperProps,
} from "./screen-error-types";
import { SCREEN_ERROR_CONFIGS } from "./screen-error-configs";

export type { ScreenErrorConfig, ScreenType, ScreenErrorWrapperProps };
export type { ScreenErrorRecoveryOptions } from "./screen-error-types";
export { SCREEN_ERROR_CONFIGS } from "./screen-error-configs";
export {
  ScreenErrorRecovery,
  screenErrorRecovery,
} from "./screen-error-recovery";

export function ScreenErrorWrapper({
  children,
  screenType,
  customConfig,
}: ScreenErrorWrapperProps): React.ReactElement {
  const baseConfig = SCREEN_ERROR_CONFIGS[screenType];
  const finalConfig = { ...baseConfig, ...customConfig };
  return (
    <ScreenErrorBoundary
      screenName={finalConfig.screenName}
      fallback={finalConfig.fallback}
      featureTag={`screen-${screenType}`}
    >
      {children}
    </ScreenErrorBoundary>
  );
}

export function useScreenError(screenType: ScreenType) {
  const config = SCREEN_ERROR_CONFIGS[screenType];
  return {
    screenConfig: config,
    isCritical: config.isCritical,
    recoveryTarget: config.recoveryTarget,
    screenName: config.screenName,
  };
}

export function withScreenErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  screenType: ScreenType,
  customConfig?: Partial<ScreenErrorConfig>,
) {
  const WithErrorBoundary = (props: P) => (
    <ScreenErrorWrapper screenType={screenType} customConfig={customConfig}>
      <WrappedComponent {...props} />
    </ScreenErrorWrapper>
  );
  WithErrorBoundary.displayName = `withScreenErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
  return WithErrorBoundary;
}
