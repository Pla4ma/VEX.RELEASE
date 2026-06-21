# no-polymorphic-children — manual fix checklist

Diagnostics found: **6**.

Estimated human time: 2-3 minutes.

## Per-file fixes

### src/accessibility/enhancer-logic.ts

- L168: Your users hit inconsistent behavior because `typeof children === "string"` makes this component switch on what callers pass, so add clear subcomponents like `<Button.

### src/components/badge-helpers.ts

- L7: Your users hit inconsistent behavior because `typeof children === "string"` makes this component switch on what callers pass, so add clear subcomponents like `<Button.

### src/components/primitives/Button.tsx

- L72: Your users hit inconsistent behavior because `typeof children === "string"` makes this component switch on what callers pass, so add clear subcomponents like `<Button.
- L144: Your users hit inconsistent behavior because `typeof children === "string"` makes this component switch on what callers pass, so add clear subcomponents like `<Button.

### src/features/ai-coach/components/primitives/button.tsx

- L63: Your users hit inconsistent behavior because `typeof children === "string"` makes this component switch on what callers pass, so add clear subcomponents like `<Button.

### src/screens/onboarding/components/__tests__/LauncherStep.test.tsx

- L103: Your users hit inconsistent behavior because `typeof children === "string"` makes this component switch on what callers pass, so add clear subcomponents like `<Button.
