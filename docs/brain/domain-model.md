# Domain Model Reference Document

## Core Entities

### User

**What it represents:** The human using the app. The root of all data ownership.

**Key fields:**
```typescript
interface User {
  id: string;              // UUID, auth.uid() from Supabase
  email: string;           // Unique, verified
  username: string;        // Unique, 3-20 chars, alphanumeric + underscore
  displayName: string;     // 1-50 chars, what others see
  avatarUrl: string | null; // Nullable, CDN URL
  timezone: string;        // IANA timezone (e.g., 'America/New_York')
  createdAt: number;       // Unix timestamp ms
  lastActiveAt: number;    // Unix timestamp ms
  isOnboarded: boolean;    // Has completed onboarding flow
  preferences: UserPreferences;
}
```

**Owned by:** Auth system (Supabase Auth)

**Cannot exist without:** Nothing - User is the root entity

**Produces/affects:**
- Creates Sessions (user starts session)
- Creates Wallets (auto-created on signup)
- Creates Progression (auto-created on signup)
- Creates Streak (auto-created on signup)
- Belongs to Squads (many-to-many via squad_members)
- Receives Notifications
- Generates OfflineQueueEntries

---

### Session

**What it represents:** A single focus/work period. The core gameplay loop of the app.

**Key fields:**
```typescript
interface Session {
  id: string;                    // UUID
  userId: string;                // FK to users.id
  status: SessionStatus;         // CREATED | ACTIVE | PAUSED | COMPLETED | ABANDONED
  phase: SessionPhase;           // FOCUS | SHORT_BREAK | LONG_BREAK
  
  // Configuration (immutable after creation)
  config: {
    duration: number;            // Seconds, 60-7200
    breakDuration: number;       // Seconds, 0-3600
    intervals: number;           // 1-10 focus periods
    strictMode: boolean;         // Cannot pause
    category: string;            // 'work', 'study', 'creative', etc.
  };
  
  // Runtime state
  currentInterval: number;       // 1-based, which interval we're on
  elapsedSeconds: number;      // Total seconds elapsed
  remainingSeconds: number;    // Seconds left in current phase
  
  // Scoring
  score: number;               // 0-1000, calculated on completion
  qualityScore: number;        // 0-100, based on pauses/interruptions
  consistencyScore: number;    // 0-100, based on phase adherence
  
  // Metadata
  startedAt: number | null;    // When session began
  completedAt: number | null;  // When session ended (success or abandon)
  createdAt: number;             // When record created
  updatedAt: number;             // Last modification
  
  // Optional reflection
  reflection: string | null;     // User's post-session notes
  mood: 'GREAT' | 'GOOD' | 'NEUTRAL' | 'BAD' | 'TERRIBLE' | null;
}
```

**Owned by:** Session feature

**Cannot exist without:** Valid User (userId required, enforced by RLS)

**Produces/affects:**
- Produces XP → feeds into Progression
- Produces SessionHistoryEntry → recorded in history
- Affects Streak (may increment or break)
- Triggers Rewards (completion rewards)
- Applies damage to BossEncounter (if active)
- Generates analytics events
- Creates Notifications (reminders, completion)

---

### Streak

**What it represents:** Consecutive days of qualifying sessions. The primary engagement mechanic.

**Key fields:**
```typescript
interface Streak {
  id: string;                  // UUID
  userId: string;              // FK to users.id
  currentDays: number;         // Current consecutive days
  longestDays: number;         // All-time record
  
  // Tracking
  lastQualifyingSessionAt: number | null;  // Last session that counted
  currentDayCompletedAt: number | null;    // Today's qualifying session time
  
  // Grace mechanics
  shieldsAvailable: number;      // Streak shields (prevent break)
  gracePeriodUsed: boolean;      // Has user used grace period this break
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}

// Qualifying session definition
const QUALIFYING_SESSION_MIN_DURATION = 15 * 60; // 15 minutes in seconds
```

**Owned by:** Streaks feature

**Cannot exist without:** User (auto-created on user signup)

**Produces/affects:**
- Provides XP multiplier to Sessions
- Triggers Streak milestone Rewards (day 3, 7, 14, 30, etc.)
- Affects Progression (streak bonuses)
- Breaks generate Comeback mechanics

---

### Reward

**What it represents:** Something the user earns and can claim. Virtual goods, currency, or unlocks.

**Key fields:**
```typescript
interface Reward {
  id: string;                  // UUID
  userId: string;              // FK to users.id
  
  // What was earned
  type: RewardType;            // 'XP' | 'COINS' | 'GEMS' | 'ITEM' | 'COSMETIC' | 'TITLE'
  amount: number | null;       // For currency rewards
  itemId: string | null;       // For item/cosmetic rewards
  
  // Trigger
  triggerType: RewardTrigger;  // 'SESSION_COMPLETE' | 'STREAK_MILESTONE' | etc.
  triggerId: string | null;    // Session ID, streak ID, etc.
  
  // State
  status: 'PENDING' | 'CLAIMED' | 'EXPIRED' | 'FAILED';
  claimedAt: number | null;
  expiresAt: number | null;    // Some rewards expire
  
  // Metadata
  createdAt: number;
}

type RewardType = 
  | 'XP'           // Experience points
  | 'COINS'        // Soft currency
  | 'GEMS'         // Hard currency
  | 'ITEM'         // Inventory item (consumable or permanent)
  | 'COSMETIC'     // Visual customization
  | 'TITLE'        // Profile title
  | 'STREAK_SHIELD'; // Protects streak from breaking

type RewardTrigger =
  | 'SESSION_COMPLETE'
  | 'STREAK_MILESTONE'
  | 'BOSS_DEFEAT'
  | 'LEVEL_UP'
  | 'SQUAD_CHALLENGE'
  | 'COMEBACK'
  | 'DAILY_LOGIN'
  | 'ACHIEVEMENT_UNLOCK';
```

**Owned by:** Rewards feature

**Cannot exist without:** User (recipient)

**Produces/affects:**
- XP rewards → Progression system
- Currency rewards → Wallet
- Item/Cosmetic rewards → Inventory
- Triggers notifications

---

### Squad

**What it represents:** A group of users who focus together. Social and collaborative gameplay.

**Key fields:**
```typescript
interface Squad {
  id: string;                  // UUID
  name: string;                // 3-50 chars
  description: string | null;  // Optional, max 500 chars
  avatarUrl: string | null;    // Squad icon
  
  // Stats
  memberCount: number;         // Current members, 1-50
  totalFocusTime: number;      // Aggregate seconds focused
  completedSessions: number;   // Aggregate sessions completed
  
  // Multiplier mechanics
  focusMultiplier: number;     // XP bonus for squad members, 1.0-2.0
  multiplierLastUpdated: number; // When multiplier was recalculated
  
  // Challenge system
  activeChallengeId: string | null; // Current squad challenge
  challengeProgress: number;     // 0-100, challenge completion
  
  // Boss encounter
  activeBossId: string | null; // Shared boss being fought
  bossHealthRemaining: number | null;
  
  // Metadata
  createdAt: number;
  updatedAt: number;
  createdBy: string;             // User ID of founder
}

interface SquadMember {
  squadId: string;
  userId: string;
  role: 'FOUNDER' | 'ADMIN' | 'MEMBER';
  joinedAt: number;
  lastContributionAt: number | null; // Last session that helped squad
  contributionScore: number;     // Total contribution to squad
}
```

**Owned by:** Social feature

**Cannot exist without:** User (creator, founder)

**Produces/affects:**
- Provides XP multiplier to member Sessions
- Creates Squad challenges
- Shares Boss encounters
- Generates Squad rewards

---

### Wallet

**What it represents:** User's virtual currency holdings. Atomic transaction ledger.

