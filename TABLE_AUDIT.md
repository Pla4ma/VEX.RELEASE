# Supabase Tables Audit

This document lists all tables expected by the codebase vs what's defined in migrations.

## Tables in Migrations (can be pushed)

These tables exist in `supabase/migrations/` and can be pushed to Supabase:

| Table | Migration File | Status |
|-------|---------------|--------|
| seasons | 20250118_seasons_battlepass.sql | Ready to push |
| battle_pass_tiers | 20250118_seasons_battlepass.sql | Ready to push |
| user_season_progress | 20250118_seasons_battlepass.sql | Ready to push |
| user_battle_pass | 20250118_seasons_battlepass.sql | Ready to push |
| season_history | 20250118_seasons_battlepass.sql | Ready to push |
| challenges | 20250118_seasons_battlepass.sql | Ready to push |
| user_challenges | 20250118_seasons_battlepass.sql | Ready to push |
| challenge_rerolls | 20250118_seasons_battlepass.sql | Ready to push |
| liveops_config | 20250118_seasons_battlepass.sql | Ready to push |
| feature_flags | 20250118_seasons_battlepass.sql | Ready to push |
| admin_users | 20250118_seasons_battlepass.sql | Ready to push |

## Tables Referenced by Repositories (NEED MIGRATIONS)

These tables are used in repository files but have NO migrations:

### Core Tables
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| users | guilds, squads, analytics, duels, economy | NO (in SUPABASE_SETUP.sql) |
| wallets | economy/repository.ts | NO (in SUPABASE_SETUP.sql) |
| transactions | economy/repository.ts | NO (in SUPABASE_SETUP.sql) |

### Streak System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| streaks | streaks/repository.ts, streaks/repository-enhanced.ts | **YES** |
| streak_shields | streaks/repository.ts, streaks/repository-enhanced.ts | **YES** |

### Squad System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| squads | squads/repository.ts, squads/service.ts, squads/persistence.ts | **YES** |
| squad_members | squads/repository.ts, squads/service.ts | **YES** |
| squad_invites | squads/repository.ts, squads/service.ts | **YES** |
| squad_join_requests | squads/repository.ts, squads/service.ts | **YES** |
| squad_sessions | squads/repository.ts | **YES** |
| squad_synergy | squads/service.ts | **YES** |

### Guild System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| guilds | guilds/repository.ts | **YES** |
| guild_members | guilds/repository.ts | **YES** |
| guild_invites | guilds/repository.ts | **YES** |
| guild_join_requests | guilds/repository.ts | **YES** |
| guild_quests | guilds/repository.ts | **YES** |

### Duel System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| duels | duels/repository.ts | **YES** |
| duel_participants | duels/repository.ts | **YES** |

### Feed System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| activities | feed/repository.ts, feed/service.ts | **YES** |
| activity_comments | feed/repository.ts | **YES** |
| activity_likes | feed/repository.ts | **YES** |

### Rankings System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| leaderboard_entries | rankings/repository.ts | **YES** |
| league_standings | rankings/repository.ts | **YES** |

### Achievement System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| achievements | Already in hand-written types | Verify |
| user_achievements | Already in hand-written types | Verify |

### Economy System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| items | items/service.ts, inventory/repository.ts | **YES** |
| inventory_items | inventory/repository.ts | **YES** |
| loot_boxes | crafting/repository.ts | **YES** |
| loot_box_contents | crafting/repository.ts | **YES** |
| marketplace_listings | economy/repository.ts | **YES** |
| user_currencies | economy/repository.ts | **YES** |

### Progression System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| user_stats | progression/repository.ts | **YES** |
| xp_transactions | progression/repository.ts | **YES** |

### Analytics System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| focus_sessions | analytics/repository.ts | **YES** |
| session_analytics | analytics/repository.ts | **YES** |

### AI Coach System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| coach_conversations | ai-coach/repository.ts, ai-coach/repository-enhanced.ts | **YES** |
| coach_messages | ai-coach/repository.ts, ai-coach/repository-enhanced.ts | **YES** |
| user_insights | ai-coach/repository.ts, ai-coach/repository-enhanced.ts | **YES** |

### Boss System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| boss_raids | boss/repository.ts, boss/repository-enhanced.ts | **YES** |
| boss_participants | boss/repository.ts, boss/repository-enhanced.ts | **YES** |
| boss_damage_log | boss/repository.ts | **YES** |

### Milestones System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| milestones | milestones/repository.ts | **YES** |
| user_milestones | milestones/repository.ts | **YES** |

### Rewards System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| rewards | rewards/repository.ts, rewards/repository-enhanced.ts | **YES** |
| claimed_rewards | rewards/repository.ts, rewards/repository-enhanced.ts | **YES** |

### Settings System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| user_settings | settings/repository.ts | **YES** |
| notification_preferences | settings/repository.ts | **YES** |

### LiveOps Config
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| liveops_config | liveops-config/repository.ts | NO (in migration) |
| feature_flags | liveops-config/repository.ts | NO (in migration) |
| config_rollouts | liveops-config/repository.ts | **YES** |

### Crafting System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| crafting_recipes | crafting/repository.ts | **YES** |
| user_crafting | crafting/repository.ts | **YES** |

### Challenge System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| challenges | challenges/repository.ts | NO (in migration) |
| user_challenges | challenges/repository.ts | NO (in migration) |

### Battle Pass System
| Table | Referenced In | Migration Needed |
|-------|--------------|------------------|
| battle_pass_tiers | battle-pass/repository.ts | NO (in migration) |
| user_battle_pass | battle-pass/repository.ts | NO (in migration) |
| user_season_progress | seasons/repository.ts | NO (in migration) |

## Action Plan

### Step 1: Push Existing Migration
```bash
npx supabase login
npx supabase db push
```

### Step 2: Create Missing Migrations
For each table marked "Migration Needed" above, create migration files in `supabase/migrations/`.

### Step 3: Generate Types
After pushing all migrations:
```bash
npm run types:supabase
```

### Step 4: Compare Generated Types
The generated types should contain all tables listed above. If any are missing, the migration wasn't pushed correctly.

## Current Hand-Written Types

The file `src/types/supabase.ts` currently has these tables:
- users
- squads  
- wallets
- transactions
- achievements
- user_achievements

**Note**: These are hand-written and will be replaced by the auto-generated types.
