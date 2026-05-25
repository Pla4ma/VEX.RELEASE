$files = Get-ChildItem -Path src -Recurse -File -Include *.ts,*.tsx
$results = @()
foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    for ($i = 0; $i -lt $lines.Length; $i++) {
        $line = $lines[$i]
        if ($line -match "as unknown") {
            $matches = [regex]::Matches($line, "as unknown as\s*[^),;}]+")
            if ($matches.Count -eq 0) {
                $results += [PSCustomObject]@{
                    File = $file.FullName.Replace((Get-Location).Path + "\", "")
                    Line = $i + 1
                    Cast = $line.Substring($line.IndexOf("as unknown")).Trim()
                    Code = $line.Trim()
                }
            } else {
                foreach ($m in $matches) {
                    $results += [PSCustomObject]@{
                        File = $file.FullName.Replace((Get-Location).Path + "\", "")
                        Line = $i + 1
                        Cast = $m.Value.Trim()
                        Code = $line.Trim()
                    }
                }
            }
        }
    }
}
$results | Sort-Object File, Line | ConvertTo-Json -Depth 3
