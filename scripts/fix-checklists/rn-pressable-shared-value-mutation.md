# rn-pressable-shared-value-mutation — manual fix checklist

Diagnostics found: **2**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/screens/auth/components/ethereal/AuthPillButton.tsx

- L73: Your users feel a choppy press when <Pressable> onPressIn animates on the JS thread.
- L76: Your users feel a choppy press when <Pressable> onPressOut animates on the JS thread.
