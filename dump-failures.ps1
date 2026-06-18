$ErrorActionPreference = "Stop"
$j = Get-Content "C:\Users\jonat\CascadeProjects\vex-app-old\failures.json" -Raw | ConvertFrom-Json

$out = @()
foreach ($f in $j) {
    $rel = $f.file -replace "C:\\Users\\jonat\\CascadeProjects\\vex-app-old\\", ""
    $out += "============================================================"
    $out += "FILE: $rel  ($($f.count) failure(s))"
    $out += "============================================================"
    $i = 0
    foreach ($t in $f.fails) {
        $i++
        $out += ""
        $out += "--- FAIL ${i}: $($t.ancestorTitles) > $($t.title)"
        # Truncate long stack, keep head
        $msg = $t.messages
        if ($msg.Length -gt 1500) { $msg = $msg.Substring(0, 1500) + "`n... [truncated]" }
        $out += $msg
        $out += ""
    }
    $out += ""
}

$out | Out-File "C:\Users\jonat\CascadeProjects\vex-app-old\failures-detail.txt"
Write-Host "Written failures-detail.txt"
