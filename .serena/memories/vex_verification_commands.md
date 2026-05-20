# VEX Verification Commands

Before declaring implementation complete, run the relevant gates:
- npm run typecheck -- --pretty false
- npm run lint when phase-wide or touched lint-sensitive files require it
- relevant npm test commands
- banned pattern audit:
  rg "console\.|: any\b|<any>|@ts-ignore|@ts-nocheck|StyleSheet\.create|FlatList|AsyncStorage|fetch\(" src_impl
- file-size audit for edited scope, ensuring hand-edited files are under 200 lines

Record evidence in VERIFICATION_REPORT.md. Do not claim a phase is complete without verification evidence.
