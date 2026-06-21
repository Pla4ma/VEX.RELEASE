# rn-no-panresponder — manual fix checklist

Diagnostics found: **1**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/shared/ui/PremiumPullToRefresh-main.tsx

- L2: PanResponder runs gesture handling on the JS thread, which stutters under load.
