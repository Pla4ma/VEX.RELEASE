$ErrorActionPreference = "Stop"
$j = Get-Content "C:\Users\jonat\CascadeProjects\vex-app-old\failures.json" -Raw | ConvertFrom-Json

$lines = @()
foreach ($f in $j) {
    $rel = $f.file -replace "C:\\Users\\jonat\\CascadeProjects\\vex-app-old\\", ""
    foreach ($t in $f.fails) {
        $lines += [pscustomobject]@{
            file     = $rel
            test     = $t.fullName
            category = $t.ancestorTitles
            snippet  = if ($t.messages.Length -gt 600) { $t.messages.Substring(0, 600) } else { $t.messages }
        }
    }
}

$lines | Format-Table -AutoSize -Wrap file,test

Write-Host ""
Write-Host "==== UNIQUE FILES WITH FAILURES ===="
$lines | ForEach-Object { $_.file } | Sort-Object -Unique

Write-Host ""
Write-Host "==== TOP-LEVEL DESCRIBE BLOCKS ===="
$lines | ForEach-Object {
    $parts = $_.category -split " > "
    if ($parts.Count -gt 0) { $parts[0] }
} | Sort-Object | Group-Object | Sort-Object Count -Descending | Format-Table Count,Name -AutoSize
