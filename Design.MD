# VEX Design.MD — Non-Color Design Rules

> **Status:** This document is the **source of truth** for non-color design rules in the VEX Expo React Native app.
> **Scope:** Layout, type, spacing, sizing, motion, depth, accessibility, and component consistency.
> **Out of scope:** Color values, palette tokens, semantic color roles, dark mode mapping. These live in `src/theme/tokens/colors.ts`, `src/theme/tokens/semanticColors.ts`, `src/theme/tokens/primary-palette.ts`, and `src/theme/tokens/dark-palette.ts`. Do not duplicate color decisions here.
> **Authority:** Every rule below is observed in the existing codebase (`src/theme/tokens/*`, `src/theme/responsive.ts`, `src/components/primitives/*`, `src/components/*`, `src/utils/touchTarget.ts`, `src/accessibility/*`). When code drifts from this document, fix the code, not the doc.

---

## 0. How to use this document

1. **Before any UI change**, confirm the change does not violate a rule here. Token names are the only acceptable values for spacing, radii, typography, motion, elevation, z-index, opacity, sizing.
2. **Never hardcode a value** that has a token (`padding: 16` → use `theme.spacing[4]`; `borderRadius: 12` → use `theme.borderRadius.lg`).
3. **Never reach for a non-VEX library** for these concerns. Type → typography.ts tokens. Spacing → spacing.ts tokens. Motion → motion.ts / timing.ts. Depth → elevation.ts. Icons / inputs / buttons / cards / modals / states / glass → the existing primitive set.
4. **Dark mode parity is required.** Every rule below applies to both light and dark. Components that render against `lightColors.semantic.background` must have a verified counterpart against the dark palette.
5. **All numbers below are in points (pt) on iOS, dp on Android, px on web.** RN's unit system makes them equivalent for layout purposes.

---

## 1. Typography

### 1.1 Font families

Defined in `src/theme/tokens/typography.ts` (`fontFamilies`):

| Role          | Family            | Usage                                                      |
|---------------|-------------------|------------------------------------------------------------|
| `primary`     | `Inter`           | All UI text — display, headings, body, UI, labels, buttons |
| `secondary`   | `Inter`           | Reserved for future second face; today mirrors `primary`   |
| `mono`        | `JetBrains Mono`  | Error codes, numeric/code surfaces, monospace debug strips |

Rules:

- Do **not** introduce a new typeface without an explicit instruction.
- Do **not** use `System` / platform-default fonts in components. The Input component hardcodes `fontFamily: 'System'` as a deliberate exception for the text input field; new components should pull from `theme.fonts.primary`.
- Tabular numbers: when displaying times, scores, durations, levels, or any vertically aligned numerics, use the typography tokens as defined (Inter ships with `tnum` behavior on numeric glyphs at the sizes specified here). Do not switch to a different font to get tabular figures.

### 1.2 Font weights

Defined in `fontWeights`:

| Token       | Value | Where it appears                                                                |
|-------------|-------|---------------------------------------------------------------------------------|
| `light`     | 300   | Reserved; rarely used. Hero ambience only.                                      |
| `regular`   | 400   | Body, bodyLarge, bodySmall, captions default                                     |
| `medium`    | 500   | Overline, selected labels in inputs                                              |
| `semibold`  | 600   | h3, h4, h5, h6, ui.label, ui.caption, ui.button, Avatar initials                |
| `bold`      | 700   | h1/h2 in some renderings; the Text primitive h3 fallback                         |
| `heavy`     | 800   | display.*, heading h1/h2, Text variants `hero` / `display` / `h1` / `h2`        |

Rules:

- Hierarchy comes from **weight + size**, never from weight alone.
- Buttons are `semibold` (700 in the active `ui.button` token). Never `regular`.
- Avatar initials are `600` (semibold). Never thinner.
- GlassPill labels are `800` (heavy) with `letterSpacing: 0.2` to read clean on small glass surfaces.
- Do not interpolate weights with arbitrary numbers. Pick a token.

### 1.3 Type scale

Source: `typography.ts`. The four scale families are `display`, `heading`, `body`, `ui`. Each member fixes `fontSize`, `fontWeight`, `letterSpacing`, `lineHeight`.

#### Display (hero / launch / empty-state anchoring)

| Variant | fontSize | lineHeight | weight | letterSpacing |
|---------|----------|------------|--------|---------------|
| `display.large`  | 48 | 52 | heavy (800) | -1.2 |
| `display.medium` | 36 | 40 | heavy (800) | -0.8 |
| `display.small`  | 28 | 34 | heavy (800) | -0.4 |

Use only for: launch heroes, level-up payoffs, screen-anchoring statements, brand moments.

#### Heading (page + section hierarchy)

| Variant | fontSize | lineHeight | weight   | letterSpacing |
|---------|----------|------------|----------|---------------|
| `h1`    | 32 | 38 | heavy (800)   | -0.5 |
| `h2`    | 28 | 34 | heavy (800)   | -0.3 |
| `h3`    | 24 | 30 | semibold (600)| -0.2 |
| `h4`    | 20 | 26 | semibold (600)| -0.1 |
| `h5`    | 18 | 24 | semibold (600)| 0    |
| `h6`    | 16 | 22 | semibold (600)| 0    |

The `Text` primitive maps:

- `hero` / `display` → `display.large` + heavy
- `h1` / `h2` → heading.h1/h2 + heavy (overrides to 800 even though tokens are heavy too — explicit)
- `h3` → heading.h3 + **bold** (700) (the primitive actively upgrades to bold)
- `h4` / `h5` / `heading` / `heading2` / `heading3` / `heading4` → heading.h4 + semibold (600)
- `bodyLarge` / `body` / `bodySmall` → body tokens
- `caption` / `label` / `button` → ui tokens

> The h3 → bold override is intentional and exists in `Text.tsx`. Honor it. Do not change the rendered weight of an `h3` to semibold via a prop override.

#### Body (reading text)

| Variant | fontSize | lineHeight | weight | letterSpacing |
|---------|----------|------------|--------|---------------|
| `body.large`  | 18 | 27 | regular | -0.1 |
| `body.medium` | 16 | 24 | regular | 0    |
| `body.small`  | 14 | 21 | regular | 0.1  |

Reading line-height ratio: 1.5x for body sizes. Do not compress body line-height below `fontSize * 1.4` even in dense lists.

#### UI (controls + labels)

| Variant     | fontSize | lineHeight | weight   | letterSpacing | textTransform |
|-------------|----------|------------|----------|---------------|---------------|
| `ui.button` | 16 | 24 | semibold (600) | 0.4 | none |
| `ui.label`  | 12 | 16 | semibold (600) | 1.2 | **uppercase** |
| `ui.caption`| 12 | 18 | semibold (600) | 0.4 | none |
| `ui.overline` | 11 | 16 | medium (500) | 0.5 | **uppercase** |

Rules:

- `ui.label` and `ui.overline` are the **only** type that may be `uppercase` by default. All other text reads in sentence case.
- `ui.label` letter-spacing of `1.2` is deliberately wide. Do not collapse it to 0.4 because it looks "tighter".
- Button text (`ui.button`) carries `letterSpacing: 0.4`. On `variant: 'premium'` buttons rendered with `#1A1300` text, the wider tracking carries the premium weight.

### 1.4 Letter-spacing discipline

| Context                                | Letter-spacing |
|----------------------------------------|----------------|
| Display (large)                        | -1.2           |
| Display (medium)                       | -0.8           |
| Display (small)                        | -0.4           |
| Heading h1                             | -0.5           |
| Heading h2                             | -0.3           |
| Heading h3                             | -0.2           |
| Heading h4                             | -0.1           |
| Heading h5 / h6                        | 0              |
| Body large                             | -0.1           |
| Body medium                            | 0              |
| Body small                             | +0.1           |
| UI button                              | +0.4           |
| UI label                               | +1.2 (uppercase) |
| UI caption                             | +0.4           |
| UI overline                            | +0.5 (uppercase) |
| GlassPill label                        | +0.2           |
| Toast / error fallback monospace       | 0              |

Tighter letter-spacing for larger display type; wider for uppercase UI labels. Never the other way around.

### 1.5 Line-height discipline

The line-height values are **fixed by token** and must be honored as-written. Custom `lineHeight` props on the `Text` primitive override the token, but only when there is a clear visual reason (e.g. tight on a GlassPill, where a custom `lineHeight` of `dim.fontSize * 1.2` keeps the chip compact).

**Reading-distance baseline:** body text on phone is 16pt/24lh. The reading-distance equation in the design system holds — 16pt at 12 inches is the floor. Do not go below 14/20 for any long-form body text.

**One-line rule for UI control text:** any text inside a 48pt-tall button, pill, or input is `lineHeight: 24` (matches `ui.button`/`body.medium`). Text vertically centers in 48 because `paddingVertical` + `lineHeight` math works out.

### 1.6 Typography variant usage rules

The `Text` primitive variants are the only entry point for new UI text. Direct RN `<Text>` is forbidden by the AGENTS.md rules and is not represented in the design system.

| Need                                   | Variant              | Why                                       |
|----------------------------------------|----------------------|-------------------------------------------|
| Page title (Hero, Login)               | `hero` or `display`  | Reads as the dominant mass on the screen  |
| Screen title (FeatureScreen)           | `h3` (renders bold)  | 24/30 holds the header line cleanly       |
| Section header                         | `h4` (semibold)      | 20/26 reads as a section, not a page      |
| Sub-section / card title               | `h5` (semibold)      | 18/24 pairs with 16/24 body               |
| Inline label / chip text               | `h6` (semibold)      | 16/22 — same scale as body, weight only   |
| Form field label                       | body + `fontWeight: 500` | Visible at 14–16, the rule from Input.tsx |
| Primary reading text                   | `body`               | 16/24 baseline                            |
| Reading-heavy / marketing body         | `bodyLarge`          | 18/27                                     |
| Helper / metadata / timestamp          | `bodySmall` or `caption` | 14/21 or 12/18                       |
| Section eyebrow / kicker               | `label` (uppercase)  | 12/16, +1.2 tracking                      |
| Toast / inline notice text             | `body`               | 16/24, in the reading lane                |
| Error code display                     | mono + caption weight| Monospace, monospace is for *codes* only  |
| Empty-state title                      | `h4` + 800 override  | Empty states want 20pt to read at-a-glance |
| Empty-state body                       | `bodySmall`, max-width 320 | 14/21 is comfortable for 2–3 lines |

### 1.7 No bare `<Text>` and no new variants

