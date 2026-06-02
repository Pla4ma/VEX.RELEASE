# Night Task Execution Protocol

## Goal

Produce 8+ hours of shipped, verified, independently reviewable work per night session.
No blocking on the user. No "STOP" mid-stream. No partial completion.

## Non-Negotiable Rules

1. **No blocking questions during execution.** If a decision is ambiguous, choose the safest default, execute, and surface the trade-off in the closing report. The user is asleep; progress matters more than perfect choice.

2. **Hard 30-minute push minimum.** Every 30 minutes without a commit is a failure state. Break work into commit-sized pieces. If no natural split exists, create a chore commit.

3. **No subagent analysis work.** Reads, globs, greps, audits, and search happen inline via terminal. Subagents are only for parallel implementation when two independent changes can run at once. Analysis-only subagents are wasted spend.

4. **Never stop at "ready to commit."** The only terminal state is pushed. If the work is done but not pushed, it is not done.

5. **Run verification per-commit on changed files only.** Full test suites are for test files only. For touched files: targeted lint + changed-file TSC + targeted tests. Full suite is banned unless tests were added or touched.

6. **Prefer surgical moves over perfect architecture.** A shipped 80% solution beats a perfect solution left in a local branch. Ship, note debt, continue.

7. **Treat `verify-completion.sh` as the actual Done gate.** If the script times out, run the four sub-gates manually and declare done. Do not loop on timeout.

## Work Session Structure

### Minute 0-15
- Read the task fully.
- Identify decision points.
- Pick defaults on all decision points.
- Announce: phase plan, time budget, expected commit cadence.

### Minute 15-120
- Execute. No Q&A with user during this window.
- If a subagent is spawned, set a hard timeout.
- If a verification gate fails 3 times, roll back the offending file, note it, and continue.

### Every 90 Minutes
- Telegram checkpoint: files changed, commits pushed, current phase, estimated time to completion.

### Minute 120+ (after initial phase)
- If blocked on a real constraint (missing DB table, unavailable native config), log it as MUST-FIX and continue on adjacent work. Do not stall the session.

### End of Session (morning handoff)
- Final status: what shipped, what passed, what is deferred, exact commit SHAs.
- Only items requiring human judgment are forwarded. Everything else is shipped or shipped + flagged.
