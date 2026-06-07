# VEX Light Glass Design System & Implementation Spec

**File:** `docs/design.md`  
**Product:** VEX  
**Target date:** June 2026  
**Audience:** AI coding agent, senior frontend/mobile engineer, product designer  
**Status:** Implementation source of truth for the VEX light-glass redesign  
**Non-negotiable goal:** Make VEX feel like a calm, premium, adaptive productivity operating system made from mint-tinted liquid glass, while preserving the real app structure, real feature availability, and real user-facing copy from the codebase.

---

## 0. Executive Summary

VEX is not a generic productivity app. It is an adaptive execution system:

> **VEX is the productivity app that changes based on how you work — starting with one focused session, then unlocking Study, Run, Project, or Clean systems as it learns your rhythm.**

The redesign must transform VEX from the current dark/obsidian visual language into a **fully light glass interface**: mint green, pearl white, glass gray, soft translucent cards, realistic depth, cinematic polish, and strict usability. The end result should look like a June 2026 premium iOS/Android app: tactile, modern, artistic, and alive, but never noisy or fake.

The app must remain true to the actual implementation. The core tabs are:

1. **Home**
2. **Focus**
3. **Progress**
4. **Profile**

Do not invent extra tabs. Do not revive archived features. Do not add shop/economy/social systems. Do not make the app look like an AI image generator, a game store, a crypto dashboard, or a dark cyberpunk product.

The redesign should feel like:

- **Liquid glass**
- **Mint atmosphere**
- **Frosted clarity**
- **Soft depth**
- **Adaptive intelligence**
- **Premium calm**
- **Execution-first productivity**

The redesign should **not** feel like:

- Dark cyberpunk
- Generic glassmorphism template
- Cluttered analytics dashboard
- Gamified casino/economy UI
- Fake productivity mockup
- Overexposed white UI with no hierarchy
- Low-contrast translucent text
- A pretty concept that no longer matches the app

---

## 1. Source-of-Truth Files Analyzed

The following files define the current app structure and must be treated as implementation source of truth.

### Navigation

- `src/navigation/MainNavigator.tsx`
- `src/navigation/components/VexTabBar.tsx`
- `src/navigation/components/TabButton.tsx`
- `src/navigation/types.ts`
- `src/navigation/ProfileTabRoute.tsx`

### Home

- `src/screens/home/HomeScreen.tsx`
- `src/screens/home/containers/HomeStageResolver.tsx`
- `src/screens/home/containers/HomeScreenInner.tsx`
- `src/screens/home/components/HomeContent.tsx`
- `src/screens/home/components/HomeHeroSection.tsx`
- `src/screens/home/components/VexFocusSurface.tsx`
- `src/screens/home/components/VexFocusSurfaceCopy.ts`
- `src/screens/home/components/HomeContentLower.tsx`
- `src/screens/home/components/HomeCompanionSection.tsx`
- `src/screens/home/components/HomeStreakProgress.tsx`
- `src/screens/home/components/HomeMemoryInsight.tsx`
- `src/screens/home/components/HomeFocusScore.tsx`
- `src/screens/home/components/HomeContextualCards.tsx`
- `src/screens/home/components/HomeSecondaryRail.tsx`
- `src/features/mode-native/components/ModeNativeHome.tsx`
- `src/features/mode-native/copy.ts`
- `src/features/mode-native/service.ts`
- `src/features/home-spine/components/StreakWidget.tsx`
- `src/features/home-spine/components/AtRiskBanner.tsx`
- `src/features/home-spine/components/RecentSessionsList.tsx`

### Focus

- `src/screens/home/FocusScreen.tsx`
- `src/features/session-start/service.ts`
- `src/features/session-start/lane-builder.ts`
- `src/features/session-start/schemas.ts`
- `src/features/session-start/setup-helpers.ts`
- `src/features/session-start/hero-builder.ts`
- `src/features/session-start/stake-service.ts`

### Progress

- `src/screens/progress/ProgressScreen.tsx`
- `src/screens/progress/StudyOSCard.tsx`
- `src/screens/progress/progress-actions.ts`
- `src/features/focus-identity/components/focus-score-dashboard.tsx`
- `src/features/focus-identity/components/score-card.tsx`
- `src/features/focus-identity/components/factor-map.tsx`
- `src/features/focus-identity/components/what-changed.tsx`
- `src/features/progression/components/progression-dashboard.tsx`
- `src/features/progression/components/progression-stat-card.tsx`
- `src/features/progression/components/xp-progress-bar.tsx`
- `src/screens/profile/components/PersonalBestsGrid.tsx`

### Profile

- `src/screens/profile/ProfileScreen.tsx`
- `src/screens/profile/ProfileHeader.tsx`
- `src/screens/profile/ProfileStatsTab.tsx`
- `src/screens/profile/ProfileAchievementsTab.tsx`
- `src/screens/profile/ProfileActivityTab.tsx`
- `src/screens/profile/ProfileMasterySheet.tsx`
- `src/screens/profile/useProfileData.ts`
- `src/screens/profile/profile-achievements.ts`
- `src/features/focus-identity/components/FocusScoreCard.tsx`
- `src/features/focus-identity/components/ScoreHistoryChart.tsx`

### Theme & primitives

- `src/theme/tokens/ethereal-sky.ts`
- `src/theme/tokens/colors.ts`
- `src/theme/tokens/rgba-colors.ts`
- `src/theme/tokens/elevation.ts`
- `src/theme/tokens/typography.ts`
- `src/theme/tokens/spacing.ts`
- `src/theme/tokens/radius.ts`
- `src/theme/tokens/shadows.ts`
- `src/theme/createTheme.ts`
- `src/components/primitives/AppScreen.tsx`
- `src/components/primitives/Card.tsx`
- `src/components/primitives/Button.tsx`
- `src/components/primitives/VexMotionSurface.tsx`
- `src/components/primitives/VexLaunchButton.tsx`
- `src/components/primitives/AuroraField.tsx`
- `src/components/Badge.tsx`
- `src/components/Avatar.tsx`
- `src/components/ui/Skeleton.tsx`

### Feature boundaries

- `docs/FINAL_RELEASE_FEATURE_CLASSIFICATION.md`
- `docs/ARCHIVED_FEATURES_DO_NOT_REVIVE.md`
- `src/features/liveops-config/final-release-classification.ts`
- `src/features/liveops-config/FeatureFlagService.ts`

These files matter because VEX already has a clear active/progressive/internal/archived feature split. The redesign must not accidentally revive old systems.

---

## 2. Product Identity

### 2.1 What VEX is

VEX is an **adaptive productivity execution system**. It does not simply list tasks. It detects where the user is in their rhythm and presents the next useful action.

VEX’s product identity is:

- Adaptive
- Personal
- Execution-first
- Calm but ambitious
- Focus-protective
- Progress-aware
- Honest about messy days
- Designed around sessions, streaks, identity, and momentum

VEX should feel like a system that says:

> “I know what kind of focus state you are in. I will help you take the next honest step.”

### 2.2 What VEX is not

VEX is not:

- A generic to-do list
- A task database
- A habit tracker clone
- A Pomodoro timer skin
- A gamified shop/economy app
- A social challenge app
- A dark battle UI
- A novelty AI coach chat app

### 2.3 Personality

The voice is direct, calm, and motivating without hype.

Use phrases that already exist in the codebase where possible:

