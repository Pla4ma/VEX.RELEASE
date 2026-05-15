# Monetization Rules & Standards

Strict monetization guidelines for the VEX codebase.

---

## Monetization Philosophy

- **Monetization must not be bolted on** - Premium features are first-class citizens
- **Purchases must be tied to clear entitlements** - One entitlement = one feature unlock
- **UI must clearly reflect locked vs unlocked premium states** - No hidden paywalls
- **Respect user investment** - Purchases must restore properly across devices
- **Transparency first** - Clear pricing, billing terms, and feature descriptions

---

## RevenueCat Rules

### SDK Layer
```typescript
// ✅ All RevenueCat SDK calls go through service layer
const result = await revenueCatService.purchasePackage(pkg);

// ❌ NEVER call Purchases directly
await Purchases.purchasePackage(pkg);  // FORBIDDEN
```

### Hook Layer
```typescript
// ✅ Use hooks for UI state management
const { offerings, purchasePackage, isPremium } = useRevenueCat();

// ✅ Specialized hooks for common patterns
const { isPremium, entitlements } = usePremiumStatus();
const { packages, purchase, restore } = usePaywall();

// ❌ NEVER use SDK in components directly
```

### Offerings
```typescript
// ✅ Fetch offerings through hooks
const { offerings, isLoadingOfferings } = useRevenueCat();

// ✅ Handle empty offerings gracefully
if (!hasOfferings) {
  return <EmptyState message="Premium features coming soon" />;
}
```

### Entitlements
```typescript
// ✅ Check entitlements through hook state
const { isPremium, activeEntitlements } = useRevenueCat();

// ✅ Gate features with clear upgrade path
if (!isPremium) {
  return <PremiumGate feature="advanced_analytics" />;
}
```

### Restore Purchases
```typescript
// ✅ Always support restore flow
const { restorePurchases, isRestoring } = useRevenueCat();

// ✅ Call restore on demand
<Button onPress={restorePurchases} title="Restore Purchases" />
```

---

## What MUST Be Handled

### Loading States
```typescript
// ✅ Loading offerings
if (isLoadingOfferings) {
  return <SkeletonPackages />;
}

// ✅ Purchase in progress
if (isPurchasing) {
  return <PurchaseProgress />;
}
```

### Empty/No Offerings
```typescript
// ✅ Handle no offerings
if (!hasOfferings) {
  return (
    <EmptyState
      title="Premium Unavailable"
      message="Premium features will be available soon."
    />
  );
}
```

### Purchase Failure
```typescript
// ✅ Handle purchase errors with retry
if (purchaseError) {
  return (
    <ErrorState
      title="Purchase Failed"
      message={purchaseError.message}
      onRetry={retry}
    />
  );
}
```

### Restore Flow
```typescript
// ✅ Restore with proper states
const handleRestore = async () => {
  const result = await restorePurchases();
  
  if (result.success && activeEntitlements.length === 0) {
    showToast("No purchases found to restore");
  } else if (result.success) {
    showToast(`Restored ${activeEntitlements.length} purchases`);
  }
};
```

### Premium Entitlement State
```typescript
// ✅ Clear locked/unlocked states
function PremiumFeature({ children }) {
  const { isPremium, isLoadingCustomer } = usePremiumStatus();
  
  if (isLoadingCustomer) {
    return <FeatureSkeleton />;
  }
  
  if (!isPremium) {
    return <PremiumGate onUpgrade={() => navigation.navigate('Paywall')} />;
  }
  
  return children;
}
```

### Offline/Degraded Purchase Messaging
```typescript
// ✅ Network-aware messaging
const { isConnected } = useNetworkInfo();

if (!isConnected && !isPremium) {
  return (
    <OfflineMessage
      title="Premium Features Offline"
      message="Connect to the internet to upgrade."
    />
  );
}
```

### Analytics Events
```typescript
// ✅ Track monetization flow automatically
// Hook already fires:
// - offering_loaded / offering_load_failed
// - purchase_started / purchase_completed / purchase_failed
// - restore_started / restore_completed / restore_failed
// - entitlement_activated
```

### Sentry Reporting
```typescript
// ✅ Unexpected purchase errors go to Sentry
// Service layer automatically reports:
// - SDK initialization failures
// - Unexpected purchase errors
// - Restore failures
// - Offering fetch failures
```

---

## What Must NOT Happen

### Forbidden: Hardcoded Premium Booleans
```typescript
// ❌ FORBIDDEN
const isPremium = false;  // Never hardcode
const isPremium = true;   // Never hardcode

// ✅ DO check from RevenueCat
const { isPremium } = usePremiumStatus();
```

### Forbidden: Direct SDK Calls in UI
```typescript
// ❌ FORBIDDEN in any component
await Purchases.purchasePackage(pkg);
await Purchases.getOfferings();
await Purchases.restorePurchases();

// ✅ DO use hooks
const { purchasePackage } = useRevenueCat();
```

### Forbidden: Missing Restore Flow
```typescript
// ❌ FORBIDDEN - no restore button
<PaywallScreen packages={packages} onPurchase={purchase} />

// ✅ DO include restore
<PaywallScreen
  packages={packages}
  onPurchase={purchase}
  onRestore={restorePurchases}
  isRestoring={isRestoring}
/>
```

### Forbidden: Missing Locked/Unlocked States
```typescript
// ❌ FORBIDDEN - unclear state
<Button title="AI Coach" onPress={openCoach} />

// ✅ DO show locked state clearly
<FeatureButton
  title="AI Coach"
  isPremium={true}
  isUnlocked={isPremium}
  onLockedPress={() => navigateToPaywall()}
  onUnlockedPress={openCoach}
/>
```

