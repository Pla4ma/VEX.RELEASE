# VEX Beta Release Plan

## Product Focus

VEX beta is a gamified productivity/focus app built around one daily focus loop: start a focus session, complete it, see progress, and return tomorrow.

## Beta Vocabulary

Use user-facing language centered on Focus session, Streak, XP, Companion, and Progress. Delay or soften funeral, anti-cheat, purity, bounty, squad war, battle pass, insurance, vault, shop, gems, and premium currency language.

## Beta Gates

Core focus, streak, XP, companion, progress, and basic coach support are the priority. Shop, battle pass, inventory, vault, bounties, wagers, premium currency, and insurance-style purchases stay hidden for beta.

## Verification

Before beta, run `npm run types:supabase` against the target Supabase project, then run `npm run typecheck`. Verify migrations are applied to the production Supabase project before release.