- If a new type style is needed, add it to `typography.ts` and re-export the variant from the `Text` primitive. Don't pass `fontSize` + `fontWeight` ad hoc.
- The GlassPill custom-styled Text (inline `color`, `fontSize`, `fontWeight: 800`, `letterSpacing: 0.2`) is an acknowledged exception because GlassPill is a tokenized component. Replicate the same pattern for other pill/glass surfaces; do not let it leak to general Text usage.

---

## 2. Spacing scale

### 2.1 The 4px grid (mandatory)

Source: `src/theme/tokens/spacing.ts`. Base unit is `SPACING_UNIT = 4`. Every spacing value in the app is a multiple of 4.

| Token | px  | Common role                                    |
|-------|-----|------------------------------------------------|
| `0`   | 0   | Reset / override                               |
| `1`   | 4   | Hairline gap, micro-padding, icon-text gap     |
| `2`   | 8   | Element internal padding (xs)                  |
| `3`   | 12  | Form field label gap, input left/right padding  |
| `4`   | 16  | Default screen edge, default card padding      |
| `5`   | 20  | Form-section gap, hero padding                 |
| `6`   | 24  | Section vertical rhythm, large card padding    |
| `8`   | 32  | Major section gap                              |
| `10`  | 40  | Hero / launch gap                              |
| `12`  | 48  | Page break                                     |
| `16`  | 64  | Dramatic gap (used sparingly)                  |
| `20`  | 80  | Rare                                           |
| `24`  | 96  | Cinematic break                                |

**Forbidden values:** 1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19, 21, 22, 23, 25+. Every spacing-related number in a component must be one of the tokens above. This is a hard AGENTS.md rule.

### 2.2 Spacing semantics

`layoutSpacing` (in `spacing.ts`) gives named roles that map to the numeric tokens:

```
screen:        { horizontal: 16, vertical: 16, top: 24, bottom: 24 }
section:       { small: 16, medium: 24, large: 32, xlarge: 48 }
element:       { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 }
padding:       { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 }
gap:           { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 }
```

Use the named role in components when it matches the intent. The numeric token is the fallback.

### 2.3 Spacing rhythm patterns

| Pattern                                | Token sequence                                   |
|----------------------------------------|--------------------------------------------------|
| Card internal padding                  | `p: 4` (md) or `p: 5` (lg)                       |
| Section break                          | `mt: 6` or `my: 6`                               |
| Form-field label → input               | `mb: 1` (xs)                                     |
| Input internal vertical padding        | `py: 3.5` token-equivalent (14px) via `paddingVertical: 14` — token-mapped: 14 ≈ between 3 and 4; components snap to 4 by `minHeight: 52` and padding 14 |
| Button internal vertical padding       | `py: 2` (sm) / `py: 3` (md) / `py: 4` (lg)       |
| Button internal horizontal padding     | `px: 3` (sm) / `px: 5` (md) / `px: 6` (lg)       |
| Pill internal vertical padding         | height-locked (28/32/36pt) — no vertical padding |
| List item vertical gap                 | `gap: 3` or `gap: 4`                             |
| Stack default gap                      | `gap: 4`                                         |
| Hero top padding                       | `pt: insets.top + 16`                            |
| Hero bottom padding                    | `pb: insets.bottom + 12`                         |
| Screen edge padding                    | `paddingHorizontal: 5` (20) — Login screen pattern, or `4` (16) — AppScreen default |

> When the only way to hit a value is to go off-grid (e.g. 14 for input vertical padding, 7 for hairline icon gap), document the deviation in code with a token-named comment, never with a hardcoded number outside the token table.

### 2.4 Stacks and gap

