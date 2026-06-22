Write-Output "=== FEATURE ARCHITECTURE COMPLIANCE ==="
$features = Get-ChildItem 'src/features' -Directory
foreach ($f in $features) {
    $feat = $f.Name
    $hasTypes = Test-Path "$f\types.ts"
    $hasSchemas = Test-Path "$f\schemas.ts"
    $hasRepo = Test-Path "$f\repository.ts"
    $hasService = Test-Path "$f\service.ts"
    $hasHooks = Test-Path "$f\hooks.ts"
    $hasAnalytics = Test-Path "$f\analytics.ts"
    $hasComponents = Test-Path "$f\components"
    $hasTests = Test-Path "$f\__tests__"
    $score = [int]$hasTypes + [int]$hasSchemas + [int]$hasRepo + [int]$hasService + [int]$hasHooks + [int]$hasAnalytics + [int]$hasComponents + [int]$hasTests
    Write-Output "$feat`t$score/8"
}

Write-Output "`n=== CONSOLE.LOG LOCATIONS ==="
Get-ChildItem 'src' -Recurse -Include '*.ts','*.tsx' | Select-String -Pattern 'console\.log' -ErrorAction SilentlyContinue | Select-Object -First 10 | ForEach-Object { "$($_.Path):$($_.LineNumber)" }

Write-Output "`n=== FILES OVER 200 LINES (non-auto-gen) ==="
Get-ChildItem 'src' -Recurse -Include '*.ts','*.tsx' | Where-Object { $_.FullName -notmatch '__tests__' -and $_.Name -ne 'supabase.ts' } | ForEach-Object {
    $lines = (Get-Content $_.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
    if ($lines -gt 200) { Write-Output "$lines`t$($_.FullName)" }
}

Write-Output "`n=== FILES OVER 150 LINES ==="
Get-ChildItem 'src' -Recurse -Include '*.ts','*.tsx' | Where-Object { $_.FullName -notmatch '__tests__' -and $_.Name -ne 'supabase.ts' } | ForEach-Object {
    $lines = (Get-Content $_.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
    if ($lines -gt 150) { Write-Output "$lines`t$($_.FullName)" }
}

Write-Output "`n=== TEST FILE COUNT ==="
$testFiles = Get-ChildItem 'src' -Recurse -Include '*.test.ts','*.test.tsx','*.spec.ts','*.spec.tsx'
Write-Output "Test files: $($testFiles.Count)"

Write-Output "`n=== TOTAL SOURCE FILES ==="
$sourceFiles = Get-ChildItem 'src' -Recurse -Include '*.ts','*.tsx' | Where-Object { $_.FullName -notmatch '__tests__' }
Write-Output "Source files: $($sourceFiles.Count)"