**Key fields:**
```typescript
interface Wallet {
  id: string;                  // UUID
  userId: string;              // FK to users.id
  
  // Balances (all non-negative)
  coins: number;               // Soft currency, freely earnable
  gems: number;                // Hard currency, premium/purchase
  
  // Totals for analytics
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalGemsEarned: number;
  totalGemsSpent: number;
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}

interface WalletTransaction {
  id: string;                  // UUID
  walletId: string;            // FK to wallets.id
  userId: string;              // Denormalized for queries
  
  type: 'EARN' | 'SPEND' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'REFUND';
  currency: 'COINS' | 'GEMS';
  amount: number;              // Positive for all types
  
  // Source tracking
  sourceType: 'SESSION' | 'STREAK' | 'BOSS' | 'SHOP' | 'SQUAD' | 'REWARD' | 'PURCHASE';
  sourceId: string | null;     // Session ID, purchase ID, etc.
  
  // Balance snapshots (for audit)
  balanceBefore: number;
  balanceAfter: number;
  
  createdAt: number;
}
```

**Owned by:** Economy feature

**Cannot exist without:** User (auto-created on signup)

**Produces/affects:**
- Balance changes from Rewards
- Spending in Shop
- Squad transfers (if squad has shared treasury)
- Feeds into analytics

**Enforced invariant:** Balance can never go negative (database constraint + app validation)

---

### ItemDefinition

**What it represents:** Template for items that can be owned, consumed, equipped, or crafted. The "class" definition that InventoryItems instantiate.

**Key fields:**
```typescript
interface ItemDefinition {
  id: string;                  // UUID
  name: string;                // Display name (e.g., "Focus Potion")
  description: string;         // Flavor text + effect description
  
  // Classification
  type: 'CONSUMABLE' | 'EQUIPMENT' | 'COSMETIC' | 'CRAFTING' | 'COLLECTIBLE';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  
  // Visual
  iconUrl: string | null;      // CDN URL for icon
  
  // For equipment
  slot: 'HEAD' | 'BODY' | 'HANDS' | 'FEET' | 'ACCESSORY' | 'WEAPON' | 'PET' | null;
  
  // Effects (for consumables/equipment)
  effects: {
    type: 'XP_BOOST' | 'STREAK_SHIELD' | 'BOSS_DAMAGE' | 'COOLDOWN_REDUCTION';
    value: number;             // Percent or flat value
    duration: number | null;   // Seconds, null = permanent
  }[];
  
  // Shop availability
  shopPrice: {
    coins: number | null;
    gems: number | null;
  } | null;                     // Null = not sold in shop
  
  // Crafting (if craftable)
  craftingRecipeId: string | null;
  
  // Availability window
  availableFrom: number | null;
  availableUntil: number | null;
  
  // Metadata
  isUnique: boolean;           // Can only own one
  maxStackSize: number;        // Max per inventory slot (1 for equipment)
  
  createdAt: number;
  updatedAt: number;
}
```

**Owned by:** Items feature

**Cannot exist without:** Nothing (seed data, created by admins)

**Produces/affects:**
- Creates InventoryItems when purchased/crafted/rewarded
- Provides template for Shop listings
- Used by Crafting recipes as ingredients or outputs

---

### InventoryItem

**What it represents:** A specific instance of an ItemDefinition owned by a user. The "object" to ItemDefinition's "class".

**Key fields:**
```typescript
interface InventoryItem {
  id: string;                  // UUID (this is the instance ID)
  userId: string;            // FK to users.id
  itemDefinitionId: string;  // FK to item_definitions.id
  
  // State
  status: 'OWNED' | 'EQUIPPED' | 'CONSUMED' | 'TRADED' | 'DESTROYED';
  quantity: number;          // For stackable items
  
  // Equipment state (null for non-equipment)
  slot: EquipmentSlot | null;
  equippedAt: number | null;
  
  // Acquisition tracking
  acquiredAt: number;
  acquiredFrom: 'SHOP' | 'CRAFTING' | 'DROP' | 'REWARD' | 'TRADE';
  sourceId: string | null;   // Purchase ID, crafting job ID, etc.
  
  // Expiration (for temporary items)
  expiresAt: number | null;
  
  // Metadata
  metadata: Record<string, unknown>; // Custom per-item data
  
  createdAt: number;
  updatedAt: number;
}
```

**Owned by:** Inventory feature

**Cannot exist without:** User + ItemDefinition

**Produces/affects:**
- Can be consumed (consumables)
- Can be equipped/unequipped (equipment)
- Can be used in crafting (ingredients)
- Changes affect Wallet (refunds on destroy)

---

### ShopItem

**What it represents:** An ItemDefinition currently available for purchase in the shop. Links pricing and availability to the item template.

**Key fields:**
```typescript
interface ShopItem {
  id: string;                  // UUID
  itemDefinitionId: string;    // FK to item_definitions.id
  
  // Pricing (overrides ItemDefinition.shopPrice if set)
  price: {
    coins: number | null;
    gems: number | null;
  };
  
  // Availability
  isAvailable: boolean;
  availableFrom: number | null;
  availableUntil: number | null;
  
  // Purchase limits
  purchaseLimit: {
    maxPerUser: number | null;     // Null = unlimited
    maxPerDay: number | null;
    globalStock: number | null;    // Null = unlimited
  } | null;
  
  // Display
  sortOrder: number;         // Position in category listing
  featured: boolean;         // Show in featured section
  discountPercent: number;   // 0-100, for sales
  
  // Categories for filtering
  categories: string[];
  
  // Metadata
  requiresLevel: number;     // Minimum user level to purchase
  requiresAchievement: string | null; // Must have achievement to purchase
  
  createdAt: number;
  updatedAt: number;
}
```

**Owned by:** Shop feature

**Cannot exist without:** ItemDefinition

**Produces/affects:**
- Creates InventoryItem on successful purchase
- Creates WalletTransaction for spend
- Fires analytics events

---

### CraftingRecipe

**What it represents:** A blueprint for transforming ingredients into a target item. Defines the crafting process parameters.

**Key fields:**
```typescript
interface CraftingRecipe {
  id: string;                  // UUID
  name: string;                // Recipe name (e.g., "Enhanced Focus Potion")
  description: string;
  
  // Output
  targetItemDefinitionId: string;
  targetQuantity: number;      // How many of the item produced
  
  // Ingredients
  ingredients: {
    itemDefinitionId: string;
    quantity: number;
    consumeOnFailure: boolean;  // Keep if crafting fails?
  }[];
  
  // Requirements
  requiredLevel: number;       // User level requirement
  requiredStationType: CraftingStationType;
  stationLevel: number;        // Minimum station level
  
  // Success/failure
  successRate: number;         // 0.0-1.0, base success chance
  failureResult: {
    type: 'NOTHING' | 'PARTIAL' | 'SCRAP';
    scrapItemDefinitionId: string | null;
  };
  
  // Time
  baseCraftingTime: number;  // Seconds
  
  // Unlock
  isDefaultUnlocked: boolean;
  unlockRequirement: {
    type: 'LEVEL' | 'ACHIEVEMENT' | 'QUEST' | 'PREVIOUS_RECIPE';
    value: string | number;
  } | null;
  
  // Metadata
  category: 'POTIONS' | 'EQUIPMENT' | 'MATERIALS' | 'SPECIAL';
  
  createdAt: number;
  updatedAt: number;
}
```

**Owned by:** Crafting feature

**Cannot exist without:** ItemDefinitions (for ingredients and output)

**Produces/affects:**
- Creates CraftingJob when started
- Consumes InventoryItems (ingredients)
- Produces InventoryItems on completion

---

### CraftingJob

**What it represents:** An in-progress or completed crafting operation. Tracks the state of item creation over time.

**Key fields:**
```typescript
interface CraftingJob {
  id: string;                  // UUID
  userId: string;
  recipeId: string;            // FK to crafting_recipes.id
  
  // State
  status: 'PENDING' | 'CRAFTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'CLAIMED';
  
  // Timing
  startedAt: number;
  completedAt: number | null;  // When finished/failed/cancelled
  claimedAt: number | null;    // When user claimed result
  
  // Progress
  totalDuration: number;       // Seconds
  progress: number;            // 0.0-1.0, can accelerate with gems
  
  // Ingredients consumed
  ingredientsUsed: {
    inventoryItemId: string;
    itemDefinitionId: string;
    quantity: number;
  }[];
  
  // Result (populated on completion)
  result: {
    success: boolean;
    outputItemId: string | null;  // Inventory item created
    quantity: number;
    scrapsCreated: number;
  } | null;
  
  // Station used
  craftingStationId: string;
  
  createdAt: number;
  updatedAt: number;
}
```