- “Choose the shape of this block”
- “Start with one short mode. VEX will build the next layer from real progress.”
- “Day X is active. Pick the mode that matches your actual energy.”
- “Your focus record.”
- “Focus sessions, study work, and coaching signals in one place.”
- “Study tools unlock through sessions”
- “Turn material into focus sessions”
- “Plans, review, and quizzes stay tied to the same start and complete loop.”
- “Your Focus Score needs three sessions”
- “Finish three sessions and VEX will start reading your focus rhythm.”
- “Earn progress now”
- “No earned proof yet”
- “Start session”

Do not add fake motivational quotes everywhere. VEX copy should feel purposeful, not wallpaper text.

---

## 3. June 2026 Visual North Star

### 3.1 Desired look

The new design should be a **fully light liquid-glass productivity OS**.

Core descriptors:

- Light
- Mint
- Glass gray
- Pearl
- Frosted
- Translucent
- Softly reflective
- Calm
- High-end
- Tactile
- Layered
- Artistic
- Accurate
- Production-realistic

### 3.2 Inspiration principles

Use the current platform-era direction around Liquid Glass carefully:

- Glass should establish **hierarchy**, not decoration.
- The strongest glass should be reserved for navigation, hero surfaces, primary CTAs, profile header, selected cards, and progress modules.
- Text must remain legible.
- Content remains the focus.
- Material should be dynamic, layered, and responsive, but restrained enough for daily productivity use.

### 3.3 The correct balance

The app should be more beautiful than a normal utility app, but it cannot become an art poster at the expense of usability.

The correct balance is:

| Dimension | Target |
|---|---|
| Beauty | 11/10 |
| Accuracy to app | 11/10 |
| Legibility | 10/10 |
| Performance | 9/10+ |
| Glass realism | 10/10 |
| Feature discipline | 10/10 |
| Visual restraint | 8/10 |
| Artistic atmosphere | 9/10 |

---

## 4. Non-Negotiable Feature Boundaries

Read `docs/ARCHIVED_FEATURES_DO_NOT_REVIVE.md` before implementing.

### 4.1 Do not include or revive

Never show these in Home, navigation, empty states, recommendations, premium copy, completion copy, or profile cards unless the user explicitly requests that exact system in the current task:

- Shop
- Inventory
- Battle pass
- Wagers
- Rivals
- Squads
- Social guilds
- Community boss
- Leaderboards
- Premium currency
- Gems
- Chests as monetization
- Advanced economy
- Theme shop
- Fake subscription plan cards
- Store-like reward UI
- Guild/community challenges
- Squad boss
- Any card that implies social pressure or marketplace mechanics

### 4.2 Boss boundary

Boss can exist only as personal focus momentum if it is already permitted by feature availability.

Allowed:

- My sessions
- My progress
- My momentum
- My creature/boss health for game-like/intense users
- Subtle momentum visual for calm/study users

Not allowed:

- Squad boss
- Guild boss
- Community boss
- Shop/inventory dependencies
- Battle pass dependencies
- Premium currency dependencies
- Wagers
- Social pressure

### 4.3 Premium boundary

Premium may deepen execution, memory, and study/review systems. It must not pretend that archived economy systems are valuable.

Allowed premium framing:

- Deep coach memory
- Advanced Study OS
- Monthly reports
- Quiz/review mode
- Deeper personalization

Forbidden premium framing:

- Gems
- Chests
- Battle pass
- Currency multipliers
- Store unlocks
- Cosmetic inventory
- Fake subscription benefits unrelated to active systems

---

## 5. Overall App Shell

### 5.1 App background

Replace the dark background with a light glass atmosphere.

Recommended base:

```ts
const lightGlassBackground = {
  pageTop: '#F7FFFC',
  pageMid: '#EEF8F5',
  pageBottom: '#DDEDE9',
  mist: 'rgba(232, 250, 245, 0.72)',
  pearl: '#FFFFFF',
  glassGray: '#E7EFEC',
  textPrimary: '#10231F',
  textSecondary: 'rgba(16, 35, 31, 0.68)',
  textTertiary: 'rgba(16, 35, 31, 0.46)',
  mint: '#42CFAE',
  mintDeep: '#139E84',
  mintSoft: 'rgba(66, 207, 174, 0.18)',
  cyanSoft: 'rgba(117, 225, 218, 0.22)',
};
```

Screens should use a subtle vertical gradient:

- Top: near-white mint
- Middle: pearl/mist
- Bottom: glass gray

Avoid flat white backgrounds. VEX should feel atmospheric.

### 5.2 Global surface hierarchy

Use this hierarchy everywhere:

1. **Page atmosphere** — very soft gradient with abstract mint/cyan haze.
2. **Hero glass** — thickest, most luminous, strongest edge highlight.
3. **Primary cards** — frosted fill, soft shadow, inner highlight.
4. **Secondary cards** — less blur, quieter fill.
5. **Pills/badges** — compact, rounded, bright edge.
6. **Bottom tab bar** — floating glass capsule.
7. **Text** — dark slate, never pure black unless necessary.

### 5.3 Avoid the old dark theme

Current code uses dark tokens such as `liquidNight`, `obsidian`, and dark gradients inside surfaces like `VexFocusSurface`.

For the redesign:

- Do not use black/obsidian as the main card fill.
- Do not use dark cyberpunk gradients.
- Do not use purple/orange glows as the main identity.
- Do not make hero cards look like sci-fi command panels.
- Translate “focused” surfaces into bright translucent glass.

If old dark code remains for fallbacks or legacy themes, it must not be the active default.

---

## 6. Design Tokens

Create a dedicated token file:

```txt
src/theme/tokens/vex-light-glass.ts
```

### 6.1 Color tokens

```ts
export const vexLightGlass = {
  background: {
    pageTop: '#F8FFFC',
    pageMid: '#EEF8F4',
    pageBottom: '#DDECE8',
    atmosphericMint: 'rgba(95, 230, 197, 0.18)',
    atmosphericCyan: 'rgba(132, 228, 229, 0.16)',
    atmosphericPearl: 'rgba(255, 255, 255, 0.78)',
  },

  text: {
    primary: '#10231F',
    secondary: 'rgba(16, 35, 31, 0.68)',
    tertiary: 'rgba(16, 35, 31, 0.48)',
    disabled: 'rgba(16, 35, 31, 0.32)',
    inverse: '#FFFFFF',
  },

  mint: {
    50: '#EFFFFA',
    100: '#D8FBF1',
    200: '#A9F0DD',
    300: '#72E0C5',
    400: '#42CFAE',
    500: '#18B894',
    600: '#109779',
    700: '#0C765F',
    800: '#0A5E4D',
    900: '#064338',
  },

  glass: {
    fillSubtle: 'rgba(255, 255, 255, 0.42)',
    fill: 'rgba(255, 255, 255, 0.58)',
    fillStrong: 'rgba(255, 255, 255, 0.76)',
    fillHero: 'rgba(255, 255, 255, 0.66)',
    border: 'rgba(255, 255, 255, 0.74)',
    borderSubtle: 'rgba(255, 255, 255, 0.38)',
    innerHighlight: 'rgba(255, 255, 255, 0.92)',
    innerShadow: 'rgba(15, 72, 61, 0.08)',
    shadow: 'rgba(13, 76, 65, 0.13)',
    shadowStrong: 'rgba(13, 76, 65, 0.22)',
  },

  semantic: {
    success: '#18B894',
    warning: '#DFA44A',
    danger: '#E05E5E',
    info: '#54AEEA',
    stable: '#18B894',
    premium: '#79DFC9',
  },
} as const;
```

### 6.2 Glass material tokens

Create a material object that maps to reusable React Native style recipes.

