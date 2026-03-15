# MLB The Show 26 — Team Affinity Program Tracker

Track your MLB The Show 26 Team Affinity missions in a rich, interactive HTML dashboard. Fetches live data straight from your account, detects which players you own from mission progress, and tells you who to keep in your lineup.

---

## What It Does

- **Live mission data** — scrapes all 30 teams' affinity missions plus WBC/themed programs
- **Home dashboard** — lineup advisor, 10 closest missions to finishing, recently completed/started
- **Auto-inventory** — if you've made progress on a mission, you own that card; the tracker figures this out automatically
- **Player recommendations** — *Use in Lineup* (active missions sorted by % complete) and *Safe to Remove* (all done)
- **WBC Moment badges** — missions like "Johan Camargo - Panama" are tagged as Moments even after completion
- **One-click GUI** — no terminal, no manual steps; just double-click and go

---

## Requirements

- **Windows 10/11** (Chrome cookie decryption uses Windows-only APIs)
- **Python 3.10+** — [python.org/downloads](https://www.python.org/downloads/) — check *"Add Python to PATH"* during install
- **Google Chrome, Microsoft Edge, or Brave** — signed into mlb26.theshow.com
- **One Python package:**

```
pip install cryptography
```

> If `pip` isn't found, open a terminal and run `python -m pip install cryptography` instead.

---

## Quick Start

### 1 — Install Python

Download Python 3.12 (or newer) from **[python.org/downloads](https://www.python.org/downloads/)**.

During install, check **"Add Python to PATH"** — this is required.

### 2 — Install the one dependency

Open **Command Prompt** (press `Win+R`, type `cmd`, press Enter) and run:

```
pip install cryptography
```

### 3 — Sign into MLB The Show 26

Open **Chrome** (or Edge/Brave), go to [mlb26.theshow.com](https://mlb26.theshow.com), and sign in with your account.

### 4 — Run the tracker

Double-click **`MLB Tracker.pyw`**.

A dark window appears — click **Refresh Live Data**.

The tracker fetches your missions, builds the HTML dashboard, and opens it in your browser automatically.

---

## File Overview

| File | Purpose |
|------|---------|
| `MLB Tracker.pyw` | GUI launcher — double-click this to run everything |
| `fetch_mlb26.py` | Scrapes your live mission data from mlb26.theshow.com |
| `build_tracker.py` | Generates the interactive HTML dashboard from the fetched data |
| `requirements.txt` | Python dependencies (`pip install -r requirements.txt`) |

> **Generated files** (not in repo — created on first run):
> - `mlb_data_live.json` — your raw mission data
> - `MLB Team Affinity Tracker.html` — the interactive dashboard
> - `.mlb26_cookies.json` — cached auth cookies (12h TTL, stays local)

---

## How Authentication Works

The tracker reads your session cookies directly from Chrome's local database — no password needed, no API keys.

**Automatic flow (no action needed):**
1. Cookies are read from Chrome's local profile
2. Cached for 12 hours in `.mlb26_cookies.json` so subsequent runs are instant
3. If Chrome is open and the database is locked, a dialog appears

**If Chrome is locked (dialog appears):**
- **Option 1** — Close Chrome and click Retry; the tracker reads the unlocked database
- **Option 2** — Paste your `_tsn_session` cookie manually (copy from Chrome DevTools → Application tab → Cookies → mlb26.theshow.com)

---

## Troubleshooting

**"pip is not recognized"**
Python wasn't added to PATH during install. Re-run the Python installer and check *"Add Python to PATH"*, or use `python -m pip install cryptography`.

**"Authenticated!" but 0 missions found**
Your session cookie may have expired — sign out and back into mlb26.theshow.com in Chrome, then click Refresh again.

**Chrome cookie error / not found**
Make sure you're signed into [mlb26.theshow.com](https://mlb26.theshow.com) in Chrome (not a guest profile). The tracker checks Chrome, Edge, and Brave automatically.

**Dashboard shows "No active missions detected"**
No missions with progress > 0% were found. Complete at least one stat in a team affinity program in-game, then re-fetch.

---

## Running Without the GUI (Advanced)

```bash
# Fetch live data
python fetch_mlb26.py

# Rebuild HTML from existing data
python build_tracker.py --source mlb_data_live.json
```

Add `--no-browser` to `fetch_mlb26.py` to skip auto-opening the browser (useful for automation).

---

## Platform Note

`fetch_mlb26.py` uses Windows-specific APIs (DPAPI via `ctypes` and Chrome's Windows profile path). It will not work on macOS or Linux without modification.
