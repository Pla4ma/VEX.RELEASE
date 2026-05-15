# WINDSURF AGENT PROMPT TEMPLATE
# Copy and paste this ENTIRE block into Windsurf to work on VEX
# Version: 6.0-ULTRA | Last Updated: April 30, 2026

---

## 🛑 MANDATORY PRE-FLIGHT (DO NOT SKIP)

**READ THESE FILES COMPLETELY BEFORE TOUCHING ANY CODE:**

1. **TASKS_V6_ULTRA.md** - The roadmap (this is the only tasks file that matters now)
2. **AGENTS.md** - Architecture rules and constraints
3. **docs/brain/product-logic.md** - Game mechanics and business rules
4. **docs/brain/architecture.md** - Feature folder structure patterns

**STOP AND VERIFY:**
```powershell
npm run typecheck -- --pretty false
```
TypeCheck must pass before you start. If it fails, STOP and report the errors.

---

## 📋 EXECUTION PROTOCOL

### Phase Selection
1. Open **TASKS_V6_ULTRA.md**
2. Find the **lowest-numbered incomplete phase** (look for ⬜ Not Started in the tracker)
3. Read that entire phase completely before writing any code
4. Work tasks **top to bottom** within the phase

### Task Execution Rules
**For every task marked [ ]:**
- Read the task completely
- Follow the **exact file paths** provided
- Use the **copy-pasteable code templates**
- **STOP** if you hit an error - don't guess, ask
- Run verification before marking complete

### Code Quality Gates (FAIL FAST)
**NEVER violate these:**
- ❌ NO file over 200 lines (split at 150 to be safe)
- ❌ NO `as any` or `as never` (use Zod schemas instead)
- ❌ NO `console.log/warn/error` in production paths
- ❌ NO Supabase queries outside repository.ts
- ❌ NO business logic in JSX/components
- ❌ NO direct cross-feature imports (use eventBus)
- ❌ NO TODO/FIXME shipped to users

**ALWAYS include these:**
- ✅ Zod schemas for ALL inputs and outputs
- ✅ All 5 UI states: loading, error, empty, offline, success
- ✅ Error handling with Sentry capture
- ✅ Tests for all services and hooks
- ✅ Accessibility props (role, label, hint, 44pt target)

---

## ✅ PHASE COMPLETION PROTOCOL

### Before Marking Any Task [x]:
1. Run the **Phase Verification Matrix** at the bottom of the phase
2. EVERY checklist item must be green
3. Run: `npm run typecheck -- --pretty false` (must pass)
4. Run: `npm test -- --runInBand` (must pass or document why)

### When Phase is Complete:
**Report EXACTLY this format:**
```
PHASE [N] COMPLETE — verification matrix passed

Files changed:
- src/features/[feature]/[file].ts
- src/screens/[screen]/[file].tsx
- [etc.]

Tests added:
- src/features/[feature]/__tests__/[test].test.ts

Verification:
- TypeCheck: PASS
- Phase Verification Matrix: ALL GREEN
- Existing tests: PASS

Blockers: None
```

### Then:
- Update the **Rating Projection Tracker** in TASKS_V6_ULTRA.md
- Mark phase as complete
- Move to next lowest-numbered phase

---

## 🚨 STOP CONDITIONS

**STOP and ask for help if:**
- TypeCheck fails and you can't fix it without `as any`
- You need to create a file over 200 lines
- The pattern doesn't fit your use case
- You find conflicting instructions between files
- You're unsure about cross-feature communication
- A repository method doesn't exist yet

**DO NOT:**
- Invent new patterns
- Skip verification steps
- Mark tasks [x] without running checks
- Work on multiple phases simultaneously
- Add features not in the phase tasks

---

## 📁 FILE PRIORITY (When In Doubt)

**Create in this order:**
1. `schemas.ts` - Zod schemas (source of truth)
2. `types.ts` - Inferred types from schemas
3. `repository.ts` - Supabase queries
4. `service.ts` - Business logic
5. `hooks.ts` - TanStack Query wiring
6. `components/*.tsx` - UI components
7. `__tests__/*.test.ts` - Tests

**Never put in wrong file:**
- Supabase queries → repository.ts ONLY
- Business logic → service.ts ONLY
- Data fetching → hooks.ts ONLY
- Render code → components ONLY

---

## 🔧 EMERGENCY COMMANDS

If stuck, run these and paste output:
```powershell
# Check current state
npm run typecheck -- --pretty false 2>&1 | head -30

# Find forbidden patterns
rg -n "as any" src -g "*.ts" -g "*.tsx" -g "!**/__tests__/**" | head -10

# Check file sizes
Get-ChildItem -Path src -Recurse -File | Where-Object {$_.Length -gt 5000} | Select-Object Name, @{Name="Lines";Expression={(Get-Content $_.FullName).Count}}

# Find console calls
rg -n "console\.(log|warn|error)" src -g "*.ts" -g "*.tsx" -g "!**/__tests__/**" | head -10
```

---

## 📝 TEMPLATE USAGE

1. **Copy this entire template** (from top "WINDSURF AGENT" to bottom)
2. **Paste into Windsurf chat**
3. **Add your specific request at the end**, e.g.:
   - "Work Phase 1: Structural Debt Elimination"
   - "Fix Task 1.2: Split HomeScreen.tsx"
   - "Complete Phase 0 baseline lock"

4. **Wait for Windsurf to acknowledge** the rules before proceeding

---

## ⚡ QUICK START EXAMPLE

**Paste this entire block:**

```
=== WINDSURF AGENT PROMPT ===

Read TASKS_V6_ULTRA.md, AGENTS.md, docs/brain/product-logic.md, docs/brain/architecture.md completely before touching any file.

Run: npm run typecheck -- --pretty false
Report: TypeCheck [PASS/FAIL]

Work Phase [N]: [Phase Name]
Complete EVERY task in Phase [N] top to bottom.
For each task marked [ ]:
  1. Read task completely
  2. Implement with exact file paths provided
  3. Run Phase Verification Matrix
  4. Mark [x] only when ALL items green
  5. Verify: npm run typecheck -- --pretty false

Report: PHASE [N] COMPLETE — verification matrix passed
List all files changed, tests added, verification results, blockers.

DO NOT:
- Skip tasks
- Use as any casts
- Create files over 200 lines
- Add console.log in production
- Mark [x] without verification

STOP if TypeCheck fails or pattern doesn't fit.
=== END PROMPT ===
```

---

**This template ensures:**
- ✅ Consistent execution across all phases
- ✅ Quality gates enforced
- ✅ Verification before completion
- ✅ Clear reporting format
- ✅ No shortcuts or skipped steps

**Use this for every VEX coding session.**
