$ErrorActionPreference = "Stop"
$json = Get-Content "C:\Users\jonat\CascadeProjects\vex-app-old\results.json" -Raw | ConvertFrom-Json

$report = @()
$totalFail = 0
$filesWithFails = @()

foreach ($suite in $json.testResults) {
    $file = $suite.name
    $failed = @()
    foreach ($t in $suite.assertionResults) {
        if ($t.status -eq "failed") {
            $totalFail++
            $msgs = @()
            foreach ($a in $t.failureMessages) {
                $msgs += $a
            }
            $failed += [pscustomobject]@{
                fullName  = $t.fullName
                title     = $t.title
                ancestorTitles = ($t.ancestorTitles -join " > ")
                messages  = ($msgs -join "`n----MSG----`n")
            }
        }
    }
    if ($failed.Count -gt 0) {
        $filesWithFails += [pscustomobject]@{
            file  = $file
            count = $failed.Count
            fails = $failed
        }
    }
}

Write-Host "TOTAL FAILED: $totalFail"
Write-Host "FILES WITH FAILS: $($filesWithFails.Count)"

$filesWithFails | ConvertTo-Json -Depth 12 | Out-File "C:\Users\jonat\CascadeProjects\vex-app-old\failures.json"
Write-Host "Written to failures.json"