**Owned by:** Crafting feature

**Cannot exist without:** User + CraftingRecipe + CraftingStation

**State Flow:**
```
PENDING → CRAFTING (when started, ingredients consumed)
  ↓
COMPLETED (time elapsed, success calculated)
  ↓
CLAIMED (user claims result, items delivered)
  OR
FAILED (bad luck or cancelled, partial refund possible)
```

---

### CraftingStation

**What it represents:** A crafting facility that enables recipes. Users unlock and upgrade stations to craft better items.

**Key fields:**
```typescript
interface CraftingStation {
  id: string;                  // UUID
  userId: string;
  
  // Type
  type: 'WORKBENCH' | 'ALCHEMY_LAB' | 'FORGE' | 'ENCHANTMENT_TABLE' | 'KITCHEN';
  
  // Level
  level: number;               // 1-10, determines recipe access
  maxLevel: number;            // Cap for this station type
  
  // State
  isUnlocked: boolean;
  unlockedAt: number | null;
  
  // Active job
  currentJobId: string | null;
  
  // Stats (increase with level)
  efficiency: number;          // 1.0-2.0, crafting speed multiplier
  successBonus: number;      // 0.0-0.25, success rate bonus
  
  // Upgrade costs
  upgradeCosts: {
    level: number;
    gems: number;
    timeReduction: number;
  }[];
  
  createdAt: number;
  updatedAt: number;
}
```

**Owned by:** Crafting feature

**Cannot exist without:** User

**Produces/affects:**
- Enables recipes of matching type
- Affects crafting speed and success rate
- Can have one active job at a time

---

### Progression

**What it represents:** User's level and XP accumulation. Long-term advancement.

**Key fields:**
```typescript
interface Progression {
  id: string;                  // UUID
  userId: string;              // FK to users.id
  
  // Current state
  level: number;               // 1+, current level
  xp: number;                  // XP in current level (0 to nextLevelThreshold)
  totalXp: number;             // Cumulative XP earned
  
  // Next level
  nextLevelThreshold: number;  // XP needed to reach level + 1
  
  // Battle pass (seasonal progression)
  battlePassTier: number;      // 1-100
  battlePassXp: number;        // XP in current tier
  
  // Unlock tracking
  unlockedFeatures: string[];  // Feature IDs unlocked
  unlockedCosmetics: string[]; // Cosmetic IDs unlocked
  
  // Metadata
  createdAt: number;
  updatedAt: number;
  lastLevelUpAt: number | null;
}

// XP thresholds per level (formula-based)
function calculateLevelThreshold(level: number): number {
  // Exponential growth: base 100, +25% per level
  return Math.floor(100 * Math.pow(1.25, level - 1));
}
```

**Owned by:** Progression feature

**Cannot exist without:** User (auto-created on signup)

**Produces/affects:**
- Unlocks content (features, bosses, shop items)
- Level-up triggers Rewards
- Gates boss encounters (min level requirements)

---

### BossEncounter

**What it represents:** An active challenge the user (or squad) is fighting. Time-limited collaborative goal.

**Key fields:**
```typescript
interface BossEncounter {
  id: string;                  // UUID
  bossId: string;              // FK to boss_templates.id (static data)
  
  // Who is fighting
  userId: string | null;       // For solo encounters
  squadId: string | null;      // For squad encounters
  
  // State
  healthRemaining: number;     // 0 to maxHealth
  maxHealth: number;           // Boss total health pool
  damageDealt: number;         // Total damage applied
  
  // Progress
  status: 'ACTIVE' | 'DEFEATED' | 'TIMEOUT' | 'ABANDONED';
  startedAt: number;
  expiresAt: number;           // Must defeat before this time
  defeatedAt: number | null;
  
  // Session tracking
  contributingSessionIds: string[]; // Sessions that dealt damage
  
  // Metadata
  createdAt: number;
}

interface BossTemplate {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  
  // Stats
  baseHealth: number;          // Base health at level 1
  healthScaling: number;       // Multiplier per user level
  minLevel: number;            // Level required to unlock
  
  // Duration
  timeLimit: number;           // Seconds to defeat
  
  // Rewards
  rewardType: RewardType;
  rewardAmount: number;
  rewardItemId: string | null;
}
```

**Owned by:** Boss feature

**Cannot exist without:** User OR Squad (one must be set), plus BossTemplate

**Produces/affects:**
- Damage applied from Sessions
- Defeat triggers Rewards
- Timeout triggers penalties
- Unlocks higher-tier bosses

---

### OfflineQueueEntry

**What it represents:** An operation waiting to sync when connection returns.

**Key fields:**
```typescript
interface OfflineQueueEntry {
  id: string;                  // UUID
  userId: string;              // FK to users.id
  
  // Operation
  type: OfflineOperationType;
  payload: Record<string, unknown>;
  
  // State
  status: 'PENDING' | 'PROCESSING' | 'FAILED' | 'DEAD';
  retryCount: number;          // 0-3
  priority: 1 | 2 | 3;         // 1=high, 3=low
  
  // Error tracking
  lastError: string | null;
  lastAttemptAt: number | null;
  
  // Timestamps
  createdAt: number;
  processedAt: number | null;
}

type OfflineOperationType =
  | 'CREATE_SESSION'
  | 'UPDATE_SESSION'
  | 'COMPLETE_SESSION'
  | 'CLAIM_REWARD'
  | 'UPDATE_PROGRESSION'
  | 'PURCHASE_ITEM'
  | 'UPDATE_PREFERENCES';
```

**Owned by:** Offline feature

**Cannot exist without:** User

**Produces/affects:**
- Processed entries mutate their target entities
- Failed entries trigger error handling
- Dead entries logged to Sentry

---

### Notification

**What it represents:** A message sent to the user. In-app, push, or both.

**Key fields:**
```typescript
interface Notification {
  id: string;                  // UUID
  userId: string;              // FK to users.id
  
  // Content
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown> | null; // Deep link payload
  
  // State
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  readAt: number | null;
  
  // Delivery
  channel: 'IN_APP' | 'PUSH' | 'BOTH';
  pushDeliveredAt: number | null;
  pushToken: string | null;      // FCM/APNS token used
  
  // Scheduling
  scheduledFor: number | null; // Future delivery
  expiresAt: number | null;    // Auto-archive after
  
  // Source
  sourceType: 'SESSION' | 'STREAK' | 'REWARD' | 'BOSS' | 'SQUAD' | 'SYSTEM';
  sourceId: string | null;
  
  createdAt: number;
}

type NotificationType =
  | 'SESSION_REMINDER'         // Upcoming session
  | 'SESSION_COMPLETE'         // Session finished
  | 'STREAK_AT_RISK'          // Haven't focused today
  | 'STREAK_BROKEN'           // Streak lost
  | 'STREAK_MILESTONE'        // Day 7, 30, etc.
  | 'REWARD_AVAILABLE'        // Claim your reward
  | 'BOSS_DEFEATED'           // Victory
  | 'BOSS_TIMEOUT_WARNING'    // 1 hour left
  | 'SQUAD_INVITE'            // Join squad
  | 'SQUAD_CHALLENGE'         // New challenge
  | 'LEVEL_UP'                // Congratulations
  | 'COME_BACK'               // Re-engagement
  | 'SYSTEM_ANNOUNCEMENT';    // Maintenance, updates
```

**Owned by:** Notifications feature

**Cannot exist without:** User

**Produces/affects:**
- Displayed to user
- May trigger actions (deep links)
- Dismissed/archived by user

---

### Season

**What it represents:** A time-limited progression event with tiers and rewards. The primary retention mechanic.

