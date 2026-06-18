$ErrorActionPreference = "Stop"
$j = Get-Content "C:\Users\jonat\CascadeProjects\vex-app-old\failures.json" -Raw | ConvertFrom-Json

# Classify each failure by error type and module
$classSummary = @{}
$modSummary = @{}
$errExamples = @{}

foreach ($f in $j) {
    $rel = $f.file -replace "C:\\Users\\jonat\\CascadeProjects\\vex-app-old\\", ""
    # Top-level module
    $mod = ($rel -split "\\")[0..1] -join "\"
    foreach ($t in $f.fails) {
        $msg = $t.messages
        # Try to extract error type / message head
        $kind = "unknown"
        if ($msg -match "(?m)^Error:\s+([^\r\n]+)") {
            $errLine = $matches[1]
            if ($errLine -match "Cannot read propert") { $kind = "undefined-property" }
            elseif ($errLine -match "is not a function") { $kind = "not-a-function" }
            elseif ($errLine -match "toBeNull|toBeNull|not\.toBeNull|toBe\(.*\)") { $kind = "assertion-mismatch" }
            elseif ($errLine -match "toEqual|deep equality") { $kind = "deep-equal-mismatch" }
            elseif ($errLine -match "toContain|toBeUndefined") { $kind = "assertion-mismatch" }
            elseif ($errLine -match "toHaveBeenCalledWith|toHaveBeenCalled") { $kind = "mock-not-called" }
            elseif ($errLine -match "Unable to find an element") { $kind = "testid-missing" }
            elseif ($errLine -match "expected \d+ to be") { $kind = "numeric-mismatch" }
            elseif ($errLine -match "Cannot find module") { $kind = "module-missing" }
            elseif ($errLine -match "Timeout") { $kind = "timeout" }
            else { $kind = "other-error" }
        } elseif ($msg -match "(?m)^TypeError:\s+([^\r\n]+)") {
            $errLine = $matches[1]
            if ($errLine -match "Cannot read propert") { $kind = "undefined-property" }
            elseif ($errLine -match "is not a function") { $kind = "not-a-function" }
            else { $kind = "other-typeerror" }
        }

        $classSummary[$kind] = @($classSummary[$kind] | ForEach-Object { $_ }) + 1
        $modSummary[$mod] = @($modSummary[$mod] | ForEach-Object { $_ }) + 1

        if (-not $errExamples.ContainsKey($kind)) {
            $short = ($msg -split "`n")[0..2] -join " | "
            $errExamples[$kind] = [pscustomobject]@{
                firstExample = $short
                firstFile = $rel
                firstTest = $t.fullName
            }
        }
    }
}

Write-Host "===== BY ERROR CLASS ====="
$classSummary.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
    "{0,-25} {1,4}  e.g. {2}" -f $_.Key, $_.Value, ($errExamples[$_.Key].firstExample.Substring(0, [Math]::Min(100, $errExamples[$_.Key].firstExample.Length)))
}
Write-Host ""
Write-Host "===== BY MODULE ====="
$modSummary.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
    "{0,-50} {1,4}" -f $_.Key, $_.Value
}

# Also dump a flat per-file list with categories
Write-Host ""
Write-Host "===== PER FILE (sorted by failures) ====="
$fileSummary = @{}
foreach ($f in $j) {
    $rel = $f.file -replace "C:\\Users\\jonat\\CascadeProjects\\vex-app-old\\", ""
    $fileSummary[$rel] = $f.count
}
$fileSummary.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
    "{0,-90} {1,4}" -f $_.Key, $_.Value
}