`Stack` (`src/components/primitives/Stack.tsx`) is the canonical gap-bearer. Use the named tokens (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`) or numeric tokens. The mapping is:

| Name   | Numeric |
|--------|---------|
| `xs`   | `1` (4)  |
| `sm`   | `2` (8)  |
| `md`   | `4` (16) |
| `lg`   | `6` (24) |
| `xl`   | `8` (32) |
| `2xl`  | `12` (48) |
| `3xl`  | `16` (64) |

Default Stack `gap` when none is supplied: none (i.e. 0). Always pass a gap.

### 2.5 `MobileGrid` and `gap` math

`MobileGrid` in `MobileOptimizedContainer.tsx` uses `gap: 12` (token `3`) as the default, then divides by 2 for inner padding. This is a documented container pattern. If you build a new grid, copy the math; do not invent a new gap.

---

## 3. Sizing

Source: `src/theme/tokens/sizing.ts`. Base unit `SIZING_UNIT = 4`.

### 3.1 Width scale

| Token  | px  | Role                                                   |
|--------|-----|--------------------------------------------------------|
| `xs`   | 80  | Inline status pill, narrow callout                     |
| `sm`   | 120 | Avatar+label, small card content                       |
| `md`   | 160 | Standard card content, single-line metric block        |
| `lg`   | 240 | Hero card, double-column content                       |
| `xl`   | 320 | Feature screen content block (Login form max-width)    |
| `2xl`  | 400 | Modal max-width                                        |
| `full` | 100%| Full-bleed containers                                  |

The `width` scale is rare in product UI. Prefer `flex: 1` or `width: '100%'`. Use `width` tokens only for hard-constrained surfaces (modal, hero image, narrow callouts).

### 3.2 Height scale

| Token  | px  | Role                                                   |
|--------|-----|--------------------------------------------------------|
| `xs`   | 24  | Compact chips, tiny badges                             |
| `sm`   | 32  | Small controls (icon button sm)                        |
| `md`   | 40  | Standard control (icon button md)                      |
| `lg`   | 48  | Comfortable tap target / md button                     |
| `xl`   | 56  | Large primary CTA                                      |
| `2xl`  | 64  | Hero / illustration anchor                             |

Heights are paired with `paddingVertical` from spacing tokens. The 4-px-grid rule means no height lands on a non-token value.

### 3.3 Icon sizes

| Token | px | Use                                                 |
|-------|----|-----------------------------------------------------|
| `icon.xs`   | 12  | Inside tiny chips, error code prefix                |
| `icon.sm`   | 16  | Inline with body text, left/right of input          |
| `icon.md`   | 20  | Standard UI icons (header, list, button)            |
| `icon.lg`   | 24  | Prominent icons, card leading                       |
| `icon.xl`   | 32  | Empty-state / error icon                            |
| `icon.2xl`  | 48  | Hero / lock screen anchor                           |
| `icon.3xl`  | 64  | Reserved for fullscreen illustration                |

Icon text gap: `marginRight: 4` (token `1`) is the canonical rule. Pill icon gap is `gap: 6` (within the GlassPill body block). Buttons: `ml: 'sm'` (token `2`) on leftIcon, `mr: 'sm'` on rightIcon.

### 3.4 Avatar sizes

| Token        | px | Use                                                  |
|--------------|----|------------------------------------------------------|
| `avatar.xs`  | 24 | Inline list avatar, compact chat                     |
| `avatar.sm`  | 32 | List row, list item                                  |
| `avatar.md`  | 40 | Card leading, standard avatar                        |
| `avatar.lg`  | 48 | Hero avatar, profile header                          |
| `avatar.xl`  | 64 | Profile screen anchor                                |
| `avatar.2xl` | 96 | Modal / full-screen avatar                           |

Initials font size is **proportional to avatar size**, with the `FONT_SIZE_MAP` ratio of ~`size / 2.4`. Do not override initials size on a per-component basis.

### 3.5 Touch target sizes

| Token                  | px | Use                                                |
|------------------------|----|----------------------------------------------------|
| `touchTarget.min`         | 44 | iOS HIG minimum, Android Material minimum       |
| `touchTarget.comfortable` | 48 | App default; used in buttons md, IconButton lg   |

- All `Pressable` interactive elements must hit `min 44×44`.
- The `IconButton` component hard-codes `sm: 32, md: 40, lg: 48` — the smallest size (`sm`, 32pt) violates the 44pt rule. This is an **acknowledged exception**: the IconButton relies on `hitSlop` to expand its tap area. When wrapping an IconButton inside a list, you **must** add `hitSlop: { top: 6, bottom: 6, left: 6, right: 6 }` (StandardHitSlops.SMALL_ICON) or larger to compensate.
- `TouchTarget` in `MobileOptimizedContainer.tsx` and `getMinTouchTargetStyle()` in `src/utils/touchTarget.ts` are the canonical helpers.

### 3.6 Container widths

| Token          | px   | Use                                                |
|----------------|------|----------------------------------------------------|
| `container.sm` | 640  | Tight form (rarely used; web target)               |
| `container.md` | 768  | Tablet portrait                                    |
| `container.lg` | 1024 | Tablet landscape, small laptop                      |
| `container.xl` | 1280 | Desktop, web                                       |

These exist for responsive breakpoints. Phone content is constrained by `layout.maxContentWidth: 480` in `src/theme/responsive.ts` — the canonical phone content max.

### 3.7 Screen reference dimensions

| Token          | px   | Role                                              |
|----------------|------|---------------------------------------------------|
| `screen.minHeight` | 568  | iPhone SE 1st gen — the lower bound            |
| `screen.small`     | 667  | iPhone SE 2/3, iPhone 8                       |
| `screen.medium`    | 812  | iPhone X-class                                  |
| `screen.large`     | 896  | iPhone XR-class                                 |
| `screen.xlarge`    | 1024 | iPad mini / large phones in landscape          |

`isSmall: height < 700`, `isMedium: 700 ≤ height < 850`, `isLarge: height ≥ 850`. The breakpoints are **height-based** to be the same on portrait phones and small tablets.

---

## 4. Page and container widths

### 4.1 App-level rules

- **AppScreen** (`src/components/primitives/AppScreen.tsx`): default `paddingHorizontal: theme.spacing[4]` (16), `paddingTop: theme.spacing[3]` (12), `paddingBottom: insets.bottom + 112` when `bottomInset: true` (the 112 clears the bottom tab bar).
- **MobileOptimizedContainer**: default `padding: 16` (token `4`). On small screens, `padding = max(padding - 4, 12)` (token `3`). On tablet (`isTablet`), `paddingHorizontal: 32` (token `8`).
- **Login screen** uses `paddingHorizontal: 20` (token `5`) and `paddingTop: insets.top + 16`, `paddingBottom: insets.bottom + 12` — the deliberate "breathable auth" pattern.
- **Feature screen content block max-width**: 320pt (login form pattern). Card grid columns: 2 (phone), up to 3 (tablet).

### 4.2 Content max-width

| Surface                              | Max width |
|--------------------------------------|-----------|
| Login email form block               | 320       |
| Modal content (Modal.tsx)            | `90%` of viewport, max 400 |
| Hero / section content              | `100%` of padded container |
| Inline cards (FlashList items)       | Full container width |
| Profile avatar block                 | `xl` (64) |
| Banner                               | Full width (`fullWidth: true` default) |

Do not invent new max-widths. Use the responsive `width - 24` / `(width - 40) / 2` math from `src/theme/responsive.ts` for dynamic card widths.

### 4.3 Bottom-sheet sizing (`src/theme/responsive.ts`)

| Sheet state  | Height                  |
|--------------|-------------------------|
| `peek`       | 80–120pt (responsive)   |
| `half`       | `Math.round(height * 0.5)` |
| `full`       | `height - 100`          |

---

## 5. Grid rules

### 5.1 The 4-px base grid

- All margin, padding, gap, height, width, and position values are multiples of 4.
- Sub-4 values are forbidden except where icon glyph optical adjustments are required and explicitly commented.

### 5.2 Flexbox conventions

- `flexDirection: 'row'` is the default for `MobileGrid`, `Stack` `direction: 'row'`, and any horizontal control (Banner actions, Avatar + name).
- `flexDirection: 'column'` is the default for `Stack` and `VStack`.
- `gap` (React Native 0.71+) is the canonical way to space flex children. Do **not** mix `gap` and `margin*` on the same axis for siblings.
- Inside `Stack`, the `gap` value resolves to a token (named or numeric). No raw numbers.

### 5.3 Responsive grid columns

| Surface                     | xs (0–320) | sm (320–375) | md (375–414) | lg (414–768) | xl (768+) |
|-----------------------------|------------|--------------|--------------|--------------|-----------|
| Card grid (`gridColumns`)   | 1          | 2            | 2            | 3            | 2 (default)  |
| `MobileGrid` columns (2)    | 2          | 2            | 2            | 2 (tablet bumps to 3) | 2 (4) |
| Modal columns               | 1          | 1            | 1            | 1            | 1 (capped at 400pt) |

### 5.4 MobileGrid inner math

```ts
gap = 12 (token 3)  // default
marginHorizontal: -gap / 2  // gutter compensation
paddingHorizontal: gap / 2   // per-cell gutter
width: ${100 / columns}%     // equal-width cells
```

Tablet: `actualColumns = min(columns + 1, 4)`.

### 5.5 Card grid widths

```
xs (< 320): width - 24
sm (320-375): (width - 40) / 2
md (375-414): (width - 48) / 2
default: 160
```

This is the `cardWidth` formula in `src/theme/responsive.ts`. Re-use it; do not re-derive.

---

## 6. Card and layout spacing

### 6.1 Card (`src/components/primitives/Card.tsx`)

- Sizes (`sm` / `md` / `lg`) are locked: `padding` is `theme.spacing[3]`, `spacing[4]`, `spacing[5]` (12 / 16 / 20), with `borderRadius: 20, 24, 28`. Do not change these.
- Default border is **1px** (white-tinted glass) with **soft drop shadow** tuned per variant. See §10.
- Card has `overflow: 'hidden'` always. Inner content cannot paint outside the radius.
- Interactive cards: `interactive` prop + `onPress` enables `Pressable` mode. Press scale: 0.99; opacity stays at 1, drops to 0.94 on press via `interpolate`. State is `disabled`: opacity 0.62. State `loading`: opacity 0.72. State `error`: 1px danger border. State `success`: 1px mint-500 border.

### 6.2 Card vertical rhythm

A card stack of 3+ cards uses `gap: 3` or `gap: 4` between cards (12 or 16). A list of 5+ cards uses `gap: 3` (12) for density.

### 6.3 Section header → first card gap

`section small: 16`, `medium: 24`, `large: 32`. Default in lists: `section.medium` (24) between section header and first card.

### 6.4 Empty state spacing (EmptyState component)

- Outer container: `paddingHorizontal: theme.spacing[5]`, `paddingVertical: theme.spacing[8]`, `gap: theme.spacing[3]`.
- Icon orb: 72×72 with 36pt border-radius (full circle), 1px border, soft tinted background.
- Title block: `gap: theme.spacing[2]` between title and body, `maxWidth: 320` on the body.

### 6.5 Banner spacing (`src/components/Banner.tsx` + `Banner.config.ts`)

| Size | padding | iconSize | titleSize | descSize | borderRadius |
|------|---------|----------|-----------|----------|--------------|
| `sm` | 12 | 20 | `h4` | `caption` | 8 |
| `md` | 16 | 24 | `h3` | `body` | 12 |
| `lg` | 20 | 32 | `h2` | `body` | 16 |

Internal layout: icon → text (flex 1) → dismiss button. Action row: `flexDirection: 'row'`, `marginTop: 12`, `alignItems: 'center'`, primary action marginRight `8` (token `2`) if secondary exists. Description margin-top: 4 (acknowledged micro value, see §2.3).

### 6.6 Glass card (GlassCard) and glass surfaces

- Inner padding: token `4` (16) default; tokens `5` (20) for hero, `6` (24) for premium.
- Border is always `1px` with a `glassEdge` helper (`rgba(255,255,255,0.15)` on dark; see `src/theme/tokens/elevation.ts`).
- Use `GlassCard` for any surface that reads as frosted material; use `Card` for plain solid glass. Do not stack them.

---

## 7. Form spacing

### 7.1 Vertical rhythm

| Relation                              | Token |
|---------------------------------------|-------|
| Field label → input                   | `mb: 1` (4) |
| Input → helper / error text           | `mt: 1` (4) |
| Between fields                        | `gap: 5` (20) for breathing forms; `gap: 4` (16) for compact |
| Section break (multi-section form)   | `my: 8` (32) |
| Form section title → first field      | `mb: 4` (16) |

### 7.2 Input sizing (`src/components/Input.tsx`)

- Container `minHeight: 52`. Internal `paddingVertical: 14` (acknowledged micro value).
- Horizontal padding inside the input: `paddingLeft/Right: theme.spacing[4]` (16) when no icon. With a side icon, the side-icon wrapper handles the inset.
- Side icon wrapper: `paddingLeft: 12, paddingRight: 8` (left), `paddingLeft: 8, paddingRight: 12` (right). 12 and 8 are `spacing[3]` and `spacing[2]`.
- Border `1px`. Border radius: `theme.borderRadius.xl` (16). Pill-style inputs are allowed via `borderRadius.full`, but only for filter / search contexts.
- Label font weight: 500 (medium) — set via the Text primitive in Input.tsx.
- Helper / error text: `variant: 'caption'` (12/18 + semibold).

### 7.3 Form screen layout

- Use `AppScreen` with `keyboardAvoiding` (default `false`, set `true` on auth / forms) and `scroll: true` for long forms. The Login screen uses `keyboardAvoiding={true}`.
- The keyboard-avoiding pattern wraps the scrollable in `KeyboardAvoidingView` with `behavior: 'padding'` on iOS and `'height'` on Android.
- Submit button: `mt: 6` (24) above the next section, full width on phone. On tablet, full width capped to `container.lg` (1024) with the button left-aligned to the form column.
- Forgot / alternate-action link: `mt: 4` (16) below submit, `textAlign: 'center'`, font 14pt with `textDecorationLine: 'underline'` on the link portion.

### 7.4 Form validation timing

- Inline validation clears on edit (Login screen does this for `email` and `password` via `setErrors` callbacks).
- Server errors render as a `Banner` (`variant: 'error'`, `size: 'sm'`) above the form.
- Field-level errors render inside the input's helper slot (caption weight, error color).

### 7.5 Form button stacking on small screens

On `isSmallScreen` (height < 700), the primary submit shrinks to `size: 'lg'` (56pt height) and stays full width. Secondary actions collapse to ghost-link style, not a stacked button group, to preserve vertical space.

---

## 8. Button and input sizing

### 8.1 Button variants and sizes (`src/components/primitives/Button.tsx` + `button-styles.ts`)

| Variant    | When to use                                          | Background                | Border (1px)                  | Shadow         |
|------------|------------------------------------------------------|---------------------------|-------------------------------|----------------|
| `primary`  | The screen's one main action                         | mint 500 / 600 (pressed)  | white 0.55                     | 0/12, opacity 0.30, radius 20, elev 8 |
| `secondary`| Default non-primary action                           | white 0.62 / 0.78         | white 0.85                     | rgba(13,76,65,0.20) 0/6/0.20/14, elev 3 |
| `outline`  | Secondary action on a busy surface                   | white 0.62 / mint 0.18    | mint 0.55                      | none            |
| `ghost`    | Tertiary, escape, or quiet action                    | transparent / white 0.42  | white 0.6                      | none            |
| `danger`   | Destructive confirmations only                       | semantic.danger           | white 0.55                     | 0/8, opacity 0.32, radius 18, elev 6 |
| `premium`  | Paywall / upsell — bright accent                     | premium gradient          | white 0.55                     | per premium token, vibrant |

Rules:

- One screen, one primary. Never two primaries on the same surface.
- Border-radius is `999` (full pill) on every variant. No rectangular buttons exist in VEX.
- All buttons render inside an `Animated.View` that scales 0.97 on press with the `tactile` spring. The component short-circuits the scale on `useReducedMotion`.
- Disabled state: opacity 0.62.
- Pressed state: opacity 0.9 (variant background also shifts to the pressed token).

### 8.2 Button sizes

| Size   | py   | px   | minHeight | fontSize | text weight |
|--------|------|------|-----------|----------|-------------|
| `sm`   | 8    | 12   | 44        | 14       | 700         |
| `small`| 8    | 12   | 44        | 14       | 700         |
| `md`   | 12   | 20   | 48        | 16       | 700         |
| `lg`   | 16   | 24   | 56        | 17       | 700         |

The 44pt minimum height on `sm` matches the touch target floor. Use `md` for product primary actions on phone. Use `lg` for hero / launch CTAs. Use `sm` only in dense lists, banners, and inline actions.

`size: 'small'` is an alias for `'sm'`. New code should use `'sm'`.

### 8.3 Button text

- One verb + object. "Save changes", "Start focus", "Send invite", "Create your focus system". Never "OK", "Submit", "Yes", "Click here".
- 700 weight (semibold-equivalent in `fontWeights.semibold` rendered as `fontWeight: '700'`) on every variant. The Button component overrides to `'700'` regardless of theme.
- Letter-spacing 0.4 from `ui.button`.
- Button text + side icon: `ml: 'sm'` / `mr: 'sm'`. Loading state replaces icon with `ActivityIndicator` (no text + spinner at the same time).

### 8.4 Icon-only button (`src/components/IconButton.tsx`)

| Size  | Box  | Icon | Background                |
|-------|------|------|---------------------------|
| `sm`  | 32   | 16   | `surface.button`          |
| `md`  | 40   | 20   | `surface.button`          |
| `lg`  | 48   | 24   | `surface.button`          |

- Variants: `default`, `primary`, `ghost`. Primary swaps background to `semantic.primary`; ghost is transparent.
- `borderRadius: 8` (token `md`).
- Pressed: opacity 0.7.
- Accessibility: every IconButton sets `accessibilityLabel` (falls back to icon), `accessibilityRole: 'button'`, `accessibilityHint: 'Activates {icon} action'`. Hit slop: pass `hitSlop` explicitly when the size is below 44.

### 8.5 Input sizing

Already documented in §7.2. The cross-cutting rules:

- min-height 52pt on phone, scales to 56 on tablet.
- Border-radius 16 (xl). Pill inputs (radius.full) are allowed for search only.
- Always one `accessibilityLabel` (falls back to `label`).
- Max length defaults to 500 — extend per-field if the product needs more (e.g. bio 280, journal 5000).

### 8.6 Liquid button / VEX launch button

Reserved for launch surfaces (Landing, Onboarding, Paywall). Use `LiquidButton` for the animated glass CTA, `VexLaunchButton` for the premium gradient CTA. Do not substitute `Button` on these surfaces.

---

## 9. Modal and dialog layout rules

### 9.1 Modal (`src/components/overlays/Modal.tsx`)

- **Container**: `position: 'absolute'`, fills the screen, `zIndex: 1000`.
- **Backdrop**: covers full screen, `rgba(0,0,0,0.5)`. Tap to dismiss by default (`closeOnBackdropPress: true`). Backdrop has `accessibilityLabel: 'Close modal backdrop'` and `accessibilityRole: 'button'`.
- **Content panel**: `width: '90%'`, `maxWidth: 400`, `maxHeight: '80%'`, `borderRadius: theme.borderRadius.lg` (12), `boxShadow: iosShadows.sm`, `elevation: 5`. `overflow: 'hidden'` is implicit through the border radius.
- **Header**: `paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8`. Title is rendered through `Text` `variant: 'h3'`. Close button on the right.
- **Body**: `padding: 16`.
- **Footer**: `padding: 16`, `borderTopWidth: 1`, `borderTopColor: rgba(0,0,0,0.1)`.
- **Animation**: 3 options — `fade`, `scale`, `slide`. Slide is the default. `useModalAnimation` runs:
  - Backdrop: opacity 0→1 in 200ms.
  - Slide: translateY 500→0 with `withSpring({ damping: 25, stiffness: 300 })`.
  - Scale: 0.9→1 with `withSpring({ damping: 20, stiffness: 200 })`.
  - Close: opacity to 0 in 150ms, transform to start state in 200ms.
  - Reduced motion: snaps to start/end without transition.
- **Back button**: `closeOnBackButton: true` registers a `BackHandler` on Android, calls `onClose` and returns `true` (consumes the back press).
- **Accessibility**: content panel has `accessibilityRole: 'alert'` and `accessibilityLabel: accessibilityLabel ?? title ?? 'Modal dialog'`.

### 9.2 Bottom sheet

Three snap points (`src/theme/responsive.ts`): `peek: 80–120`, `half: 0.5 × height`, `full: height - 100`. Sheet content uses `borderTopLeftRadius: 24, borderTopRightRadius: 24` (token `2xl`). Drag handle: 36pt wide, 4pt tall, centered, 8pt from the top edge.

### 9.3 Toast (`src/components/overlays/Toast.tsx`)

- Position: `top: 0` with `translateY: 60` final, or `bottom: 100` with `translateY: -60` final, or `center` with `translateY: 0`.
- Padding: `paddingHorizontal: 16, paddingVertical: 12`.
- Border: `1px` semantic color border, `borderRadius: theme.borderRadius.lg` (12).
- Default `zIndex: 2000`. (`zIndex.toast = 800` is the underlying scale; the runtime zIndex is 2000 for visual safety above modals.)
- Animation: opacity 0→1 in 200ms, scale 0.8→1 with spring `{ damping: 20, stiffness: 300 }`, `translateY` lands at `±60` from edge.
- Hide: opacity → 0 in 150ms, scale → 0.8 in 150ms, then onHide callback.
- Reduced motion: snaps with no transition.
- Accessibility: `accessibilityLiveRegion: 'polite'`, `accessibilityLabel: accessibilityLabel ?? message`.
- `duration: 3000` default; respects `extendedTimeouts` accessibility preference.

### 9.4 Inline notifications / banner

- Use `Banner` for in-flow notices. Top-of-screen or above-form placement.
- `dismiss` is a `Pressable` (not a Button) with `accessibilityLabel: 'Dismiss {title}'` and `accessibilityHint: 'Double tap to dismiss'`. Pressed: opacity 0.7.

### 9.5 StreakInsuranceModal (and other long-form modals)

- Use `Footer` for the CTA row. Pad footer with `gap: 4` (16) between buttons. Primary on the right (VEX primary placement), secondary on the left, danger / cancel on the far left when present.
- Footer CTA height: 48 (md).

---

## 10. Depth (shadow + elevation)

### 10.1 The 5-tier depth system (`src/theme/tokens/elevation.ts`)

| Tier       | iOS shadow                                                | Android `elevation` | Use                                  |
|------------|-----------------------------------------------------------|---------------------|--------------------------------------|
| `flat`     | 0/0/0, opacity 0                                          | 0                   | Resting list rows, baseline ground   |
| `resting`  | 0/4, opacity 0.18, radius 12                              | 3                   | Default cards                        |
| `raised`   | 0/10, opacity 0.26, radius 22                             | 6                   | Interactive / selected cards         |
| `floating` | 0/18, opacity 0.34, radius 34                             | 12                  | Sheets, modals, hero surfaces        |
| `lifted`   | 0/24, opacity 0.42, radius 44                             | 16                  | Primary CTA cluster, peak emphasis   |

Rules:

- One tier per surface. Never stack tiers.
- The base shadow color is `#000000`. Colored shadows are reserved for the `glow()` helper (see §10.3).

### 10.2 Glass edge (1px inner highlight)

```ts
export const glassEdge = {
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.15)',
};
```

Every frosted-glass surface that does not have an authored color border uses `glassEdge`. The 1px rim is what makes glass read as frosted material rather than blurred rectangle.

### 10.3 Glow (`elevation.ts → glow(color, tier)`)

| Tier      | shadowColor | offset  | opacity | radius | elev |
|-----------|-------------|---------|---------|--------|------|
| `whisper` | input color | 0/0     | 0.28    | 16     | 4    |
| `soft`    | input color | 0/8     | 0.50    | 24     | 9    |
| `vivid`   | input color | 0/0     | 0.70    | 32     | 14   |

- `whisper` for resting companion aura, idle CTA halo.
- `soft` for active CTA, focused surface.
- `vivid` for perfect focus, level-up payoff, peak moments.

Glow is layered on top of a depth tier, never used in place of one. The colored shadow must come from the same accent that drives the surface (mint, violet, orange, etc.), not an arbitrary color.

### 10.4 Card variant shadows (`Card.styles.ts`)

| Variant         | iOS (offset / opacity / radius)         | elev | Bg            | Border                          |
|-----------------|-----------------------------------------|------|---------------|---------------------------------|
| `default`       | 0/12, 0.85, 22                          | 5    | white 0.58    | white 0.74, 1px                  |
| `lightGlass`    | 0/12, 0.85, 22                          | 5    | white 0.58    | white 0.74, 1px                  |
| `elevated`      | 0/16, 0.20, 28                          | 8    | white 0.76    | white 0.84, 1px                  |
| `lightHero`     | 0/20, 0.85, 36                          | 10   | white 0.66    | white 0.78, 1px (mint 700 glow)  |
| `lightSelected` | 0/14, 0.85, 26                          | 8    | white 0.78    | mint 400, 1.4px (mint 500 glow)   |
| `lightSuccess`  | 0/12, 0.85, 22                          | 6    | white 0.62    | mint 0.45, 1px (mint 500 glow)   |
| `outlined`      | none                                    | 0    | transparent   | rgba(13,76,65,0.18), 1px         |
| `ghost`         | none                                    | 0    | transparent   | none                              |
| `glass`         | 0/12, 0.85, 22                          | 5    | white 0.58    | white 0.74, 1px                  |
| `premium`       | 0/16, 0.85, 28                          | 10   | white 0.78    | mint 0.7, 1.2px (mint 600 glow)  |

### 10.5 Button shadow

Already in §8.1. The Button primitive has hand-tuned per-variant shadows; do not add a generic `shadow` to a Button. Use the variant.

### 10.6 Modal shadow

`boxShadow: iosShadows.sm`, `elevation: 5` — the iOS token in `src/theme/tokens/shadows.ts`. Modal sits at depth `floating` on Android (12) and at iOS `sm` box-shadow. There is no `floating` token applied to the Modal component itself; the `boxShadow: iosShadows.sm` plus `elevation: 5` is the authored combination. The `depth.floating` token is available for hero/sheet surfaces that need a deeper drop.

### 10.7 iOS shadow tokens (`src/theme/tokens/shadows.ts → iosShadows`)

| Token  | Value                                                                  |
|--------|------------------------------------------------------------------------|
| `none` | 0                                                                     |
| `xs`   | 0 1 2 rgba(0,0,0,0.05)                                                |
| `sm`   | 0 1 3 rgba(0,0,0,0.10), 0 1 2 rgba(0,0,0,0.06)                       |
| `DEFAULT` | 0 4 6 rgba(0,0,0,0.10), 0 2 4 rgba(0,0,0,0.06)                     |
| `md`   | 0 6 12 rgba(0,0,0,0.10), 0 4 6 rgba(0,0,0,0.05)                      |
| `lg`   | 0 10 20 rgba(0,0,0,0.15), 0 6 8 rgba(0,0,0,0.10)                     |
| `xl`   | 0 20 40 rgba(0,0,0,0.20), 0 10 15 rgba(0,0,0,0.10)                   |
| `2xl`  | 0 25 50 rgba(0,0,0,0.25), 0 15 25 rgba(0,0,0,0.15)                   |
| `inner`| inset 0 2 4 rgba(0,0,0,0.06)                                          |

`androidElevation` mirrors these in DP: `none: 0, xs: 1, sm: 2, DEFAULT: 4, md: 6, lg: 8, xl: 12, 2xl: 16`. Use these directly; do not roll your own.

### 10.8 Brand shadow colors

```ts
brandShadowTokens = {
  primary: { color: '#A66BFF', radius: 20 },  // violet
  accent:  { color: '#FF8A24', radius: 14 },  // orange
  glass:   { color: '#FFFFFF', radius: 36 },
}
```

Use for `glow()` calls when the surface accent is one of the brand hues. Do not reach for these from non-glow contexts.

---

## 11. Z-index and layer order

Source: `src/theme/tokens/zIndex.ts`. Numeric values for RN:

| Layer        | Value | Used by                          |
|--------------|-------|----------------------------------|
| `auto`       | —     | default                          |
| `base`       | 0     | baseline                         |
| `dropdown`   | 100   | menus, selects                   |
| `sticky`     | 200   | tab bar, header                  |
| `fixed`      | 300   | persistent controls              |
| `modalBackdrop` | 400 | Modal backdrop                  |
| `modal`      | 500   | Modal, bottom sheet, dialog      |
| `popover`    | 600   | popovers                         |
| `tooltip`    | 700   | tooltips                         |
| `toast`      | 800   | toasts, notifications            |

Rules:

- The Modal component uses `zIndex: 1000` directly, not the token. This is a deliberate override — modals must always clear the rest. The token table is for code that uses `getZIndex()`.
- The Toast component uses `zIndex: 2000` in its style for the same reason (toasts must clear modals).
- `componentZIndex` is the named alias table. Use the named token when possible, the raw number only when overriding defaults.

---

## 12. Border radius

Source: `src/theme/tokens/radius.ts`. The scale:

| Token    | px | Use                                                     |
|----------|----|---------------------------------------------------------|
| `none`   | 0  | square edges (rare)                                     |
| `xs`     | 2  | micro roundings                                         |
| `sm`     | 4  | small chips, tag                                        |
| `DEFAULT`| 6  | small button default                                    |
| `md`     | 8  | badge md, IconButton default                            |
| `lg`     | 12 | Banner md, Modal, Toast                                 |
| `xl`     | 16 | Input default, large card md                            |
| `2xl`    | 24 | Banner lg, Bottom sheet top                             |
| `3xl`    | 32 | Hero glass                                              |
| `full`   | 9999 | Button (all), pill, avatar circle                     |

Component-specific mappings:

```
button:    sm 4 / default 8 / lg 12 / full 9999
input:     default 8 / pill full
card:      sm 8 / default 12 / lg 16
modal:     default 16 / top 24
badge:     default 4 / pill full
avatar:    default full / rounded 12 / square 4
```

Rules:

- **All buttons are full pill (`9999`)**. This is non-negotiable. If a rectangular button is required, it is a different control (use `Pressable` inside a `Card`).
- Card radius follows the size scale: `sm: 20, md: 24, lg: 28` (per `Card.styles.ts`). These supersede the token scale for the Card component and are the canonical Card radii.
- Banner radius follows the size scale: `sm: 8, md: 12, lg: 16`.
- Inner radius must be smaller than outer radius. Never use the same radius on a parent and a directly nested child.

---

## 13. Motion

### 13.1 Two motion systems

The codebase ships **two motion token sets**. New code must use the newer set (`src/theme/tokens/motion.ts`). The legacy set in `src/theme/tokens/timing.ts` remains for backwards compatibility — do not add new call sites to it.

#### New motion set (preferred) — `motion.ts`

Spring presets (Reanimated 4.3.1):

| Preset    | damping | stiffness | mass | Use                                                    |
|-----------|---------|-----------|------|--------------------------------------------------------|
| `tactile` | 18      | 420       | 1    | Button press, card press, instant control feedback     |
| `settle`  | 16      | 180       | 1    | Standard entrance, gentle arrival                      |
| `lively`  | 11      | 240       | 1    | Rewards, celebrations, level-ups                       |
| `calm`    | 22      | 90        | 1.1  | Ambient / focus surfaces, slow drift                   |
| `precise` | 30      | 360       | 1    | Toggles, selection commits (no overshoot)             |

Timing presets (cubic bezier):

| Preset           | duration (ms) | easing                       | Use                                  |
|------------------|---------------|------------------------------|--------------------------------------|
| `microFade`      | 160           | [0.4, 0, 0.2, 1]             | Chip / label state changes            |
| `enter`          | 320           | [0.22, 1, 0.36, 1]           | Standard surface / card entrance      |
| `cinematicReveal`| 620           | [0.16, 1, 0.3, 1]            | Staged hero / completion reveals      |
| `breath`         | 2600          | [0.37, 0, 0.63, 1]           | One half-cycle of ambient breathing   |
| `dramatic`       | 820           | [0.16, 1, 0.3, 1]            | Grade / payoff flourish               |

Stagger steps:

| Step     | delay (ms) |
|----------|------------|
| `tight`  | 40         |
| `normal` | 64         |
| `loose`  | 96         |

Ambient loop durations:

| Loop         | duration (ms) |
|--------------|---------------|
| `breathing`  | 5200          |
| `drift`      | 11000         |
| `shimmer`    | 2400          |

#### Legacy motion set — `timing.ts` (do not extend)

Animation durations: `instant: 0, fast: 150, normal: 300, slow: 500, verySlow: 800`. Delays: `none: 0, short: 100, medium: 250, long: 500`. Spring configs: `default { 100/10/1 }, gentle { 120/14/1 }, bouncy { 400/10/1 }, stiff { 300/30/1 }, slow { 50/20/2 }`. Stagger delays: `fast 30, normal 50, slow 100`.

> Migration target: any new screen or component imports from `motion.ts` only. When touching a screen that uses `timing.ts` tokens, port the call site to `motion.ts` in the same change.

### 13.2 Motion vocabulary rules

- Animate `transform` and `opacity` only. Anything else triggers layout.
- Press feedback: `scale(0.97)` for buttons (`Button.tsx`), `scale(0.99)` for cards (`Card.tsx`). Card also dims to opacity 0.94 on press.
- Entrance default: `enter` (320ms) or `settle` (spring). Hero / launch: `cinematicReveal` (620ms).
- Stagger with `motionStagger.normal` (64ms) for list / grid entry. Add ±5ms jitter for "alive" feel; uniform delays read as robotic.
- Exit: ~70% of entrance duration. Leaving feels faster than arriving.
- Reduced motion: snap to start/end. Every animated component reads `useReducedMotion()` and short-circuits transforms to `1` / `0`. Never animate despite the preference.
- Modal close: opacity 150ms, transform 200ms.
- Toast show: opacity 200ms, transform spring, translateY lands at ±60.
- FocusRing progress arc: `withTiming(clamped, { duration: 900, easing: Easing.out(Easing.cubic) })`. Reduced motion: snap to final.

### 13.3 What motion is forbidden

- No animated layout properties (no `width`, `height`, `margin`, `padding` animation). Use `transform: scaleY` or `transform: scaleX` for size morphs.
- No `rotateY` / `rotateX` without a clear purpose.
- No animating from `scale(0)`. Always use intermediate scale (~0.95) with opacity.
- No page-load ceremony on product surfaces. AppScreen, FeatureScreen, MobileOptimizedContainer should appear ready to use.
- No infinite animation near reading content.
- No motion that conveys information exclusively (no audio-less "look here" only motion). State changes must be observable without motion.

---

## 14. Responsive breakpoints

Source: `src/theme/responsive.ts` and `src/theme/createTheme.ts`.

### 14.1 Breakpoints

| Token | px   | Use                                                |
|-------|------|----------------------------------------------------|
| `xs`  | 0    | Out of range, fallback                             |
| `sm`  | 320  | iPhone SE                                          |
| `md`  | 375  | Standard iPhone                                    |
| `lg`  | 414  | Large iPhone (XR, Plus, Pro Max)                   |
| `xl`  | 768  | iPad portrait, large phones in landscape           |
| `2xl` | 1024 | iPad landscape, small laptop                       |

Height-based flags:

- `isSmall: height < 700` — compact UI, tighter padding
- `isMedium: 700 ≤ height < 850` — standard
- `isLarge: height ≥ 850` — generous
- `isTablet: width > 768`
- `isLandscape: width > height`

The `responsive()` helper is the only supported way to read a breakpoint. Do not use `Dimensions.get('window')` directly in component bodies; use `useWindowDimensions()` and the `useResponsiveLayout()` hook from `MobileOptimizedContainer.helpers.ts`.

### 14.2 Spacing scale adapts to width

| Token        | xs (≤ 320) | sm (320+) | md (375+) | default |
|--------------|------------|-----------|-----------|---------|
| `xs`         | 4          | 4         | 4         | 4       |
| `sm`         | 6          | 8         | 8         | 8       |
| `md`         | 10         | 12        | 16        | 16      |
| `lg`         | 14         | 16        | 24        | 24      |
| `xl`         | 20         | 24        | 32        | 32      |
| `2xl`        | 28         | 32        | 48        | 48      |
| `screenEdge` | 12         | 16        | 20        | 24      |
| `section`    | 20         | 24        | 32        | 40      |
| `card`       | 12         | 16        | 20        | 24      |

The screen-edge scale preserves content margin on small screens without overflow.

### 14.3 Type scale adapts to width

| Variant  | xs     | sm     | md     | default |
|----------|--------|--------|--------|---------|
| `h1`     | 28/32  | 30/36  | 32/40  | 36/44   |
| `h2`     | 22/26  | 24/28  | 26/30  | 28/32   |
| `h3`     | 18/22  | 20/24  | 22/26  | 24/28   |
| `h4`     | 15/19  | 16/20  | 18/22  | 20/24   |
| `body`   | 14/20  | 14/20  | 16/24  | 16/24   |
| `caption`| 11/14  | 12/16  | 13/18  | 14/18   |

Note: the `responsive.ts` type scale differs in number-set from `typography.ts`. The `typography.ts` scale is the **canonical token set**; the `responsive.ts` overrides are the **runtime values** used by `MobileOptimizedContainer`. They are not in conflict — the responsive override is a phone-specific condensation. On tablet, the typography.ts scale is the one rendered.

### 14.4 Layout max-widths (responsive)

| Surface           | Value                                     |
|-------------------|-------------------------------------------|
| `maxContentWidth` | 480                                       |
| `gridColumns`     | 1 / 2 / 2 / 3 / 2 across xs / sm / md / lg / default |
| `cardWidth`       | `width - 24`, `(width - 40) / 2`, `(width - 48) / 2`, `160` |
| `bottomSheet.peek` | 80 / 90 / 100 / 120                      |
| `bottomSheet.half` | `height * 0.5`                          |
| `bottomSheet.full` | `height - 100`                          |

### 14.5 Small-screen adjustments

When `isSmallScreen` (`height < 700`):
- `MobileOptimizedContainer.padding = max(padding - 4, 12)` (token `3`).
- `getResponsiveFontSize(baseSize, true, false)` multiplies by 0.9.
- Touch targets stay 44 (do not shrink).

When `isTablet`:
- `paddingHorizontal: 32` (token `8`).
- `MobileGrid` adds one column (capped at 4).
- `getResponsiveFontSize(baseSize, false, true)` multiplies by 1.1.

### 14.6 Safe areas

- All fixed bottom controls (tab bar, primary FAB, persistent CTA) MUST account for `insets.bottom`. AppScreen uses `paddingBottom: insets.bottom + 112` for the bottom tab bar clearance.
- Login / auth use `paddingTop: insets.top + 16`, `paddingBottom: insets.bottom + 12`.
- Status bar: `expo-status-bar` with `style: 'dark'` (VEX light theme is the default; dark mode flips to `light`).

---

## 15. Accessibility rules

### 15.1 Touch targets (mandatory)

- Every interactive element: **min 44×44** physical hit area.
- `src/utils/touchTarget.ts → MIN_TOUCH_TARGET = 44` is the constant.
- Helpers: `calculateHitSlop`, `getMinTouchTargetStyle`, `getTouchTargetProps`, `auditTouchTarget` (dev-only audit).
- Standard hit-slops:
  - `ICON: { top: 10, bottom: 10, left: 10, right: 10 }`
  - `SMALL_ICON: { top: 6, bottom: 6, left: 6, right: 6 }`
  - `TEXT_BUTTON: { top: 8, bottom: 8, left: 12, right: 12 }`
  - `LINK: { top: 12, bottom: 12, left: 8, right: 8 }`
- IconButton below 44pt: pass `hitSlop` from the helper. Do not rely on the visual size.

### 15.2 Accessibility labels, roles, hints (mandatory)

- Every `Pressable`, `Button`, `IconButton`, `TouchableWithoutFeedback` MUST set:
  - `accessibilityLabel` (string).
  - `accessibilityRole` (`'button'` for pressables, `'link'` for navigation, `'alert'` for modals).
  - `accessibilityHint` (action verb + outcome: "Activates X", "Double tap to dismiss").
- Text inputs MUST set `accessibilityLabel` (Input component falls back to `label`).
- Icons that are decorative (purely visual) MUST have `accessibilityElementsHidden` and `importantForAccessibility: 'no'`. Icons that convey meaning MUST have a label on the parent.
- Disabled state on Button: `accessibilityState: { disabled: true, busy: isLoading }`.

### 15.3 Live regions

- `Toast` uses `accessibilityLiveRegion: 'polite'`.
- Loading states (`accessibilityRole: 'progressbar'`) announce on appearance.
- `EmptyState` reads as `accessibilityRole: 'text'` with combined `accessibilityLabel: title + body`.

### 15.4 Focus management

- `src/accessibility/focus.ts` provides register / unregister / next / previous for focusable elements.
- `useFocusManagement` in `src/accessibility/focusManagement.ts` for component-level focus traps (modal, drawer, sheet).
- Focus is restored to the trigger element on modal close. The Modal component closes on backdrop press; restoration is the caller's responsibility.

### 15.5 Color contrast

- Minimum contrast ratio: **4.5:1** (WCAG AA for body text).
- Source: `src/accessibility/wcag.ts` (WCAG 2.1 AA guidelines reference table), `src/accessibility/contrastUtils.ts` (ratio computation), `src/accessibility/contrast.ts` (convenience).
- `highContrast` mode in `createTheme('light' | 'dark', highContrast: true)` boosts foreground/background contrast; preserve semantic color roles.

### 15.6 Reduced motion

- Read from `useReducedMotion()` (Reanimated). Default to animating; when the preference is true, **snap to start/end with no transition**.
- All animated primitives in the codebase honor this: Button, Card, Modal, Toast, Skeleton, FocusRing, BreathingGlow.

### 15.7 Screen reader optimization

- `accessibilityRole` is set explicitly. Default to `'button'` on pressables, `'text'` on information blocks, `'alert'` on modals, `'progressbar'` on loading.
- `accessibilityLabel` reads as natural language. Not a code. "Daily goal progress 25 minutes, 47 percent" (FocusRing pattern), not "progress 47".
- `accessibilityHint` is the consequence of the action, not the action itself: "Activates Send invite" not "Tap to send".

### 15.8 WCAG 2.1 AA checklist (in scope for VEX)

VEX targets WCAG 2.1 AA. The full reference table lives in `src/accessibility/wcag.ts`. The items the design system enforces directly:

| Guideline  | VEX behavior                                                                |
|------------|------------------------------------------------------------------------------|
| 1.3.1 Adaptable | Semantic structure preserved; all text exposed via Text primitive        |
| 1.4.3 Contrast  | 4.5:1 minimum on text; highContrast mode available                       |
| 1.4.11 Non-text contrast | UI controls and borders meet 3:1 via glassEdge + border tokens     |
| 2.1.1 Keyboard  | Tab order follows render order; no keyboard traps                       |
| 2.4.7 Focus visible | 2–3px focus rings required; never `outline: none` without replacement |
| 2.5.5 Target size | 44×44 minimum on all interactive surfaces                              |
| 3.2.1 On focus  | No context change on focus alone                                          |
| 3.3.1 Error identification | Errors render in helper slot with color + text                  |
| 3.3.2 Labels    | Every input has a visible label and accessibilityLabel                    |
| 4.1.2 Name, role, value | Every component declares role, label, value, state              |

### 15.9 Color-blind support

- `src/accessibility/color-blind.ts` + `colorBlindPalettes.ts` provide simulation palettes (protanopia, deuteranopia, tritanopia, achromatopsia).
- Color is never the sole carrier of state. Icon, text, and pattern are paired with color (success ✓, warning ⚠, error ✕).
- The `colorBlindMode` preference in `AccessibilityPreferences` flips state to pattern-only when set.

### 15.10 Accessibility preferences (per user)

`src/accessibility/types.ts → AccessibilityPreferences`:

- `screenReaderOptimized`, `announcementsEnabled`, `reducedMotion`, `animationsEnabled`, `highContrast`, `colorBlindMode`, `textScale`, `boldText`, `simplifiedUI`, `extendedTimeouts`, `switchControl`, `voiceControl`.

The `textScale` preference multiplies font sizes at render. The `getResponsiveFontSize` helper accepts `(baseSize, isSmallScreen, isTablet)`. Components must not bypass the system font scale.

---

## 16. Component consistency rules

### 16.1 The primitive set (the only legal building blocks)

| Concern            | Component                                            |
|--------------------|------------------------------------------------------|
| Layout root        | `Box`                                                |
| Stack              | `Stack` / `VStack` / `HStack` / `Center`             |
| Text               | `Text` (variant or inline props only)                |
| App screen         | `AppScreen` (or `MobileOptimizedContainer` legacy)   |
| Feature screen     | `FeatureScreen` (title + loading + error + content)  |
| Button             | `Button` (and `LiquidButton` / `VexLaunchButton` for special CTAs) |
| Icon button        | `IconButton`                                         |
| Input              | `Input`                                              |
| Card               | `Card` (variants per `Card.styles.ts`)                |
| Glass card         | `GlassCard` / `GlassSurface`                         |
| Glass pill         | `GlassPill`                                          |
| Banner             | `Banner`                                             |
| Modal              | `Modal`                                              |
| Toast              | `Toast`                                              |
| Avatar             | `Avatar`                                             |
| Badge              | `Badge` (and `PremiumBadge`, `SupporterBadge`)       |
| Divider            | `Divider`                                            |
| Icon               | `Icon`                                               |
| Loading            | `Loading` / `LoadingState` / `Skeleton`              |
| Empty              | `EmptyState`                                         |
| Error              | `ErrorState`                                         |
| Progress           | `ProgressBar` / `LiquidProgressBar` / `GlassProgressBar` / `CircularProgress` |
| Step indicator     | `StepIndicator`                                      |

Rules:

- Do not create a new component in this list's domain. Extend the existing primitive.
- Variants (size, color, state) belong on the primitive, not as a new component.
- The AGENTS.md file is the structural authority; this document is the design authority. They agree.

### 16.2 State coverage matrix

| Component   | idle | hover | active/pressed | focused | loading | empty | error | success | disabled |
|-------------|------|-------|----------------|---------|---------|-------|-------|---------|----------|
| Button      | ✓    | ✓ (Press) | ✓ (Press: scale 0.97, opacity 0.9) | via system | ✓ (ActivityIndicator) | n/a   | inline via Banner | inline | ✓ opacity 0.62 |
| Card        | ✓    | n/a   | ✓ (scale 0.99, opacity 0.94) | via system | ✓ (opacity 0.72) | n/a | ✓ danger border | ✓ mint border | ✓ opacity 0.62 |
| Input       | ✓    | n/a   | n/a | ✓ (border semantic.primary) | n/a | n/a | ✓ border + caption error | n/a | n/a |
| Banner      | ✓    | n/a   | ✓ (Press opacity 0.7 on dismiss) | via system | n/a | n/a | ✓ variant error | ✓ variant success | n/a |
| Modal       | ✓    | n/a   | ✓ (close on backdrop) | traps focus | n/a | n/a | n/a | n/a | n/a |
| Toast       | ✓    | n/a   | n/a | n/a | n/a | n/a | ✓ variant error | ✓ variant success | n/a |
| Avatar      | ✓    | n/a   | ✓ (Press opacity 0.8) | via system | n/a | n/a | n/a | n/a | n/a |
| IconButton  | ✓    | n/a   | ✓ (Press opacity 0.7) | via system | n/a | n/a | n/a | n/a | n/a |
| Badge       | ✓    | n/a   | ✓ (Press opacity 0.8) | via system | n/a | n/a | ✓ variant error | ✓ variant success | ✓ opacity 0.5 |

Hover is n/a on touch surfaces — visual hover state is only used on web. On touch, press feedback is the equivalent.

### 16.3 Form consistency

- Use the `Input` primitive. No custom text inputs.
- Use the `Button` primitive for submit. No `Pressable + Text` outside the Button / IconButton / Banner dismiss patterns.
- Use the `Banner` for top-of-form errors.
- Field labels are always visible (no placeholder-as-label).
- Helper text and errors share the same slot (caption weight, color flip).
- Validation: clear on edit; server errors via banner; required field is not marked with color alone (an asterisk + a label legend are required if a required indicator is shown).

### 16.4 List consistency

- All lists are `FlashList` (not `FlatList`), per AGENTS.md.
- `estimatedItemSize` MUST be set to the actual item height. No magic numbers.
- Skeleton loading state for every list (the `Skeleton` primitive or `SkeletonList`).
- Empty state for every list (`EmptyState` primitive, 320pt body max-width).
- Error state for every list (`ErrorState` primitive, `onRetry` always present when a refetch is possible).

### 16.5 Card consistency

- Use `Card` for solid (default / elevated / outlined / premium / etc.).
- Use `GlassCard` for frosted glass.
- Use `GlassPill` for chip-style tags.
- Do not stack cards. If a card carries another card inside it, flatten with type, dividers, or padding.
- Press scale on interactive cards is 0.99 (not 0.97). Cards are not buttons.

### 16.6 Iconography consistency

- All icons come from the registry in `src/icons/components/Icon`. No emoji or inline SVG outside that registry.
- Icon size is the token (`xs` 12, `sm` 16, `md` 20, `lg` 24, `xl` 32, `2xl` 48, `3xl` 64).
- Icon color is a token: `theme.colors.text.primary`, `text.secondary`, `text.tertiary`, `text.placeholder`, or a semantic role. Never a literal hex.
- Outline icons are used for empty / error / quiet states; filled icons are used for selected / active / positive states.

### 16.7 Text inside surfaces

- All text comes from the `Text` primitive. No bare `<Text>` (AGENTS.md).
- All copy is sentence case. No Title Case in body or labels (display / launch headlines can be Title Case if authored in a script).
- No exclamation points. "Save changes" not "Save changes!".
- Loading copy names the work: "Syncing sessions", "Uploading reflection", "Loading your focus history". Never "Loading...".

### 16.8 Empty / error / loading

- Loading: skeleton (not a spinner alone) matching the layout. Per AGENTS.md.
- Error: `ErrorState` with title, description, optional `errorCode`, retry, optional degraded-mode action.
- Empty: `EmptyState` with icon orb (72×72 circular, themed), title (h4, 800), body (bodySmall, max 320), optional CTA.
- Success / completion: inline confirmation (Banner variant success, or `Toast`), not a separate screen.

### 16.9 Modal vs screen rule

- Modals are for short decisions and confirmations.
- Long forms get a screen.
- Information gets inline disclosure.
- Success gets a toast.
- Destructive, legal, financial, or irreversible moments can earn a dialog.
- If the modal needs a scroll for primary content, it should be a screen.

### 16.10 Haptics

- All haptics go through `src/utils/haptics.ts` named functions.
- Significant actions (session start, completion, level up, achievement) trigger the right named haptic.
- Haptic on Button: `haptic: 'none' | 'light' | 'medium' | 'success' | 'warning'`. Default `'medium'`. Set `'none'` to disable for the call.

---

## 17. Composition patterns

### 17.1 The feature screen pattern

Use `FeatureScreen` for any screen that fits:

- Title (and optional subtitle).
- Optional back button + right action.
- Loading → skeleton row (count 3, height 80, gap 12).
- Error → `ErrorState` with `onRetry`.
- Content → `Animated.View entering={FadeIn.duration(300)}`.
- Padding `paddingHorizontal: 16`. `padded: true` default.
- Header `borderBottomWidth: 1, borderBottomColor: theme.colors.border.DEFAULT`.
- Title is `variant: 'h3'`. Subtitle is `variant: 'caption'` with `color: 'text.secondary'`.

### 17.2 The auth screen pattern

- `AppScreen` with `keyboardAvoiding: true`, `padded: false`, `scroll: false`, `bottomInset: false`.
- Background atmosphere: `EtherealSkyBackground` + `BackgroundScrim intensity="login"`.
- Content max-width: 320pt.
- OAuth button row above email form.
- Email form appears only after user opts in.
- "Create your focus system" link below the form, underlined, hitSlop 12/8/12/8.

### 17.3 The home / dashboard pattern

- `AppScreen` with `scroll: true`, `padded: true`, `bottomInset: true` (tab bar clearance).
- Hero block first (HomeHero, gradient or glass).
- Section blocks (GlassSectionHeader + Card list).
- `gap: 4` (16) between sections.
- Each section has a header, then a `FlashList` of cards with `estimatedItemSize` set.
- Empty / error / loading states handled per section.

### 17.4 The session / focus pattern

- Full-bleed atmosphere background (no GlassScreen, no padding).
- Centered FocusRing (default 148pt, stroke 12, with a `reduceMotion` short-circuit on the `useSharedValue`).
- Session controls (pause / stop) at the bottom in a `SafeAreaView` bottom-inset padded block.
- Haptics on session start (`success`), pause (`light`), complete (`success` + `lively` spring on the level-up orb).

### 17.5 The list / search pattern

- `MobileGrid` (2 columns phone, 3 tablet) for card grids.
- `FlashList` for long lists.
- `Skeleton` (single), `SkeletonCard`, or `SkeletonList` for the loading state.
- `EmptyState` for the empty state, with one CTA only.
- Stagger entry: `motionStagger.normal` (64ms) per index.

### 17.6 The paywall / launch pattern

- Premium gradient background.
- `VexLaunchButton` for the primary CTA.
- `PremiumBadge` or `SupporterBadge` for the membership indicator.
- `Banner` (`variant: 'gradient'`) for the value-prop card.
- Reduced motion: replace ambient loops with static gradient.

---

## 18. High-priority focus: **Glass + Liquid surface discipline**

> The most distinctive design choice in VEX is the **glass + liquid** material language. This is the area with the highest density of rules and the highest risk of drift. It is the design system's "anti-AI-tell" — what makes the app feel authored rather than generated.

### 18.1 What glass means in VEX

A glass surface is **never** just `backdropFilter: blur(20)` on a translucent white. A VEX glass surface has, in order:

1. A subtle white-tinted background (`rgba(255, 255, 255, 0.5–0.78)` depending on elevation).
2. A 1px white-tinted border (`rgba(255, 255, 255, 0.55–0.85)`).
3. A multi-layer shadow with **colored** accent (`mint[600]` for primary, `violet` for premium, `white` for ambient).
4. An inner highlight on the top edge (the `glassEdge` helper in `src/theme/tokens/elevation.ts` is the canonical pattern).
5. Optional: an inner gradient (TopRadial or Linear) for liquid depth.
6. Optional: a `ShimmerSweep` for one-shot motion emphasis.

A surface missing any one of these is not glass. It is a translucent rectangle.

### 18.2 Glass variants (Card.styles.ts)

| Variant         | Background    | Border         | Shadow accent | Use                          |
|-----------------|---------------|----------------|---------------|------------------------------|
| `default`       | white 0.58    | white 0.74     | rgba(13,76,65,0.13) | standard card        |
| `lightGlass`    | white 0.58    | white 0.74     | rgba(13,76,65,0.13) | alias of default    |
| `elevated`      | white 0.76    | white 0.84     | rgba(13,76,65,0.22) | active card         |
| `lightHero`     | white 0.66    | white 0.78     | mint[700]     | hero card, premium card     |
| `lightSelected` | white 0.78    | mint[400] 1.4px | mint[500]    | selected / focus            |
| `lightSuccess`  | white 0.62    | mint 0.45 1px  | mint[500]     | success state                |
| `outlined`      | transparent   | rgba(13,76,65,0.18) | none    | low-emphasis surface         |
| `ghost`         | transparent   | none           | none          | no chrome                    |
| `glass`         | white 0.58    | white 0.74     | rgba(13,76,65,0.13) | glass alias of default |
| `premium`       | white 0.78    | mint 0.7 1.2px | mint[600]     | premium surface              |

### 18.3 Liquid components

Reserved for launch / payoff / hero surfaces:

- `LiquidButton` — animated glass CTA.
- `LiquidProgressBar` — fills with a glass wave.
- `LiquidLens`, `WaterBubble`, `WaterRippleBackground`, `FloatingDroplets`, `TinyBubbleCluster` — ambient atmospheres.
- `LiquidGlassSphere`, `LiquidGlassObject` (variants: bubble, gem, lens, orb, ribbon, swirl) — companion auras.

Rules:

- These are NOT general-purpose components. They live in launch, onboarding, paywall, and ambient focus surfaces.
- On reduced motion, the animation freezes; the static gradient / shape still reads.
- Do not place two liquid components in the same viewport. The eye cannot read both.

### 18.4 Glass anti-patterns to refuse

- `backgroundColor: 'rgba(255,255,255,0.4)'` with no border and no shadow. That's not glass; it's a faded rectangle.
- Two glass surfaces stacked (glass-on-glass). The inner one loses all reading; pick the one that matters and flatten the other.
- Glass on a glass background where the underlying glass is also at 0.5+ opacity. The whole screen turns milky.
- `backdrop-filter` without an inner border. The surface reads as a smear, not a pane.
- A border with no corresponding shadow. The border announces an edge but the surface does not lift.
- A shadow with no corresponding border. The surface lifts but reads as unfinished.

### 18.5 Glass + dark mode

- White-tinted glass does not translate directly to dark. The dark glass palette (`dark-palette.ts` + `dark-semantic-palette.ts`) is the source. White opacity values in dark mode are lower (0.06–0.12 typical) and the border shifts to a subtle inner-light tone.
- The 1px inner-light edge is non-negotiable in dark mode. Without it, the surface vanishes into the background.

---

## 19. Spacing and sizing on special surfaces

### 19.1 Modal sizing recap

| Property        | Value           |
|-----------------|-----------------|
| Content width   | 90% / max 400   |
| Content height  | max 80%         |
| Header padding  | px 16, pt 16, pb 8 |
| Body padding    | 16              |
| Footer padding  | 16              |
| Footer border   | 1px top, rgba(0,0,0,0.1) |
| Border radius   | 12 (lg)         |
| Shadow          | iosShadows.sm / elev 5 |
| Z-index         | 1000            |

### 19.2 Bottom sheet recap

| Property           | Value                              |
|--------------------|------------------------------------|
| Top radius         | 24 (2xl)                           |
| Drag handle        | 36 wide, 4 tall, 8 from top        |
| Snap points        | peek / half / full                 |
| Backdrop           | 50% black                          |
| Drag dismiss       | swipe down past threshold          |

### 19.3 Toast recap

| Property         | Value                                  |
|------------------|----------------------------------------|
| Horizontal pad   | 16                                     |
| Vertical pad     | 12                                     |
| Border           | 1px semantic color                     |
| Border radius    | 12 (lg)                                |
| Position offsets | top: 0 +60 / bottom: 100 / center: 0  |
| Z-index          | 2000                                   |
| Live region      | polite                                 |
| Duration         | 3000ms default                         |

### 19.4 Banner recap

| Size | padding | icon | title (variant) | desc (variant) | radius |
|------|---------|------|-----------------|----------------|--------|
| sm   | 12      | 20   | h4              | caption        | 8      |
| md   | 16      | 24   | h3              | body           | 12     |
| lg   | 20      | 32   | h2              | body           | 16     |

### 19.5 Skeleton

- Variant `text`: height 16, radius 4, opacity 0.3→0.6 cycle.
- Variant `circular`: height × height, radius height/2.
- Variant `rectangular`: radius 0.
- Variant `rounded`: radius 8.
- `SkeletonCard`: 120pt tall, 3 lines default, 80% width on last line.
- `SkeletonList`: 5 items default, 72pt each.
- All skeletons use `withRepeat(withSequence(withTiming(0.6, 800), withTiming(0.3, 800)), -1, true)`. Reduced motion: opacity 0.5 static.

### 19.6 Progress components

- `ProgressBar`: 8pt height, themed, with `LiquidProgressBar` as the glass variant.
- `CircularProgress`: 8/16/24/32/48 sizes, semantic color, no border.
- `StepIndicator`: 24pt circles, 2pt active border, gap 4 between steps.

### 19.7 FocusRing (focus session component)

- Default size 148pt. Stroke 12pt. Stroke-linecap round. Gradient from primary 500 to primary 300.
- Animation: 900ms `Easing.out(Easing.cubic)`. Reduced motion: snap to final.
- Center text: 32pt / weight 800. Web fallback: static SVG (no animation).
- accessibilityLabel: "Daily goal progress X minutes, Y percent".

### 19.8 Avatars

- Initials proportional to size (FONT_SIZE_MAP: 24→11, 32→14, 40→16, 48→20, 64→28, 96→40).
- Status dot: max 8pt, sits at -sizeValue/20 from corner, 2pt border in background.primary.
- Badge: max 18pt, sits at -sizeValue/20 from top-right, 2pt border in background.primary, "99+" overflow.
- Shapes: `circle` (default, full radius), `rounded` (size/4), `square` (4pt radius).
- Initials color: `lightColors.text.inverse` (white in light theme).

### 19.9 Badges

- Sizes: `sm` (pv 2 / ph 6 / 10pt / icon 10), `md` (pv 4 / ph 8 / 12pt / icon 12), `lg` (pv 6 / ph 12 / 14pt / icon 14).
- Border radius: 4 (sm) / 6 (md) / 8 (lg).
- Font weight: 600.
- Disabled: opacity 0.5.
- Remove button hitSlop: 8 all sides.
- Variants: default / primary / success / warning / error / info / secondary / outline.

### 19.10 GlassPill

- Sizes: sm 28h / md 32h / lg 36h. Horizontal pad 12 / 14 / 16. Font 11 / 12 / 14.
- Weight 800, letter-spacing 0.2.
- Variants: neutral, mint, success, warning, fire, premium. `success` maps to mint tone.
- Selected state: text color flips to inverse.

---

## 20. What to refuse (the discipline list)

A change is rejected if it does any of the following:

- Hardcodes a number that has a token (4, 8, 12, 16, 20, 24, 32, 40, 44, 48, 56, 64, 80, 96, 128, 160, 240, 320, 400, 480, 640, 768, 1024, 1280).
- Uses a non-token font family.
- Reaches for a new component when a primitive exists.
- Adds a non-token shadow or radius.
- Uses `FlatList` instead of `FlashList` for a list.
- Uses `Animated` from `react-native` instead of `react-native-reanimated`.
- Uses `StyleSheet.create` for a component style (use inline with theme tokens).
- Uses `AsyncStorage` (use MMKV / SecureStorage wrappers).
- Bypasses the Button primitive for an interactive element (a `Pressable + Text` outside the documented exception paths).
- Stacks two glass surfaces in the same viewport.
- Animates layout properties.
- Animates without honoring `useReducedMotion`.
- Disables a focus ring without a replacement.
- Uses color alone to convey state.
- Uses Title Case in body / labels.
- Adds an exclamation point.
- Renders a spinner alone as a loading state.
- Renders a "No items found" as an empty state.
- Calls a screen "responsive" because it shrinks without changing composition.
- Adds a touch target smaller than 44×44 without `hitSlop`.
- Uses a hex literal in component code (all color values go through the token system).
- Uses `padding` / `margin` values that are not in the spacing scale.
- Sets `letterSpacing` outside the documented values for the matching type role.
- Creates a `style` file under a different name (the codebase uses inline styles + `createSheet` for shared sheets).
- Creates a component file over 200 lines (AGENTS.md hard limit).
- Writes `@ts-ignore`, `@ts-nocheck`, `as any` (AGENTS.md zero-tolerance).
- Logs to console in production (use the logger + Sentry).
- Adds a TODO comment (AGENTS.md; implement it or delete it).
- Creates a `*.part-N.ts` file (decompose by domain, not by line count).

---

## 21. When a rule must bend

Bending a rule requires:

1. A `// DESIGN-SYSTEM:` comment in the code explaining the deviation.
2. A note here in the `## 21` section listing the deviation, its scope, and the reason.
3. A new token if the deviation repeats.

Currently accepted micro-deviations:

| Location                                  | Deviation                                 | Reason                                                                 |
|-------------------------------------------|-------------------------------------------|------------------------------------------------------------------------|
| `Input.tsx` `minHeight: 52, paddingVertical: 14` | Off-grid 52 (between 12 and 13) and 14 (between 3 and 4) | The 52pt input is a product-mandated height for comfortable typing on phone; 14pt vertical padding keeps the text vertically centered at 16pt line-height |
| `Banner.tsx` description `marginTop: 4`  | Token 1 (4px) — used, not raw 4           | Already a token; this is the token. (The 4 number is the same value.)  |
| `Avatar.tsx` status / badge offsets `-sizeValue / 20` | Off-token ratios | Positioning math tied to the avatar's own size; not a spacing token    |
| `IconButton` `sm: 32, md: 40`             | Below the 44pt touch floor                | Compensated by `hitSlop`; documented in §3.5                            |
| `LoginScreen` `paddingTop: insets.top + 16` | Token 4 (16) used as the offset constant | Already a token                                                         |
| `MobileGrid` `marginHorizontal: -gap / 2` | Math expression, not a token             | Gutter compensation; the `gap` itself is a token                        |
| `Stack` `alignSelf: 'flex-start'` defaults | Not a spacing value                       | Layout primitive, not a deviation                                       |
| `Modal` `zIndex: 1000` direct value       | Above `zIndex.toast` (800)               | Modal must clear toast; explicit override                               |
| `Toast` `zIndex: 2000` direct value       | Above Modal                               | Toast must clear modal; explicit override                               |

When a deviation becomes a pattern (3+ call sites), promote it to a token.

---

## 22. Cross-references

| Concern            | File                                                      |
|--------------------|-----------------------------------------------------------|
| All token types    | `src/theme/tokens/index.ts`                               |
| Typography         | `src/theme/tokens/typography.ts`                          |
| Spacing            | `src/theme/tokens/spacing.ts`                             |
| Sizing             | `src/theme/tokens/sizing.ts`                              |
| Motion (new)       | `src/theme/tokens/motion.ts`                              |
| Motion (legacy)    | `src/theme/tokens/timing.ts` (do not extend)              |
| Elevation / glow   | `src/theme/tokens/elevation.ts`                           |
| Shadows (iOS)      | `src/theme/tokens/shadows.ts`                             |
| Z-index            | `src/theme/tokens/zIndex.ts`                              |
| Radius             | `src/theme/tokens/radius.ts`                              |
| Opacity            | `src/theme/tokens/opacity.ts`                             |
| Responsive helpers | `src/theme/responsive.ts`                                 |
| Theme factory      | `src/theme/createTheme.ts`                                |
| Theme context      | `src/theme/ThemeContext.tsx`                              |
| Brand colors       | `src/theme/tokens/brand.ts` (color — out of scope here)   |
| Glass tokens       | `src/theme/tokens/vex-light-glass.ts`                     |
| Primitives         | `src/components/primitives/`                              |
| States             | `src/components/states/`                                  |
| Overlays           | `src/components/overlays/`                                |
| Glass              | `src/components/glass/`                                   |
| UI controls        | `src/components/ui/`                                      |
| Touch target       | `src/utils/touchTarget.ts`                                |
| Haptics            | `src/utils/haptics.ts`                                    |
| Accessibility      | `src/accessibility/`                                      |

---

## 23. Verification checklist (run before every UI change)

Before opening a PR or marking a UI task complete, verify:

- [ ] Every new `padding`, `margin`, `gap`, `width`, `height`, `borderRadius`, `shadow`, `fontSize`, `lineHeight`, `letterSpacing` is a token.
- [ ] Every interactive element has `accessibilityLabel`, `accessibilityRole`, `accessibilityHint`.
- [ ] Every animated element reads `useReducedMotion()` and short-circuits.
- [ ] Every state is covered: loading (skeleton), empty (EmptyState), error (ErrorState + retry), success (inline / Toast).
- [ ] Every form field has a visible label (no placeholder-as-label).
- [ ] Every list is `FlashList` with `estimatedItemSize` set to actual item height.
- [ ] Every modal closes on backdrop press, on Android back, and via close button.
- [ ] Every modal traps focus and restores it on close.
- [ ] Every touch target is at least 44×44 (or has `hitSlop`).
- [ ] No glass-on-glass stacking.
- [ ] No animation of layout properties.
- [ ] No console.log in production code paths.
- [ ] All copy is sentence case, no exclamation points, no "Loading...".
- [ ] `npx tsc --noEmit` clean.
- [ ] Affected file under 200 lines; split if not.
- [ ] No `@ts-ignore`, no `any`, no `@ts-nocheck`.

This checklist is not optional. It is the contract.