**Key fields:**
```typescript
interface Season {
  id: string;                    // UUID
  name: string;                  // Display name
  description: string;           // Rich description
  theme: string;                 // Visual theme identifier
  
  // Lifecycle
  startAt: number;               // Unix timestamp ms
  endAt: number;                 // Unix timestamp ms
  archivedAt: number | null;     // When archived
  isActive: boolean;             // Currently active
  
  // Configuration
  tierCount: number;             // Total tiers (10-100)
  xpPerTier: number;             // XP needed per tier (500-5000)
  premiumPriceGems: number;      // Premium track cost (99-4999)
  
  createdAt: number;             // Creation timestamp
}
```

**Owned by:** Seasons feature

**Cannot exist without:** Nothing - Seasons are root entities

**Produces/affects:**
- Creates BattlePass tiers
- Generates SeasonMilestones
- Triggers UserSeasonProgress for participants
- Produces season-specific Challenges
- Generates notifications (season start, end reminders)
- Affects analytics (engagement, monetization)

---

### UserSeasonProgress

**What it represents:** A user's progression within a specific season.

**Key fields:**
```typescript
interface UserSeasonProgress {
  id: string;                    // UUID
  userId: string;                // FK to users.id
  seasonId: string;              // FK to seasons.id
  
  // Progress
  currentTier: number;           // Current tier (0 to tierCount)
  tierXp: number;                // XP within current tier
  totalSeasonXp: number;         // Total XP earned this season
  
  // Premium status
  isPremium: boolean;            // Has purchased premium track
  premiumPurchasedAt: number | null;
  
  // Claimed rewards
  claimedTiers: string[];        // Array of claimed tier IDs
  
  createdAt: number;
  updatedAt: number;
}
```

**Owned by:** Seasons feature

**Cannot exist without:** Valid User and Season

**Produces/affects:**
- Feeds into BattlePass tier claiming
- Triggers reward delivery
- Updates when XP earned from any source
- Generates analytics events

---

### BattlePassTier

**What it represents:** A reward tier within a season's battle pass.

**Key fields:**
```typescript
interface BattlePassTier {
  id: string;                    // UUID
  seasonId: string;              // FK to seasons.id
  tierNumber: number;            // 1-based tier number
  xpRequired: number;            // XP needed to unlock
  
  // Free track reward
  freeRewardType: 'COINS' | 'GEMS' | 'ITEM' | 'TITLE' | 'XP' | null;
  freeRewardAmount: number | null;
  freeRewardItemId: string | null;
  
  // Premium track reward
  premiumRewardType: 'COINS' | 'GEMS' | 'ITEM' | 'TITLE' | 'XP' | null;
  premiumRewardAmount: number | null;
  premiumRewardItemId: string | null;
  
  // Visual
  iconUrl: string | null;
  isMajorMilestone: boolean;     // Special milestone tier
  
  createdAt: number;
}
```

**Owned by:** Battle Pass feature

**Cannot exist without:** Valid Season

**Produces/affects:**
- Rewards delivered upon tier claim
- Analytics tracking (engagement, monetization)
- Triggers notifications for major milestones

---

### Challenge

**What it represents:** A task for users to complete for rewards.

**Key fields:**
```typescript
interface Challenge {
  id: string;                    // UUID
  seasonId: string | null;     // Optional season association
  
  // Challenge details
  type: 'DAILY' | 'WEEKLY' | 'EVENT' | 'STREAK_BONUS';
  category: 'FOCUS_TIME' | 'SESSION_COUNT' | 'STREAK' | 'BOSS_DAMAGE' | 'SOCIAL';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  
  // Requirements
  title: string;
  description: string;
  targetValue: number;           // Target to complete
  targetType: string;            // What to measure
  
  // Rewards
  rewardType: 'COINS' | 'GEMS' | 'ITEM' | 'XP' | 'TITLE';
  rewardAmount: number;
  rewardItemId: string | null;
  
  // Lifecycle
  startAt: number;
  endAt: number | null;
  isActive: boolean;
  
  createdAt: number;
}
```

**Owned by:** Challenges feature

**Cannot exist without:** Nothing - Challenges can be global or season-specific

**Produces/affects:**
- Creates UserChallenge instances for users
- Triggers rewards on completion
- Feeds into Progression (XP rewards)
- Updates analytics (completion rates)

---

### UserChallenge

**What it represents:** A user's instance of a challenge with their progress.

**Key fields:**
```typescript
interface UserChallenge {
  id: string;                    // UUID
  userId: string;                // FK to users.id
  challengeId: string;           // FK to challenges.id
  
  // Progress
  currentValue: number;          // Current progress
  status: 'ACTIVE' | 'COMPLETED' | 'CLAIMED' | 'EXPIRED' | 'REROLLED';
  
  // Timestamps
  assignedAt: number;
  completedAt: number | null;
  claimedAt: number | null;
  expiresAt: number | null;
  
  // Reroll tracking
  rerollCount: number;
  rerolledFromId: string | null; // Previous challenge if rerolled
  
  createdAt: number;
}
```

**Owned by:** Challenges feature

**Cannot exist without:** Valid User and Challenge

**Produces/affects:**
- Progress updates trigger completion checks
- Completion triggers reward delivery
- Reroll tracking prevents fraud
- Generates analytics (completion time, difficulty)

---

### LiveOpsConfig

**What it represents:** Remote configuration for feature flags and A/B tests.

**Key fields:**
```typescript
interface LiveOpsConfig {
  version: number;               // Config version
  updatedAt: number;             // Last update timestamp
  
  // Feature flags
  features: Record<string, {
    enabled: boolean;
    rolloutPercentage: number;    // 0-100
    description: string;
    targetUserIds: string[] | null;
    targetSegments: string[] | null;
  }>;
  
  // A/B tests
  abTests: Record<string, {
    enabled: boolean;
    variants: Array<{
      id: string;
      weight: number;            // 0-100
      value: unknown;
    }>;
    audience: {
      minLevel: number;
      maxLevel: number | null;
      platforms: ('ios' | 'android' | 'web')[];
    };
  }>;
  
  // Maintenance
  maintenance: {
    enabled: boolean;
    message: string;
    estimatedEndTime: number | null;
  };
}
```

**Owned by:** LiveOps Config feature

**Cannot exist without:** Nothing - Global configuration

**Produces/affects:**
- Controls feature availability
- Routes users to A/B test variants
- Triggers maintenance mode UI
- Caches locally for offline access

---

## Entity Relationship Map

