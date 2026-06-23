# VEX Audit Pass 4 - Error Handling, Security, Depth
$root = "C:\Users\jonat\CascadeProjects\vex-app-old"
$tsFiles = Get-ChildItem -Path "$root\src" -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch '__tests__' }

Write-Host "=== AUDIT PASS 4: ERROR HANDLING & SECURITY ===" -ForegroundColor Cyan

# 1. catch(e: any) - typed error violations
$catchAny = $tsFiles | Select-String -Pattern 'catch\s*\(\s*\w+\s*:\s*any\s*\)' -ErrorAction SilentlyContinue
Write-Host "`ncatch(e: any) violations: $($catchAny.Count)"
$catchAny | Select-Object -First 10 @{N='File';E={$_.Path.Replace("$root\src\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 2. catch(e) - untyped catch blocks
$catchUntyped = $tsFiles | Select-String -Pattern 'catch\s*\(\s*\w+\s*\)\s*\{' -ErrorAction SilentlyContinue
Write-Host "Untyped catch blocks: $($catchUntyped.Count)"

# 3. Empty catch blocks
$emptyCatch = $tsFiles | Select-String -Pattern 'catch\s*\([^)]*\)\s*\{\s*\}' -ErrorAction SilentlyContinue
Write-Host "Empty catch blocks: $($emptyCatch.Count)"
$emptyCatch | Select-Object -First 10 @{N='File';E={$_.Path.Replace("$root\src\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 4. catch blocks that swallow errors (no throw, no Sentry, no console)
Write-Host "`n--- CATCH BLOCK QUALITY ---"
$catchBlocks = $tsFiles | Select-String -Pattern 'catch\s*\(' -ErrorAction SilentlyContinue
$withSentry = $catchBlocks | Select-String -Pattern 'Sentry|captureException|logger' -ErrorAction SilentlyContinue
$withRethrow = $catchBlocks | Select-String -Pattern 'throw' -ErrorAction SilentlyContinue
Write-Host "Total catch blocks: $($catchBlocks.Count)"
Write-Host "Catch with Sentry: $($withSentry.Count)"
Write-Host "Catch with rethrow: $($withRethrow.Count)"
Write-Host "Catch without either: $($catchBlocks.Count - $withSentry.Count - $withRethrow.Count)"

# 5. eval() / new Function() - code injection
$evalUsage = $tsFiles | Select-String -Pattern '\beval\s*\(|new\s+Function\s*\(' -ErrorAction SilentlyContinue
Write-Host "`neval()/new Function(): $($evalUsage.Count)"
$evalUsage | Format-Table @{N='File';E={$_.Path.Replace("$root\src\",'')}}, LineNumber, Line -AutoSize -Wrap

# 6. Hardcoded API keys/secrets (excluding constants and test files)
$secrets = $tsFiles | Where-Object { $_.FullName -notmatch 'constants' -and $_.FullName -notmatch 'test' -and $_.FullName -notmatch 'config' } | Select-String -Pattern 'sk_live|sk_test|api_key\s*[:=]\s*["\x27]|password\s*[:=]\s*["\x27]|secret\s*[:=]\s*["\x27]|token\s*[:=]\s*["\x27][a-zA-Z0-9]' -ErrorAction SilentlyContinue
Write-Host "`nHardcoded secrets (non-constants): $($secrets.Count)"
$secrets | Select-Object -First 10 @{N='File';E={$_.Path.Replace("$root\src\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 7. Race conditions - concurrent state updates
$raceConditions = $tsFiles | Select-String -Pattern 'setInterval|setTimeout' -ErrorAction SilentlyContinue
Write-Host "`nsetTimeout/setInterval: $($raceConditions.Count)"

# 8. Memory leaks - subscriptions without cleanup
$subscriptions = $tsFiles | Select-String -Pattern '\.subscribe\(' -ErrorAction SilentlyContinue
$unsubscribes = $tsFiles | Select-String -Pattern '\.unsubscribe\(' -ErrorAction SilentlyContinue
Write-Host "`n.subscribe() calls: $($subscriptions.Count)"
Write-Host ".unsubscribe() calls: $($unsubscribes.Count)"
if ($subscriptions.Count -gt $unsubscribes.Count) {
    Write-Host "POTENTIAL MEMORY LEAK: $($subscriptions.Count - $unsubscribes.Count) subscriptions without matching unsubscribe"
}

# 9. Unhandled promise rejections
$unhandledPromises = $tsFiles | Select-String -Pattern '\.then\(' -ErrorAction SilentlyContinue
$withCatch = $tsFiles | Select-String -Pattern '\.catch\(' -ErrorAction SilentlyContinue
Write-Host "`n.then() chains: $($unhandledPromises.Count)"
Write-Host ".catch() handlers: $($withCatch.Count)"

# 10. Sensitive data in analytics
$sensitiveAnalytics = $tsFiles | Select-String -Pattern 'track\(.*email|track\(.*password|track\(.*token|track\(.*secret' -ErrorAction SilentlyContinue
Write-Host "`nSensitive data in analytics: $($sensitiveAnalytics.Count)"
$sensitiveAnalytics | Select-Object -First 10 @{N='File';E={$_.Path.Replace("$root\src\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 11. Console usage in production code (not debug utility)
$consoleProd = $tsFiles | Select-String -Pattern 'console\.(log|warn|error|info|debug)' -ErrorAction SilentlyContinue
Write-Host "`nConsole usage in production code: $($consoleProd.Count)"
$consoleProd | Select-Object -First 15 @{N='File';E={$_.Path.Replace("$root\src\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 12. Files importing from react-native Animated (should use Reanimated)
$animatedRN = $tsFiles | Select-String -Pattern "from 'react-native'.*Animated|Animated.*from 'react-native'" -ErrorAction SilentlyContinue
Write-Host "`nReact Native Animated imports: $($animatedRN.Count)"
$animatedRN | Format-Table @{N='File';E={$_.Path.Replace("$root\src\",'')}}, LineNumber, Line -AutoSize -Wrap

# 13. Platform.OS === checks (should use Platform.select)
$platformOS = $tsFiles | Select-String -Pattern "Platform\.OS\s*===" -ErrorAction SilentlyContinue
Write-Host "`nPlatform.OS === checks: $($platformOS.Count)"

# 14. Hardcoded dimensions (width/height numbers without tokens)
$hardcodedDims = $tsFiles | Select-String -Pattern 'width:\s*\d{2,}|height:\s*\d{2,}|borderRadius:\s*\d{2,}' -ErrorAction SilentlyContinue
Write-Host "`nHardcoded dimension values: $($hardcodedDims.Count)"

# 15. Non-null assertions in production code
$nonNull = $tsFiles | Select-String -Pattern '\w+!\.' -ErrorAction SilentlyContinue
Write-Host "`nNon-null assertions (!.): $($nonNull.Count)"
$nonNull | Select-Object -First 15 @{N='File';E={$_.Path.Replace("$root\src\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 16. Files with many imports (>15)
Write-Host "`n--- HEAVY IMPORTS (>15 imports) ---"
$heavyImports = @()
foreach ($f in $tsFiles | Where-Object { $_.Name -notmatch '__tests__' }) {
    $imports = (Get-Content $f.FullName -ErrorAction SilentlyContinue | Select-String -Pattern "^import " | Measure-Object).Count
    if ($imports -gt 15) {
        $heavyImports += [PSCustomObject]@{File=$f.FullName.Replace("$root\src\",''); Imports=$imports}
    }
}
$heavyImports | Sort-Object Imports -Descending | Select-Object -First 20 | Format-Table -AutoSize
Write-Host "Files with >15 imports: $($heavyImports.Count)"

# 17. Files with >500 lines
Write-Host "`n--- VERY LARGE FILES (>500 lines) ---"
$veryLarge = @()
foreach ($f in $tsFiles) {
    $lines = (Get-Content $f.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
    if ($lines -gt 500) {
        $veryLarge += [PSCustomObject]@{File=$f.FullName.Replace("$root\src\",''); Lines=$lines}
    }
}
$veryLarge | Sort-Object Lines -Descending | Format-Table -AutoSize
Write-Host "Files >500 lines: $($veryLarge.Count)"

# 18. Feature completeness check
Write-Host "`n--- FEATURE ARCHITECTURE COMPLETENESS ---"
$features = Get-ChildItem -Path "$root\src\features" -Directory -ErrorAction SilentlyContinue
foreach ($feat in $features) {
    $required = @('types.ts','schemas.ts','repository.ts','service.ts','hooks.ts')
    $missing = @()
    foreach ($req in $required) {
        $found = Get-ChildItem -Path $feat.FullName -Recurse -Filter $req -ErrorAction SilentlyContinue
        if (-not $found) { $missing += $req }
    }
    if ($missing.Count -gt 0) {
        Write-Host "  $($feat.Name): MISSING $($missing -join ', ')"
    }
}

# 19. Barrel files with >10 exports
Write-Host "`n--- HEAVY BARREL FILES ---"
$barrels = $tsFiles | Where-Object { $_.Name -eq 'index.ts' } | Select-String -Pattern '^export ' -ErrorAction SilentlyContinue
$grouped = $barrels | Group-Object Path | Where-Object { $_.Count -gt 10 }
$grouped | Sort-Object Count -Descending | Select-Object -First 15 @{N='File';E={$_.Name.Replace("$root\src\",'')}}, Count | Format-Table -AutoSize

# 20. useCallback overuse
$useCallbacks = $tsFiles | Select-String -Pattern 'useCallback\(' -ErrorAction SilentlyContinue
Write-Host "`nuseCallback total: $($useCallbacks.Count)"

# 21. useMemo overuse
$useMemos = $tsFiles | Select-String -Pattern 'useMemo\(' -ErrorAction SilentlyContinue
Write-Host "useMemo total: $($useMemos.Count)"

# 22. Components without memo
$components = $tsFiles | Select-String -Pattern 'export (const|function) \w+.*:.*React\.(FC|Component)|export default function' -ErrorAction SilentlyContinue
$memoized = $tsFiles | Select-String -Pattern 'React\.memo\(' -ErrorAction SilentlyContinue
Write-Host "`nComponent exports: ~$($components.Count)"
Write-Host "React.memo wrapping: $($memoized.Count)"

Write-Host "`n=== PASS 4 COMPLETE ===" -ForegroundColor Green