```ts
export const glassMaterials = {
  pane: {
    backgroundColor: vexLightGlass.glass.fill,
    borderColor: vexLightGlass.glass.border,
    borderWidth: 1,
    shadowColor: vexLightGlass.glass.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },

  paneStrong: {
    backgroundColor: vexLightGlass.glass.fillStrong,
    borderColor: vexLightGlass.glass.border,
    borderWidth: 1,
    shadowColor: vexLightGlass.glass.shadowStrong,
    shadowOpacity: 0.2,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },

  hero: {
    backgroundColor: vexLightGlass.glass.fillHero,
    borderColor: vexLightGlass.glass.border,
    borderWidth: 1,
    shadowColor: vexLightGlass.mint[700],
    shadowOpacity: 0.18,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 20 },
    elevation: 10,
  },

  nav: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.82)',
    borderWidth: 1,
    shadowColor: 'rgba(13, 76, 65, 0.22)',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
} as const;
```

### 6.3 Radius tokens

The current radius scale has `2xl = 24`, `3xl = 32`, `full = 9999`. Keep that but apply more consistently.

Recommended:

| Element | Radius |
|---|---:|
| Screen hero surface | 32 |
| Large cards | 26–30 |
| Standard cards | 22–24 |
| Small cards | 18–20 |
| Pills | 999 |
| Bottom tab bar | 28–32 |
| Icon orbs | 18–999 depending shape |
| Sheets | top radius 32 |

### 6.4 Spacing rules

Continue using the 4px grid. The current `spacing.ts` is good. Use it more consistently.

Recommended screen-level spacing:

| Area | Value |
|---|---:|
| Horizontal screen padding | 20 |
| Top padding with safe area | safe + 20 |
| Section gap | 16–20 |
| Card internal padding | 16–20 |
| Hero internal padding | 20–24 |
| Small row gap | 8–12 |
| Tab bar horizontal margin | 16 |
| Bottom padding above tab | 12–16 |

### 6.5 Typography

Current Inter-based scale is fine. Keep Inter.

Need adjustments for light glass:

- Primary text should be dark green-slate, not white.
- Labels should use mint/deep mint.
- Avoid low-opacity text over translucent surfaces.
- Avoid uppercase labels smaller than 11px.
- Use strong hierarchy: display/h1 only once per screen.

Recommended text mapping:

| Role | Style |
|---|---|
| Screen label | label, mint 600, letter spacing 1.1 |
| Main title | h1/h2, text primary, 800 |
| Card title | h3/h4, text primary, 700–800 |
| Body | body/bodySmall, text secondary |
| Metadata | caption, text tertiary |
| CTA | button, semibold, white or mintDeep |
| Tiny stat | caption, 600, legible |

### 6.6 Motion tokens

Motion should feel like glass, not arcade.

Recommended:

```ts
export const glassMotion = {
  screenEnter: { duration: 420, easing: 'easeOutCubic' },
  cardEnter: { duration: 360, stagger: 45 },
  pressDownScale: 0.985,
  pressUpSpring: { damping: 18, stiffness: 180 },
  selectedPillSpring: { damping: 20, stiffness: 220 },
  progressSpring: { damping: 18, stiffness: 130 },
};
```

Respect reduced motion everywhere.

---

## 7. Core Components to Build or Refactor

### 7.1 `GlassScreen`

Create:

```txt
src/components/glass/GlassScreen.tsx
```

Purpose: replace screen backgrounds with the new light glass atmosphere.

Responsibilities:

- Safe area aware
- Soft mint/pearl gradient
- Optional top aurora
- Optional bottom haze
- ScrollView or static layout support
- Correct bottom padding for tab bar
- No dark theme assumptions

Suggested props:

```ts
type GlassScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  showTopAura?: boolean;
  showBottomGlow?: boolean;
  testID?: string;
};
```

Implementation notes:

- Use `LinearGradient` for the page background.
- Use decorative absolute blobs with low opacity.
- Do not use heavy blur on every background layer.
- Use `AppScreen` internals if safe, or wrap gradually.

### 7.2 `GlassCard`

Create:

```txt
src/components/glass/GlassCard.tsx
```

Purpose: a reusable frosted card.

Variants:

- `subtle`
- `default`
- `strong`
- `hero`
- `selected`
- `danger`
- `success`
- `premium`

Suggested props:

```ts
type GlassCardVariant =
  | 'subtle'
  | 'default'
  | 'strong'
  | 'hero'
  | 'selected'
  | 'danger'
  | 'success'
  | 'premium';

type GlassCardProps = {
  variant?: GlassCardVariant;
  children: React.ReactNode;
  padding?: number;
  radius?: number;
  interactive?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};
```

Rules:

- Use blur sparingly.
- On iOS, prefer native glass effect when available.
- On Android, use translucent fills + gradient + border + shadow fallback.
- Always include a visible border edge.
- Selected state should use mint border and soft mint glow.
- Error/danger state should be warm red but still frosted.

### 7.3 `LiquidButton`

Create or refactor `VexLaunchButton` into light glass.

Purpose: primary CTA with tactile mint glass.

Variants:

- `primary`
- `secondary`
- `outline`
- `ghost`
- `danger`

For primary:

- Fill: mint gradient
- Text: white
- Shadow: mint glow
- Border: white/mint edge
- Shape: pill
- Press: slight compression and brightening

Primary CTA examples:

- `Start`
- `Resume project`
- `Start sprint`
- `Protect streak`
- `Start study`
- `Recover today`
- `Earn progress now`
- `Open study tools`
- `Start session`

### 7.4 `GlassPill`

For mode pills, badges, filters, profile tabs.

Examples:

- `Project mode`
- `Adaptive`
- `OPEN SESSION`
- `15 min`
- `Level 7`
- `7 Day Streak`
- `Stable`
- `x2.0`

Rules:

- Round full.
- Use border.
- Keep text readable.
- Selected pill gets mint fill and white edge.
- Neutral pill gets frosted fill.

### 7.5 `GlassTabBar`

Refactor `VexTabBar.tsx`.

Current tab bar is already custom and uses gradients. Make it lighter and more 2026.

Rules:

- Floating capsule over content.
- Height includes safe area.
- Frosted background.
- Active tab appears as a small raised glass capsule or orb.
- Use mint for active icon/label.
- Inactive tabs are dark slate at 45–55% opacity.
- No black gradient at bottom.
- Keep route labels exactly: Home, Focus, Progress, Profile.

### 7.6 `GlassIconOrb`

Use for:

- Focus mode icons
- Profile avatar accent
- Progress factor icons
- Coach presence icon
- Memory insight icon
- Study OS icon

Visual:

- circular or rounded glass orb
- inner mint glow
- subtle refraction highlight
- low-contrast icon inside

Do not overuse huge decorative orbs in dense screens. One hero orb per screen is enough.

### 7.7 `GlassProgressBar`

Use for:

- XP progress
- Factor map bars
- Mastery bars
- Focus score trend
- Session progression
- Streak risk time

Rules:

- Track: glass gray/mint very light
- Fill: mint gradient
- Edge: subtle glow
- Height: 6–10px
- Rounded full

### 7.8 `GlassSectionHeader`

Reusable section header:

- Eyebrow label
- Title
- Optional body
- Optional trailing action

Use in Home secondary rail, Progress sections, Profile sections.

---

## 8. Screen-by-Screen Spec

---

# 8A. Home Tab

## 8A.1 Actual source structure

Home starts at:

```txt
src/screens/home/HomeScreen.tsx
```

Then resolves stage through:

```txt
src/screens/home/containers/HomeStageResolver.tsx
```

The primary logged-in app path renders:

```txt
src/screens/home/containers/HomeScreenInner.tsx
src/screens/home/components/HomeContent.tsx
```

