# VEX UI/UX Standards

**Phase 4: UI/UX Polish - Component Standardization**

Complete coding standards for the VEX application to ensure consistency, maintainability, and quality.

---

## Core Principles

1. **Theme-First**: Always use theme tokens, never hardcode values
2. **Inline Styles**: Use inline styles with theme tokens (no StyleSheet.create)
3. **Type Safety**: Zero `any` types - everything must be typed
4. **Error Handling**: All async functions must have try/catch with typed errors
5. **File Size**: Maximum 200 lines per file
6. **Logging**: Use logger utility, never console.log

---

## Theme Token Usage

### ✅ Correct

```typescript
import { useTheme } from '../theme';

function MyComponent() {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.background.primary,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
      }}
    >
      <Text
        style={{
          color: theme.colors.text.primary,
          fontSize: theme.typography.size.md,
          fontWeight: theme.typography.weight.semibold,
        }}
      >
        Hello
      </Text>
    </View>
  );
}
```

### ❌ Incorrect

```typescript
// Hardcoded colors
<View style={{ backgroundColor: '#FFFFFF' }} />

// Hardcoded spacing
<View style={{ padding: 16 }} />

// StyleSheet.create (banned)
const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF' },
});
```

---

## Color Tokens Reference

### Semantic Colors (Always use these)

| Token | Usage |
|-------|-------|
| `theme.colors.background.primary` | Main background |
| `theme.colors.background.secondary` | Secondary/cards |
| `theme.colors.background.card` | Card backgrounds |
| `theme.colors.text.primary` | Primary text |
| `theme.colors.text.secondary` | Secondary/muted text |
| `theme.colors.text.inverse` | Text on dark backgrounds |
| `theme.colors.primary.DEFAULT` | Primary actions |
| `theme.colors.primary.light` | Primary hover states |
| `theme.colors.success.DEFAULT` | Success states |
| `theme.colors.error.DEFAULT` | Error states |
| `theme.colors.warning.DEFAULT` | Warning states |
| `theme.colors.border.DEFAULT` | Borders |
| `theme.colors.border.focus` | Focus rings |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `theme.spacing.xs` | 4px | Tight spacing |
| `theme.spacing.sm` | 8px | Small gaps |
| `theme.spacing.md` | 16px | Standard spacing |
| `theme.spacing.lg` | 24px | Large spacing |
| `theme.spacing.xl` | 32px | Extra large |
| `theme.spacing.xxl` | 48px | Section spacing |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `theme.radius.sm` | 4px | Inputs, small elements |
| `theme.radius.md` | 8px | Cards, buttons |
| `theme.radius.lg` | 12px | Large cards |
| `theme.radius.xl` | 16px | Modals, screens |
| `theme.radius.full` | 9999px | Pills, avatars |

---

## Component Standards

### File Structure

```typescript
/**
 * ComponentName
 *
 * Brief description of what this component does.
 *
 * @phase X (which phase this belongs to)
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme';
import { createDebugger } from '../utils/debug';

// Types
interface ComponentNameProps {
  // All props must be typed
  title: string;
  count?: number;
  onPress?: () => void;
}

// Debugger
const debug = createDebugger('component:ComponentName');

// Component (max 200 lines including types)
export const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  count = 0,
  onPress,
}) => {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.background.card,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
      }}
    >
      <Text
        style={{
          color: theme.colors.text.primary,
          fontSize: theme.typography.size.md,
        }}
      >
        {title}
      </Text>
    </View>
  );
};
```

### Required Imports

```typescript
// Always import in this order:
import React from 'react';                          // 1. React
import { View, Text } from 'react-native';          // 2. RN components
import { useTheme } from '../theme';               // 3. Theme
import { createDebugger } from '../utils/debug';   // 4. Debug (if needed)
// 5. Other imports
```

---

## Error Handling Standards

### Async Functions

```typescript
// ✅ Correct
try {
  const result = await fetchData();
  return result;
} catch (error) {
  const typedError = error as Error;
  debug.error('Failed to fetch data:', typedError.message);
  throw typedError;
}

// ❌ Incorrect
try {
  const result = await fetchData();
} catch (e) {
  console.log(e); // No typing, uses console.log
}
```

### Error Boundaries

```typescript
interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    debug.error('Component error:', error, errorInfo);
  }
}
```

---

## File Size Enforcement

### Maximum 200 Lines

If a component exceeds 200 lines, split it:

```typescript
// Component.tsx (main component, < 200 lines)
export const Component: React.FC<Props> = (props) => {
  return (
    <View>
      <ComponentHeader {...props} />
      <ComponentBody {...props} />
      <ComponentFooter {...props} />
    </View>
  );
};

// ComponentHeader.tsx (< 200 lines)
// ComponentBody.tsx (< 200 lines)
// ComponentFooter.tsx (< 200 lines)
// hooks/useComponent.ts (< 200 lines)
// utils/componentHelpers.ts (< 200 lines)
```

---

## Primitive Components

Always use primitive components as building blocks:

```typescript
import { Box, Text, Button, Card } from './primitives';

// Instead of raw View/Text:
<Box padding="md" background="card">
  <Text variant="heading">Title</Text>
  <Button variant="primary" onPress={handlePress}>
    Action
  </Button>
</Box>
```

---

## Testing Requirements

### Minimum Test Coverage

Every new service/hook requires tests:

```typescript
// Component.test.tsx
import { render, screen } from '@testing-library/react-native';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component title="Test" />);
    expect(screen.getByText('Test')).toBeTruthy();
  });

  it('handles press', () => {
    const onPress = jest.fn();
    render(<Component title="Test" onPress={onPress} />);
    // Test interaction
  });
});
```

---

## Pre-Commit Checklist

Before committing, verify:

- [ ] No files > 200 lines
- [ ] Zero `any` types
- [ ] No hardcoded hex colors (use theme)
- [ ] No `console.log` (use `debug`)
- [ ] No `StyleSheet.create`
- [ ] All async functions have try/catch
- [ ] All errors are typed
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Tests pass

---

## Linting Rules

### Required ESLint Rules

```json
{
  "rules": {
    "no-console": ["error", { "allow": ["error"] }],
    "@typescript-eslint/no-explicit-any": "error",
    "max-lines": ["error", 200],
    "react-native/no-color-literals": "error",
    "react-native/no-inline-styles": "off"
  }
}
```

---

## Migration Checklist

For existing code:

1. Replace `StyleSheet.create` with inline styles + theme
2. Replace hardcoded colors with theme tokens
3. Replace `console.log` with `createDebugger`
4. Add types to all `any` usages
5. Add try/catch to async functions
6. Split files > 200 lines

---

## Phase 4 Completion Criteria

- [x] Theme tokens audit complete
- [x] Component standardization documented
- [ ] All hardcoded colors replaced
- [ ] All StyleSheet.create removed
- [ ] All console.log replaced
- [ ] All files under 200 lines
- [ ] Zero `any` types
- [ ] Pre-commit hooks configured
