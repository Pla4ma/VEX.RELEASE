# no-react19-deprecated-apis — manual fix checklist

Diagnostics found: **6**.

Estimated human time: 2-3 minutes.

## Per-file fixes

### src/accessibility/AccessibilityEnhancer.ts

- L45: forwardRef is dead weight in React 19, since ref is a normal prop now, so drop it & pass ref straight through.

### src/components/Input.tsx

- L7: forwardRef is dead weight in React 19, since ref is a normal prop now, so drop it & pass ref straight through.

### src/components/primitives/Card.tsx

- L1: forwardRef is dead weight in React 19, since ref is a normal prop now, so drop it & pass ref straight through.

### src/shared/ui/components/ScreenErrorBoundary.tsx

- L120: useContext is replaced by `use()` in React 19, which reads context inside ifs & loops too, so switch to `import { use } from 'react'`.

### src/shared/ui/components/ToastProvider.tsx

- L6: useContext is replaced by `use()` in React 19, which reads context inside ifs & loops too, so switch to `import { use } from 'react'`.

### src/theme/ThemeContext.tsx

- L11: useContext is replaced by `use()` in React 19, which reads context inside ifs & loops too, so switch to `import { use } from 'react'`.
