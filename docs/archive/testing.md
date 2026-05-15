# Testing Rules & Standards

Strict testing guidelines for the VEX codebase.

---

## Testing Philosophy

- **Test behavior, not implementation** - Tests should verify what the code does, not how it does it
- **Prioritize critical logic paths** - Focus on business logic, calculations, and state transitions
- **Prevent regressions in core flows** - Tests must catch breaking changes to auth, sessions, rewards
- **Tests are documentation** - A well-written test explains the intended behavior
- **Fast feedback** - Tests should run quickly to support rapid development

---

## What MUST be tested

### Service Layer Functions
- All exported service functions
- Business logic calculations
- State transitions
- Async operations with proper error handling

```typescript
// ✅ MUST test
export function calculateReward(base: number, multipliers: number[]) {
  return multipliers.reduce((acc, m) => acc * m, base);
}

// ❌ Service orchestrators (test integration separately)
```

### Zod Validation Schemas
- All custom schemas
- Edge cases (empty strings, max lengths, bounds)
- Failure cases with proper error messages
- Default value application

```typescript
// ✅ MUST test
const WalletSchema = z.object({
  coins: z.number().int().min(0),
  gems: z.number().int().min(0),
});
```

### State Machines and Calculators
- XP calculation with all multipliers
- Reward distribution logic
- Progression thresholds
- Currency conversion rates

### Repository Logic (with mocked Supabase)
- Query construction
- Error handling from database
- Data transformation
- Transaction management

### Critical Flows

#### Auth Flow
- Login success/failure
- Token refresh
- Session persistence
- Logout cleanup

#### Session Creation
- Session initialization
- Timer accuracy
- Pause/resume behavior
- Completion detection

#### Reward Claiming
- Reward calculation
- Distribution to correct systems
- Duplicate prevention
- Partial failure handling

---

## What should NOT be tested

### Purely Presentational Components
Components without logic don't need unit tests:

```typescript
// ❌ DON'T test - purely presentational
function Title({ text }: { text: string }) {
  return <Text style={styles.title}>{text}</Text>;
}

// ✅ DO test - has conditional logic
function WalletDisplay({ coins, isLoading }: WalletProps) {
  if (isLoading) return <Skeleton />;
  return <Text>{coins} Coins</Text>;
}
```

### Third-party Libraries
Don't test library internals:
- React Native components
- Expo APIs
- Supabase client
- TanStack Query

### Implementation Details
Don't test:
- Private helper functions (test through public API)
- Internal state structure
- Specific variable names
- Comment accuracy

---

## Test Structure Rules

### File Organization
```
src/
  features/
    economy/
      __tests__/
        service.test.ts         # ✅ Service logic
        schemas.test.ts         # ✅ Validation
        repository.test.ts      # ✅ Data layer
        wallet-screen.test.tsx  # ✅ Component tests
      service.ts
      schemas.ts
      repository.ts
```

### Test Naming
```typescript
// ✅ Use clear, descriptive names
describe('addCurrency', () => {
  describe('success paths', () => {
    it('should add coins to wallet and return updated balance', async () => {});
    it('should create wallet if user has no wallet', async () => {});
  });

  describe('failure paths', () => {
    it('should reject negative amounts', async () => {});
    it('should handle repository errors gracefully', async () => {});
  });

  describe('edge cases', () => {
    it('should handle maximum safe integer values', async () => {});
  });
});
```

### AAA Pattern (Arrange-Act-Assert)
```typescript
it('should calculate reward with multipliers', () => {
  // Arrange
  const base = 100;
  const multipliers = [1.5, 1.2];

  // Act
  const result = calculateReward(base, multipliers);

  // Assert
  expect(result).toBe(180); // 100 * 1.5 * 1.2
});
```

---

## Mocking Rules

### MSW for API Mocking
```typescript
// ✅ Use MSW for all API mocking
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('should fetch wallet', async () => {
  server.use(
    http.get('*/rest/v1/wallets', () => {
      return HttpResponse.json([{ coins: 1000 }]);
    })
  );
  
  const wallet = await fetchWallet('user-1');
  expect(wallet.coins).toBe(1000);
});
```

