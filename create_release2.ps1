$token = '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'

$releaseBody = 'v2.1.0 - Official inventory API, Use in Lineup overhaul, position badges'

$json = '{"tag_name":"v2.1.0","target_commitish":"main","name":"v2.1.0 - Official inventory API, Use in Lineup overhaul, position badges","body":"Official inventory API (\/apis\/inventory.json?type=mlb_card) as primary strategy. Fixed Use in Lineup to show all owned cards. Mission goal text in each row. REP badge for double-dippers. Ownership gate for Repeatable XP panel. Position badges with secondary positions. Dashboard auto-load fix.","draft":false,"prerelease":false}'

$result = curl.exe -s -w "`n%{http_code}" `
    -X POST `
    -H "Authorization: Bearer $token" `
    -H "Accept: application/vnd.github+json" `
    -H "X-GitHub-Api-Version: 2022-11-28" `
    -H "Content-Type: application/json" `
    -d $json `
    "https://api.github.com/repos/plotting/MLBProgramTracker/releases"

Write-Host $result
