$glassFiles = Get-ChildItem 'src/components/glass' -File -Exclude 'index.ts'
$allFiles = Get-ChildItem 'src' -Recurse -Include '*.ts','*.tsx' | Where-Object { $_.FullName -notmatch 'node_modules' }
foreach ($f in $glassFiles) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
    $importCount = 0
    foreach ($other in $allFiles) {
        if ($other.FullName -eq $f.FullName) { continue }
        $content = Get-Content $other.FullName -ErrorAction SilentlyContinue -Raw
        if ($content -match [regex]::Escape($baseName)) {
            $importCount++
        }
    }
    if ($importCount -eq 0) {
        Write-Output "DEAD`t$($f.Name)"
    } else {
        Write-Output "USED($importCount)`t$($f.Name)"
    }
}
