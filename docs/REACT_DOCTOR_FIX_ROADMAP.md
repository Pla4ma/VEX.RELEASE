# react-doctor Fix Roadmap (REAL FIXES ONLY — no config silencing)

**Current state:** 835 diagnostics, 37 pre-existing TS errors, 0 `.bak`, codebase clean,
`doctor.config.json` is unchanged from HEAD.
**Target:** reach score 100 by fixing each rule via real code rewrites.
**Hard constraint:** `doctor.config.json` is OFF-LIMITS. Every diagnostic must be closed
by changing the actual source file. No rule silencing, no `.react-doctorignore` workaround
for in-scope code, no ignore-blocks, no `eslint-disable-next-line`. The lint baseline will
catch any attempt.

**Honest history — fixer iterations that all broke code:**

| Script | Diag count dropped | New TS errors introduced | Verdict |
|--------|--------------------|--------------------------|---------|
| `scripts/fix-master.js` | ~24 | unknown (no full audit) | reverted |
| `scripts/fix-v2.js`     | 0 (regex too narrow) | 0 | reverted (no-op) |
| `scripts/fix-v3.js`     | ~200 (useRef→useState) | +82 (.current.X reads broke) | REVERTED 205 files |
| `scripts/fix-v4.js`     | 0 (strict basename) | 0 | reverted (no-op) |
| `scripts/fix-v5.js`     | 25 (no-barrel-import) | +7 (over-matched wrong paths) | REVERTED 25 files |
| `scripts/fix-v6.js`     | not run | n/a | planned but must apply with TYPECHECK GATE before write |

**Mandatory safety protocol going forward**: every fixer MUST include a `--dry` mode that
emits diagnostics count + per-file preview BEFORE `--write`. After `--write`, run
`npx tsc --noEmit`. If the error count rises AT ALL, revert the writes for that rule.
Document the failure mode in this file.

## Per-rule inventory

Counts from `npx react-doctor@latest --json` (~835 total across the remaining rule set).

| #  | Rule                                     | Count | Real fix pattern (no config edits) |
|----|------------------------------------------|-------|------------------------------------|
| 1  | `only-export-components`                 | 112   | Split helper exports to own file. Use per-handler hoisting? No — rename and move file. |
| 2  | `no-event-handler`                       | 78    | Move side-effect out of useEffect into the actual event handler that triggers it. |
| 3  | `async-await-in-loop`                    | 75    | For each loop: confirm awaits are independent → wrap in `Promise.all(arr.map(async (x) => await fn(x)))`. If sequential deps exist, leave the loop alone and document why. |
| 4  | `no-inline-exhaustive-style`             | 60    | If value is purely static literals → extract to module-level `const STYLE_HOISTED_<hash> = {...}` and replace `style={{...}}` with `style={STYLE_HOISTED_<hash>}`. Skip if any value is dynamic (variable ref, function call, ternary). |
| 5  | `no-multi-comp`                          | 56    | Split each sub-component out of the file (per AGENTS.md 200-line limit). |
| 6  | `no-array-index-as-key`                  | 44    | Read the schema; if items have `.id`, replace `key={index}` with `key={item.id}`. If no `.id` exists, generate one upstream. |
| 7  | `no-derived-state`                       | 36    | Move derived value into render body or use `useMemo`. |
| 8  | `no-barrel-import`                       | 32    | Per diagnostic, extract quoted paths, write per-name direct imports. |
| 9  | `rerender-lazy-ref-init`                 | 19    | Wrap init in factory: `useRef<X | null>(null);` + `if (!ref.current) ref.current = new X()`. Avoid the useRef→useState rewrite (broke `.current` reads last time). |
| 10 | `rn-no-scrollview-mapped-list`           | 16    | Convert `<ScrollView>{arr.map(...)}` to `FlashList` with `estimatedItemSize`. |
| -- | 47 more rules, ~245 diagnostics          | ~245  | See `scripts/fix-checklists/*.md` per rule for the exact fix. |

## Phase A — Apply-safe, real code fixes only

### Step A.0: Generate per-rule checklists (already done)

```
node scripts/generate-fix-checklists.js   # writes 67 md files in scripts/fix-checklists/
```

### Step A.1: Apply `no-barrel-import` (32 diagnostics, manual)

Manual list: `scripts/fix-checklists/no-barrel-import.md`. The 32 cases split into two
groups:

- **Safe (~25)**: diagnostic message contains explicit quoted paths where path basename
  matches destructured name (e.g., `Box` → `…/components/primitives/Box`). Apply directly.
- **Risky (~7)**: name-to-path mapping is non-obvious (camelCase, multi-dotup, ambiguous).
  Require human review on those.

### Step A.2: Apply `no-array-index-as-key` (44 diagnostics, manual)

For each `.tsx` mapped-list in `scripts/fix-checklists/no-array-index-as-key.md`:
- Find the enclosing `.map((<var>, index) => …)`
- Verify the schema (grep inferred type) has `.id` — if yes, replace `key={index}` with
  `key={<var>.id}`
- If no `.id`, leave the diagnostic and move on (requires upstream schema change)

### Step A.3: Apply `no-inline-exhaustive-style` (60 diagnostics, AST or manual)

Real fix: regex/AST extractor that detects `style={{...}}` with N≥8 WHERE every value
is a static literal (number / string / nested static object). Output:
```diff
+ const __HOISTED_style_l5_x7 = { background: '...', padding: 12, /* 8 keys total */ };
  return (
    <View style={{ background: '...', padding: 12, /* ... */ }}>
-   <View style={__HOISTED_style_l5_x7}>
```
Skip if any value is a variable reference, ternery, function call, or imported token.

## What I will NOT propose

- Adding rules to `doctor.config.json`'s `off` list — the user forbid this and that's correct.
- Expanding `.react-doctorignore` for in-scope code — the existing entries (`.agents/skills/`,
  `archive/`, `.github/`, `release/`) were legitimate scope reduction for non-VEX content.
- `eslint-disable` or `@ts-nocheck` — banned by AGENTS.md.
- Shortcuts like renaming `TouchableOpacity` → `Pressable` just to silence RN rules —
  only do this if it produces real semantic improvement (Pressable has correct hitSlop /
  android_ripple semantics that TouchableOpacity doesn't).
