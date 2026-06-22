Get-ChildItem 'src' -Recurse -Include '*.helpers.ts','*.helpers.tsx' | Where-Object { $_.FullName -notmatch '__tests__' } | ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    [PSCustomObject]@{ Lines = $lines; File = $_.FullName -replace [regex]::Escape((Get-Location).Path + '\'), '' }
} | Sort-Object Lines -Descending | Format-Table -AutoSize
