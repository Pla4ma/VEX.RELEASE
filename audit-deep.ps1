$root = "C:\Users\jonat\CascadeProjects\vex-app-old"
$tsFiles = Get-ChildItem -Path "$root\src" -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' }

# 1. Supabase queries outside repository files
Write-Host "`n--- SUPABASE QUERIES OUTSIDE REPOSITORY ---"
$supabaseQueries = $tsFiles | Select-String -Pattern "\.from\(['""].*['""].*\.(select|insert|update|delete|upsert)" -ErrorAction SilentlyContinue
$outsideRepo = $supabaseQueries | Where-Object { $_.Path -notmatch 'repository' -and $_.Path -notmatch '__tests__' -and $_.Path -notmatch 'supabase' }
Write-Host "Supabase queries outside repository: $($outsideRepo.Count)"
$outsideRepo | Select-Object -First 30 @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 2. Hooks with direct Supabase access
Write-Host "`n--- HOOKS WITH SUPABASE ---"
$hookSupabase = $tsFiles | Where-Object { $_.Name -match 'hook' -or $_.FullName -match '\\hooks\\' } | Select-String -Pattern 'supabase' -ErrorAction SilentlyContinue
Write-Host "Hooks mentioning supabase: $($hookSupabase.Count)"
$hookSupabase | Select-Object -First 20 @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 3. Components with business logic keywords
Write-Host "`n--- COMPONENTS WITH BUSINESS LOGIC ---"
$componentLogic = $tsFiles | Where-Object { $_.FullName -match '\\components\\' -and $_.Name -match '\.tsx$' } | Select-String -Pattern 'calculate|compute|validate|transform|fetch(' -ErrorAction SilentlyContinue
Write-Host "Components with business logic keywords: $($componentLogic.Count)"
$componentLogic | Select-Object -First 20 @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 4. Empty/Stub functions
Write-Host "`n--- EMPTY/STUB FUNCTIONS ---"
$stubs = $tsFiles | Select-String -Pattern 'function\s+\w+\([^)]*\)\s*\{\s*\}' -ErrorAction SilentlyContinue
Write-Host "Empty function declarations: $($stubs.Count)"
$stubs | Select-Object @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 5. console.warn/error/info/debug
Write-Host "`n--- CONSOLE.WARN/ERROR ---"
$consoleOther = $tsFiles | Select-String -Pattern 'console\.(warn|error|info|debug)' -ErrorAction SilentlyContinue
Write-Host "console.warn/error/info/debug: $($consoleOther.Count)"
$consoleOther | Select-Object -First 20 @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 6. Non-null assertions (!)
Write-Host "`n--- NON-NULL ASSERTIONS ---"
$nonNull = $tsFiles | Where-Object { $_.Name -notmatch '\.test\.' -and $_.Name -notmatch '\.spec\.' } | Select-String -Pattern '\w+![\.\;\,\)]' -ErrorAction SilentlyContinue
Write-Host "Non-null assertions: $($nonNull.Count)"
$nonNull | Select-Object -First 20 @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 7. Type assertions (as X)
Write-Host "`n--- TYPE ASSERTIONS (as X) ---"
$asType = $tsFiles | Select-String -Pattern '\bas\s+[A-Z]\w+' -ErrorAction SilentlyContinue | Where-Object { $_.Line -notmatch 'import|export|from|@ts-ignore' }
Write-Host "Type assertions (as X): $($asType.Count)"
$asType | Select-Object -First 25 @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 8. Unused imports (lines with import that are never referenced)
Write-Host "`n--- POTENTIAL UNUSED IMPORTS ---"
$importLines = $tsFiles | Select-String -Pattern '^import\s' -ErrorAction SilentlyContinue
Write-Host "Total import statements: $($importLines.Count)"

# 9. Barrel files (index.ts)
Write-Host "`n--- BARREL FILES ---"
$barrels = $tsFiles | Where-Object { $_.Name -eq 'index.ts' -or $_.Name -eq 'index.tsx' }
Write-Host "Barrel files (index.ts): $($barrels.Count)"

# 10. Duplicate function names across files
Write-Host "`n--- DUPLICATE EXPORT NAMES ---"
$exportedFns = $tsFiles | Select-String -Pattern 'export\s+(?:function|const|class)\s+(\w+)' -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch '__tests__' }
$fnNames = @{}
foreach ($line in $exportedFns) {
    if ($line.Matches[0].Groups[1].Value) {
        $name = $line.Matches[0].Groups[1].Value
        if (-not $fnNames.ContainsKey($name)) { $fnNames[$name] = @() }
        $fnNames[$name] += $line.Path.Replace("$root\",'')
    }
}
$dupes = $fnNames.GetEnumerator() | Where-Object { $_.Value.Count -gt 3 } | Sort-Object { $_.Value.Count } -Descending | Select-Object -First 20
foreach ($d in $dupes) {
    Write-Host "$($d.Key) (exported $($d.Value.Count) times):"
    $d.Value | ForEach-Object { Write-Host "  $_" }
}

# 11. Feature files missing required files
Write-Host "`n--- FEATURE ARCHITECTURE COMPLIANCE ---"
$features = Get-ChildItem -Path "$root\src\features" -Directory -ErrorAction SilentlyContinue
$requiredFiles = @('types.ts', 'schemas.ts', 'repository.ts', 'service.ts', 'hooks.ts')
foreach ($feat in $features) {
    $missing = @()
    foreach ($req in $requiredFiles) {
        $found = Get-ChildItem -Path $feat.FullName -Filter $req -Recurse -ErrorAction SilentlyContinue
        if (-not $found) { $missing += $req }
    }
    if ($missing.Count -gt 0) {
        Write-Host "$($feat.Name): MISSING $($missing -join ', ')"
    }
}

# 12. Screens directory
Write-Host "`n--- SCREENS DIRECTORY ---"
$screens = Get-ChildItem -Path "$root\src\screens" -Directory -ErrorAction SilentlyContinue -Recurse | Where-Object { $_.FullName -notmatch '__tests__' }
Write-Host "Screen directories: $($screens.Count)"

# 13. Shared directory
Write-Host "`n--- SHARED DIRECTORY ---"
$shared = Get-ChildItem -Path "$root\src\shared" -Directory -ErrorAction SilentlyContinue
Write-Host "Shared subdirectories: $($shared.Count)"
$shared | ForEach-Object { Write-Host "  $($_.Name)" }

# 14. Event emitter usage
Write-Host "`n--- EVENT EMITTER USAGE ---"
$eventUsage = $tsFiles | Select-String -Pattern 'EventEmitter|eventBus|emit\(' -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch '__tests__' }
Write-Host "Event emitter usage: $($eventUsage.Count)"

# 15. Sentry usage
Write-Host "`n--- SENTRY USAGE ---"
$sentryUsage = $tsFiles | Select-String -Pattern 'Sentry\.(captureException|captureMessage|withScope|setUser)' -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch '__tests__' }
Write-Host "Sentry calls: $($sentryUsage.Count)"

Write-Host "`n=== DEEP AUDIT COMPLETE ===" -ForegroundColor Green
