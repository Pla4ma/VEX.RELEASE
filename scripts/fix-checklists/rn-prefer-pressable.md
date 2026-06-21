# rn-prefer-pressable — manual fix checklist

Diagnostics found: **4**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/components/overlays/Modal.tsx

- L4: Your users miss <Pressable>'s flexible press feedback when you use TouchableWithoutFeedback, which is old & frozen.

### src/features/focus-identity/components/FocusScoreWidget.tsx

- L7: Your users miss <Pressable>'s flexible press feedback when you use TouchableOpacity, which is old & frozen.

### src/screens/home/components/HomeCompanionWidget.cards.tsx

- L2: Your users miss <Pressable>'s flexible press feedback when you use TouchableOpacity, which is old & frozen.

### src/screens/home/components/HomeCompanionWidget.tsx

- L2: Your users miss <Pressable>'s flexible press feedback when you use TouchableOpacity, which is old & frozen.
