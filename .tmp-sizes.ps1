Get-ChildItem 'src/components/glass' -File | Where-Object { $_.Name -ne 'index.ts' } | ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    [PSCustomObject]@{ Lines = $lines; Name = $_.Name }
} | Sort-Object Lines -Descending | Format-Table -AutoSize
