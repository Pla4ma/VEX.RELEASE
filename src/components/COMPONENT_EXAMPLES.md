# Component Usage Examples

**Quick reference for using VEX UI components correctly.**

---

## Primitives

### Box

```tsx
import { Box } from './primitives';

// Basic usage
<Box padding="md" background="card">
  <Text>Content</Text>
</Box>

// With all props
<Box
  padding="lg"
  margin="md"
  background="secondary"
  radius="lg"
  shadow="md"
  flex={1}
>
  <Text>Content</Text>
</Box>
```

### Stack

```tsx
import { VStack, HStack, Center } from './primitives';

// Vertical stack
<VStack gap="md" align="center">
  <Item1 />
  <Item2 />
  <Item3 />
</VStack>

// Horizontal stack
<HStack gap="sm" justify="space-between">
  <Left />
  <Right />
</HStack>

// Centered content
<Center>
  <Text>Centered</Text>
</Center>
```

### Text

```tsx
import { Text } from './primitives';

// Using variants
<Text variant="heading">Title</Text>
<Text variant="body">Body text</Text>
<Text variant="caption">Small text</Text>

// Custom styling
<Text
  variant="body"
  color="secondary"
  align="center"
  weight="bold"
>
  Styled text
</Text>
```

### Button

```tsx
import { Button } from './primitives';

// Variants
<Button variant="primary" onPress={handlePress}>
  Primary
</Button>

<Button variant="secondary" onPress={handlePress}>
  Secondary
</Button>

<Button variant="ghost" onPress={handlePress}>
  Ghost
</Button>

// States
<Button
  variant="primary"
  onPress={handlePress}
  loading={isLoading}
  disabled={!canSubmit}
  size="lg"
>
  Submit
</Button>
```

### Card

```tsx
import { Card } from './primitives';

// Basic card
<Card>
  <Text>Card content</Text>
</Card>

// With header
<Card
  header={<Text variant="heading">Title</Text>}
  footer={<Button>Action</Button>}
>
  <Text>Content</Text>
</Card>

// Variants
<Card variant="outlined" padding="lg">
  <Text>Outlined card</Text>
</Card>

<Card variant="elevated" shadow="lg">
  <Text>Elevated card</Text>
</Card>
```

---

## State Components

### Loading States

```tsx
import { LoadingState, FullScreenLoader, InlineLoader } from './states';

// Full screen with message
<FullScreenLoader message="Loading your data..." />

// Inline loading
<InlineLoader />

// Custom loading state
<LoadingState
  message="Fetching sessions..."
  size="small"
  fullScreen={false}
/>
```

### Error States

```tsx
import { ErrorState } from './states';

<ErrorState
  title="Failed to load"
  message="Something went wrong. Please try again."
  onRetry={handleRetry}
  retryLabel="Try Again"
/>
```

---

## Theme Usage

### Colors

```tsx
import { useTheme } from '../theme';

function Component() {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.background.primary,
      }}
    >
      <Text style={{ color: theme.colors.text.primary }}>
        Primary text
      </Text>
      <Text style={{ color: theme.colors.text.secondary }}>
        Secondary text
      </Text>
    </View>
  );
}
```

### Spacing

```tsx
import { useTheme } from '../theme';

function Component() {
  const theme = useTheme();

  return (
    <View
      style={{
        padding: theme.spacing.md,    // 16px
        gap: theme.spacing.sm,        // 8px
        marginVertical: theme.spacing.lg, // 24px
      }}
    >
      {/* content */}
    </View>
  );
}
```

### Typography

```tsx
import { useTheme } from '../theme';

function Component() {
  const theme = useTheme();

  return (
    <Text
      style={{
        fontSize: theme.typography.size.md,
        fontWeight: theme.typography.weight.semibold,
        lineHeight: theme.typography.leading.normal,
      }}
    >
      Text
    </Text>
  );
}
```

---

## Complete Example

