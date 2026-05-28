# VEX Task Completion Checklist

Before marking ANY task as complete, ALL of these must be verified:

## Pre-Work ✅
- [ ] Ran `bash .hermes/scripts/pre-work.sh`
- [ ] Safety branch created
- [ ] On correct branch (`hermes-vex-work`)
- [ ] Pulled latest from remote

## During Work ✅
- [ ] Made actual changes to files
- [ ] Changes are meaningful (not just whitespace/comments)
- [ ] Committed after each logical unit of work
- [ ] Sent heartbeats with actual progress (not "still working")
- [ ] Did not stop early — task is FULLY complete

## Post-Work ✅
- [ ] Ran `bash .hermes/scripts/post-work.sh`
- [ ] TypeScript check passed
- [ ] Test suite passed
- [ ] File size audit passed (all under 200 lines)
- [ ] Banned pattern audit passed

## Completion ✅
- [ ] Ran `bash .hermes/scripts/verify-completion.sh`
- [ ] Files actually changed (not just claimed)
- [ ] Changes are meaningful (not just whitespace/comments)
- [ ] Commits were made
- [ ] Code was pushed to `origin/hermes-vex-work`
- [ ] All quality gates pass

## Reporting ✅
- [ ] Used `kanban_complete` with structured metadata
- [ ] Included: changed_files, tests_run, tests_passed, commits, pushed
- [ ] Included verification summary from verify-completion.sh

## Anti-Slop ✅
- [ ] No stub implementations
- [ ] No happy-path-only code
- [ ] No generic placeholder text
- [ ] No redundant code
- [ ] No over-engineering
- [ ] If unsure about something, BLOCKED and asked

## If ANY checkbox is unchecked:
**DO NOT mark the task as complete.**
Either complete the missing step, or BLOCK with a clear reason.

## If verify-completion.sh fails:
**DO NOT mark the task as complete.**
Fix the issue, re-run verification, and only then mark done.
