# VEX Codebase Audit Script
$root = "C:\Users\jonat\CascadeProjects\vex-app-old"

Write-Host "=== VEX CODEBASE STATISTICS ===" -ForegroundColor Cyan

# 1. Count TS/TSX files in src/
$tsFiles = Get-ChildItem -Path "$root\src" -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' }
Write-Host "`n--- FILE COUNTS ---"
Write-Host "TypeScript files in src/: $($tsFiles.Count)"

# 2. Total lines in src/
$totalLines = 0
foreach ($f in $tsFiles) {
    $lines = (Get-Content $f.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
    $totalLines += $lines
}
Write-Host "Total lines in src/: $totalLines"

# 3. Files over 200 lines
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

# 4. console.log usage
Write-Host "`n--- CONSOLE.LOG USAGE ---"
$consoleLogs = Select-String -Path "$root\src\*.ts","$root\src\*.tsx" -Pattern 'console\.log' -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch 'node_modules' }
Write-Host "console.log occurrences: $($consoleLogs.Count)"
$consoleLogs | Select-Object -First 20 Path, LineNumber, Line | Format-Table -AutoSize -Wrap

# 5. 'any' type usage
Write-Host "`n--- 'any' TYPE USAGE ---"
$anyTypes = Select-String -Path "$root\src\*.ts","$root\src\*.tsx" -Pattern ':\s*any\b|<any>|as any' -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch 'node_modules' }
Write-Host "'any' type occurrences: $($anyTypes.Count)"
$anyTypes | Select-Object -First 20 Path, LineNumber, Line | Format-Table -AutoSize -Wrap

# 6. @ts-ignore/@ts-nocheck
Write-Host "`n--- @ts-ignore / @ts-nocheck ---"
$tsIgnore = Select-String -Path "$root\src\*.ts","$root\src\*.tsx" -Pattern '@ts-ignore|@ts-nocheck' -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch 'node_modules' }
Write-Host "@ts-ignore/@ts-nocheck occurrences: $($tsIgnore.Count)"
$tsIgnore | Select-Object Path, LineNumber, Line | Format-Table -AutoSize -Wrap

# 7. StyleSheet.create
Write-Host "`n--- STYLESHEET.CREATE ---"
$stylesheets = Select-String -Path "$root\src\*.ts","$root\src\*.tsx" -Pattern 'StyleSheet\.create' -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch 'node_modules' }
Write-Host "StyleSheet.create occurrences: $($stylesheets.Count)"
$stylesheets | Select-Object Path, LineNumber, Line | Format-Table -AutoSize -Wrap

# 8. FlatList
Write-Host "`n--- FLATLIST ---"
$flatlists = Select-String -Path "$root\src\*.ts","$root\src\*.tsx" -Pattern 'FlatList' -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch 'node_modules' }
Write-Host "FlatList occurrences: $($flatlists.Count)"
$flatlists | Select-Object Path, LineNumber, Line | Format-Table -AutoSize -Wrap

# 9. AsyncStorage
Write-Host "`n--- ASYNCSTORAGE ---"
$asyncStorage = Select-String -Path "$root\src\*.ts","$root\src\*.tsx" -Pattern 'AsyncStorage' -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch 'node_modules' }
Write-Host "AsyncStorage occurrences: $($asyncStorage.Count)"

# 10. Raw fetch()
Write-Host "`n--- RAW FETCH ---"
$rawFetch = Select-String -Path "$root\src\*.ts","$root\src\*.tsx" -Pattern '\bfetch\(' -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch 'node_modules' }
Write-Host "Raw fetch() occurrences: $($rawFetch.Count)"
$rawFetch | Select-Object -First 15 Path, LineNumber, Line | Format-Table -AutoSize -Wrap

# 11. TODO/FIXME/HACK
Write-Host "`n--- TODO / FIXME / HACK ---"
$todos = Select-String -Path "$root\src\*.ts","$root\src\*.tsx" -Pattern '// TODO|// FIXME|// HACK|// XXX|/\* TODO|/\* FIXME' -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch 'node_modules' }
Write-Host "TODO/FIXME/HACK occurrences: $($todos.Count)"
$todos | Select-Object -First 20 Path, LineNumber, Line | Format-Table -AutoSize -Wrap

# 12. Hardcoded hex colors
Write-Host "`n--- HARDCODED COLORS ---"
$hardcodedColors = Select-String -Path "$root\src\*.ts","$root\src\*.tsx" -Pattern "'#[0-9a-fA-F]{3,8}'|`"#[0-9a-fA-F]{3,8}`"" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch 'node_modules' }
Write-Host "Hardcoded color occurrences: $($hardcodedColors.Count)"
$hardcodedColors | Select-Object -First 20 Path, LineNumber, Line | Format-Table -AutoSize -Wrap

# 13. Animated from react-native (banned)
Write-Host "`n--- ANIMATED FROM REACT-NATIVE (BANNED) ---"
$animated = Select-String -Path "$root\src\*.ts","$root\src\*.tsx" -Pattern "from 'react-native'.*Animated|import.*Animated.*from 'react-native'" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch 'node_modules' }
Write-Host "Animated from react-native occurrences: $($animated.Count)"
$animated | Select-Object Path, LineNumber, Line | Format-Table -AutoSize -Wrap

# 14. Top 20 largest files
Write-Host "`n--- TOP 20 LARGEST FILES ---"
$fileSizes = @()
foreach ($f in $tsFiles) {
    $lines = (Get-Content $f.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
    $fileSizes += [PSCustomObject]@{File=$f.FullName.Replace("$root\",""); Lines=$lines}
}
$fileSizes | Sort-Object Lines -Descending | Select-Object -First 20 | Format-Table -AutoSize

# 15. Empty catch blocks
Write-Host "`n--- EMPTY CATCH BLOCKS ---"
$emptyCatch = Select-String -Path "$root\src\*.ts","$root\src\*.tsx" -Pattern 'catch\s*\([^)]*\)\s*\{\s*\}' -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch 'node_modules' }
Write-Host "Empty catch blocks: $($emptyCatch.Count)"

Write-Host "`n=== AUDIT COMPLETE ===" -ForegroundColor Green
