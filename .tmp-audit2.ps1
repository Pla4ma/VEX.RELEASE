Write-Output "=== FEATURE ARCHITECTURE COMPLIANCE (FIXED) ==="
$features = Get-ChildItem 'src/features' -Directory
foreach ($f in $features) {
    $feat = $f.Name
    $files = Get-ChildItem $f.FullName -File -Name -ErrorAction SilentlyContinue
    $hasTypes = $files -contains 'types.ts'
    $hasSchemas = $files -contains 'schemas.ts'
    $hasRepo = $files -contains 'repository.ts'
    $hasService = $files -contains 'service.ts'
    $hasHooks = $files -contains 'hooks.ts'
    $hasAnalytics = $files -contains 'analytics.ts'
    $hasEvents = $files -contains 'events.ts'
    $hasStore = $files -contains 'store.ts'
    $score = [int]$hasTypes + [int]$hasSchemas + [int]$hasRepo + [int]$hasService + [int]$hasHooks + [int]$hasAnalytics
    Write-Output "$feat`t$score/6"
}