`HomeContent` renders, in order:

1. Status/sync banners
2. Home experience prelude
3. Hero section
4. Companion/coach section
5. Streak progress
6. At-risk banner
7. Lower content:
   - Memory insight
   - Focus score
   - Contextual cards
   - Secondary rail

Do not replace this with a fake dashboard.

## 8A.2 Home visual goal

Home should feel like the user opened a personalized execution command center.

The first thing the user should understand:

- “VEX knows my current mode.”
- “VEX has chosen the next action.”
- “I can start/resume quickly.”
- “My streak, focus score, and context are alive but not overwhelming.”

## 8A.3 Mode pill

User chooses a mode during onboarding. Main tab should show a mode state.

The mode pill should appear near the top of Home or inside the hero surface.

Possible mode labels from lane mapping:

| Lane | Display |
|---|---|
| `student` | Study mode |
| `game_like` | Run mode |
| `deep_creative` | Project mode |
| `minimal_normal` | Clean mode |

For the primary design direction, use **Project mode** as the example state.

The pill must be glassy, not a flat chip:

- Fill: `rgba(255,255,255,0.62)`
- Border: `rgba(255,255,255,0.78)`
- Text: mint 700
- Tiny chevron optional
- Height: 32–36
- Radius: full

## 8A.4 Home hero

Current source components:

- `HomeHeroSection.tsx`
- `VexFocusSurface.tsx`
- `VexFocusSurfaceCopy.ts`
- `ModeNativeHome.tsx`

Current dark hero must be translated to light glass.

### 8A.4.1 Current hero behavior

`VexFocusSurface` renders:

- Eyebrow
- Title
- Reason
- `What matters now` stakes block
- Badges:
  - Adaptive
  - CTA action
- `VexLaunchButton`

`ModeNativeHome` renders:

- Mode pill
- Headline
- Body
- First contract
- `VexLaunchButton`
- Secondary hint

### 8A.4.2 New hero look

The Home hero becomes a large frosted-glass panel.

Characteristics:

- Radius: 32
- Fill: pearly transparent white
- Edge: bright glass border
- Inner light streaks
- Soft mint/cyan aurora behind it
- A single liquid-glass sculptural orb/ribbon on the right side
- Text on the left
- CTA near bottom
- Secondary hint at bottom

Do not use a dark gradient. Do not use obsidian.

### 8A.4.3 Hero copy examples

Use actual code-driven copy wherever possible. Do not hardcode these if the component already derives them.

For an activated Project Mode state, the mock/reference state may show:

- Label: `DAILY FOCUS`
- Mode pill: `Project mode`
- Title: `Your project is waiting.`
- Reason: `Pick up right where you stopped. The next move is already saved — just resume.`
- Contract:
  - `First contract`
  - `30 minutes, one clean start.`
  - `Deep work window: afternoons`
- Badges:
  - `Adaptive`
  - `Project Work`
- CTA:
  - `Resume project`
- Sub-label:
  - `~30 minutes`
- Hint:
  - `Next move is saved. Open the thread.`

If code-derived copy differs, prefer code-derived copy.

### 8A.4.4 Hero layout

```
[Status row: VEX | mode pill | notification]
[Hero glass surface]
  label: DAILY FOCUS
  title: Your project is waiting.
  body/reason
  [decorative glass ribbon/orb]
  [Adaptive pill] [Project Work pill]
  [First contract card]
    First contract
    30 minutes, one clean start.
    Deep work window: afternoons
  [Resume project CTA] [~30 min]
  [secondary hint row]
```

### 8A.4.5 Status/sync banners

Home can show:

- offline indicator
- pending completion sync
- failed completion sync with retry

Visual rules:

- Banners should be slim glass strips.
- Success/synced state should be mint-soft.
- Failed state should be warm, not harsh.
- Retry button should be a small pill.
- Do not make banners dominate.

Example:

- `All caught up`
- `You're online`

Only show when state actually exists.

## 8A.5 Coach/companion section

Source:

- `HomeCompanionSection.tsx`
- `CoachPresenceCard`
- companion widget based on feature gates

Design:

- Use a small glass card.
- Left: small GlassIconOrb.
- Title: `AI Coach` or code-derived companion label.
- Body: code-derived coach message.
- CTA/chevron on right.

Do not turn coach into a full chat screen on Home.

## 8A.6 Streak widget

Source:

- `HomeStreakProgress`
- `StreakWidget`
- `WeeklyCalendar`
- `AtRiskBanner`

The existing `StreakWidget` includes parts that may mention wager/insurance. Be careful: archived features say wagers and economy systems must not appear. If code still has wager/insurance visual paths, the redesign must hide or remove user-facing wagering/economy UI for final release.

Allowed streak content:

- Current streak count
- Multiplier if it is part of progression/streak logic and not framed as gambling/economy
- Longest streak
- Time remaining
- Weekly calendar strip
- Risk banner
- Start session CTA

Forbidden streak content:

- Wager section
- Gem balance
- Purchase insurance with gems
- Economy/gambling framing

Recommended Home streak card:

```
7 Day Streak        x2.0
M T W T F S S       12h 40m until streak risk
[calendar circles]
```

Visual:

- Frosted glass card
- Small fire icon may remain
- Mint checkmarks
- Warning state uses amber glow
- Critical state uses soft red border, still glassy

## 8A.7 At-risk banner

Source:

- `AtRiskBanner.tsx`

Show only if ≤4 hours remain or logic says risk is high/critical.

Visual:

- More urgent but not aggressive.
- Frosted amber/red tint.
- Clear CTA: `START →` or code-derived copy.
- Thin progress bar showing time draining.

## 8A.8 Memory insight

Source:

- `HomeMemoryInsight.tsx`
- `features/focus-memory/MemoryPanel`

Rules:

- Show only when `MemoryPanel` has items.
- Do not invent memory items.
- A memory insight is a subtle card, not a giant feed.

Possible look:

```
Focus Memory
VEX remembered your next move.
[Accept] [Hide]
```

Use real item copy from data.

## 8A.9 Focus score compact

Source:

- `HomeFocusScore.tsx`
- `FocusScoreHomeWidget`

Design:

- Small two-column glass card.
- Score big but not as big as Progress page.
- Show score, band, delta, trend snippet.

Example:

```
Focus Score
82  +6  Stable
[mini trend line]
```

If no score:

```
Start your first session to see your Focus Score.
```

If less than 3 sessions and dashboard says no current score:

```
Your Focus Score needs three sessions
Finish three sessions and VEX will start reading your focus rhythm.
```

## 8A.10 Contextual cards

Source:

- `HomeContextualCards.tsx`

Important: it intentionally shows **only one card at a time** in priority order:

1. Study plan suggestion if active plan exists
2. Comeback quest if eligible
3. Today’s challenges if available and near completion
4. Nothing

Do not show all possible cards simultaneously.

Design each as a glass card:

- Study plan: mint/pearl
- Comeback: warm mint/amber
- Challenges: visible only when unlocked and present

## 8A.11 Secondary rail

Source:

- `HomeSecondaryRail.tsx`

It renders:

- Section header:
  - Eyebrow: `Execution record`
  - Title: `Keep the loop moving`
  - Body: `${learningCopy.layerName}, coaching, and progress stay tied to completed focus sessions.`
- Goal card if no active recommendation
- ContentStudyHeroCard if entry point can render
- Recent Sessions:
  - Title: `Recent Sessions`
  - Body: `A compact snapshot of your last three focus wins.`
- Comeback premium surface if comeback message exists

Design:

- Use this lower area to make Home feel complete.
- Do not overcrowd the first viewport.
- The first viewport should include hero + maybe coach/streak.
- Lower scroll should include focus score, memory, contextual card, secondary rail.

---

# 8B. Focus Tab

## 8B.1 Actual source structure

Source:

```txt
src/screens/home/FocusScreen.tsx
```

It uses:

```ts
buildFocusModeCards({ streakDays })
```

from:

```txt
src/features/session-start/service.ts
src/features/session-start/lane-builder.ts
```

The Focus tab is **not the active timer screen**. It is a focus mode selection screen.

## 8B.2 Current visible structure

Top:

- `Focus modes`
- `Choose the shape of this block`
- Dynamic status:
  - Loading: `Loading the best focus entry points for today.`
  - With streak: `Day ${streakDays} is active. Pick the mode that matches your actual energy.`
  - No streak: `Start with one short mode. VEX will build the next layer from real progress.`

Then a list of focus mode cards.

Each card:

- title
- body
- duration label
- CTA button
- card variant:
  - `premium` for `sprint-15`
  - default for others

Pressing a card navigates to:

```ts
SessionStack > SessionSetup
```

with:

- `presetDuration`
- `presetMode`
- `sessionCategory`

## 8B.3 Focus card examples

Use the real `buildFocusModeCards` output. If mock states are needed, use the following code-consistent content:

### Sprint

- Title: `Sprint`
- Body: `Fastest path to a real completion and a tomorrow promise.`
- Duration: `15 min`
- CTA: `Start sprint`

### Light Focus

- Title: `Light Focus`
- Body: `Protect day 7 without opening the whole dashboard.`
- Duration: `25 min`
- CTA: `Protect streak`

### Study

- Title: `Study`
- Body: `Use when the work has material, notes, or review attached.`
- Duration: `25 min`
- CTA: `Start study`

### Recovery

- Title: `Recovery`
- Body: `For messy days: count something truthful instead of disappearing.`
- Duration: `10 min`
- CTA: `Recover today`

If actual builder output differs, use actual output.

## 8B.4 Focus visual goal

Focus should feel like a calm “choose the right block” moment.

It should not feel like a menu of features. It should feel like VEX is matching the session type to the user’s current energy.

## 8B.5 Focus layout

```
[VEX header]
Focus modes
Choose the shape of this block
Day 7 is active. Pick the mode that matches your actual energy.

[Primary selected/premium card: Sprint]
  [glass orb icon]
  Sprint
  Fastest path...
  [15 min pill]
  [Start sprint button]

[Light Focus card]
[Study card]
[Recovery card]

[Glass bottom tab bar]
```

## 8B.6 Visual treatment

- Sprint is the most visually important card.
- Use a larger glow/outline for Sprint.
- Cards use left icon orbs:
  - Sprint: lightning
  - Light Focus: leaf/check
  - Study: book
  - Recovery: heart
- Duration pill at right/top.
- CTA at lower right or full width depending available space.
- No fake timer ring.
- No session result stats on this tab.

---

# 8C. Progress Tab

## 8C.1 Actual source structure

Source:

```txt
src/screens/progress/ProgressScreen.tsx
```

Renders in ScrollView:

1. Header
2. `FocusScoreDashboard`
3. `ProgressionDashboard`
4. `StudyOSCard`
5. Personal Stats
6. `PersonalBestsGrid`

## 8C.2 Header copy

Keep exact:

- Label: `Progress`
- Heading: `Your focus record.`
- Body: `Focus sessions, study work, and coaching signals in one place.`

## 8C.3 Focus Score Dashboard

Source:

```txt
src/features/focus-identity/components/focus-score-dashboard.tsx
```

States:

### Pending

Skeleton.

### Error

- Title: `Focus Score couldn't load`
- Description: `Your score data is temporarily unavailable.`
- Button: `Retry`

### Empty

- Title: `Your Focus Score needs three sessions`
- Body: `Finish three sessions and VEX will start reading your focus rhythm.`
- Action: `Start session`

### Active

Renders:

- `ScoreCard`
- `FactorMap`
- `WhatChanged`

## 8C.4 ScoreCard

Design target:

```
Focus Score
82
Stable
Last session +6
30-day trend +14
[soft wave trend]
```

Rules:

- Score should be large and central.
- Use mint for stable/good.
- Use text labels from model.
- Add an abstract glass wave only if it does not obscure real labels.
- Do not fake ranges if the model does not supply them.

## 8C.5 FactorMap

Source labels:

- `Factor map`
- `Consistency`
- `Streak stability`
- `Session quality`
- `Intentional difficulty`
- `Recency`
- `Strongest pattern: ...`
- `Weakest pattern: ...`

Design:

- Use compact progress bars.
- Show numeric scores at the right if available.
- Strongest/weakest labels can be subtle.
- Keep this readable; it is core analysis, not decoration.

## 8C.6 WhatChanged

Source labels:

- `What changed`
- `{model.current.lastChangeReason}`
- `Next target: {nextTarget}`
- Button: `Open monthly report`

Rules:

- If monthly report is gated, pressing button follows existing `resolveMonthlyReportAction`.
- Visual should be a small insight card.
- Do not make it look like a premium sales banner unless action resolves to paywall.

## 8C.7 ProgressionDashboard

Source:

```txt
src/features/progression/components/progression-dashboard.tsx
```

Active content:

- Label: `Progression`
- Title: `Level {level}`
- Body: `{remainingXp} XP to Level {level + 1}`
- XP bar
- Caption: `{xp} / {nextLevelThreshold} XP`
- Stat card:
  - `Current streak`
  - `{currentDays} days`
  - Detail: `Needs a session today` or `Protected by focus`
- Stat card:
  - `XP multiplier`
  - `x{multiplier}`
  - Detail: `Streak bonus active` or `Build a 3-day streak`
- Button:
  - `Earn progress now`

Design:

- One premium glass module.
- XP bar should be mint and tactile.
- Stat cards inside should be glass mini cards.
- Do not add currency/gems.

## 8C.8 StudyOSCard

Source:

```txt
src/screens/progress/StudyOSCard.tsx
```

Content:

- Label: `Study OS`
- Title:
  - If unlocked: `Turn material into focus sessions`
  - If locked: `Study tools unlock through sessions`
- Body:
  - `Plans, review, and quizzes stay tied to the same start and complete loop.`
- Button:
  - If unlocked: `Open study tools`
  - If locked: `Start session`

Design:

- Premium but not shop-like.
- Use mint/pearl highlight.
- Small book/document icon orb.
- If locked, make it aspirational, not disabled-looking.

## 8C.9 Personal Stats

Source labels:

- `Personal Stats`
- `Focus Hours`
- `Completed Sessions`
- `Longest Streak`
- Button:
  - `Refresh stats`

Design:

- Three glass stat cards in a row/wrap.
- Loading skeletons if loading.
- Values bold.
- Button outline glass.

## 8C.10 PersonalBestsGrid

Source states:

- Pending: skeleton
- Error:
  - Title: `Personal bests paused`
  - Description: `Your records are safe. We could not load them right now.`
- Empty:
  - `Personal bests`
  - `Complete a session to set your first personal best.`
- Active list cards:
  - Session mode
  - Duration and date
  - Grade
  - Purity

Design:

- Keep list compact.
- Use grade as a badge.
- Do not turn personal bests into achievements/loot.

---

# 8D. Profile Tab

## 8D.1 Actual source structure

Source:

```txt
src/screens/profile/ProfileScreen.tsx
```

Default active tab is:

```ts
stats
```

Sub-tabs:

- `stats`
- `achievements`
- `activity`

The screenshot/default app state should show **stats**.

## 8D.2 Profile header