```tsx
/**
 * StudySessionCard
 *
 * @phase 4
 */

import React from 'react';
import { Card, VStack, HStack, Text, Button } from '../primitives';
import { useTheme } from '../../theme';

interface StudySessionCardProps {
  title: string;
  duration: number;
  progress: number;
  onContinue: () => void;
}

export const StudySessionCard: React.FC<StudySessionCardProps> = ({
  title,
  duration,
  progress,
  onContinue,
}) => {
  const theme = useTheme();

  return (
    <Card
      variant="elevated"
      padding="lg"
      background="card"
    >
      <VStack gap="md">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Text variant="heading" numberOfLines={1}>
            {title}
          </Text>
          <Text variant="caption" color="secondary">
            {duration} min
          </Text>
        </HStack>

        {/* Progress */}
        <View
          style={{
            height: 4,
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.radius.full,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: theme.colors.primary.DEFAULT,
            }}
          />
        </View>

        {/* Footer */}
        <HStack justify="flex-end">
          <Button
            variant="primary"
            onPress={onContinue}
            size="sm"
          >
            Continue
          </Button>
        </HStack>
      </VStack>
    </Card>
  );
};
```

---

## Common Patterns

### Loading + Error + Content

```tsx
function DataComponent() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });

  if (isLoading) {
    return <FullScreenLoader message="Loading..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load"
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  return <Content data={data} />;
}
```

### Form Layout

```tsx
<VStack gap="lg" padding="lg">
  <Text variant="heading">Create Session</Text>

  <VStack gap="md">
    <Input label="Title" placeholder="Enter title" />
    <Input label="Duration" type="number" />
  </VStack>

  <HStack justify="flex-end" gap="sm">
    <Button variant="ghost">Cancel</Button>
    <Button variant="primary">Create</Button>
  </HStack>
</VStack>
```

---

## Anti-Patterns to Avoid

### ❌ Don't Use StyleSheet.create (BANNED PATTERN)

```tsx
// VIOLATION - This pattern is banned in AGENTS.md
// const styles = StyleSheet.create({
//   container: { padding: 16 },
// });

// CORRECT - Use theme tokens and inline styles
<View style={{ padding: theme.spacing.md }} />
```

### ❌ Don't Hardcode Colors (BANNED PATTERN)

```tsx
// VIOLATION - Hardcoded colors are banned in AGENTS.md
// <Text style={{ color: '#000000' }} />

// CORRECT - Always use theme tokens
<Text style={{ color: theme.colors.text.primary }} />
```

### ❌ Don't Use console.log (BANNED PATTERN)

```tsx
// VIOLATION - console.log is banned in AGENTS.md
// console.log('Debug', value);

// CORRECT - Use the debug utility
import { createDebugger } from '../utils/debug';
const debug = createDebugger('component:Name');
debug.log('Debug', value);
```

### ❌ Don't Use any (BANNED PATTERN)

```tsx
// VIOLATION - 'any' type is banned in AGENTS.md
// function process(data: any) { }

// CORRECT - Use proper TypeScript types
function process(data: DataType) { }
```

---

## Quick Reference

| Token | Value | Usage |
|-------|-------|-------|
| `theme.spacing.xs` | 4px | Tight spacing |
| `theme.spacing.sm` | 8px | Small gaps |
| `theme.spacing.md` | 16px | Standard |
| `theme.spacing.lg` | 24px | Large |
| `theme.spacing.xl` | 32px | Extra large |
| `theme.radius.sm` | 4px | Inputs |
| `theme.radius.md` | 8px | Cards |
| `theme.radius.lg` | 12px | Large cards |
| `theme.radius.full` | 9999px | Pills |

---

## Resources

- [UI_STANDARDS.md](../UI_STANDARDS.md) - Complete standards
- [Theme Tokens](../theme/tokens/) - All theme values
- [Primitive Components](./primitives/) - Building blocks
