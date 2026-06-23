$f = 'src/features/session-completion/__tests__/completion-subsystems.helpers.ts'
$content = Get-Content $f -Raw
# Remove the broken analytics mock (3 lines + blank)
$content = $content -replace "  jest\.mock\('\.\./analytics', \(\) => \(\{\s*\n    trackSessionCompleted: jest\.fn\(\),\s*\n  \}\)\);", ""
Set-Content $f $content -NoNewline
Write-Output "Fixed: $f"
