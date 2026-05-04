# V6 Quality Gates (FAIL FAST)

**Document:** Quality gates for V6 implementation  
**Purpose:** Prevent technical debt accumulation during V6 work  
**Enforcement:** Automated + manual review

---

## Compiler Gate

| Rule | Verification | Enforcement |
|------|--------------|-------------|
| TypeCheck passes | `npm run typecheck -- --pretty false` | CI/CD block |
| No new `@ts-nocheck` | grep search in changed files | Pre-commit hook |
| No new `@ts-ignore` | grep search in changed files | PR review block |
| No new `as any` | grep search in changed files | Pre-commit hook |
| No new `as never` | grep search in changed files | Pre-commit hook |

**Command:**
```bash
npm run typecheck -- --pretty false
```

**Pass Criteria:** Exit code 0

---

## Code Style Gate

| Rule | Verification | Enforcement |
|------|--------------|-------------|
| No file over 200 lines | `find src -name "*.ts" -o -name "*.tsx" | xargs wc -l` | Pre-commit hook |
| No new `console.log/warn/error` | grep in production paths | PR review block |
| No new `TODO/FIXME/placeholder` | grep in production paths | PR review block |
| No new `StyleSheet.create` | grep search | Pre-commit hook |
| No magic numbers | Token audit | PR review |

**Allowed Exceptions:**
- `console.log` in `__tests__/` directories
- `console.log` in `debug.ts` utilities
- `TODO` comments in `.md` documentation

**Command:**
```bash
# File size check
wc -l src/features/**/*.ts src/features/**/*.tsx | sort -n | tail -20
```

---

## Architecture Gate

| Rule | Verification | Enforcement |
|------|--------------|-------------|
| No Supabase outside repository.ts | grep for `supabase.` outside repository files | PR review block |
| No business logic in JSX | grep for calculations in .tsx | PR review block |
| No direct cross-feature imports | grep for `from '../[feature]'` | Pre-commit hook |
| All route params typed | Check `navigation/types.ts` | TypeCheck |
| EventBus used for cross-feature | grep for `eventBus.publish` | PR review |

**Correct Pattern:**
```typescript
// ✅ Correct: Repository contains Supabase
export class FeatureRepository {
  static async getById(id: string): Promise<FeatureEntity | null> {
    const { data, error } = await supabase
      .from('features')
      .select('*')
      .eq('id', id)
      .single();
    // ...
  }
}
```

**Banned Pattern:**
```typescript
// ❌ Banned: Supabase in component
const handlePress = async () => {
  await supabase.from('features').insert({ ... });
};
```

---

## UI/UX Gate

| Rule | Verification | Enforcement |
|------|--------------|-------------|
| All 5 UI states present | Manual check: Loading, Error, Empty, Offline, Success | PR review |
| Accessibility labels | grep for `accessibilityLabel` | Pre-commit hook |
| 44pt touch targets | Visual inspection | Device QA |
| Reduced motion check | grep for `useReducedMotion` | PR review |
| No inline styles | grep for `style={{` | Pre-commit hook |

**Required UI States:**
1. **Loading** - Skeleton matching final layout
2. **Error** - ErrorState with retry button
3. **Empty** - EmptyState with CTA (genuine absence only)
4. **Offline** - OfflineBanner + degraded functionality
5. **Success** - The actual data view

**Accessibility Requirements:**
- `accessibilityLabel` on all interactive elements
- `accessibilityRole` on all buttons
- `accessibilityHint` where helpful
- Minimum touch target: 44×44pt

---

## Testing Gate

| Rule | Verification | Enforcement |
|------|--------------|-------------|
| Service unit tests | `*.test.ts` alongside service.ts | PR review block |
| Hook async state tests | `*.test.ts` for hooks.ts | PR review block |
| TypeCheck passes | `npm run typecheck` | CI/CD block |
| No test skips without reason | grep for `.skip` | PR review |

**Required Test Coverage:**
- Services: valid input, invalid input, failure, offline
- Hooks: pending, error, success, retry states
- Components: render, interaction, accessibility

---

## Integration Verification

| Rule | Verification | Enforcement |
|------|--------------|-------------|
| QA script passes | `node scripts/qa-verification.js` | CI/CD block |
| Integration audit passes | `node scripts/integration-audit.js` | CI/CD block |
| Performance audit passes | `node scripts/performance-audit.js` | CI/CD block |

**Command:**
```bash
npm run typecheck -- --pretty false && \
node scripts/qa-verification.js && \
node scripts/integration-audit.js
```

---

## Pre-Commit Checklist

Before every commit, verify:

```markdown
- [ ] TypeCheck passes
- [ ] No files > 200 lines
- [ ] No new `as any` or `as never`
- [ ] No new `console.log` in production code
- [ ] No new TODO/FIXME without issue reference
- [ ] Supabase only in repository.ts files
- [ ] Business logic in service.ts, not JSX
- [ ] All new components have 5 UI states
- [ ] Accessibility labels added
```

---

## Phase Completion Gate

Before marking any phase complete:

```markdown
- [ ] All tasks in phase marked [x]
- [ ] TypeCheck: npm run typecheck -- --pretty false passes
- [ ] No new files over 200 lines
- [ ] No new as any, as never
- [ ] No new console.log in production
- [ ] Tests added for all new services/hooks
- [ ] QA verification passes
- [ ] Integration audit passes
```

---

## Emergency Override

If a gate must be bypassed:

1. Document the reason in code comment
2. Create follow-up issue
3. Get second reviewer approval
4. Add to technical debt tracker

**Never bypass without written justification.**

---

*Document Version: 1.0*  
*Last Updated: April 30, 2026*  
*Owner: Engineering Team*
