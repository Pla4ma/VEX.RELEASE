# rn-prefer-pressable-over-gesture-detector — manual fix checklist

Diagnostics found: **1**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/screens/auth/components/ethereal/AuthPillButton.tsx

- L102: Your users wait longer for the screen when <GestureDetector> handles a simple tap.
