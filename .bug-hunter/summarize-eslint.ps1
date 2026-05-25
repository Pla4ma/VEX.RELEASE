$ErrorActionPreference = 'Stop'

$items = Get-Content -LiteralPath '.bug-hunter/eslint.json' -Raw | ConvertFrom-Json
$ruleCounts = @{}
$filesWithMessages = 0
$errorCount = 0
$warningCount = 0

foreach ($item in $items) {
  if ($item.messages.Count -gt 0) {
    $filesWithMessages += 1
  }
  $errorCount += $item.errorCount
  $warningCount += $item.warningCount
  foreach ($message in $item.messages) {
    $rule = if ($message.ruleId) { $message.ruleId } else { 'unknown' }
    if (-not $ruleCounts.ContainsKey($rule)) {
      $ruleCounts[$rule] = 0
    }
    $ruleCounts[$rule] += 1
  }
}

$topRules = $ruleCounts.GetEnumerator() |
  Sort-Object Value -Descending |
  Select-Object -First 20 |
  ForEach-Object {
    [PSCustomObject]@{
      rule = $_.Key
      count = $_.Value
    }
  }

$topFiles = $items |
  Where-Object { $_.messages.Count -gt 0 } |
  Sort-Object warningCount, errorCount -Descending |
  Select-Object -First 50 |
  ForEach-Object {
    [PSCustomObject]@{
      filePath = $_.filePath
      errors = $_.errorCount
      warnings = $_.warningCount
    }
  }

$summary = [ordered]@{
  fileCount = $items.Count
  filesWithMessages = $filesWithMessages
  errors = $errorCount
  warnings = $warningCount
  topRules = @($topRules)
  topFiles = @($topFiles)
}

$summary | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath '.bug-hunter/eslint-summary.json'
Write-Output "eslint-files=$($summary.fileCount)"
Write-Output "eslint-files-with-messages=$($summary.filesWithMessages)"
Write-Output "eslint-errors=$($summary.errors)"
Write-Output "eslint-warnings=$($summary.warnings)"
