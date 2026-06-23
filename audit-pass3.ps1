# VEX Audit Pass 3 - Additional scans
$root = "C:\Users\jonat\CascadeProjects\vex-app-old"
$tsFiles = Get-ChildItem -Path "$root\src" -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' }
$tsxFiles = $tsFiles | Where-Object { $_.Name -match '\.tsx$' -and $_.FullName -notmatch '__tests__' }

Write-Host "=== AUDIT PASS 3: ADDITIONAL SCANS ===" -ForegroundColor Cyan

# 1. useState declarations
$stateful = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' } | Select-String -Pattern 'useState<' -ErrorAction SilentlyContinue
Write-Host "`nuseState declarations: $($stateful.Count)"

# 2. useEffect calls
$effects = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' } | Select-String -Pattern 'useEffect\(' -ErrorAction SilentlyContinue
Write-Host "useEffect calls: $($effects.Count)"

# 3. useCallback calls
$callbacks = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' } | Select-String -Pattern 'useCallback\(' -ErrorAction SilentlyContinue
Write-Host "useCallback calls: $($callbacks.Count)"

# 4. useMemo calls
$memos = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' } | Select-String -Pattern 'useMemo\(' -ErrorAction SilentlyContinue
Write-Host "useMemo calls: $($memos.Count)"

# 5. useRef calls
$refs = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' } | Select-String -Pattern 'useRef\(' -ErrorAction SilentlyContinue
Write-Host "useRef calls: $($refs.Count)"

# 6. React.memo
$memoized = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' } | Select-String -Pattern 'React\.memo|memo\(' -ErrorAction SilentlyContinue
Write-Host "React.memo: $($memoized.Count)"

# 7. forwardRef
$fwd = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' } | Select-String -Pattern 'forwardRef' -ErrorAction SilentlyContinue
Write-Host "forwardRef: $($fwd.Count)"

# 8. Event listeners
$evtListeners = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' } | Select-String -Pattern 'addEventListener|removeEventListener|removeAllListeners' -ErrorAction SilentlyContinue
Write-Host "Event listeners: $($evtListeners.Count)"

# 9. Platform checks
$platformChecks = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' } | Select-String -Pattern 'Platform\.OS|Platform\.select' -ErrorAction SilentlyContinue
Write-Host "Platform checks: $($platformChecks.Count)"

# 10. Ternary operators in TSX
$ternary = $tsxFiles | Select-String -Pattern '\?.*:' -ErrorAction SilentlyContinue
Write-Host "Ternary operators in TSX: $($ternary.Count)"

# 11. Inline style objects
$inlineStyles = $tsxFiles | Select-String -Pattern 'style=\{\{' -ErrorAction SilentlyContinue
Write-Host "Inline style objects: $($inlineStyles.Count)"

# 12. Reanimated imports
$reanimated = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' } | Select-String -Pattern "from 'react-native-reanimated" -ErrorAction SilentlyContinue
Write-Host "Reanimated imports: $($reanimated.Count)"

# 13. Supabase direct usage (beyond repository)
$supDirect = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' -and $_.FullName -notmatch 'repository' -and $_.FullName -notmatch 'supabase' } | Select-String -Pattern 'getSupabaseClient|supabase\.' -ErrorAction SilentlyContinue
Write-Host "Direct Supabase client usage outside repository: $($supDirect.Count)"
$supDirect | Select-Object -First 15 @{N='File';E={$_.Path.Replace("$root\src\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 14. PostHog analytics
$ph = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' } | Select-String -Pattern 'PostHog|posthog' -ErrorAction SilentlyContinue
Write-Host "PostHog usage: $($ph.Count)"

# 15. RevenueCat
$rc = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' } | Select-String -Pattern 'Purchases|RevenueCat|react-native-purchases' -ErrorAction SilentlyContinue
Write-Host "RevenueCat usage: $($rc.Count)"

# 16. MMKV usage
$mmkv = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' } | Select-String -Pattern 'MMKV|mmkv' -ErrorAction SilentlyContinue
Write-Host "MMKV usage: $($mmkv.Count)"

# 17. SecureStore usage
$secure = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' } | Select-String -Pattern 'SecureStore|secure-store' -ErrorAction SilentlyContinue
Write-Host "SecureStore usage: $($secure.Count)"

# 18. FlashList usage
$flash = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' } | Select-String -Pattern 'FlashList' -ErrorAction SilentlyContinue
Write-Host "FlashList usage: $($flash.Count)"

# 19. Complex component: files with >300 lines
Write-Host "`n--- VERY LARGE FILES (>300 lines) ---"
$veryLarge = @()
foreach ($f in $tsFiles | Where-Object { $_.Name -notmatch '__tests__' }) {
    $lines = (Get-Content $f.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
    if ($lines -gt 300) {
        $veryLarge += [PSCustomObject]@{File=$f.FullName.Replace("$root\src\",''); Lines=$lines}
    }
}
$veryLarge | Sort-Object Lines -Descending | Format-Table -AutoSize
Write-Host "Very large files (>300 lines): $($veryLarge.Count)"

# 20. Features with most files
Write-Host "`n--- FEATURE FILE COUNTS ---"
$features = Get-ChildItem -Path "$root\src\features" -Directory -ErrorAction SilentlyContinue
$features | ForEach-Object {
    $count = (Get-ChildItem -Path $_.FullName -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '__tests__' }).Count
    if ($count -gt 50) { Write-Host "  $($_.Name): $count source files" }
}

# 21. Screen files
Write-Host "`n--- SCREEN FILES ---"
$screens = Get-ChildItem -Path "$root\src\screens" -Recurse -Include *.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '__tests__' }
Write-Host "Screen TSX files: $($screens.Count)"

# 22. Session engine files
Write-Host "`n--- SESSION ENGINE ---"
$sessionDir = "$root\src\session"
$sessionFiles = Get-ChildItem -Path $sessionDir -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '__tests__' }
Write-Host "Session engine files: $($sessionFiles.Count)"
$sessionLines = 0
foreach ($f in $sessionFiles) {
    $sessionLines += (Get-Content $f.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
}
Write-Host "Session engine lines: $sessionLines"

Write-Host "`n=== PASS 3 COMPLETE ===" -ForegroundColor Green