### Mock Supabase at Repository Layer
```typescript
// ✅ Mock repository, not Supabase internals
vi.mock('../repository');

it('should handle database errors', async () => {
  vi.mocked(repository.fetchWallet).mockRejectedValue(
    new Error('Connection failed')
  );
  
  await expect(getWallet('user-1')).rejects.toThrow('Connection failed');
});
```

### Don't Mock Business Logic
```typescript
// ❌ DON'T mock business logic
vi.mock('./calculator', () => ({
  calculateReward: vi.fn().mockReturnValue(100),
}));

// ✅ DO test the actual logic
const result = calculateReward(50, [2]);
expect(result).toBe(100);
```

### Mock React Native Modules
```typescript
// ✅ Mock RN modules that don't work in Node
jest.mock('react-native-reanimated', () => {
  return require('react-native-reanimated/mock');
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));
```

---

## Coverage Rules

### Minimum Coverage Thresholds
```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

### Services: Strong Coverage Required
- 90%+ for critical business logic
- All branches tested
- Error paths covered

### Edge Cases: Must Be Tested
```typescript
// ✅ Test boundaries
it('should handle maximum safe integer', () => {});
it('should reject negative amounts', () => {});
it('should handle empty arrays', () => {});
it('should handle network timeout', () => {});
it('should handle concurrent requests', () => {});
```

### Failure Paths: Must Be Tested
```typescript
describe('failure paths', () => {
  it('should handle network errors', async () => {});
  it('should handle database failures', async () => {});
  it('should handle invalid input', async () => {});
  it('should handle timeout', async () => {});
  it('should handle rate limiting', async () => {});
});
```

---

## Naming Conventions

### Test Files
```
*.test.ts      # Logic tests (services, utilities)
*.test.tsx     # Component tests
*.spec.ts      # Alternative (allowed but prefer .test)
```

### Test Descriptions
```typescript
// ✅ Start with "should" for behavior
it('should calculate XP with level multiplier', () => {});
it('should reject invalid currency type', () => {});
it('should emit event on completion', () => {});

// ❌ Don't use vague descriptions
it('works', () => {});
it('test 1', () => {});
it('handles stuff', () => {});
```

---

## Quality Rules

### No Empty Tests
```typescript
// ❌ FORBIDDEN
it('should do something', () => {});

// ❌ FORBIDDEN
it('should do something', async () => {
  // TODO: implement
});

// ✅ REQUIRED
it('should do something', () => {
  const result = doSomething();
  expect(result).toBe(expected);
});
```

### No Meaningless Assertions
```typescript
// ❌ FORBIDDEN - asserts nothing meaningful
expect(true).toBe(true);
expect(typeof result).toBe('object');

// ✅ REQUIRED - asserts actual behavior
expect(result.coins).toBe(100);
expect(screen.getByText('Success')).toBeTruthy();
```

### No Snapshot Spam
```typescript
// ❌ DON'T overuse snapshots
expect(tree).toMatchSnapshot(); // Every test?

// ✅ Use snapshots sparingly
expect(errorMessage).toMatchInlineSnapshot(`
  "Invalid currency type: INVALID"
`);
```

### Tests Must Assert Real Behavior
```typescript
// ❌ Weak assertion
it('should call API', async () => {
  await fetchData();
  expect(fetch).toHaveBeenCalled(); // Was it successful?
});

// ✅ Strong assertion
it('should return parsed data', async () => {
  const result = await fetchData();
  expect(result).toEqual({ coins: 100, gems: 50 });
});
```

---

## Testing Checklist

Before submitting code:

- [ ] All service functions have tests
- [ ] All schemas have validation tests
- [ ] Critical paths have success + failure tests
- [ ] Edge cases are covered
- [ ] No empty or TODO tests
- [ ] All assertions verify actual behavior
- [ ] Mocks don't leak between tests
- [ ] Tests run in isolation
- [ ] No test is flaky

---

## Running Tests

```bash
# Run all tests
npm test

# Run in watch mode (development)
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific file
npx jest src/features/economy/service.test.ts

# Run with verbose output
npx jest --verbose
```

---

## Example Test Suite

See `src/__tests__/examples/` for complete examples:
- `service.test.ts` - Service layer testing with MSW
- `schema.test.ts` - Zod validation testing
- `component.test.tsx` - React Native component testing

---

**Last Updated:** 2024-01-18  
**Applies to:** All VEX codebase contributions
