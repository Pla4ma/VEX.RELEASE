# VEX UI State Requirements

Every data-driven component must include:
- Loading skeleton matching final layout, not spinner-only.
- Error state with VEX voice and retry, using src/components/states/ErrorState.tsx or src_impl equivalent where applicable.
- Empty state with illustration/icon and one CTA.
- Success state.
- Offline degraded banner via useNetInfo.
- Optimistic UI for important writes.

Every interactive element needs accessibilityLabel, accessibilityRole, accessibilityHint, and minimum 44x44 touch target via touchTarget utility.
Animations must use Reanimated 3 and respect reduced motion. Haptics must go through src/utils/haptics.ts or src_impl/utils/haptics.ts named functions only.
