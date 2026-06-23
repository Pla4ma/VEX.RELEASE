# VEX Codebase Audit Script v2 - Fixed Select-String usage
$root = "C:\Users\jonat\CascadeProjects\vex-app-old"

Write-Host "=== VEX CODEBASE STATISTICS ===" -ForegroundColor Cyan

# Get all TS/TSX files in src/ (excluding node_modules)
$tsFiles = Get-ChildItem -Path "$root\src" -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' }
Write-Host "`nTypeScript files in src/: $($tsFiles.Count)"

# Total lines
$totalLines = 0
foreach ($f in $tsFiles) {
    $lines = (Get-Content $f.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
    $totalLines += $lines
}
Write-Host "Total lines in src/: $totalLines"

# FILES OVER 200 LINES
Write-Host "`n--- FILES OVER 200 LINES ---"
$oversized = @()
foreach ($f in $tsFiles) {
    $lines = (Get-Content $f.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
    if ($lines -gt 200) {
        $oversized += [PSCustomObject]@{File=$f.FullName.Replace("$root\",""); Lines=$lines}
    }
}
$oversized | Sort-Object Lines -Descending | Format-Table -AutoSize
Write-Host "Total oversized files: $($oversized.Count)"

# console.log
Write-Host "`n--- CONSOLE.LOG USAGE ---"
$consoleLogs = $tsFiles | Select-String -Pattern 'console\.log' -ErrorAction SilentlyContinue
Write-Host "console.log occurrences: $($consoleLogs.Count)"
$consoleLogs | Select-Object -First 20 @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# 'any' type
Write-Host "`n--- 'any' TYPE USAGE ---"
$anyTypes = $tsFiles | Select-String -Pattern ':\s*any\b|<any>|as any' -ErrorAction SilentlyContinue
Write-Host "'any' type occurrences: $($anyTypes.Count)"
$anyTypes | Select-Object -First 30 @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# @ts-ignore/@ts-nocheck
Write-Host "`n--- @ts-ignore / @ts-nocheck ---"
$tsIgnore = $tsFiles | Select-String -Pattern '@ts-ignore|@ts-nocheck' -ErrorAction SilentlyContinue
Write-Host "@ts-ignore/@ts-nocheck occurrences: $($tsIgnore.Count)"
$tsIgnore | Select-Object @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# StyleSheet.create
Write-Host "`n--- STYLESHEET.CREATE ---"
$stylesheets = $tsFiles | Select-String -Pattern 'StyleSheet\.create' -ErrorAction SilentlyContinue
Write-Host "StyleSheet.create occurrences: $($stylesheets.Count)"
$stylesheets | Select-Object @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# FlatList
Write-Host "`n--- FLATLIST ---"
$flatlists = $tsFiles | Select-String -Pattern 'FlatList' -ErrorAction SilentlyContinue
Write-Host "FlatList occurrences: $($flatlists.Count)"
$flatlists | Select-Object @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# AsyncStorage
Write-Host "`n--- ASYNCSTORAGE ---"
$asyncStorage = $tsFiles | Select-String -Pattern 'AsyncStorage' -ErrorAction SilentlyContinue
Write-Host "AsyncStorage occurrences: $($asyncStorage.Count)"

# Raw fetch()
Write-Host "`n--- RAW FETCH ---"
$rawFetch = $tsFiles | Select-String -Pattern '\bfetch\(' -ErrorAction SilentlyContinue
Write-Host "Raw fetch() occurrences: $($rawFetch.Count)"
$rawFetch | Select-Object -First 15 @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# TODO/FIXME/HACK
Write-Host "`n--- TODO / FIXME / HACK ---"
$todos = $tsFiles | Select-String -Pattern '// TODO|// FIXME|// HACK|// XXX|/\* TODO|/\* FIXME' -ErrorAction SilentlyContinue
Write-Host "TODO/FIXME/HACK occurrences: $($todos.Count)"
$todos | Select-Object -First 20 @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# Hardcoded hex colors
Write-Host "`n--- HARDCODED COLORS ---"
$hardcodedColors = $tsFiles | Select-String -Pattern "'#[0-9a-fA-F]{3,8}'|`"#[0-9a-fA-F]{3,8}`"" -ErrorAction SilentlyContinue
Write-Host "Hardcoded color occurrences: $($hardcodedColors.Count)"
$hardcodedColors | Select-Object -First 20 @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# Animated from react-native (banned)
Write-Host "`n--- ANIMATED FROM REACT-NATIVE (BANNED) ---"
$animated = $tsFiles | Select-String -Pattern "from 'react-native'" -ErrorAction SilentlyContinue | Where-Object { $_.Line -match 'Animated' }
Write-Host "Animated from react-native occurrences: $($animated.Count)"
$animated | Select-Object @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# Empty catch blocks
Write-Host "`n--- EMPTY CATCH BLOCKS ---"
$emptyCatch = $tsFiles | Select-String -Pattern 'catch\s*\(' -ErrorAction SilentlyContinue
Write-Host "catch blocks found: $($emptyCatch.Count)"
$emptyCatch | Select-Object -First 15 @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# Hardcoded URLs/strings
Write-Host "`n--- HARDCODED URLS ---"
$hardcodedUrls = $tsFiles | Select-String -Pattern "https?://[^\s`"']+" -ErrorAction SilentlyContinue | Where-Object { $_.Line -notmatch '^\s*//' -and $_.Line -notmatch 'test' }
Write-Host "Hardcoded URLs: $($hardcodedUrls.Count)"
$hardcodedUrls | Select-Object -First 15 @{N='File';E={$_.Path.Replace("$root\",'')}}, LineNumber, Line | Format-Table -AutoSize -Wrap

# Features directory structure
Write-Host "`n--- FEATURES DIRECTORY ---"
$features = Get-ChildItem -Path "$root\src\features" -Directory -ErrorAction SilentlyContinue
foreach ($feat in $features) {
    $featFiles = Get-ChildItem -Path $feat.FullName -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue
    $featLines = 0
    foreach ($ff in $featFiles) {
        $featLines += (Get-Content $ff.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
    }
    Write-Host "  $($feat.Name): $($featFiles.Count) files, $featLines lines"
}

# Test coverage
Write-Host "`n--- TEST FILES ---"
$testFiles = $tsFiles | Where-Object { $_.Name -match '\.test\.|\.spec\.' }
Write-Host "Test files: $($testFiles.Count)"
$nonTestFiles = $tsFiles | Where-Object { $_.Name -notmatch '\.test\.|\.spec\.' }
Write-Host "Non-test files: $($nonTestFiles.Count)"
if ($nonTestFiles.Count -gt 0) {
    $ratio = [math]::Round($testFiles.Count / $nonTestFiles.Count * 100, 1)
    Write-Host "Test-to-source ratio: $ratio%"
}

# Exports count
Write-Host "`n--- EXPORTS ---"
$exports = $tsFiles | Select-String -Pattern '^export\s' -ErrorAction SilentlyContinue
Write-Host "Total export statements: $($exports.Count)"

# Default exports
$defaultExports = $tsFiles | Select-String -Pattern 'export\s+default' -ErrorAction SilentlyContinue
Write-Host "Default exports: $($defaultExports.Count)"

Write-Host "`n=== AUDIT COMPLETE ===" -ForegroundColor Green