```
User
  ├─ owns → Wallet (1:1)
  ├─ owns → Progression (1:1)
  ├─ owns → Streak (1:1)
  ├─ creates → Session (1:many)
  ├─ receives → Reward (1:many)
  ├─ receives → Notification (1:many)
  ├─ generates → OfflineQueueEntry (1:many)
  ├─ belongs to → Squad (many:many via SquadMember)
  ├─ fights → BossEncounter (1:many, solo)
  └─ creates → Notification (as trigger)

Session
  ├─ belongs to → User (many:1)
  ├─ produces → XP → Progression
  ├─ affects → Streak (may increment or break)
  ├─ triggers → Reward (completion rewards)
  ├─ contributes to → BossEncounter (deals damage)
  ├─ belongs to → Squad (affects squad stats)
  └─ produces → SessionHistoryEntry

Squad
  ├─ founded by → User (1:1 founder)
  ├─ has members → User (1:many via SquadMember)
  ├─ shares → BossEncounter (1:1 active boss)
  ├─ provides multiplier → Session (affects member XP)
  └─ creates → Squad challenge Rewards

BossEncounter
  ├─ fought by → User (solo) OR Squad (shared)
  ├─ based on → BossTemplate (static definition)
  ├─ receives damage from → Session (contributing sessions)
  ├─ defeat triggers → Reward
  └─ timeout triggers → Penalty

Wallet
  ├─ belongs to → User (1:1)
  ├─ receives → Reward (currency rewards)
  ├─ spends in → Shop (buy items)
  ├─ records → WalletTransaction (ledger)
  └─ contributes to → Squad (if shared treasury)

Progression
  ├─ belongs to → User (1:1)
  ├─ receives XP from → Session
  ├─ receives XP from → Reward
  ├─ level up unlocks → features, bosses, shop items
  └─ level up triggers → Reward

Streak
  ├─ belongs to → User (1:1)
  ├─ incremented by → Session (qualifying sessions)
  ├─ milestone triggers → Reward
  ├─ break triggers → Penalty
  └─ provides multiplier → Session (XP bonus)

Reward
  ├─ belongs to → User (1:many)
  ├─ triggered by → Session | Streak | Boss | LevelUp | Squad
  ├─ adds to → Wallet (currency rewards)
  ├─ adds to → Inventory (item rewards)
  ├─ adds to → Progression (XP rewards)
  └─ creates → Notification

OfflineQueueEntry
  ├─ belongs to → User (1:many)
  ├─ targets → Session | Wallet | Progression | etc.
  └─ processed → mutates target entity

Notification
  ├─ belongs to → User (1:many)
  ├─ triggered by → any system
  └─ may deep link → Session | Squad | Reward | etc.

Season
  ├─ has many → BattlePassTier (tier rewards)
  ├─ has many → UserSeasonProgress (participant progress)
  ├─ generates → Challenge (season-specific challenges)
  ├─ triggers → Notification (start/end reminders)
  └─ controlled by → LiveOpsConfig (feature flag)

BattlePassTier
  ├─ belongs to → Season (many:1)
  ├─ claimed via → UserSeasonProgress
  ├─ delivers → Reward (free or premium track)
  └─ milestone triggers → Notification

UserSeasonProgress
  ├─ belongs to → User (many:1)
  ├─ belongs to → Season (many:1)
  ├─ claims → BattlePassTier (tier rewards)
  ├─ receives XP from → any activity
  └─ purchase triggers → Wallet (gem deduction)

Challenge
  ├─ optional belongs to → Season (many:1)
  ├─ creates → UserChallenge (per user instance)
  ├─ delivers → Reward (on completion)
  ├─ feeds into → Progression (XP rewards)
  └─ controlled by → LiveOpsConfig (feature flag)

UserChallenge
  ├─ belongs to → User (many:1)
  ├─ belongs to → Challenge (many:1)
  ├─ tracks progress → currentValue/targetValue
  ├─ completion triggers → Reward delivery
  └─ reroll affects → Challenge (new assignment)

LiveOpsConfig
  ├─ controls → Season (availability)
  ├─ controls → Challenge (availability)
  ├─ routes users → ABTestVariant
  ├─ triggers → MaintenanceMode
  └─ cached locally → Offline availability
```

### Most Important Relationships

**1. Session → Progression (XP Flow)**
Every completed Session generates XP based on duration, quality, streak multiplier, and squad bonuses. This XP flows into Progression, potentially triggering level-ups which unlock new content and features.

**2. Session → Streak → Session (Feedback Loop)**
Sessions maintain Streaks (consecutive days with qualifying focus time). Active Streaks provide XP multipliers back to Sessions, creating positive reinforcement. Broken Streaks trigger comeback mechanics and reduced multipliers.

**3. User ↔ Squad (Social Multiplier)**
Users can join Squads, gaining XP multipliers from squad activity. Squad activity (collective sessions) also unlocks squad challenges and shared boss encounters with enhanced rewards.

**4. Session → BossEncounter → Reward (Boss Combat)**
During boss encounters, Sessions deal "damage" to the boss based on focus quality. Defeating bosses before timeout triggers substantial rewards. Failed boss encounters may reset or penalize.

---

## System Ownership Table

| Entity | Owned By | Written By | Read By |
|--------|----------|------------|---------|
| User | Auth system | Supabase Auth (signup) | All systems (via userId) |
| Session | Session feature | Session service (create, update, complete) | Session UI, History, Analytics |
| Season | Seasons feature | Seasons service (create, activate, end, archive) | Seasons UI, Challenges, Battle Pass |
| UserSeasonProgress | Seasons feature | Seasons service (create, update tier, claim) | Seasons UI, Battle Pass, Analytics |
| BattlePassTier | Battle Pass feature | Admin/Setup (static data) | Battle Pass service, Seasons UI |
| Challenge | Challenges feature | Challenges service (generate, assign), Admin | Challenges UI, Seasons, Analytics |
| UserChallenge | Challenges feature | Challenges service (progress, complete, reroll) | Challenges UI, Analytics |
| LiveOpsConfig | LiveOps feature | LiveOps service (sync, update) | All features (feature flags), Admin |
| ABTest | LiveOps feature | LiveOps service (assign variants) | LiveOps service, Analytics |
| Streak | Streaks feature | Streak service (increment, break, shield) | Session (multiplier), UI |
| Reward | Rewards feature | Reward service (create on triggers) | Reward UI, Wallet (currency), Inventory (items) |
| Squad | Social feature | Squad service (create, join, leave) | Squad UI, Session (multiplier) |
| SquadMember | Social feature | Squad service (on join/leave) | Squad UI, Session (member list) |
| Wallet | Economy feature | Wallet service (transactions) | Shop (balance check), UI |
| WalletTransaction | Economy feature | Wallet service (on every tx) | Analytics, Audit |
| Progression | Progression feature | Progression service (add XP) | Session (gating), UI |
| BossEncounter | Boss feature | Boss service (create, damage, defeat) | Session (damage), Boss UI |
| BossTemplate | Boss feature | Admin/static data | Boss service (create encounters) |
| OfflineQueueEntry | Offline feature | Offline queue service (on network failure) | Offline queue service (process) |
| Notification | Notifications feature | All systems (publish), Notification service (create) | Notification UI, Push service |
| SessionHistoryEntry | Session feature | Session service (on completion) | History UI, Analytics |

---

## Key Invariants

### Session Invariants

**1. Session Status Transition Validity**
- A Session can only transition: CREATED → ACTIVE → (PAUSED ↔ ACTIVE) → (COMPLETED | ABANDONED)
- No other transitions allowed
- Enforced in: `session/service/validation.ts`

**2. Completed Session Requirements**
- A Session cannot be COMPLETED without valid User, startedAt, and positive duration
- Enforced in: `session/service/session-lifecycle.ts` and database constraints

**3. Strict Mode Invariant**
- If `config.strictMode === true`, the Session can never be PAUSED
- Enforced in: `session/service/validation.ts`

**4. Elapsed Time Integrity**
- `elapsedSeconds` must never exceed `config.duration`
- `remainingSeconds` must equal `config.duration - elapsedSeconds`
- Enforced in: `session/hooks/useTimer.ts` (tick updates)

### Streak Invariants

**5. Streak Day Uniqueness**
- A user can only increment streak once per calendar day (in their timezone)
- Enforced in: `streaks/service.ts` (checks lastQualifyingSessionAt)

**6. Streak Cannot Exceed Longest**
- `currentDays` must never exceed `longestDays`
- Enforced in: `streaks/service.ts` (updates both atomically)

**7. Shield Consumption**
- `shieldsAvailable` must decrement when preventing a break
- Cannot go negative
- Enforced in: `streaks/service.ts`

### Reward Invariants

**8. Single Claim**
- A Reward can only transition PENDING → CLAIMED once
- Duplicate claims rejected
- Enforced in: `rewards/service.ts` and database unique constraints

**9. Expired Rewards**
- Rewards past `expiresAt` cannot be claimed
- Auto-archived by cron job
- Enforced in: `rewards/service.ts` and database

**10. Wallet Atomicity**
- All Wallet updates must be atomic transactions
- No partial updates (e.g., coins updated but gems failed)
- Enforced in: `economy/service/wallet.ts` (using Supabase RPC)

### Wallet Invariants

**11. Non-Negative Balance**
- `coins` and `gems` can never be negative
- Spend operations must check balance first
- Enforced in: Database constraints + `economy/service/wallet.ts`

**12. Transaction Ledger Integrity**
- Every Wallet change must create corresponding WalletTransaction
- `balanceAfter` must equal current balance
- Enforced in: `economy/service/wallet.ts` (always create tx record)

### Squad Invariants

**13. Member Limit**
- `memberCount` must never exceed 50
- Enforced in: Database constraints + `social/service/squad.ts`

**14. Founder Always Member**
- `createdBy` user must always be in SquadMember table with role FOUNDER
- Enforced in: `social/service/squad.ts` (cascade checks)

