# Neon Leonida — GTA VI Trophy Guide & Tracker

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/gokonk-7/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/gokonk-7/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline web app that is the best guide + tracker for the 55 PlayStation 5 trophies of **Grand Theft Auto VI**. Entry for the [make.fun bounty gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) — $250 pot, top 50 share. Built by [gokonk-7](https://make.fun/r/sqj6a0rx) (referral: https://make.fun/r/sqj6a0rx).

## What it does

- **Checklist of all 55 official trophies** — names, descriptions and grades verified against GTABase, Outputlag and Exophase (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden; Gamerscore sums to 1,000G). Progress is saved in the browser, with per-trophy notes.
- **Filters** by grade, kind and status, plus full-text search.
- **Spoiler setting** — hides story and hidden trophies (name + description + guide) until they are earned.
- **Roadmap to the platinum** — 3 phases with per-phase progress: story, the 100% checklist grind, strangers & clean-up.
- **Missables page** — Positive Mental Attitude, the only possibly-missable trophy (Lucia's Chapter 1 balcony meditation), Yago's time-sensitive Chapter 3 race, the permanent irredeemable-profile warning, and save discipline (15 manual slots + 1 autosave; one save per chapter start).
- **Next-up planner** — ranks un-earned trophies: time-sensitive first, then story order, then the grind.
- **Export / import** of progress as JSON (validated — a bad file is rejected with nothing changed), plus reset.
- **A guide for every trophy in our own words**, citing its sources — what to do, where and how, when it can be missed. Five trophies whose exact steps are not yet confirmed (In The Beginning…, Capital Offense, Bad Luck I Guess, The Truth Is Out There, Ten Pin) are marked honestly as “Not yet pinned down” instead of given an invented method.

## Look

Dark neon-sunset theme with a hand-drawn CSS/SVG skyline. Own look — no Rockstar logo or official artwork.

## Run it

```bash
node serve.ts
# open http://localhost:8080
```

Fully offline: static files only, no network requests, no build step. Keyboard: `/` focuses search, `1`–`5` switch tabs.

## Build the dossier

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, stdlib only) copies `app/` + `screenshots/` to the output directory and writes `dossier.json` with the vendored `vendor/makefun-frontend.ts` library.

## Sources

- [GTABase — GTA 6 achievements & trophies list](https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series)
- [Outputlag — GTA 6 trophy list](https://outputlag.com/guides/gta-6-trophy-list/)
- [Exophase — Grand Theft Auto VI trophies](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
- [PSNProfiles — Grand Theft Auto VI trophies](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)

## License

MIT — see [LICENSE](LICENSE).