### Forbidden: Silent Purchase Failures
```typescript
// ❌ FORBIDDEN - silent failure
const handlePurchase = async () => {
  await purchasePackage(pkg);  // No error handling
};

// ✅ DO handle all outcomes
const handlePurchase = async () => {
  const result = await purchasePackage(pkg);
  
  if (!result.success) {
    if (result.errorCode === 'PURCHASE_CANCELLED') {
      // User cancelled - no action needed
      return;
    }
    
    showError(result.error?.message || "Purchase failed");
  }
};
```

---

## Testing Rules

### Entitlement Mapping Logic
```typescript
// ✅ Test entitlement to feature mapping
it('should grant advanced_analytics with premium_entitlement', () => {
  const entitlements = [{ identifier: 'premium', isActive: true }];
  expect(canAccessAdvancedAnalytics(entitlements)).toBe(true);
});

it('should block advanced_analytics without premium_entitlement', () => {
  const entitlements = [];
  expect(canAccessAdvancedAnalytics(entitlements)).toBe(false);
});
```

### Purchase State Transitions
```typescript
// ✅ Test state machine
it('should transition from idle → purchasing → success', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useRevenueCat());
  
  expect(result.current.isPurchasing).toBe(false);
  
  act(() => {
    result.current.purchasePackage(pkg);
  });
  
  expect(result.current.isPurchasing).toBe(true);
  
  await waitForNextUpdate();
  
  expect(result.current.isPurchasing).toBe(false);
  expect(result.current.isPremium).toBe(true);
});
```

### Restore State Handling
```typescript
// ✅ Test restore flows
it('should handle restore with no purchases', async () => {
  const { result } = renderHook(() => useRevenueCat());
  
  const restoreResult = await result.current.restorePurchases();
  
  expect(restoreResult.success).toBe(true);
  expect(result.current.activeEntitlements).toHaveLength(0);
});

it('should restore active entitlements', async () => {
  // Mock restored entitlements
  mockRevenueCat.restore.mockResolvedValue({
    entitlements: { active: { premium: {} } }
  });
  
  const { result } = renderHook(() => useRevenueCat());
  
  await result.current.restorePurchases();
  
  expect(result.current.isPremium).toBe(true);
});
```

### No Offerings / Error Conditions
```typescript
// ✅ Test empty/error states
it('should handle no offerings', async () => {
  mockRevenueCat.getOfferings.mockResolvedValue({ current: null });
  
  const { result, waitForNextUpdate } = renderHook(() => useRevenueCat());
  
  await waitForNextUpdate();
  
  expect(result.current.hasOfferings).toBe(false);
  expect(result.current.offerings).toBeNull();
});

it('should handle offering fetch failure', async () => {
  mockRevenueCat.getOfferings.mockRejectedValue(new Error('Network error'));
  
  const { result, waitForNextUpdate } = renderHook(() => useRevenueCat());
  
  await waitForNextUpdate();
  
  expect(result.current.offeringsError).toBeTruthy();
  expect(result.current.retry).toBeDefined();
});
```

---

## File Organization

```
src/shared/monetization/
├── index.ts                    # Public exports
├── revenuecat-types.ts         # Type definitions
├── revenuecat-service.ts       # SDK wrapper
├── use-revenuecat.ts          # React hooks
└── purchase-events.ts         # Analytics event helpers
```

---

## Environment Variables

```bash
# Required for RevenueCat SDK
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_your_ios_key_here
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_your_android_key_here
```

**Note:** Use platform-specific keys from RevenueCat dashboard.

---

## Expo Build Requirements

### Development Builds Required
```bash
# ✅ REQUIRED - RevenueCat requires native modules
npx expo prebuild
npx expo run:ios
npx expo run:android

# ❌ Expo Go will NOT work for real purchases
```

### iOS Setup
- Configure in-app purchases in App Store Connect
- Add products/subscriptions to RevenueCat dashboard
- Link RevenueCat to App Store Connect API

### Android Setup
- Configure in-app products in Google Play Console
- Add products/subscriptions to RevenueCat dashboard
- Upload signed release build for testing

---

## Sample Usage

### Basic Paywall Screen
```typescript
import { usePaywall } from '@/shared/monetization';

function PaywallScreen() {
  const { packages, isLoading, error, purchase, restore } = usePaywall();
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState onRetry={retry} />;
  
  return (
    <View>
      {packages.map(pkg => (
        <PackageCard
          key={pkg.identifier}
          package={pkg}
          onPress={() => purchase(pkg)}
        />
      ))}
      <Button title="Restore Purchases" onPress={restore} />
    </View>
  );
}
```

### Premium Feature Gate
```typescript
import { usePremiumStatus } from '@/shared/monetization';

function AICoachScreen() {
  const { isPremium, isLoading } = usePremiumStatus();
  
  if (isLoading) return <FeatureSkeleton />;
  
  if (!isPremium) {
    return (
      <PremiumGate
        title="AI Coach"
        description="Get personalized guidance with AI Coach"
        onUpgrade={() => navigation.navigate('Paywall')}
      />
    );
  }
  
  return <AICoachInterface />;
}
```

---

## Checklist

Before submitting monetization code:

- [ ] No direct Purchases SDK calls in components
- [ ] All purchases go through `revenueCatService`
- [ ] Hook properly manages loading/error states
- [ ] Restore flow implemented and tested
- [ ] Premium locked/unlocked states clear
- [ ] Empty offerings handled gracefully
- [ ] Purchase errors handled with user feedback
- [ ] Analytics events firing correctly
- [ ] Sentry reporting for unexpected errors
- [ ] Entitlement checks use `activeEntitlements`
- [ ] Platform keys configured in `.env.local`

---

**Last Updated:** 2024-01-18  
**Owner:** Monetization Team  
**Enforced:** CI/CD + Code Review