### Boss Encounter Invariants

**15. Health Cannot Exceed Max**
- `healthRemaining` must be 0 to `maxHealth`
- `damageDealt` must not exceed `maxHealth`
- Enforced in: `boss/service/boss-encounter.ts`

**16. Timeout Immutability**
- Once `expiresAt` passed, status can only be TIMEOUT (not ACTIVE)
- Enforced in: `boss/service/boss-encounter.ts` (cron check)

### Progression Invariants

**17. XP Never Decreases**
- `totalXp` and `xp` can only increase (no XP loss)
- Enforced in: `progression/service.ts` (only addXP function, no subtract)

**18. Level Threshold Consistency**
- `nextLevelThreshold` must always equal `calculateLevelThreshold(level + 1)`
- Enforced in: `progression/service.ts` (recalculate on level up)

### Notification Invariants

**19. Delivered Once**
- `pushDeliveredAt` can only be set once per push notification
- Enforced in: `notifications/service.ts` (idempotent delivery)

### Inventory Invariants

**21. Unique Equipped Slot**
- Only one item can be equipped per slot at a time
- Equipping new item automatically unequips previous
- Enforced in: `inventory/service.ts` (equip transaction)

**22. Consumed Items Archived**
- Items with status CONSUMED/DESTROYED remain in database for audit
- quantity set to 0, status updated, not deleted
- Enforced in: `inventory/service.ts` (consume/destroy operations)

**23. Stack Size Limits**
- InventoryItem.quantity ≤ ItemDefinition.maxStackSize
- Attempting to add beyond stack creates new stack
- Enforced in: `inventory/service.ts` (addItem logic)

### Crafting Invariants

**24. Recipe Validity**
- CraftingRecipe must have at least one ingredient
- All ingredient itemDefinitionIds must exist
- targetItemDefinitionId must exist
- Enforced in: `crafting/service.ts` (recipe validation)

**25. Ingredient Consumption**
- Ingredients consumed atomically when job starts
- If consumption fails, job never created
- Enforced in: `crafting/service.ts` (startCraftingJob transaction)

**26. Station Single Job**
- CraftingStation can have max one currentJobId
- Cannot start job on station with active job
- Enforced in: `crafting/service.ts` (job start validation)

**27. Success Rate Bounds**
- CraftingRecipe.successRate between 0.0 and 1.0
- Final success rate = base × station bonus × other modifiers
- Cannot exceed 1.0 (100%)
- Enforced in: `crafting/service.ts` (calculateSuccessRate)

### Shop Invariants

**28. Price Consistency**
- ShopItem must have at least one price (coins or gems)
- Price must be positive integer
- Enforced in: `shop/service.ts` (validation) + database constraints

**29. Purchase Limits Enforced**
- Cannot exceed maxPerUser, maxPerDay, or globalStock
- Checked atomically before completing purchase
- Enforced in: `shop/service.ts` (purchase transaction)

**30. Shop Item Availability**
- ShopItem with availableUntil in past cannot be purchased
- isAvailable flag must be true
- Enforced in: `shop/service.ts` (purchase validation)

### Offline Queue Invariants

**31. Retry Limit**
- `retryCount` cannot exceed 3
- Entries exceeding limit marked DEAD, not retried
- Enforced in: `offline-queue/service.ts`

### Season Invariants

**32. Season Date Validity**
- `endAt` must be greater than `startAt`
- `archivedAt` must be greater than `endAt` if set
- Enforced in: `seasons/schemas.ts` (Zod validation)

**33. Single Active Season**
- Only one Season can have `isActive = true` at a time
- Activating new season automatically deactivates previous
- Enforced in: `seasons/service.ts` (activateSeason transaction)

**34. Tier Progression Validity**
- `currentTier` must be 0 to `tierCount`
- `tierXp` must be 0 to `xpPerTier`
- Enforced in: `seasons/service.ts` (advanceTier calculation)

**35. Premium Purchase Once**
- `isPremium` can only transition from false to true (never back)
- `premiumPurchasedAt` set once on purchase
- Enforced in: `seasons/service.ts` (purchasePremium idempotency)

### Challenge Invariants

**36. Challenge Status Transitions**
- UserChallenge status: ACTIVE → COMPLETED → CLAIMED (or EXPIRED, REROLLED)
- COMPLETED challenges must have `completedAt` set
- CLAIMED challenges must have `claimedAt` set
- Enforced in: `challenges/service.ts` (status transitions)

**37. Reroll Limits**
- `rerollCount` cannot exceed daily limit (1 free + paid limit)
- Rerolled challenges marked REROLLED, not deleted
- `rerolledFromId` links to original challenge
- Enforced in: `challenges/service.ts` (checkRerollEligibility)

**38. Challenge Expiration**
- EXPIRED status only set when `expiresAt` < current time
- Cannot claim rewards for EXPIRED challenges
- Enforced in: `challenges/service.ts` (expiration check)

### LiveOps Config Invariants

**39. Feature Flag Rollout**
- `rolloutPercentage` must be 0-100
- User assignment consistent per feature (same user always same result)
- Enforced in: `liveops-config/service.ts` (hash-based assignment)

**40. A/B Test Validity**
- Variant weights must sum to 100
- User assigned to exactly one variant per test
- Test must have `enabled = true` for assignments
- Enforced in: `liveops-config/service.ts` (variant selection)

**41. Maintenance Mode**
- When `maintenance.enabled = true`, non-essential features disabled
- `estimatedEndTime` must be in future if set
- Enforced in: `liveops-config/service.ts` (isMaintenanceMode check)

---

## Entity Lifecycle States

### Session State Machine

```
                    ┌─────────────────┐
                    │    CREATED      │
                    │   (config set)  │
                    └────────┬────────┘
                             │ startSession()
                             ▼
                    ┌─────────────────┐
              ┌────▶│     ACTIVE      │◀────┐
              │     │  (timer running)│     │
              │     └────────┬────────┘     │
              │              │               │
     pause()  │              │ complete()    │ abandon()
              │              ▼               │
              │     ┌─────────────────┐     │
              └─────│     PAUSED      │     │
                    │ (timer stopped) │     │
                    └────────┬────────┘     │
                             │ resume()     │
                             └──────────────┘
                             │
                             ▼
              ┌────────────────────────────────┐
              │         COMPLETED              │
              │   (score calculated, rewards    │
              │    triggered, history saved)   │
              └────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    ▼                   ▼
            ┌─────────────┐     ┌─────────────┐
            │  COMPLETED  │     │  ABANDONED  │
            │  (success)  │     │   (fail)    │
            │             │     │  (penalty)  │
            └─────────────┘     └─────────────┘
                             │
                    ┌────────┴────────┐
                    ▼                   ▼
              (terminal states - no further transitions)
```

**Valid transitions:**
- CREATED → ACTIVE (on start)
- ACTIVE ↔ PAUSED (on pause/resume)
- ACTIVE → COMPLETED (on complete)
- ACTIVE → ABANDONED (on abandon)
- PAUSED → ABANDONED (on abandon while paused)

**Invalid transitions (blocked):**
- CREATED → COMPLETED (must be ACTIVE first)
- COMPLETED → anything (terminal)
- ABANDONED → anything (terminal)
- ACTIVE → CREATED (no reverse)

### Streak State Machine

```
                    ┌─────────────────┐
                    │     ACTIVE      │
                    │ (currentDays > 0)│
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            │ qualifying     │ no qualifying  │ 
            │ session        │ session within │
            │ today          │ time window    │
            │                │ (no shield)    │
            ▼                │                ▼
    ┌───────────────┐       │      ┌──────────────────┐
    │   INCREMENTED │       │      │     BROKEN       │
    │ (currentDays  │       │      │ (currentDays=0,  │
    │      +1)      │       │      │ streak ends)     │
    │               │       │      │                  │
    │ Fire milestone│       │      │ Fire penalty     │
    │ rewards       │       │      │ Comeback offers  │
    └───────┬───────┘       │      └────────┬─────────┘
            │               │               │
            └───────────────┴───────────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │  GRACE PERIOD    │ (optional, 24h)
                   │  (shield used)   │
                   └──────────────────┘
```

