# VEX Android validation — 2026-10-11

## Install artifact

Skip-login replacement: [`d8f745b8-2536-47ce-94b9-85c8e2166f76`](https://expo.dev/accounts/jeppygeja/projects/vex-app/builds/d8f745b8-2536-47ce-94b9-85c8e2166f76) — building. The previous APK below does not include the button in release mode.
The preview profile explicitly enables local skip login; production explicitly disables it. Strict TypeScript, targeted lint, and four bypass tests passed. A release Hermes export was installed with a local test signature in the API 36 emulator: Skip login was visible and navigated directly to Home, with zero runtime error lines. Its bundle contained no server keys, service-role tokens, or SDK shims. The pending signed replacement needs separate artifact verification.

Final standalone signed APK build: [`c7744b9c-3b34-477c-9d75-b9c40f859c80`](https://expo.dev/accounts/jeppygeja/projects/vex-app/builds/c7744b9c-3b34-477c-9d75-b9c40f859c80) — finished (ARM64 preview, 185.4 MiB).
[Download APK](https://expo.dev/artifacts/eas/xG56rGl3uDXfbTpIKkRKUkyBb-LWQAcz3GcpMKVHb8A.apk). Release v2 signature verified with the existing signing certificate.
APK SHA-256: `807cc903157d513cb6b7111632cc57bb238bd20cd5457867d2fa33b450a99e50`.

Corrected iOS preview build: [`7a03ec80-0426-4dc7-b55d-f8c05a2da9e4`](https://expo.dev/accounts/jeppygeja/projects/vex-app/builds/7a03ec80-0426-4dc7-b55d-f8c05a2da9e4) — finished. Its provisioning profile covers one registered iPhone. Earlier builds contain the native startup blocker and must not be installed.
Package: `com.jonathan.vex`. Profile: `preview`; channel: `preview`.
Expo Go shims are disabled. The APK embeds its JavaScript bundle and does not require Metro.

## Repairs in this continuation

- Restored the paused Supabase project and verified its Auth endpoint responds.
- Repaired Android network security XML and implemented real iOS ATS CA pinning.
- Updated stale Supabase certificate pins from the live certificate chain, retaining intermediate/root backup pins.
- Applied compatible Expo SDK 57 patch updates without changing TypeScript 6.0.3, React 19.2.3, React Native 0.86.3, or Reanimated 4.5.1.
- Updated vulnerable transitive packages with available upstream fixes.
- Added regression-tested local guards for unpatched braces recursion and node-forge RSA DigestInfo validation vulnerabilities.
- Made RevenueCat initialization depend on the current platform's key and safely normalize arbitrary thrown values.
- Preserved offline completion receipts when lookup/write requests fail.
- Made repair process the canonical session queue, retry dead letters, and restore session history on replay.
- Preserved degraded history/reward failures instead of reporting an unconditional sync success.
- Translated the database's pending/failed vocabulary into the app's pending_sync/failed_sync vocabulary.
- Refreshed session-history queries and the current pending completion state after a successful replay.
- Removed the fallback that silently accepted an unrecovered duplicate ledger conflict.
- Wired challenge XP credits to progression with deterministic credit/receipt idempotency keys.
- Kept failed claims retryable, stopped reporting failed coin grants as delivered, and hid archived coin rewards in challenge summaries.
- Removed redundant RLS policies and one duplicate idempotency index, retaining ownership and uniqueness enforcement.
- Revoked public/client access to six archived wallet RPCs that accepted caller-selected currency amounts.
- Added non-anonymous ownership guards to memory-vector, idempotency, and session-event read policies.
- Regenerated Supabase types through npm run types:supabase after all four deployed migrations.
- Restored the atomic XP client path with SECURITY INVOKER, non-anonymous ownership checks, verified session/challenge rewards, a per-user transaction lock, stable idempotency, and the canonical 1.25 level curve.
- Removed the second non-atomic XP write after an ambiguous RPC failure; retries preserve the same server key and duplicate responses do not emit another XP celebration.
- Added missing focus-score columns and an atomic session score/history RPC with duplicate detection and conflict retry.
- Persisted enriched completion outcomes and their failed subsystem list; recovery now works after a restart even when the local queue is empty.
- Scoped repair to the authenticated account and requested session, coalesced repeated repair taps, and rejected missing receipts or still-processing work instead of claiming success.
- Preserved completion receipts across the queue TTL, stopped full-queue updates from evicting unrelated work, rejected overflow without dropping important receipts, and released replaced processing locks.
- Prevented error-boundary retries from updating unmounted/degraded screens, coalesced manual retry taps, and kept telemetry failures from crashing the fallback.
- Added a Hermes string-table scanner for server secrets and development-only SDK shims.
- Fixed Metro resolving Expo Go shims into native releases despite the disabled profile flag; real Sentry, MMKV, RevenueCat, and other native SDKs now load. Release resolution is protected even when stale developer flags are present.
- Fixed intrinsic-height glass containers collapsing authentication forms, enabled login scrolling, and reused themed form fields/buttons so email/password remain readable and reachable with the keyboard open.
- Excluded local caches, indexes, history, and browser exports from the EAS archive; upload shrank from 288 MB to 134 MB.

## Verification

| Check | Result |
| --- | --- |
| TypeScript strict compilation | Passed |
| Full Jest suite | 1,238 suites / 10,199 tests passed; 38 suites / 150 tests skipped |
| Snapshots | 84 passed |
| Browser checks | 57 passed across Chromium, Firefox, and WebKit |
| Native Android/iOS bundle exports | Passed |
| Expo Doctor | 21/21 passed |
| Expo dependency compatibility | Up to date |
| Preview update channel | Newly created; no previous update branches |
| ESLint | 0 errors; 345 existing warnings |
| Banned-pattern and 200-line checks | Passed |
| Native pinning regressions | 4 passed |
| Dependency exploit regressions | 4 passed |
| Edge Function checks/tests | Passed |
| Tracked-file secret scan | 9,049 files checked; passed |
| Native bundle server-secret scan | Corrected iOS artifact: 61,727 strings checked; zero server keys, service-role tokens, or release SDK shims. corrected Android artifact: 61,713 strings checked with the same zero findings |
| Atomic XP live transaction | Owned receipt credited once; foreign/inflated/anonymous awards denied; fixture writes rolled back |
| Challenge XP live transaction | Incomplete and inflated claims denied; exact reward and claimed retry verified; fixture writes rolled back |
| Atomic focus-score live transaction | Score/history applied once; foreign writes denied; fixture writes rolled back |
| Durable completion/progression/focus/offline regressions | 111 suites / 760 tests passed; 2 skipped |
| Error-boundary lifecycle regressions | 27 tests passed; 12 pre-existing skipped |
| Hermes secret-scanner and native resolver regressions | 9 passed |
| Corrected native Android bundle smoke test | Cold start, email inputs, empty-form validation, keyboard scrolling, and password-recovery navigation passed in API 36 ARM64 translation |
| Auth/navigation regressions | 7 suites / 70 tests passed |
| Final signed APK authentication UI | Email/password inputs and both empty-form validation messages verified in ARM translation |
| Final signed APK offline startup | Welcome screen and degraded offline banner visible; no fatal runtime errors; device animation scale disabled |
| Final Android native build | Release v2 signature verified; ARM64 bundle embedded; minimum API 24 / target API 36; compiled pin XML denies cleartext |
| Final iOS native build | App and widget verified; ATS CA pins present; arbitrary loads disabled; signed profile expires 2027-05-28 |
| Embedded Supabase key smoke check | Both native artifacts returned HTTP 200 from Auth settings |
| RLS expression equivalence | 18 cases; zero permission changes |
| Live RPC identity boundaries | Foreign writes/uploads denied; absent subject reads empty; transaction rolled back |
| Archived wallet RPC privileges | All six deny authenticated and anon EXECUTE |
| Database performance WARN notices | Zero after cleanup |

Initial native smoke checks used a local test signature. The unchanged final signed ARM64 APK was then installed and cold-started in the API 36 emulator. React Native SoLoader initially chose the emulator’s x86_64 direct-APK library path; extracting the APK’s 36 existing ARM64 libraries into its emulator installation directory enabled ARM translation. This emulator-only workaround does not change the APK, and it is not a physical-device verification. A host reboot interrupted the first final rerun and iOS upload. The corrected Android cloud build survived; iOS was uploaded again, and the full Jest suite plus strict TypeScript and targeted lint checks passed after restart.

Browser tests exercise mocked local journeys and authentication boundaries. They do not prove real device behavior or paid checkout. Two long interaction tests initially timed out under concurrent heavy verification, then passed with one browser worker. WebKit's missing libraries were restored in a persistent user cache.

## Remaining release limitations

- Android RevenueCat has no real configured public SDK key. Free core testing is available; Android checkout is unavailable until the RevenueCat Android app is configured.
- Production npm audit still reports 29 high transitive findings. They cascade from two root packages with no compatible upstream fixed release. Local patches block the reproduced exploits, but the version-based audit remains nonzero and the patches are not a claim of complete upstream remediation.
- Supabase retains notices for four intentionally exposed, identity-checked SECURITY DEFINER RPCs. These were reviewed rather than blindly revoked.
- Leaked-password protection remains disabled. Supabase documents this as a Pro-plan feature; no paid-plan change was made.
- The existing iOS submit profile contains literal environment placeholders. Actual App Store Connect metadata and submission credentials still need to be resolved before submission; a passing iOS bundle is not an App Store release.
- The final standalone iOS preview build finished with the existing active distribution certificate and provisioning profile. The profile currently covers one registered iPhone. No App Store/Play Store submission was performed.
- Physical-device login, notification delivery, reduced-motion behavior, and native checkout still need device verification.
- Skipped tests remain skipped. This report does not assert that every possible issue in the application has been eliminated.

## Reproducing native and database checks

- `node --test scripts/__tests__/native-bundle-secrets.test.js`
- Extract `assets/index.android.bundle` from the APK, then run `node scripts/native-bundle-secrets.js <bundle-path>`.
- `supabase/tests/atomic-xp-owner-and-retry.sql` and `supabase/tests/session-focus-score-retry.sql`, and `supabase/tests/challenge-xp-claim-retry.sql` use generated fixture identities and roll back every fixture write.
- Final APK and IPA were checked separately. Both embedded public Supabase keys returned HTTP 200 from Auth settings. Both final bundles contain the new focus-score RPC and completion ownership/retry checks.

## References

- [Supabase password security](https://supabase.com/docs/guides/auth/password-security)
- [Supabase RLS and request-level auth caching](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Expo EAS archive behavior](https://github.com/expo/fyi/blob/main/eas-build-archive.md)
- [Expo iOS submission requirements](https://docs.expo.dev/submit/ios/)

## Native screenshots

- [Signed APK cold start](./android-native-startup.png)
- [Signed APK email validation](./android-native-form.png)
- [Signed APK offline startup](./android-native-offline.png)
- [Preview skip-login button](./android-skip-login.png)
- [Home after skipping login](./android-skip-login-home.png)