Source:

```txt
src/screens/profile/ProfileHeader.tsx
```

Current structure:

- Top bar:
  - Settings icon left
  - Notification icon right
  - Logout icon right
- Center:
  - Avatar
  - Display name
  - User id or fallback
  - Badges:
    - `Level {level}`
    - `{streakDays} Day Streak`
  - XP progress:
    - `Level {level} | {xp}/{nextLevelThreshold} XP`
    - `{xpPercent}%`
    - progress bar

## 8D.3 Header redesign

Current header uses gradient based on streak days. Convert to light glass:

- Use a large pearly glass header card.
- Keep subtle mint gradient behind it.
- Avatar becomes a glass orb/avatar medallion.
- The header should feel prestigious but not dark.
- Settings/notifications/logout icons should be small circular glass buttons.

Profile example state:

- Name: use actual user displayName if available. In marketing mockups, `Woodarlyne` is acceptable.
- Account line: user id/email line from app state; do not invent if live data is available.
- Level: 7
- Streak: 7 Day Streak
- XP: `2450/3000 XP`
- Progress: 81%

## 8D.4 Profile sub-tabs

Source:

```ts
(['stats', 'achievements', 'activity'] as const)
```

Design:

- Glass segmented control.
- Active tab: mint fill/underline.
- Text exactly lowercase or capitalized according to current component. Current text uses `textTransform: 'capitalize'`, so visible labels become:
  - Stats
  - Achievements
  - Activity

## 8D.5 Stats sub-tab

Source:

```txt
src/screens/profile/ProfileStatsTab.tsx
```

Order:

1. Error card if stats error
2. `FocusScoreCard`
3. `ScoreHistoryChart`
4. `PersonalBestsGrid`
5. 2-column stats grid
6. Mastery card

Do not reorder drastically. Small visual grouping is okay.

### 8D.5.1 FocusScoreCard

- Large animated focus score card.
- Show trend.
- Glass panel.
- Could include small score line chart.
- Text should be legible.

### 8D.5.2 ScoreHistoryChart

- Keep as line chart.
- Use mint line.
- Use very subtle grid.
- Avoid dark graph background.

### 8D.5.3 PersonalBestsGrid

- Same as Progress, but in profile context.
- Keep compact.

### 8D.5.4 Stats grid

Source `stats` from `useProfileData`.

Current component expects:

```ts
StatsItem {
  label: string;
  value: string;
  icon: string;
  color: string;
}
```

Design:

- 2 columns.
- Small glass cards.
- Icon top-left.
- Label caption.
- Value bold.

### 8D.5.5 Mastery card

Source content:

- Title: `Mastery`
- Subtitle: `${rankDisplay.icon} ${rankDisplay.title.toUpperCase()}`
- Badge: `{totalMasteryPoints} pts`
- Techniques:
  - `Duration`
  - `Purity`
  - `Consistency`
  - `Comeback`
  - `Boss`
- Each shows `{value}/25`
- Progress bar per technique

Important:

- Mastery card is allowed in Profile stats because it is already there.
- Do not make Boss look like a standalone boss system.
- Boss here is a technique metric only.

Visual:

- Premium glass card.
- Small crystalline rank icon.
- Mint bars; allow subtle different tones if already tokenized.
- Keep the label `Boss` because it is in current code, but do not add boss artwork.

## 8D.6 Achievements sub-tab

Even though default screenshot is stats, redesign should cover Achievements.

States:

### Loading

- Skeleton lines

### Error

- Title: `Achievements unavailable`
- Body: `Your identity rewards could not load right now. Retry from the achievements screen or come back after your next session.`
- CTA: `Open achievements`

### Empty

- Title: `No earned proof yet`
- Body: `Complete your first focus session to unlock real achievements on this profile.`
- CTA: `Start session`

### Active

Achievement card contains:

- icon circle
- title
- description
- progress label
- status badge
- earned/unearned opacity

Design:

- Achievement cards should feel like proof, not loot.
- No chests, currencies, or store framing.
- Use check-circle for earned, award for unearned as current code does.

## 8D.7 Activity sub-tab

States:

### Loading

- Skeleton cards

### Error

- Title: `Activity unavailable`
- Body: `We couldn't load your recent sessions right now.`
- CTA: `Start session`

### Empty

- Title: `No recent activity`
- Body: `Start a session to turn your profile into a live record of wins, streaks, and progression.`
- CTA: `Start session`

### Active

Session cards show:

- custom name or `Focus Session`
- date
- duration
- status badge:
  - `COMPLETED` or other status
- XP earned:
  - `{xpEarned} XP`

Design:

- Glass list cards.
- Status badge uses mint if completed.
- Keep list easy to scan.

## 8D.8 Bottom sheet

Source:

```txt
src/screens/profile/ProfileMasterySheet.tsx
```

Hidden by default.

Content:

- `{rankDisplay.icon} {rankDisplay.title}`
- `{totalMasteryPoints} total mastery points`
- Up to 3 challenges:
  - title
  - description
  - progress bar
  - `{current}/{target} {unit}`
  - `+{masteryPoints} MP`
- Empty:
  - `Complete sessions to unlock mastery challenges`

Design:

- Sheet background should be strong glass.
- Handle should be mint/gray.
- It should slide over a blurred background.
- Do not expose it in main screenshot unless user taps mastery.

---

## 9. Navigation / Bottom Tab Bar

## 9.1 Current structure

`MainNavigator.tsx` defines:

```tsx
<Tab.Screen name="Home" component={HomeScreen} />
<Tab.Screen name="Focus" component={FocusScreen} />
<Tab.Screen name="Progress" component={ProgressScreen} />
<Tab.Screen name="Profile" component={ProfileTabRoute} />
```

Keep this exactly.

## 9.2 `VexTabBar` redesign

Current `VexTabBar`:

- custom container
- rounded
- gradient background
- route map to `TabButton`
- active color `vexCyan`
- inactive `tabInactive`

New design:

- Floating frosted capsule
- No dark bottom gradient
- Active tab has a raised mint glass capsule
- Inactive labels visible but subdued
- Icons should be thin, clean, consistent
- Height safe-area aware

Suggested style:

```ts
tabBar: {
  marginHorizontal: 16,
  marginBottom: Math.max(insets.bottom - 4, 8),
  height: 72 + insets.bottom,
  borderRadius: 30,
  overflow: 'hidden',
  backgroundColor: 'rgba(255,255,255,0.72)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.84)',
  shadowColor: 'rgba(13,76,65,0.22)',
  shadowOpacity: 0.18,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 14 },
  elevation: 8,
}
```

Active tab:

```ts
activeTabPill: {
  backgroundColor: 'rgba(66,207,174,0.18)',
  borderColor: 'rgba(255,255,255,0.86)',
  borderWidth: 1,
  borderRadius: 999,
}
```

---

## 10. Implementation Plan for AI Agent

## 10.1 Phase 1 — create tokens and component primitives

Create:

```txt
src/theme/tokens/vex-light-glass.ts
src/components/glass/GlassScreen.tsx
src/components/glass/GlassCard.tsx
src/components/glass/GlassPill.tsx
src/components/glass/LiquidButton.tsx
src/components/glass/GlassIconOrb.tsx
src/components/glass/GlassProgressBar.tsx
src/components/glass/GlassTabBarSurface.tsx
src/components/glass/GlassSectionHeader.tsx
src/components/glass/index.ts
```

Do not redesign all screens before primitives exist.

## 10.2 Phase 2 — update theme defaults

Update theme creation so default app style is light glass.

Files likely involved:

- `src/theme/createTheme.ts`
- `src/theme/semanticColors.ts`
- `src/theme/tokens/colors.ts`
- `src/theme/tokens/index.ts`
- `app.json`

Important: `app.json` currently has:

```json
"userInterfaceStyle": "dark"
```

Change to:

```json
"userInterfaceStyle": "light"
```

or ensure the app theme overrides it correctly. If the app must support both modes later, the default for this release is still light glass.

## 10.3 Phase 3 — refactor primitive mappings

Update existing primitives to support light glass:

- `Card.tsx`
- `Button.tsx`
- `VexMotionSurface.tsx`
- `VexLaunchButton.tsx`
- `AppScreen.tsx`
- `Badge.tsx`
- `Skeleton.tsx`

Do not break existing props. Add variants or map existing variants.

Example:

- `Card variant="glass"` => `GlassCard default`
- `Card variant="premium"` => `GlassCard premium`
- `Card variant="elevated"` => `GlassCard strong`
- `VexMotionSurface variant="focused"` => `GlassCard hero`
- `VexMotionSurface variant="chrome"` => `GlassCard strong`
- `Button variant="primary"` => `LiquidButton primary`
- `Button variant="outline"` => glass outline

## 10.4 Phase 4 — refactor Home

Files:

- `src/screens/home/components/VexFocusSurface.tsx`
- `src/features/mode-native/components/ModeNativeHome.tsx`
- `src/screens/home/components/HomeContent.tsx`
- `src/screens/home/components/HomeHeroSection.tsx`
- `src/screens/home/components/HomeContentLower.tsx`
- `src/features/home-spine/components/StreakWidget.tsx`
- `src/features/home-spine/components/AtRiskBanner.tsx`

Tasks:

1. Replace dark hero gradient with light glass hero.
2. Keep hero data/copy exactly from priority/surface objects.
3. Add visible mode pill.
4. Update streak card to remove/avoid wagering/economy UI.
5. Update lower cards to glass.
6. Ensure Day Zero and Activated user states both work.
7. Ensure loading, error, and offline states remain visible.

## 10.5 Phase 5 — refactor Focus

Files:

- `src/screens/home/FocusScreen.tsx`
- `src/features/session-start/lane-builder.ts` only if copy truly needs cleanup

Tasks:

1. Wrap in `GlassScreen`.
2. Replace `Card` with glass styling.
3. Make Sprint primary/premium.
4. Add icon orbs.
5. Keep card data from `buildFocusModeCards`.
6. Preserve navigation params exactly.

## 10.6 Phase 6 — refactor Progress

Files:

- `src/screens/progress/ProgressScreen.tsx`
- `src/features/focus-identity/components/focus-score-dashboard.tsx`
- `src/features/focus-identity/components/score-card.tsx`
- `src/features/focus-identity/components/factor-map.tsx`
- `src/features/focus-identity/components/what-changed.tsx`
- `src/features/progression/components/progression-dashboard.tsx`
- `src/screens/progress/StudyOSCard.tsx`
- `src/screens/profile/components/PersonalBestsGrid.tsx`

Tasks:

1. Wrap in `GlassScreen`.
2. Convert dashboard cards to glass.
3. Improve chart/line visuals.
4. Keep empty/error states.
5. Keep premium gates through existing logic.
6. Do not show disabled features as active.

## 10.7 Phase 7 — refactor Profile

Files:

- `src/screens/profile/ProfileScreen.tsx`
- `src/screens/profile/ProfileHeader.tsx`
- `src/screens/profile/ProfileStatsTab.tsx`
- `src/screens/profile/ProfileAchievementsTab.tsx`
- `src/screens/profile/ProfileActivityTab.tsx`
- `src/screens/profile/ProfileMasterySheet.tsx`

Tasks:

1. Convert header to light glass.
2. Keep top icons and actions.
3. Convert sub-tabs to glass segmented control.
4. Update stats cards.
5. Preserve achievements/activity states.
6. Convert bottom sheet to glass.
7. Keep default tab `stats`.

## 10.8 Phase 8 — tests and visual QA

Run:

```bash
npm run lint
npm run typecheck
npm test
```

If available:

```bash
npm run test:app
npm run perf:audit
```

Manual QA:

- iPhone small screen
- iPhone Pro Max
- Android medium device
- reduced motion enabled
- offline mode
- new user state
- activated user state
- empty progress state
- no Focus Score state
- profile data loading/error states
- streak at-risk state
- feature gates locked/unlocked

---

## 11. Performance Requirements

Glass effects can be expensive. The redesign must remain smooth.

### 11.1 General rules

- Do not put heavy blur inside long lists repeatedly.
- Avoid nested blurs.
- Prefer one parent blur/surface with gradient overlays.
- Use static translucent fills on Android when needed.
- Use Reanimated for card entrance/press states.
- Respect `useReducedMotion`.
- Memoize expensive charts where possible.
- Do not animate every decorative orb simultaneously.

### 11.2 Blur strategy

iOS:

- If native glass APIs are available through Expo/RN version, use native glass for key surfaces only:
  - tab bar
  - hero cards
  - sheets
  - primary cards

Android:

- Use translucent fill + gradient + border + shadow fallback.
- Avoid high-cost realtime blur on long scroll content.

### 11.3 List performance

For `FlashList`:

- Keep `estimatedItemSize`.
- Avoid rendering large decorative blur layers per row.
- Use simple glass cards for session/achievement rows.
- Avoid `overflow: hidden` + large shadow conflicts when scrolling.

### 11.4 Battery and thermal

- No continuous infinite glow animations on core screens.
- Decorative hero shimmer may be static or slow.
- Use low opacity atmospheric layers.
- Reduce animation if device is low-power or reduced motion.

---

## 12. Accessibility Requirements

The app must be beautiful and readable.

### 12.1 Contrast

- Primary text over glass must meet readable contrast.
- Never place light gray text on translucent white.
- Use `#10231F` or similar dark slate for headings.
- Body text should be at least ~68% dark slate.
- Captions should not drop below ~46% dark slate unless decorative.

### 12.2 Dynamic type

- Do not hardcode tiny heights that clip text.
- Cards should grow vertically.
- CTAs should handle larger text.
- Tab labels should remain legible.

### 12.3 Touch targets

Minimum touch target: 44x44.

Applies to:

- tab buttons
- settings
- notifications
- logout
- mode pill if interactive
- CTA buttons
- streak row
- achievement card
- personal best card
- mastery card

### 12.4 Reduced motion

If `useReducedMotion` is true:

- Disable shimmer.
- Disable large card entrance animations.
- Replace spring expansions with instant or short fade.
- Keep progress bars readable.

### 12.5 Screen readers

Preserve accessibility labels/hints already in code.

Examples:

- `Open settings`
- `Open notifications`
- `Log out`
- `Refresh progress stats`
- `Open monthly focus report`
- `Start a focus session`
- `View Mastery details`

Do not remove accessibility props while refactoring.

---

## 13. Copy Rules

### 13.1 Use real app copy first

The app already has strong copy. Prefer existing strings from service/model outputs.

### 13.2 Do not write fake content into components

Do not hardcode marketing mock values unless creating a preview/storybook/demo fixture.

In production components:

- copy comes from hooks, models, services, or existing constants
- UI components are presentational
- feature gates control visibility

### 13.3 Acceptable sample fixture state

For Storybook/screenshot testing, this sample state is acceptable:

