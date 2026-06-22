import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StaggeredEnter } from '../../shared/ui/components/EnterAnimation';
import { useTheme } from '../../theme/ThemeContext';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { usePaywallScreen } from './use-paywall-screen';
import { PaywallHero } from './PaywallHero';
import { PaywallFooterActions, PaywallPlanList } from './PaywallPlans';
import {
  PaywallErrorState,
  PaywallLoadingState,
  PaywallStatusMessageBanner,
  PaywallUnavailableState,
} from './PaywallStates';
import { paywallStyles as styles } from './paywall-styles';
import { LiquidGlassScreen } from '../../shared/ui/liquid-glass/LiquidGlassScreen';

export const PaywallScreen = withScreenErrorBoundary(
  function PaywallScreen(): React.ReactNode {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const {
      isPremium,
      isLoading,
      error,
      hasLivePackages,
      statusMessage,
      contextBody,
      contextHeadline,
      lane,
      featureHighlight,
      packageSelection,
      setStatusMessage,
      handleClose,
      handlePurchase,
      handleRestore,
      retry,
    } = usePaywallScreen();

    return (
      <LiquidGlassScreen style={styles.screen}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          <StaggeredEnter
            direction="up"
            speed="normal"
            staggerDelay={80}
            containerStyle={styles.content}
          >
            <PaywallHero
              contextBody={contextBody}
              contextHeadline={contextHeadline}
              featureHighlight={featureHighlight}
              isPremium={isPremium}
              lane={lane}
              showBoundary={!isLoading && !error}
              theme={theme}
              onClose={handleClose}
            />

            {statusMessage ? (
              <PaywallStatusMessageBanner
                statusMessage={statusMessage}
                onDismiss={() => setStatusMessage(null)}
              />
            ) : null}

            {isLoading ? (
              <PaywallLoadingState />
            ) : error ? (
              <PaywallErrorState
                theme={theme}
                onRestore={handleRestore}
                onRetry={retry}
              />
            ) : !hasLivePackages ? (
              <PaywallUnavailableState
                onRestore={handleRestore}
                onRetry={retry}
              />
            ) : (
              <PaywallPlanList
                plans={packageSelection}
                theme={theme}
                onPurchase={handlePurchase}
              />
            )}

            <PaywallFooterActions
              hasLivePackages={hasLivePackages}
              isLoading={isLoading}
              isPremium={isPremium}
              plans={packageSelection}
              onPurchase={handlePurchase}
              onRestore={handleRestore}
            />
          </StaggeredEnter>
        </ScrollView>
      </LiquidGlassScreen>
    );
  },
  'Paywall',
);

export { PaywallScreen }