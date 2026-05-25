$ErrorActionPreference = 'Stop'

$root = (Get-Location).Path
$sourceExtensions = @('.ts', '.tsx', '.js', '.jsx')
$excludedSegments = @(
  '\node_modules\',
  '\.git\',
  '\.bug-hunter\',
  '\dist\',
  '\android\',
  '\ios\'
)

function Get-RelativePath([string] $path) {
  if ($path.StartsWith($root)) {
    return $path.Substring($root.Length + 1)
  }
  return $path
}

function Is-SourceFile($file) {
  if ($sourceExtensions -notcontains $file.Extension) {
    return $false
  }
  foreach ($segment in $excludedSegments) {
    if ($file.FullName.Contains($segment)) {
      return $false
    }
  }
  return $true
}

function Count-Matches([string] $content, [string] $pattern) {
  return ([regex]::Matches($content, $pattern)).Count
}

$files = Get-ChildItem -Recurse -File | Where-Object { Is-SourceFile $_ }

$largeFiles = foreach ($file in $files) {
  $lineCount = (Get-Content -LiteralPath $file.FullName | Measure-Object -Line).Lines
  if ($lineCount -gt 200) {
    [PSCustomObject]@{
      lines = $lineCount
      path = Get-RelativePath $file.FullName
    }
  }
}

$patterns = [ordered]@{
  anyType = '\bany\b'
  tsIgnore = '@ts-ignore|@ts-nocheck'
  consoleLog = '\bconsole\.log\b'
  todo = 'TODO|FIXME|HACK'
  styleSheetCreate = 'StyleSheet\.create'
  flatList = '\bFlatList\b'
  asyncStorage = '\bAsyncStorage\b'
  rawFetch = '\bfetch\s*\('
  reactNativeAnimated = '\bAnimated\b'
  supabaseAccess = '\bsupabase\.(from|rpc|channel|storage)\b'
  useQueryInSource = '\buse(Query|Mutation)\s*\('
  revenueCatDirect = 'react-native-purchases|Purchases\.'
  expoHapticsDirect = 'expo-haptics'
  unsafeCast = '\bas\s+[A-Za-z_{]'
  hardcodedHexColor = '#[0-9A-Fa-f]{3,8}'
}

$patternHits = foreach ($file in $files) {
  $text = Get-Content -LiteralPath $file.FullName -Raw
  $row = [ordered]@{ path = Get-RelativePath $file.FullName }
  $total = 0
  foreach ($entry in $patterns.GetEnumerator()) {
    $count = Count-Matches $text $entry.Value
    $row[$entry.Key] = $count
    $total += $count
  }
  if ($total -gt 0) {
    [PSCustomObject]$row
  }
}

$supabaseViolations = $patternHits |
  Where-Object { $_.supabaseAccess -gt 0 -and $_.path -notmatch 'repository\.ts$' -and $_.path -notmatch 'config\\supabase\.ts$' -and $_.path -notmatch 'types\\supabase\.ts$' }

$queryViolations = $patternHits |
  Where-Object { $_.useQueryInSource -gt 0 -and $_.path -notmatch 'hooks\.ts$' -and $_.path -notmatch '\\hooks\\' -and $_.path -notmatch '\\__tests__\\' }

$activeAppPathPattern = '^(src|App\.js|index\.js|jobs|shared|scripts|supabase)\\?'
$activeLargeFiles = $largeFiles |
  Where-Object { $_.path -match $activeAppPathPattern -and $_.path -notmatch '\\__tests__\\' -and $_.path -notmatch '\.test\.' }

$activePatternHits = $patternHits |
  Where-Object { $_.path -match $activeAppPathPattern -and $_.path -notmatch '\\__tests__\\' -and $_.path -notmatch '\.test\.' }

$patternTotals = [ordered]@{}
foreach ($entry in $patterns.GetEnumerator()) {
  $name = $entry.Key
  $patternTotals[$name] = [ordered]@{
    all = (($patternHits | Measure-Object -Property $name -Sum).Sum + 0)
    active = (($activePatternHits | Measure-Object -Property $name -Sum).Sum + 0)
  }
}

$requiredFeatureFiles = @('types.ts', 'schemas.ts', 'repository.ts', 'service.ts', 'hooks.ts', 'events.ts', 'analytics.ts')
$featureDirs = Get-ChildItem -Path 'src/features' -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -notlike '__*' }
$featureLayout = foreach ($dir in $featureDirs) {
  $missing = @()
  foreach ($name in $requiredFeatureFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $dir.FullName $name))) {
      $missing += $name
    }
  }
  if ($missing.Count -gt 0) {
    [PSCustomObject]@{
      feature = $dir.Name
      missing = ($missing -join ', ')
    }
  }
}