```ts
const activatedProjectModeFixture = {
  displayName: 'Woodarlyne',
  lane: 'deep_creative',
  modeLabel: 'Project mode',
  streakDays: 7,
  level: 7,
  xp: 2450,
  nextLevelThreshold: 3000,
  xpPercent: 81,
  focusScore: 82,
  focusBand: 'Stable',
  lastSessionDelta: 6,
  thirtyDayTrend: 14,
  currentStreak: '7 days',
  multiplier: 2.0,
  focusHours: '28.4h',
  completedSessions: '46',
  longestStreak: '12 days',
};
```

This is for preview only, not production state.

---

## 14. Exact Screen Snapshot Target

When creating marketing screenshots or UI references, use four phones in 4:3 landscape:

1. **Home** — Project mode, adaptive hero, first contract, coach, streak, focus score, memory/recent continuation.
2. **Focus** — focus mode cards with Sprint, Light Focus, Study, Recovery.
3. **Progress** — Focus Score Dashboard, Factor Map, What Changed, Progression, Study OS.
4. **Profile** — header, stats tab, Focus Score, Score History, Personal Bests, stat grid, Mastery.

This screenshot direction must not override production app logic. It is a visualization of an activated state.

---

## 15. Visual QA Checklist

Before considering the redesign complete, confirm:

### App-wide

- [ ] App opens in light glass theme by default.
- [ ] No dark obsidian hero cards remain in active default path.
- [ ] Text is legible on all glass surfaces.
- [ ] Tab bar is light glass and route labels are unchanged.
- [ ] Status bar works on light background.
- [ ] Safe area spacing is correct.
- [ ] No archived features are visible.
- [ ] No fake shop/currency/economy UI appears.
- [ ] No disabled feature appears active.

### Home

- [ ] Mode pill is visible.
- [ ] Hero surface uses real priority/surface data.
- [ ] Primary CTA still opens correct action.
- [ ] Coach/companion still follows feature gates.
- [ ] Streak widget does not show wagers/gems/shop-like insurance.
- [ ] At-risk banner only appears when logic says.
- [ ] Memory insight only appears with items.
- [ ] Lower contextual cards respect priority order.
- [ ] Secondary rail respects feature availability.

### Focus

- [ ] Header copy exact.
- [ ] Cards come from `buildFocusModeCards`.
- [ ] Sprint primary card is premium but not fake.
- [ ] Tapping each card navigates with correct params.
- [ ] Durations format correctly.
- [ ] Loading streak copy works.

### Progress

- [ ] Header copy exact.
- [ ] Focus Score empty/error/loading/active states work.
- [ ] Factor map labels exact.
- [ ] Monthly report action follows existing gate logic.
- [ ] Progression dashboard values render.
- [ ] Study OS locked/unlocked text exact.
- [ ] Personal Stats loading and values work.
- [ ] Personal Bests states work.

### Profile

- [ ] Header actions still work.
- [ ] Name/user line displays from auth state.
- [ ] Level/streak/XP render correctly.
- [ ] Sub-tabs switch correctly.
- [ ] Stats default tab works.
- [ ] Achievements states work.
- [ ] Activity states work.
- [ ] Mastery card keeps technique labels.
- [ ] Bottom sheet opens/looks correct if feature navigation allows.

---

## 16. Suggested File-Level Notes

### `src/components/primitives/VexMotionSurface.tsx`

Current variants may be biased toward dark surfaces. Re-map them:

- `focused` => light glass hero
- `chrome` => strong frosted glass
- `glass` => default frosted glass

Do not remove the API if many components use it.

### `src/components/primitives/VexLaunchButton.tsx`

Make it the signature VEX CTA:

- mint liquid fill
- high edge highlight
- pill shape
- sublabel support
- right arrow icon optional
- press animation

### `src/screens/home/components/VexFocusSurface.tsx`

Critical file. Replace dark `LinearGradient` colors with light glass layers.

Current dark colors likely include:

- `lightColors.semantic.liquidNight`
- `lightColors.semantic.obsidian`
- `lightColors.semantic.background`

These should not be active in the new default hero.

Use:

- page-matched glass fill
- mint aura
- pearl highlight
- subtle cyan/glass decorative shape

### `src/features/mode-native/components/ModeNativeHome.tsx`

Critical first-run/mode-native surface.

Keep:

- mode pill
- headline
- body
- first contract
- CTA
- secondary hint

Change:

- visual material to light glass
- decorative aurora to mint/pearl
- text to dark slate

### `src/features/home-spine/components/StreakWidget.tsx`

Important warning: this file imports `StreakInsuranceCard`, `WagerSection`, and gem-related props. Because archived docs forbid wagers/premium currency, audit this component carefully.

Final release default should not render:

- WagerSection
- gem balance
- purchase insurance tied to gems
- any economy framing

If logic must remain for old code paths, guard it behind a false final-release flag or remove from final visible UI.

### `src/screens/progress/StudyOSCard.tsx`

This is allowed progressive content. Make it premium/study but not paywall/store.

### `src/screens/profile/ProfileStatsTab.tsx`

Mastery card is okay, but keep it as identity/progression. Do not expand Boss into a feature preview here.

---

## 17. Implementation Guardrails for AI Agent

### 17.1 Before editing

Read:

1. `docs/design.md`
2. `docs/ARCHIVED_FEATURES_DO_NOT_REVIVE.md`
3. `docs/FINAL_RELEASE_FEATURE_CLASSIFICATION.md`
4. `src/navigation/MainNavigator.tsx`
5. Target screen files

### 17.2 During editing

- Do not remove business logic.
- Do not hardcode production sample data.
- Do not bypass feature gates.
- Do not create new feature routes unless asked.
- Do not import archived systems into visible Home/Profile/Progress cards.
- Do not delete accessibility labels.
- Do not make styling changes that break tests.
- Prefer additive tokens/components over one-off inline styling.

### 17.3 After editing

Run:

```bash
npm run lint
npm run typecheck
npm test
```

Then manually inspect each main tab.

---

## 18. Acceptance Criteria

The redesign is accepted only if all of these are true:

1. VEX has a complete, consistent light glass theme.
2. The active app no longer feels dark, cyberpunk, or ugly.
3. Home, Focus, Progress, and Profile remain structurally accurate to the code.
4. The app includes real app copy and real data-driven UI.
5. Disabled/archived features are not visible.
6. The bottom tab bar is light glass and polished.
7. CTAs feel tactile and premium.
8. Progress and Profile charts/cards remain readable.
9. Streak UI does not show wager/economy/gem/store mechanics.
10. Performance remains acceptable.
11. Accessibility remains intact.
12. The result looks June 2026 worthy: liquid, refined, modern, and emotionally premium.

---

## 19. One-Sentence Direction for the Agent

> Rebuild VEX’s active Home, Focus, Progress, and Profile experience into a fully light mint-and-glass productivity OS using reusable glass primitives, preserving the real app copy, data flow, feature gates, accessibility, and final-release feature boundaries while removing the old dark visual language from the default experience.

---

## 20. Do Not Misinterpret This Spec

This spec does **not** ask for:

- A marketing-only mockup
- A new feature set
- A new navigation model
- A full rewrite
- A dark/light theme toggle
- A fake AI dashboard
- A shop/economy/gamification revival
- A screenshot-only implementation

This spec asks for:

- A production-real UI redesign
- A reusable design system
- Accurate VEX app structure
- Beautiful, artistic, industry-leading light glass
- Strict final-release discipline

---

## 21. Final Product Feeling

When the redesign is complete, opening VEX should feel like holding a calm piece of intelligent glass.

The user should immediately understand:

- “This app knows my mode.”
- “This app knows what matters now.”
- “I can start the right kind of block quickly.”
- “My progress is visible without pressure.”
- “My profile is proof of execution.”
- “This is beautiful enough to make me want to use it every day.”

That is the bar.
