$token = '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'
$headers = @{
    'Authorization' = "Bearer $token"
    'Accept' = 'application/vnd.github+json'
    'X-GitHub-Api-Version' = '2022-11-28'
}

$releaseBody = @"
## What's New

### Inventory
- **Official inventory API** (/apis/inventory.json?type=mlb_card) replaces HTML scraping as primary strategy
- HTML table scrape still runs as secondary pass for position enrichment
- Fixed 1B / 2B / 3B positions being silently filtered out (regex was requiring letter-first)
- Pagination now correctly fetches all pages (was stopping at page 1)

### Use in Lineup panel
- Now shows **all owned cards** that have an incomplete mission - not just WBC cards
- Fixed series-prefix mismatch (e.g. "Jolt Adam Jones" in mission -> "Adam Jones" in inventory)
- Each row shows the **mission goal text** below the player name
- Double-dippers (stat mission + repeatable eligible) get a purple **REP** badge and sort to the top

### Repeatable XP panel
- Only shows players you **own** (ownership gate via invMap)
- Pure-repeatable players (no open stat mission) listed separately from double-dippers

### Position badges
- Primary and all secondary positions displayed inline for every player row

### Bug fixes
- Dashboard now defaults correctly on page load (was crashing in buildAutoInventory before selectHome() ran)
- Fixed JS TypeError when inventory entries are objects instead of strings (Pass 5)
- Fixed Paxton / Ramírez false positives in Repeatable XP panel
"@

$payload = @{
    tag_name = 'v2.1.0'
    target_commitish = 'main'
    name = 'v2.1.0 - Official inventory API, Use in Lineup overhaul, position badges'
    body = $releaseBody
    draft = $false
    prerelease = $false
} | ConvertTo-Json -Depth 5

$response = Invoke-WebRequest -Uri 'https://api.github.com/repos/plotting/MLBProgramTracker/releases' `
    -Method POST `
    -Headers $headers `
    -Body $payload `
    -ContentType 'application/json'

$release = $response.Content | ConvertFrom-Json
Write-Host "Release created: $($release.html_url)"