$routeStringLiterals = $files |
  Where-Object { $_.FullName.Contains('\src\') } |
  ForEach-Object {
    $matches = Select-String -LiteralPath $_.FullName -Pattern "navigation\.navigate\(\s*['""]" -AllMatches
    foreach ($match in $matches) {
      [PSCustomObject]@{
        path = Get-RelativePath $_.FullName
        line = $match.LineNumber
        text = $match.Line.Trim()
      }
    }
  }

$summary = [ordered]@{
  generatedAt = (Get-Date).ToString('o')
  sourceFilesScanned = $files.Count
  largeFileCount = @($largeFiles).Count
  activeLargeFileCount = @($activeLargeFiles).Count
  patternHitFileCount = @($patternHits).Count
  activePatternHitFileCount = @($activePatternHits).Count
  supabaseViolationFileCount = @($supabaseViolations).Count
  queryViolationFileCount = @($queryViolations).Count
  featureLayoutViolationCount = @($featureLayout).Count
  routeStringLiteralCount = @($routeStringLiterals).Count
  patternTotals = $patternTotals
  largeFilesTop = @($largeFiles | Sort-Object lines -Descending | Select-Object -First 200)
  activeLargeFilesTop = @($activeLargeFiles | Sort-Object lines -Descending | Select-Object -First 200)
  patternHitsTop = @($patternHits | Sort-Object anyType, unsafeCast, supabaseAccess -Descending | Select-Object -First 300)
  activePatternHitsTop = @($activePatternHits | Sort-Object anyType, unsafeCast, supabaseAccess -Descending | Select-Object -First 300)
  supabaseViolations = @($supabaseViolations | Select-Object -First 200)
  queryViolations = @($queryViolations | Select-Object -First 200)
  featureLayoutViolations = @($featureLayout | Select-Object -First 200)
  routeStringLiterals = @($routeStringLiterals | Select-Object -First 200)
}

$summary | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath '.bug-hunter/static-audit.json'

$markdown = New-Object System.Collections.Generic.List[string]
$markdown.Add("# Static Audit Snapshot")
$markdown.Add("")
$markdown.Add("- Generated: $($summary.generatedAt)")
$markdown.Add("- Source files scanned: $($summary.sourceFilesScanned)")
$markdown.Add("- Files over 200 lines: $($summary.largeFileCount) total, $($summary.activeLargeFileCount) active")
$markdown.Add("- Files with banned-pattern hits: $($summary.patternHitFileCount) total, $($summary.activePatternHitFileCount) active")
$markdown.Add("- Supabase access outside allowed files: $($summary.supabaseViolationFileCount) files")
$markdown.Add("- Query/mutation calls outside hook layers: $($summary.queryViolationFileCount) files")
$markdown.Add("- Feature folders missing mandatory files: $($summary.featureLayoutViolationCount)")
$markdown.Add("- String-literal navigation calls: $($summary.routeStringLiteralCount)")
$markdown.Add("")
$markdown.Add("## Pattern Totals")
$markdown.Add("")
$markdown.Add("| Pattern | Active hits | Total hits |")
$markdown.Add("| --- | ---: | ---: |")
foreach ($name in $patternTotals.Keys) {
  $markdown.Add("| $name | $($patternTotals[$name].active) | $($patternTotals[$name].all) |")
}
$markdown.Add("")
$markdown.Add("## Active Files Over 200 Lines")
$markdown.Add("")
foreach ($item in ($activeLargeFiles | Sort-Object lines -Descending | Select-Object -First 80)) {
  $markdown.Add("- $($item.lines) lines: $($item.path)")
}
$markdown.Add("")
$markdown.Add("## Supabase Access Outside repository.ts/config/types")
$markdown.Add("")
foreach ($item in $supabaseViolations) {
  $markdown.Add("- $($item.path) ($($item.supabaseAccess) hits)")
}
$markdown.Add("")
$markdown.Add("## useQuery/useMutation Outside Allowed Hook Layers")
$markdown.Add("")
foreach ($item in $queryViolations) {
  $markdown.Add("- $($item.path) ($($item.useQueryInSource) hits)")
}
$markdown.Add("")
$markdown.Add("## Feature Layout Violations")
$markdown.Add("")
foreach ($item in $featureLayout) {
  $markdown.Add("- $($item.feature): missing $($item.missing)")
}
$markdown.Add("")
$markdown.Add("## Route String Literal Samples")
$markdown.Add("")
foreach ($item in ($routeStringLiterals | Select-Object -First 80)) {
  $markdown.Add("- $($item.path):$($item.line) $($item.text)")
}

$markdown | Set-Content -LiteralPath '.bug-hunter/static-audit.md'
Write-Output "static-audit-json=.bug-hunter/static-audit.json"
Write-Output "static-audit-md=.bug-hunter/static-audit.md"
Write-Output "source-files=$($files.Count)"
Write-Output "large-files=$(@($largeFiles).Count)"
Write-Output "supabase-violation-files=$(@($supabaseViolations).Count)"
Write-Output "query-violation-files=$(@($queryViolations).Count)"
Write-Output "feature-layout-violations=$(@($featureLayout).Count)"
