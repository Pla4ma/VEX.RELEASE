$j = Get-Content "C:\Users\jonat\CascadeProjects\vex-app-old\failures.json" -Raw | ConvertFrom-Json

$classSummary = @{}
$modSummary = @{}
$errExamples = @{}

foreach ($f in $j) {
    $rel = $f.file -replace "C:\\Users\\jonat\\CascadeProjects\\vex-app-old\\", ""
    $mod = ($rel -split "\\")[0..1] -join "\"
    foreach ($t in $f.fails) {
        $msg = $t.messages
        $kind = "unknown"
        if ($msg -match "(?m)^Error:\s+([^\r\n]+)") {
            $errLine = $matches[1]
            if ($errLine -match "Cannot read propert") { $kind = "undefined-property" }
            elseif ($errLine -match "is not a function") { $kind = "not-a-function" }
            elseif ($errLine -match "toBeNull|toBeNull|not\.toBeNull|toBe\(") { $kind = "assertion-mismatch" }
            elseif ($errLine -match "toEqual|deep equality") { $kind = "deep-equal-mismatch" }
            elseif ($errLine -match "toContain|toBeUndefined") { $kind = "assertion-mismatch" }
            elseif ($errLine -match "toHaveBeenCalledWith|toHaveBeenCalled") { $kind = "mock-not-called" }
            elseif ($errLine -match "Unable to find an element") { $kind = "testid-missing" }
            elseif ($errLine -match "expected \d+ to be") { $kind = "numeric-mismatch" }
            elseif ($errLine -match "Cannot find module") { $kind = "module-missing" }
            elseif ($errLine -match "Timeout") { $kind = "timeout" }
            elseif ($errLine -match "rejects\.toThrow|Received promise resolved") { $kind = "rejects-not-rejected" }
            else { $kind = "other-error" }
        } elseif ($msg -match "(?m)^TypeError:\s+([^\r\n]+)") {
            $errLine = $matches[1]
            if ($errLine -match "Cannot read propert") { $kind = "undefined-property" }
            elseif ($errLine -match "is not a function") { $kind = "not-a-function" }
            else { $kind = "other-typeerror" }
        } elseif ($msg -match "SessionCompletionRepositoryError|RateLimitError|RepositoryError") {
            $kind = "service-throws"
        }

        if (-not $classSummary.ContainsKey($kind)) { $classSummary[$kind] = 0 }
        $classSummary[$kind]++
        if (-not $modSummary.ContainsKey($mod)) { $modSummary[$mod] = 0 }
        $modSummary[$mod]++

        if (-not $errExamples.ContainsKey($kind)) {
            $short = ($msg -split "`n")[0] -replace "\s+", " "
            $errExamples[$kind] = [pscustomobject]@{
                firstExample = $short
                firstFile = $rel
            }
        }
    }
}

Write-Host "===== BY ERROR CLASS ====="
$classSummary.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
    $example = $errExamples[$_.Key].firstExample
    $file = $errExamples[$_.Key].firstFile
    Write-Host ("{0,-25} {1,4}  e.g. {2}" -f $_.Key, $_.Value, $example)
    Write-Host ("{0,-25}        in:  {1}" -f "", $file)
}
Write-Host ""
Write-Host "===== BY MODULE ====="
$modSummary.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
    Write-Host ("{0,-50} {1,4}" -f $_.Key, $_.Value)
}
