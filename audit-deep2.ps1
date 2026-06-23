# VEX Codebase Deep Audit Pass 2 - Exhaustive
$root = "C:\Users\jonat\CascadeProjects\vex-app-old"
$tsFiles = Get-ChildItem -Path "$root\src" -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' }
$srcRoot = "$root\src"

Write-Host "=== DEEP AUDIT PASS 2: EXHAUSTIVE SCAN ===" -ForegroundColor Cyan
Write-Host "Total TS/TSX files: $($tsFiles.Count)"

# ========== 1. IMPURE COMPONENTS (business logic in .tsx) ==========
Write-Host "`n========== 1. IMPURE COMPONENTS (business logic in .tsx) =========="
$tsxFiles = $tsFiles | Where-Object { $_.Name -match '\.tsx$' -and $_.FullName -notmatch '__tests__' }
$impurePatterns = @(
    'if\s*\(', 'switch\s*\(', 'case\s+', '&&\s*\(', '\|\|\s*\(',
    '\.then\(', 'await\s+', 'async\s+', 'Promise',
    'calculate', 'compute', 'derive', 'transform',
    'supabase', '\.from\(', '\.select\(', '\.insert\(',
    'fetch\(', 'axios', 'XMLHttpRequest',
    'localStorage', 'MMKV', 'SecureStore',
    'Sentry\.', 'captureException', 'captureMessage'
)
$impureCount = 0
$impureFiles = @{}
foreach ($f in $tsxFiles) {
    $content = Get-Content $f.FullName -ErrorAction SilentlyContinue
    $hits = 0
    $lineNum = 0
    foreach ($line in $content) {
        $lineNum++
        foreach ($pat in $impurePatterns) {
            if ($line -match $pat) {
                $hits++
                if ($hits -le 3) {
                    $key = $f.FullName.Replace("$srcRoot\",'')
                    if (-not $impureFiles.ContainsKey($key)) { $impureFiles[$key] = @() }
                    $impureFiles[$key] += "L$lineNum`: $($line.Trim())"
                }
            }
        }
    }
    if ($hits -gt 0) { $impureCount++ }
}
Write-Host "TSX files with business logic patterns: $impureCount / $($tsxFiles.Count)"
foreach ($kv in ($impureFiles.GetEnumerator() | Sort-Object { $_.Value.Count } -Descending | Select-Object -First 25)) {
    Write-Host "`n  $($kv.Key):"
    $kv.Value | ForEach-Object { Write-Host "    $_" }
}

# ========== 2. HOOKS BREAKING RULES ==========
Write-Host "`n========== 2. HOOKS BREAKING RULES =========="
$hookFiles = $tsFiles | Where-Object { $_.FullName -match '\\hooks\\' -or $_.Name -match 'use[A-Z]' }
$hookViolations = @{}
foreach ($f in $hookFiles) {
    $content = Get-Content $f.FullName -ErrorAction SilentlyContinue -Raw
    $issues = @()
    if ($content -match '\.from\([''"].*[''"].*\.(select|insert|update|delete)') { $issues += "Direct Supabase query" }
    if ($content -match 'console\.log') { $issues += "console.log" }
    if ($content -match 'localStorage|AsyncStorage') { $issues += "Wrong storage" }
    if ($content -match 'fetch\(') { $issues += "Raw fetch" }
    if ($content -match 'StyleSheet') { $issues += "StyleSheet" }
    if ($issues.Count -gt 0) {
        $hookViolations[$f.FullName.Replace("$srcRoot\",'')] = $issues
    }
}
Write-Host "Hooks with violations: $($hookViolations.Count)"
foreach ($kv in $hookViolations) {
    Write-Host "  $($kv.Key): $($kv.Value -join ', ')"
}

# ========== 3. REPOSITORY LAYER VIOLATIONS ==========
Write-Host "`n========== 3. REPOSITORY LAYER VIOLATIONS =========="
$repoFiles = $tsFiles | Where-Object { $_.FullName -match 'repository' -and $_.Name -notmatch '__tests__' }
$repoIssues = @{}
foreach ($f in $repoFiles) {
    $content = Get-Content $f.FullName -ErrorAction SilentlyContinue -Raw
    $issues = @()
    if ($content -match 'console\.') { $issues += "console.*" }
    if ($content -match 'useState|useEffect|useCallback|useMemo') { $issues += "React hooks in repository" }
    if ($content -match 'StyleSheet|View|Text|TouchableOpacity') { $issues += "UI imports in repository" }
    if ($content -match 'Sentry\.') { $issues += "Direct Sentry in repository" }
    if ($issues.Count -gt 0) {
        $repoIssues[$f.FullName.Replace("$srcRoot\",'')] = $issues
    }
}
Write-Host "Repository files with violations: $($repoIssues.Count)"
foreach ($kv in $repoIssues) {
    Write-Host "  $($kv.Key): $($kv.Value -join ', ')"
}

# ========== 4. SERVICE LAYER VIOLATIONS ==========
Write-Host "`n========== 4. SERVICE LAYER VIOLATIONS =========="
$svcFiles = $tsFiles | Where-Object { $_.FullName -match '\\service\\|service\.ts$' -and $_.Name -notmatch '__tests__' }
$svcIssues = @{}
foreach ($f in $svcFiles) {
    $content = Get-Content $f.FullName -ErrorAction SilentlyContinue -Raw
    $issues = @()
    if ($content -match 'useState|useEffect|useCallback|useMemo|useRef') { $issues += "React hooks in service" }
    if ($content -match 'StyleSheet|View|Text|TouchableOpacity|Image') { $issues += "UI imports in service" }
    if ($content -match '<View|<Text|<TouchableOpacity|<Image') { $issues += "JSX in service" }
    if ($content -match 'fetch\(') { $issues += "Raw fetch" }
    if ($content -match 'console\.log') { $issues += "console.log" }
    if ($issues.Count -gt 0) {
        $svcIssues[$f.FullName.Replace("$srcRoot\",'')] = $issues
    }
}
Write-Host "Service files with violations: $($svcIssues.Count)"
foreach ($kv in $svcIssues) {
    Write-Host "  $($kv.Key): $($kv.Value -join ', ')"
}

# ========== 5. COMPONENT FILE SIZE AUDIT ==========
Write-Host "`n========== 5. COMPONENT FILE SIZES (>150 lines) =========="
$bigComponents = @()
foreach ($f in $tsxFiles) {
    $lines = (Get-Content $f.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
    if ($lines -gt 150) {
        $bigComponents += [PSCustomObject]@{File=$f.FullName.Replace("$srcRoot\",''); Lines=$lines}
    }
}
$bigComponents | Sort-Object Lines -Descending | Format-Table -AutoSize
Write-Host "Large component files: $($bigComponents.Count)"

# ========== 6. DUPLICATE UTILITY FUNCTIONS ==========
Write-Host "`n========== 6. DUPLICATE UTILITY FUNCTIONS =========="
$utilFiles = $tsFiles | Where-Object { $_.FullName -match '\\utils\\' -or $_.FullName -match 'helpers' -or $_.Name -match '-helpers\.' -or $_.Name -match 'utils\.' }
$utilFns = @{}
foreach ($f in $utilFiles) {
    $content = Get-Content $f.FullName -ErrorAction SilentlyContinue
    foreach ($line in $content) {
        if ($line -match 'export\s+(?:function|const)\s+(\w+)') {
            $name = $Matches[1]
            if (-not $utilFns.ContainsKey($name)) { $utilFns[$name] = @() }
            $utilFns[$name] += $f.FullName.Replace("$srcRoot\",'')
        }
    }
}
$dupUtilFns = $utilFns.GetEnumerator() | Where-Object { $_.Value.Count -gt 1 } | Sort-Object { $_.Value.Count } -Descending
Write-Host "Duplicate utility functions: $($dupUtilFns.Count)"
$dupUtilFns | Select-Object -First 20 | ForEach-Object {
    Write-Host "`n  $($_.Key) (x$($_.Value.Count)):"
    $_.Value | ForEach-Object { Write-Host "    $_" }
}

# ========== 7. INLINE STYLES vs TOKENS ==========
Write-Host "`n========== 7. HARDCODED STYLE VALUES =========="
$hardcodedStyles = $tsxFiles | Select-String -Pattern 'fontSize:\s*\d+|borderRadius:\s*\d+|padding:\s*\d+|margin:\s*\d+|width:\s*\d+|height:\s*\d+|gap:\s*\d+' -ErrorAction SilentlyContinue
Write-Host "Hardcoded numeric style values: $($hardcodedStyles.Count)"
$hardcodedStyles | Select-Object -First 20 @{N='File';E={$_.Path.Replace("$srcRoot\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# ========== 8. ERROR HANDLING GAPS ==========
Write-Host "`n========== 8. ASYNC WITHOUT ERROR HANDLING =========="
$asyncNoCatch = @()
$asyncFiles = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' -and $_.Name -notmatch '\.test\.' }
foreach ($f in $asyncFiles) {
    $content = Get-Content $f.FullName -ErrorAction SilentlyContinue -Raw
    # Find async functions without try/catch
    $asyncFns = [regex]::Matches($content, 'async\s+(?:function|[\w]+\s*[\(=])')
    $tryCatches = [regex]::Matches($content, 'try\s*\{')
    if ($asyncFns.Count -gt 0 -and $tryCatches.Count -eq 0 -and $content -notmatch 'throw\s+new') {
        $asyncNoCatch += $f.FullName.Replace("$srcRoot\",'')
    }
}
Write-Host "Async files with no try/catch: $($asyncNoCatch.Count)"
$asyncNoCatch | Select-Object -First 15 | ForEach-Object { Write-Host "  $_" }

# ========== 9. ZOD SCHEMA COMPLIANCE ==========
Write-Host "`n========== 9. ZOD SCHEMA USAGE =========="
$schemaFiles = $tsFiles | Where-Object { $_.Name -match 'schema' -and $_.Name -notmatch '__tests__' }
Write-Host "Schema files: $($schemaFiles.Count)"
$zodUsage = $tsFiles | Select-String -Pattern 'from [''"]zod[''"]|from [''"]zod' -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch '__tests__' }
Write-Host "Files importing zod: $($zodUsage.Count)"
$typeOnly = $tsFiles | Select-String -Pattern 'type\s+\w+\s*=\s*\{' -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch '__tests__' -and $_.Path -notmatch 'schema' }
Write-Host "Manual type definitions (not from schema): $($typeOnly.Count)"

# ========== 10. MISSING ERROR BOUNDARIES ==========
Write-Host "`n========== 10. SCREENS WITHOUT ERROR BOUNDARIES =========="
$screens = $tsFiles | Where-Object { $_.FullName -match '\\screens\\' -and $_.Name -match '\.tsx$' -and $_.Name -notmatch '__tests__' }
$screensWithEB = @()
foreach ($f in $screens) {
    $content = Get-Content $f.FullName -ErrorAction SilentlyContinue -Raw
    if ($content -match 'ErrorBoundary|ErrorFallback|error') {
        $screensWithEB += $f.FullName.Replace("$srcRoot\",'')
    }
}
Write-Host "Screens with error handling: $($screensWithEB.Count) / $($screens.Count)"

# ========== 11. REALTIME SUBSCRIPTION CLEANUP ==========
Write-Host "`n========== 11. REALTIME SUBSCRIPTIONS =========="
$realtimeFiles = $tsFiles | Select-String -Pattern '\.subscribe\(|channel\(' -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch '__tests__' }
Write-Host "Files with subscriptions: $($realtimeFiles.Count)"
$noCleanup = @()
foreach ($f in ($realtimeFiles | Select-Object -Unique Path)) {
    $content = Get-Content $f.Path -ErrorAction SilentlyContinue -Raw
    if ($content -match '\.subscribe\(' -and $content -notmatch 'unsubscribe|cleanup|return\s*\(') {
        $noCleanup += $f.Path.Replace("$srcRoot\",'')
    }
}
Write-Host "Subscriptions without cleanup pattern: $($noCleanup.Count)"
$noCleanup | ForEach-Object { Write-Host "  $_" }

# ========== 12. PERFORMANCE: INLINE FUNCTIONS IN JSX ==========
Write-Host "`n========== 12. PERFORMANCE: INLINE FUNCTIONS IN JSX =========="
$inlineFns = $tsxFiles | Select-String -Pattern 'onPress=\{?\(\)\s*=>' -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch '__tests__' }
Write-Host "Inline arrow functions in onPress: $($inlineFns.Count)"

$inlineRender = $tsxFiles | Select-String -Pattern 'renderItem=\{' -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch '__tests__' }
Write-Host "renderItem with inline: $($inlineRender.Count)"

# ========== 13. DEPENDENCY ANALYSIS ==========
Write-Host "`n========== 13. IMPORT DENSITY =========="
$importCounts = @{}
foreach ($f in $tsFiles | Where-Object { $_.Name -notmatch '__tests__' }) {
    $content = Get-Content $f.FullName -ErrorAction SilentlyContinue
    $imports = ($content | Where-Object { $_ -match '^import\s' }).Count
    if ($imports -gt 15) {
        $importCounts[$f.FullName.Replace("$srcRoot\",'')] = $imports
    }
}
Write-Host "Files with >15 imports: $($importCounts.Count)"
$importCounts.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 15 | ForEach-Object {
    Write-Host "  $($_.Key): $($_.Value) imports"
}

# ========== 14. COMPLEXITY: NESTING DEPTH ==========
Write-Host "`n========== 14. DEEP NESTING (>5 levels) =========="
$deepNest = @()
foreach ($f in $tsxFiles | Where-Object { $_.Name -notmatch '__tests__' }) {
    $content = Get-Content $f.FullName -ErrorAction SilentlyContinue
    $maxDepth = 0
    $depth = 0
    foreach ($line in $content) {
        $opens = ([regex]::Matches($line, '\{')).Count
        $closes = ([regex]::Matches($line, '\}')).Count
        $depth += $opens - $closes
        if ($depth -gt $maxDepth) { $maxDepth = $depth }
    }
    if ($maxDepth -gt 8) {
        $deepNest += [PSCustomObject]@{File=$f.FullName.Replace("$srcRoot\",''); MaxDepth=$maxDepth}
    }
}
$deepNest | Sort-Object MaxDepth -Descending | Select-Object -First 15 | Format-Table -AutoSize
Write-Host "Files with deep nesting (>8): $($deepNest.Count)"

# ========== 15. BARREL FILE ANALYSIS ==========
Write-Host "`n========== 15. BARREL FILE DEPTH =========="
$barrels = $tsFiles | Where-Object { $_.Name -eq 'index.ts' }
$deepBarrels = @()
foreach ($f in $barrels) {
    $content = Get-Content $f.FullName -ErrorAction SilentlyContinue
    $reExports = ($content | Where-Object { $_ -match 'export\s+\*|export\s+\{' }).Count
    if ($reExports -gt 10) {
        $deepBarrels += [PSCustomObject]@{File=$f.FullName.Replace("$srcRoot\",''); Exports=$reExports}
    }
}
$deepBarrels | Sort-Object Exports -Descending | Select-Object -First 15 | Format-Table -AutoSize
Write-Host "Heavy barrel files (>10 exports): $($deepBarrels.Count)"

# ========== 16. FEATURE COMPLEXITY RANKING ==========
Write-Host "`n========== 16. FEATURE COMPLEXITY RANKING =========="
$features = Get-ChildItem -Path "$srcRoot\features" -Directory -ErrorAction SilentlyContinue
$featureStats = @()
foreach ($feat in $features) {
    $featFiles = Get-ChildItem -Path $feat.FullName -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '__tests__' }
    $featLines = 0
    $featComponents = 0
    $featHooks = 0
    foreach ($ff in $featFiles) {
        $l = (Get-Content $ff.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
        $featLines += $l
        if ($ff.Name -match '\.tsx$') { $featComponents++ }
        if ($ff.Name -match 'use[A-Z]' -or $ff.FullName -match '\\hooks\\') { $featHooks++ }
    }
    $featureStats += [PSCustomObject]@{
        Feature=$feat.Name
        Files=$featFiles.Count
        Lines=$featLines
        Components=$featComponents
        Hooks=$featHooks
    }
}
$featureStats | Sort-Object Lines -Descending | Format-Table -AutoSize

# ========== 17. CROSS-CUTTING: SHARED STATE USAGE ==========
Write-Host "`n========== 17. ZUSTAND STORE USAGE =========="
$zustandFiles = $tsFiles | Select-String -Pattern 'from [''"]zustand|create\(|useStore' -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch '__tests__' }
Write-Host "Files using Zustand: $($zustandFiles.Count)"

$storeDefs = $tsFiles | Select-String -Pattern 'create\(<' -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch '__tests__' }
Write-Host "Zustand store definitions: $($storeDefs.Count)"
$storeDefs | Select-Object @{N='File';E={$_.Path.Replace("$srcRoot\",'')}}, LineNumber | Format-Table -AutoSize

# ========== 18. TANSTACK QUERY USAGE ==========
Write-Host "`n========== 18. TANSTACK QUERY USAGE =========="
$tqFiles = $tsFiles | Select-String -Pattern 'useQuery|useMutation|useInfiniteQuery|queryClient' -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch '__tests__' }
Write-Host "Files using TanStack Query: $($tqFiles.Count)"

# ========== 19. HARDCODED STRINGS / MAGIC NUMBERS ==========
Write-Host "`n========== 19. MAGIC NUMBERS =========="
$magicNums = $tsFiles | Where-Object { $_.Name -notmatch '__tests__' -and $_.Name -notmatch 'schema' -and $_.Name -notmatch 'constant' } | Select-String -Pattern '(?:setTimeout|setInterval)\(\s*\(\)\s*=>[^,]+,\s*\d{4,}' -ErrorAction SilentlyContinue
Write-Host "setTimeout/setInterval with magic numbers: $($magicNums.Count)"
$magicNums | Select-Object -First 15 @{N='File';E={$_.Path.Replace("$srcRoot\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# ========== 20. MISSING LOADING/ERROR STATES ==========
Write-Host "`n========== 20. COMPONENTS WITHOUT LOADING STATE =========="
$componentsWithoutLoading = @()
foreach ($f in $tsxFiles | Where-Object { $_.FullName -match '\\components\\' }) {
    $content = Get-Content $f.FullName -ErrorAction SilentlyContinue -Raw
    $hasQuery = $content -match 'useQuery|useMutation|isPending|isLoading|isFetching'
    $hasLoading = $content -match 'Loading|Skeleton|skeleton|ActivityIndicator|Spinner'
    $hasError = $content -match 'Error|error|isError'
    if ($hasQuery -and -not $hasLoading) {
        $componentsWithoutLoading += $f.FullName.Replace("$srcRoot\",'')
    }
}
Write-Host "Components with queries but no loading state: $($componentsWithoutLoading.Count)"
$componentsWithoutLoading | Select-Object -First 15 | ForEach-Object { Write-Host "  $_" }

# ========== 21. ACCESSIBILITY AUDIT ==========
Write-Host "`n========== 21. ACCESSIBILITY =========="
$a11yMissing = @()
foreach ($f in $tsxFiles | Where-Object { $_.FullName -match '\\components\\' -and $_.Name -notmatch '__tests__' }) {
    $content = Get-Content $f.FullName -ErrorAction SilentlyContinue -Raw
    $hasTouch = $content -match 'TouchableOpacity|Pressable|onPress'
    $hasA11y = $content -match 'accessibilityLabel|accessibilityRole|accessibilityHint|accessibilityState'
    if ($hasTouch -and -not $hasA11y) {
        $a11yMissing += $f.FullName.Replace("$srcRoot\",'')
    }
}
Write-Host "Interactive components without a11y props: $($a11yMissing.Count)"
$a11yMissing | Select-Object -First 15 | ForEach-Object { Write-Host "  $_" }

# ========== 22. TEST COVERAGE GAPS ==========
Write-Host "`n========== 22. FEATURES WITHOUT TESTS =========="
foreach ($feat in $features) {
    $testFiles = Get-ChildItem -Path $feat.FullName -Recurse -Include *.test.ts,*.test.tsx -ErrorAction SilentlyContinue
    $srcFiles = Get-ChildItem -Path $feat.FullName -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '__tests__' }
    $ratio = if ($srcFiles.Count -gt 0) { [math]::Round($testFiles.Count / $srcFiles.Count * 100, 1) } else { 0 }
    if ($ratio -lt 30 -and $srcFiles.Count -gt 5) {
        Write-Host "  $($feat.Name): $($testFiles.Count) tests / $($srcFiles.Count) src ($ratio%)"
    }
}

# ========== 23. EXPORT/IMPORT ASYMMETRY ==========
Write-Host "`n========== 23. EXPORTED BUT NEVER IMPORTED =========="
$allExports = @{}
foreach ($f in $tsFiles | Where-Object { $_.Name -notmatch '__tests__' }) {
    $content = Get-Content $f.FullName -ErrorAction SilentlyContinue
    foreach ($line in $content) {
        if ($line -match 'export\s+(?:function|const|class|type|interface)\s+(\w+)') {
            $name = $Matches[1]
            if (-not $allExports.ContainsKey($name)) { $allExports[$name] = 0 }
            $allExports[$name]++
        }
    }
}
$allImports = @{}
foreach ($f in $tsFiles) {
    $content = Get-Content $f.FullName -ErrorAction SilentlyContinue
    foreach ($line in $content) {
        if ($line -match 'import\s+\{([^}]+)\}') {
            foreach ($imp in $Matches[1].Split(',')) {
                $impName = $imp.Trim().Split(' as ')[0].Trim()
                if (-not $allImports.ContainsKey($impName)) { $allImports[$impName] = 0 }
                $allImports[$impName]++
            }
        }
    }
}
$unimported = $allExports.GetEnumerator() | Where-Object { -not $allImports.ContainsKey($_.Key) -or $allImports[$_.Key] -eq 0 }
Write-Host "Exported symbols never imported: $($unimported.Count)"
$unimported | Select-Object -First 20 | ForEach-Object { Write-Host "  $($_.Key) (exported x$($_.Value))" }

Write-Host "`n=== DEEP AUDIT PASS 2 COMPLETE ===" -ForegroundColor Green
