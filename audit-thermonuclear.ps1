# VEX Thermonuclear Code Quality Review
$root = "C:\Users\jonat\CascadeProjects\vex-app-old"
$tsFiles = Get-ChildItem -Path "$root\src" -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch '__tests__' }

Write-Host "=== THERMONUCLEAR CODE QUALITY REVIEW ===" -ForegroundColor Red

# 1. Files approaching 1000 lines (thermonuclear threshold)
Write-Host "`n--- FILES APPROACHING 1000 LINES ---" -ForegroundColor Yellow
$largeFiles = @()
foreach ($f in $tsFiles) {
    $lines = (Get-Content $f.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
    if ($lines -gt 500) {
        $largeFiles += [PSCustomObject]@{File=$f.FullName.Replace("$root\src\",''); Lines=$lines}
    }
}
$largeFiles | Sort-Object Lines -Descending | Format-Table -AutoSize
Write-Host "Files >500 lines: $($largeFiles.Count)"

# 2. Deeply nested code (4+ levels of indentation = spaghetti)
Write-Host "`n--- DEEP NESTING (4+ levels) ---" -ForegroundColor Yellow
$deepNest = $tsFiles | Select-String -Pattern '^\s{32,}\S' -ErrorAction SilentlyContinue
Write-Host "Lines with 8+ indentation levels: $($deepNest.Count)"
$deepNest | Select-Object -First 10 @{N='File';E={$_.Path.Replace("$root\src\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 3. Long parameter lists (functions with 6+ params = bad abstraction)
Write-Host "`n--- LONG PARAMETER LISTS ---" -ForegroundColor Yellow
$longParams = $tsFiles | Select-String -Pattern '\([^)]{100,}\)' -ErrorAction SilentlyContinue
Write-Host "Functions with 100+ char parameter lists: $($longParams.Count)"
$longParams | Select-Object -First 10 @{N='File';E={$_.Path.Replace("$root\src\",'')}}, LineNumber | Format-Table -AutoSize

# 4. God functions (functions with 50+ lines)
Write-Host "`n--- GOD FUNCTIONS (est. 50+ lines) ---" -ForegroundColor Yellow
$functionDefs = $tsFiles | Select-String -Pattern '(export\s+)?(async\s+)?function\s+\w+' -ErrorAction SilentlyContinue
Write-Host "Total function definitions: $($functionDefs.Count)"

# 5. Switch statements (potential for polymorphism)
Write-Host "`n--- SWITCH STATEMENTS ---" -ForegroundColor Yellow
$switches = $tsFiles | Select-String -Pattern 'switch\s*\(' -ErrorAction SilentlyContinue
Write-Host "Switch statements: $($switches.Count)"
$switches | Select-Object -First 10 @{N='File';E={$_.Path.Replace("$root\src\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 6. Boolean parameters (code smell - should be enums/configs)
Write-Host "`n--- BOOLEAN PARAMETERS ---" -ForegroundColor Yellow
$boolParams = $tsFiles | Select-String -Pattern ':\s*boolean\s*[,\)]' -ErrorAction SilentlyContinue
Write-Host "Boolean parameters: $($boolParams.Count)"

# 7. Nested ternaries (unreadable)
Write-Host "`n--- NESTED TERNARIES ---" -ForegroundColor Yellow
$nestedTern = $tsFiles | Select-String -Pattern '\?.*\?' -ErrorAction SilentlyContinue
Write-Host "Potential nested ternaries: $($nestedTern.Count)"

# 8. Magic numbers (excluding 0, 1, 2, 100, common values)
Write-Host "`n--- MAGIC NUMBERS ---" -ForegroundColor Yellow
$magicNums = $tsFiles | Select-String -Pattern '(?<!=\s)(?<![a-zA-Z_])\d{3,}(?![a-zA-Z_])' -ErrorAction SilentlyContinue
Write-Host "Potential magic numbers (3+ digits): $($magicNums.Count)"

# 9. Commented-out code (dead code indicator)
Write-Host "`n--- COMMENTED-OUT CODE ---" -ForegroundColor Yellow
$commentedCode = $tsFiles | Select-String -Pattern '^\s*//\s*(const|let|var|function|return|if|for|while|import|export)' -ErrorAction SilentlyContinue
Write-Host "Commented-out code lines: $($commentedCode.Count)"
$commentedCode | Select-Object -First 15 @{N='File';E={$_.Path.Replace("$root\src\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 10. TODO/FIXME/HACK/XXX comments
Write-Host "`n--- TECHNICAL DEBT MARKERS ---" -ForegroundColor Yellow
$todoComments = $tsFiles | Select-String -Pattern 'TODO|FIXME|HACK|XXX|TEMP|WORKAROUND' -ErrorAction SilentlyContinue
Write-Host "TODO/FIXME/HACK/XXX comments: $($todoComments.Count)"
$todoComments | Select-Object -First 15 @{N='File';E={$_.Path.Replace("$root\src\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 11. Console.warn/error in production (not debug utility)
Write-Host "`n--- CONSOLE IN PRODUCTION ---" -ForegroundColor Yellow
$consoleProd = $tsFiles | Where-Object { $_.FullName -notmatch 'debug\.ts' -and $_.FullName -notmatch 'sentry\.ts' } | Select-String -Pattern 'console\.(warn|error|log|info|debug)' -ErrorAction SilentlyContinue
Write-Host "Console usage in production code: $($consoleProd.Count)"
$consoleProd | Select-Object -First 10 @{N='File';E={$_.Path.Replace("$root\src\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 12. Hardcoded strings that should be constants
Write-Host "`n--- HARDCODED STRINGS IN LOGIC ---" -ForegroundColor Yellow
$hardcodedStrings = $tsFiles | Where-Object { $_.FullName -notmatch 'constants|types|schemas|__tests__' } | Select-String -Pattern "===\s*['" + '"]' -ErrorAction SilentlyContinue
Write-Host "Hardcoded string comparisons: $($hardcodedStrings.Count)"

# 13. Unused imports (files importing more than they use)
Write-Host "`n--- POTENTIAL UNUSED IMPORTS ---" -ForegroundColor Yellow
$heavyImports = @()
foreach ($f in $tsFiles | Where-Object { $_.Name -notmatch '__tests__' }) {
    $imports = (Get-Content $f.FullName -ErrorAction SilentlyContinue | Select-String -Pattern "^import " | Measure-Object).Count
    $lines = (Get-Content $f.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
    if ($imports -gt 10 -and $lines -lt 200) {
        $ratio = [math]::Round($imports / $lines * 100, 1)
        if ($ratio -gt 5) {
            $heavyImports += [PSCustomObject]@{File=$f.FullName.Replace("$root\src\",''); Imports=$imports; Lines=$lines; Ratio="$ratio%"}
        }
    }
}
$heavyImports | Sort-Object Ratio -Descending | Select-Object -First 15 | Format-Table -AutoSize
Write-Host "Files with high import density: $($heavyImports.Count)"

# 14. Barrel files with circular dependency risk
Write-Host "`n--- HEAVY BARREL FILES (re-export chains) ---" -ForegroundColor Yellow
$barrels = $tsFiles | Where-Object { $_.Name -eq 'index.ts' } | Select-String -Pattern '^export ' -ErrorAction SilentlyContinue
$grouped = $barrels | Group-Object Path | Where-Object { $_.Count -gt 15 }
$grouped | Sort-Object Count -Descending | Select-Object -First 10 @{N='File';E={$_.Name.Replace("$root\src\",'')}}, Count | Format-Table -AutoSize
Write-Host "Barrel files with >15 exports: $($grouped.Count)"

# 15. Feature files that are just re-exports (stub compliance)
Write-Host "`n--- STUB/RE-EXPORT FILES (architecture compliance shells) ---" -ForegroundColor Yellow
$stubs = $tsFiles | Where-Object { $_.Name -match '^(types|schemas|repository|service|hooks|store|events|analytics)\.ts$' } | Select-String -Pattern '^export \* from' -ErrorAction SilentlyContinue
Write-Host "Single-line re-export stubs: $($stubs.Count)"
$stubs | Select-Object -First 20 @{N='File';E={$_.Path.Replace("$root\src\",'')}}, Line | Format-Table -AutoSize -Wrap

# 16. Inconsistent error handling patterns
Write-Host "`n--- ERROR HANDLING PATTERNS ---" -ForegroundColor Yellow
$tryCatch = $tsFiles | Select-String -Pattern 'try\s*\{' -ErrorAction SilentlyContinue
$ifError = $tsFiles | Select-String -Pattern 'if\s*\(\s*error\s*\)' -ErrorAction SilentlyContinue
$ifErr = $tsFiles | Select-String -Pattern 'if\s*\(\s*err\s*\)' -ErrorAction SilentlyContinue
Write-Host "try/catch blocks: $($tryCatch.Count)"
Write-Host "if (error) checks: $($ifError.Count)"
Write-Host "if (err) checks: $($ifErr.Count)"

Write-Host "`n=== THERMONUCLEAR REVIEW COMPLETE ===" -ForegroundColor Red
