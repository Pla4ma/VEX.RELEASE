$files = Get-ChildItem -Path src -Recurse -File -Include *.ts,*.tsx
$results = @()

foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    for ($i = 0; $i -lt $lines.Length; $i++) {
        if ($lines[$i] -match "as unknown") {
            $results += [PSCustomObject]@{
                File = $file.FullName.Replace((Get-Location).Path + "\", "")
                Line = $i + 1
                Code = $lines[$i].Trim()
            }
        }
    }
}

$results | Export-Csv -Path cast_inventory.csv -NoTypeInformation