**State characteristics:**
- ACTIVE: Has current streak, today's session not yet done
- INCREMENTED: Streak incremented today, still active
- BROKEN: Streak lost, reset to 0
- GRACE PERIOD: Shield consumed, extended deadline

### Reward State Machine

```
                    ┌─────────────────┐
                    │     PENDING     │
                    │  (awaiting user)│
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            │ user claims    │ expires        │ system error
            │ (claimReward)  │ (past expiry)  │ (delivery fails)
            │                │                │
            ▼                ▼                ▼
    ┌───────────────┐ ┌─────────────┐  ┌───────────────┐
    │    CLAIMED    │ │   EXPIRED   │  │    FAILED     │
    │ (delivered to  │ │ (auto-      │  │ (logged,      │
    │  wallet/inv/   │ │  archived)  │  │  may retry    │
    │  progression)  │ │             │  │  manually)    │
    └───────────────┘ └─────────────┘  └───────────────┘
                             │
                    (terminal states)
```

**Triggers by state:**
- PENDING → CLAIMED: User taps "Claim", system processes
- PENDING → EXPIRED: Cron job checks expiresAt, auto-archives
- PENDING → FAILED: Delivery error (e.g., wallet service down), logged for retry

**Duplicate prevention:**
- CLAIMED rewards have unique constraint on (userId, rewardType, triggerId)
- Attempting to create duplicate returns existing reward

### CraftingJob State Machine

```
                    ┌─────────────────┐
                    │     PENDING     │
                    │  (job created,  │
                    │  not yet active) │
                    └────────┬────────┘
                             │ startCrafting()
                             │ (ingredients consumed)
                             ▼
                    ┌─────────────────┐
                    │    CRAFTING     │
                    │ (timer running, │◀────┐
                    │  progress 0-100%)│     │
                    └────────┬────────┘     │ cancel()
                             │              │ (may refund)
            ┌────────────────┼──────────────┤
            │ time elapses   │              │
            │ (success roll) │              │
            │                │              │
            ▼                ▼              ▼
    ┌───────────────┐ ┌─────────────┐  ┌─────────────┐
    │   COMPLETED   │ │    FAILED   │  │  CANCELLED  │
    │  (success!    │ │  (bad luck  │  │ (user       │
    │   claimable)  │ │   or error) │  │  aborted)   │
    └───────┬───────┘ └─────────────┘  └─────────────┘
            │
            │ claimResult()
            │ (items delivered)
            ▼
    ┌───────────────┐
    │    CLAIMED    │
    │  (items in    │
    │   inventory)   │
    └───────────────┘
            │
    (terminal states)
```

**State characteristics:**
- PENDING: Job created but not yet started, ingredients not consumed
- CRAFTING: Active job, timer counting down, progress increasing
- COMPLETED: Crafting finished successfully, output ready to claim
- FAILED: Crafting failed (random or error), partial refund may apply
- CANCELLED: User cancelled during crafting, ingredients may be partially refunded
- CLAIMED: User claimed result, items delivered to inventory

**Valid transitions:**
- PENDING → CRAFTING (on start, ingredients consumed)
- CRAFTING → COMPLETED (on time elapsed + success roll)
- CRAFTING → FAILED (on time elapsed + failure roll)
- CRAFTING → CANCELLED (on user cancel)
- COMPLETED → CLAIMED (on user claim)

**Failure handling:**
- Some recipes return partial ingredients on failure
- Scrap items may be created from failed crafting
- Failed jobs logged for analytics

---

## Phase 3 — Domain Entities Summary (COMPLETED)

### Progression Domain

**Progression Entity:**
```typescript
interface Progression {
  id: string;
  userId: string;
  level: number;           // Current level (1-100)
  xp: number;              // XP toward next level
  totalXp: number;         // Lifetime XP earned
  nextLevelThreshold: number;
  lastLevelUpAt: number | null;
  createdAt: number;
  updatedAt: number;
}
```

**Level Up Record:**
```typescript
interface LevelUpRecord {
  id: string;
  userId: string;
  previousLevel: number;
  newLevel: number;
  xpAtLevelUp: number;
  rewards: string[];        // Reward IDs granted
  unlockedFeatures: string[];
  createdAt: number;
}
```

**XP Entry (Audit Trail):**
```typescript
interface XpEntry {
  id: string;
  userId: string;
  amount: number;
  source: 'SESSION_COMPLETE' | 'STREAK_BONUS' | 'BOSS_DEFEAT' | etc.;
  sessionId?: string;
  breakdown?: XpBreakdown;
  createdAt: number;
}
```

### Boss Domain

**Boss Template:**
```typescript
interface BossTemplate {
  id: string;
  name: string;
  description: string;
  baseHealth: number;
  unlockLevel: number;
  requiresBossId?: string;    // Prerequisite boss
  rewardType: 'COINS' | 'GEMS' | 'ITEM';
  rewardAmount: number;
  difficulty: 'EASY' | 'NORMAL' | 'HARD' | 'EXTREME';
}
```

**Boss Encounter:**
```typescript
interface BossEncounter {
  id: string;
  bossId: string;
  userId: string;
  squadId?: string;
  maxHealth: number;         // Scaled based on level/squad
  healthRemaining: number;
  damageDealt: number;
  status: 'ACTIVE' | 'DEFEATED' | 'TIMEOUT' | 'ABANDONED';
  contributingSessionIds: string[];
  createdAt: number;
  expiresAt: number;         // 24h from creation
  defeatedAt?: number;
}
```

**Boss Defeat History:**
```typescript
interface BossDefeatRecord {
  id: string;
  userId: string;
  bossId: string;
  encounterId: string;
  damageDealt: number;
  defeatedAt: number;
  cooldownEndsAt: number;    // 7 days later
}
```

### Streak Domain

**Streak Entity:**
```typescript
interface Streak {
  id: string;
  userId: string;
  currentDays: number;       // Current streak length
  longestDays: number;       // Personal best
  lastQualifyingSessionAt: number;
  currentDayCompletedAt: number | null;
  shieldsAvailable: number;  // Protection count
  gracePeriodUsed: boolean;  // Shield already used this cycle
  timezone: string;
  createdAt: number;
  updatedAt: number;
}
```

**Streak Milestone:**
```typescript
interface StreakMilestone {
  id: string;
  days: number;              // 3, 7, 14, 30, etc.
  rewardType: 'COINS' | 'GEMS' | 'SHIELD';
  rewardAmount: number;
  description: string;
}
```

**Streak Shield (Protection):**
```typescript
interface StreakShield {
  id: string;
  userId: string;
  usedAt: number;
  reason: 'MANUAL' | 'AUTO'; // Manual use or auto-triggered
  sessionId?: string;
}
```

### Rewards Domain

**Reward Entity:**
```typescript
interface Reward {
  id: string;
  userId: string;
  type: 'XP' | 'COINS' | 'GEMS' | 'ITEM' | 'TITLE' | 'SHIELD' | 'BOOST';
  amount: number | null;     // Null for items/titles
  triggerType: 'SESSION_COMPLETE' | 'LEVEL_UP' | 'BOSS_DEFEAT' | etc.;
  triggerId: string | null;
  status: 'PENDING' | 'CLAIMED' | 'EXPIRED' | 'FAILED';
  expiresAt: number | null;
  claimedAt: number | null;
  createdAt: number;
  updatedAt: number;
}
```

**Reward Ledger (Audit Trail):**
```typescript
interface RewardLedgerEntry {
  id: string;
  rewardId: string;
  action: 'CREATED' | 'CLAIMED' | 'EXPIRED' | 'FAILED';
  details: Record<string, unknown>;
  createdAt: number;
}
```

**Deliverable (Claim Result):**
```typescript
interface Deliverable {
  type: 'XP' | 'COINS' | 'GEMS' | 'ITEM' | 'TITLE' | 'SHIELD';
  amount: number;
  itemId?: string;         // For item/title rewards
  delivered: boolean;
  deliveredAt: number | null;
}
```

### Integration Domain

