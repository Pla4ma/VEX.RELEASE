export const THRESHOLDS = {
  /** Detects clock manipulation or system time jumps. Acceptable range: 0–60s. Source: empirical testing with device clock change scenarios. */
  MAX_TIME_JUMP: 30_000,
  /** Minimum interval between timer ticks. Values below indicate the timer firing too fast (possible speed-hack or timer injection). Range: 900–1000ms. Source: theoretical — 10% below expected 1000ms tick. */
  MIN_TICK_INTERVAL: 900,
  /** Maximum interval between timer ticks. Values above indicate throttling or backgrounding. Range: 1000–2000ms. Source: theoretical — 10% above expected 1000ms tick. */
  MAX_TICK_INTERVAL: 1_100,
  /** Upper bound for a single session. Beyond 8hr, sessions are likely abandoned or manipulated. Range: 1–12hr. Source: App Store productivity guidelines. */
  MAX_SESSION_DURATION: 8 * 60 * 60 * 1_000,
  /** Minimum meaningful session length. Sessions under 60s can't be reliably scored. Range: 30–120s. Source: empirical — scoring engine needs at least one interval. */
  MIN_SESSION_DURATION: 60 * 1_000,
  /** Multiplier of expected completion rate. 1.5x = user completing 50% faster than nominal pace. Range: 1.0–2.0. Source: empirical from beta cohort — fastest legitimate users complete at ~1.3x. */
  MAX_COMPLETION_SPEED: 1.5,
  /** Ratio of total paused time to session duration. >70% indicates the session was mostly idle. Range: 0.5–0.9. Source: empirical — sessions >0.7 ratio correlate with abandoned sessions. */
  MAX_PAUSE_RATIO: 0.7,
  /** Minimum variance in inter-tick intervals. Too little variance (<0.1) suggests automated/bot behavior. Range: 0.05–0.2. Source: theoretical — human reaction time produces natural variance. */
  MIN_FOCUS_VARIANCE: 0.1,
  /** Maximum tick records kept in memory for pattern analysis. Bounded to prevent unbounded memory growth on very long sessions. */
  MAX_TICK_HISTORY: 1_000,
  /** When tick history exceeds MAX_TICK_HISTORY, prune down to this count, keeping most recent entries. */
  MAX_TICK_HISTORY_TRIM: 500,
  /** Minimum tick samples required before pattern-based cheat detection runs. Too few samples produce unreliable results. */
  MIN_TICK_PATTERN_SAMPLE: 10,
  /** Minimum sample size for statistical variance and anomaly calculations. Below this, variance calculations are statistically meaningless. Source: statistical — n≥30 for Central Limit Theorem applicability. */
  VARIANCE_SAMPLE_THRESHOLD: 30,
  /** Maximum allowed suspension (background) time before it's treated as a violation. 30s grace period for legitimate app switches. Range: 15–60s. Source: App Store background task guidelines. */
  MAX_SUSPENSION_MS: 30_000,
  /** Minimum duration for a pause to register as intentional. Pauses shorter than 5s are treated as accidental/tap errors. Range: 3–10s. */
  MIN_PAUSE_TIME_MS: 5_000,
  /** Tolerance for discrepancies between wall-clock elapsed time and timer-reported elapsed time. Accounts for timer scheduling jitter. Range: 500–2000ms. Source: empirical — JS setTimeout can be ±1s off. */
  TIME_ACCOUNTING_TOLERANCE_MS: 1_000,
  /** Maximum ratio of time discrepancy to expected interval. >0.5 = half the expected time is unaccounted for. Range: 0.1–0.5. */
  INTERVAL_TIME_DISCREPANCY_RATIO: 0.5,
};

export const PURITY_SCORING = {
  BACKGROUND_SWITCH_PENALTY: 8,
  MANUAL_PAUSE_PENALTY: 5,
  SUSPENSION_PENALTY: 15,
  UNINTERRUPTED_BONUS_PER_MINUTE: 2,
  MAX_SCORE: 100,
  MIN_SCORE: 0,
  ELITE_THRESHOLD: 90,
  GOOD_THRESHOLD: 70,
  OKAY_THRESHOLD: 45,
};

export const FLAG_CRITICAL_THRESHOLD = 5;
