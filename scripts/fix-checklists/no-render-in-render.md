# no-render-in-render — manual fix checklist

Diagnostics found: **7**.

Estimated human time: 2-4 minutes.

## Per-file fixes

### src/navigation/root-stack-authenticated-routes.tsx

- L144: Your users lose state because "renderRootStackFeatureRoutes()" builds UI from an inline call that React remounts, so pull it into its own component instead.

### src/screens/auth/components/VexAuroraCanvas.tsx

- L131: Your users lose state because "renderNoiseGrain()" builds UI from an inline call that React remounts, so pull it into its own component instead.

### src/screens/profile/ProfileActivityTab.tsx

- L153: Your users lose state because "renderSessionCard()" builds UI from an inline call that React remounts, so pull it into its own component instead.

### src/shared/ui/PremiumPullToRefresh-main.tsx

- L154: Your users lose state because "renderIndicator()" builds UI from an inline call that React remounts, so pull it into its own component instead.

### src/shared/ui/components/DataList.tsx

- L103: Your users lose state because "renderEmpty()" builds UI from an inline call that React remounts, so pull it into its own component instead.

### src/shared/ui/components/DataList.useItemRenderer.tsx

- L49: Your users lose state because "renderItem()" builds UI from an inline call that React remounts, so pull it into its own component instead.

### src/shared/ui/components/StepIndicator.tsx

- L145: Your users lose state because "renderContent()" builds UI from an inline call that React remounts, so pull it into its own component instead.