**Offline Queue Entry:**
```typescript
interface OfflineQueueEntry {
  id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'XP_ADD' | 'REWARD_CLAIM';
  feature: 'progression' | 'streaks' | 'rewards' | 'boss' | 'sessions';
  payload: Record<string, unknown>;
  idempotencyKey: string;
  createdAt: number;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'normal' | 'low';
  dependsOn?: string;        // Entry ID this depends on
  error?: string;            // Last error message
}
```

**Repository Error:**
```typescript
interface RepositoryError {
  operation: string;
  code: 'NETWORK' | 'TIMEOUT' | 'NOT_FOUND' | 'CONFLICT' | 'SERVER' | 'UNKNOWN';
  originalError: unknown;
  retryable: boolean;
}
```

### Phase 3 Cross-System Integration Map

```
sessions
  → progression (XP awards)
  → streaks (record qualifying session)
  → rewards (create session rewards)
  → boss (apply damage if active encounter)
  → analytics (track completion)
  → social (feed posts on milestones)

progression
  → rewards (level up rewards)
  → social (level up posts)
  → unlocks (feature availability)

streaks
  → progression (streak milestone XP)
  → rewards (milestone rewards)
  → social (streak achievement posts)

boss
  → rewards (defeat rewards)
  → progression (bonus XP)
  → social (victory posts)

rewards
  → economy (currency delivery)
  → progression (XP rewards)
  → inventory (item delivery)
```

### Key Invariants

**Progression:**
- XP never decreases (only increases)
- Level only increases (never decreases)
- Total XP = sum of all XP entries

**Streaks:**
- Only one qualifying session per day per user
- Shield consumption is idempotent (can't use same shield twice)
- Streak reset to 0 on break, longest preserved

**Boss:**
- Only one active encounter per user/squad at a time
- Damage is additive (multiple sessions contribute)
- Defeat rewards distributed to all contributors

**Rewards:**
- Duplicate prevention: (userId, triggerType, triggerId) unique
- Claim is idempotent (same reward returned on re-claim)
- Expired rewards are archived, not deleted

**Seasons:**
- Only one active season at a time
- Tier progression is monotonic (never decreases)
- Premium purchase is one-way (no refunds)
- Retroactive tier claiming on premium purchase

**Challenges:**
- Status transitions are linear (ACTIVE → COMPLETED → CLAIMED)
- Reroll creates new challenge, marks old as REROLLED
- Daily reroll limits enforced (1 free + paid)
- Expired challenges cannot be claimed

**LiveOps Config:**
- Feature flag assignment is consistent per user
- A/B test variant weights sum to 100%
- Maintenance mode disables non-essential features
- Config cached locally for offline access

---

## Phase 4 — Domain Entities Summary (COMPLETED)

### New Entities Added

**Retention System:**
- **Season**: Time-limited progression event with tiers and rewards
- **UserSeasonProgress**: User's progression within a season
- **BattlePassTier**: Reward tier with free/premium track rewards
- **Challenge**: Task for users to complete for rewards
- **UserChallenge**: User's instance of a challenge with progress
- **LiveOpsConfig**: Remote configuration for feature flags and A/B tests

### Cross-System Integration

```
Season
  → creates BattlePassTier (reward tiers)
  → generates Challenge (season-specific)
  → triggers UserSeasonProgress (per user)
  → affects Analytics (engagement tracking)
  → controlled by LiveOpsConfig (feature flag)

UserSeasonProgress
  → receives XP from any activity
  → claims BattlePassTier rewards
  → purchase affects Wallet (gem deduction)
  → feeds into Analytics (progression)

Challenge
  → creates UserChallenge (per user instance)
  → completion triggers Reward delivery
  → delivers XP to Progression
  → controlled by LiveOpsConfig

UserChallenge
  → progress updates from activities
  → completion affects Rewards
  → reroll affects Challenge (new assignment)
  → generates Analytics (completion rates)
```

### Architecture Compliance
✅ All entities follow strict typing
✅ Owned by specific features
✅ Validated with Zod schemas
✅ Business logic in services
✅ Event-driven cross-system updates
✅ Comprehensive invariants documented

---

## Phase 6 — Social & Competition Domain (COMPLETED)

### New Entities Added

**Social System:**
- **Squad**: Small group (2-50) for shared focus sessions with synergy multipliers
- **SquadMember**: User's membership in a squad with role and contribution tracking
- **SquadInvite**: Invitation to join a squad with role offer and expiration
- **SquadSession**: Shared focus session for squad members
- **FeedItem**: Social activity post with reactions, comments, and visibility
- **FeedReaction**: User reaction to a feed item (like, fire, trophy, etc.)
- **FeedComment**: User comment on a feed item

**Competition System:**
- **Duel**: 1v1 competitive focus session with rating implications
- **DuelRating**: User's ELO rating and tier in competitive play
- **Leaderboard**: Time-bound ranking of users by metric (focus time, XP, etc.)
- **LeaderboardEntry**: User's position and score on a specific leaderboard
- **SeasonRanking**: User's rank within a competitive season

### Feature Dependencies

```
Squad
  → Users (membership, invites)
  → Sessions (squad sessions, shared focus)
  → Progression (squad XP multipliers)
  → Boss (shared boss encounters)
  → Feed (squad activity posts)
  → Analytics (squad metrics)
  → Notifications (invite, role change alerts)

Feed
  → Users (authors, mentions)
  → Squads (squad activities)
  → Sessions (session completions)
  → Duels (duel results)
  → Challenges (challenge completions)
  → Analytics (engagement tracking)

Duel
  → Users (challenger, challenged)
  → Sessions (duel sessions)
  → Rankings (rating changes, tier progression)
  → Feed (duel results sharing)
  → Notifications (duel invites, results)
  → Analytics (competitive metrics)

Ranking
  → Users (ranked participants)
  → Seasons (seasonal leaderboards)
  → Duels (competitive ratings)
  → Sessions (focus time rankings)
  → Progression (level rankings)
```

### Cross-System Integration

```
Session completes
  → triggers Squad contribution (if in squad)
  → creates Feed post (if milestone)
  → updates Challenge progress
  → updates Ranking (if leaderboard active)
  → awards XP via Progression

Duel completes
  → updates both users' DuelRating
  → creates Feed post for winner
  → triggers tier promotion if applicable
  → sends Notifications to both players
  → generates Analytics events

Squad join
  → creates SquadMember record
  → creates Feed welcome post
  → sends Notifications to squad
  → updates Squad stats
  → triggers Analytics tracking

Challenge completes
  → creates Feed achievement post
  → awards rewards
  → updates Progression
```

### Key Invariants

**Squads:**
- Max 50 members per squad
- Only one founder per squad (transferable)
- Synergy multipliers calculated from member activity
- Invites expire after 48 hours
- Member contributions are permanent (retained after leaving)

**Feed:**
- Feed items immutable after creation (except reaction counts)
- Visibility controlled by author (public/friends/squad)
- Comments support threading (parent-child relationships)
- Auto-moderation for reported content

**Duels:**
- Rating changes use ELO algorithm with K-factor based on tier
- Duels have time limits (5-60 minutes)
- Forfeits affect rating negatively
- Only one active duel per user at a time
- Tier promotion requires series completion

**Rankings:**
- Leaderboards reset on configurable intervals (daily/weekly/seasonal)
- Competition ranking handles ties correctly
- Anomaly detection prevents cheating
- Pagination cursors for large leaderboards
- Historical rankings archived, not deleted

**AI Coach:**
- Max 10 interventions per day per user
- Quiet hours (10 PM - 8 AM) respected for non-urgent messages
- Messages expire after 30 days (configurable retention)
- Streak risk detection requires 24h+ without session
- Comeback mode activates on 3+ day streak breaks
- Circuit breakers prevent cascade failures from external systems

### Architecture Compliance
✅ All features follow strict typing with Zod schemas
✅ Business logic isolated in services
✅ Repository pattern for data access
✅ Event-driven cross-system integration
✅ Comprehensive test coverage (unit, integration, deep tests)
✅ UI components with loading/error/empty states
✅ Retry logic and circuit breakers for resilience
✅ Analytics tracking for all key flows
