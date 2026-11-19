[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/gokonk-7/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/gokonk-7/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

# Neon Leonida — GTA VI Trophy Guide & Tracker

The best guide + tracker for the **55 PlayStation 5 trophies of Grand Theft Auto VI** — an offline static web app. Open `app/index.html` in a desktop browser (or run `node serve.ts` and visit http://localhost:8080). No network needed, no account, no Rockstar logo or artwork.

## What it does

- **Checklist of all 55 official trophies** — exact names, descriptions and grades (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden), saved in the browser, with per-trophy notes.
- **Export / import** your progress as JSON, so it survives a new machine.
- **Filters** by grade, kind and status, plus full-text search across names, descriptions and guides.
- **Spoiler setting** (on by default) masks hidden and story trophies until you earn them.
- **Roadmap to the Platinum** in 3 phases — story, then the 100% checklist, then strangers & clean-up — each with its own progress bar.
- **Missables page** — the only possibly-missable trophy (Positive Mental Attitude, Chapter 1 balcony meditation), the time-sensitive Yago race, the permanent irredeemable-profile warning, and save discipline (15 manual slots, no mission replay, no New Game+).
- **Next-up planner** — ranks what to chase next: time-sensitive first, then story order, then the grind.
- **A cited guide for every trophy** — what to do, where and how, and when it can be missed, in our own words. Every guide cites its sources. Where a trophy's steps are not yet pinned down by any source, the guide says so plainly instead of inventing a method.

## Sources

- [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) — names, descriptions, grades.
- [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi) — PSN trophy list and progress targets.
- [GTABase](https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series) — full list with how-to guidance.
- [Outputlag](https://outputlag.com/guides/gta-6-trophy-list/) — full list with how-to guidance.

All 55 names, descriptions and grades were cross-checked between GTABase and Outputlag and agree exactly. Guides draw on those sources and cite them, never copying their text.

## Run it

```sh
node serve.ts   # http://localhost:8080
```

## Build the dossier (what make.fun judges)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, stdlib only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `vendor/makefun-frontend.ts` (`buildDossier`). Run it twice and the bytes are identical.

## Screenshots

- `1-checklist.jpg` — checklist with progress, filters and spoiler mode on.
- `2-guide.jpg` — the full guide for Positive Mental Attitude, with its missable warning and sources.
- `3-roadmap.jpg` — the 3-phase roadmap to the Platinum.
- `4-missables.jpg` — missables, save discipline and the next-up planner.

## License

MIT — see [LICENSE](LICENSE). Unofficial fan guide; not affiliated with or endorsed by Rockstar Games.

Built for the make.fun competition [gta6-trophy-guide-01](https://make.fun/c/gta6-trophy-guide-01) by [gokonk-7](https://github.com/gokonk-7). Referral: https://make.fun/r/sqj6a0rx
