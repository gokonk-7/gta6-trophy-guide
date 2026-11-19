[![GTA 6 Trophy Guide](https://make.fun/competitions/gta6-trophy-guide-01/badge.svg)](https://make.fun/competitions/gta6-trophy-guide-01)
[![Rank](https://make.fun/competitions/gta6-trophy-guide-01/rank.svg)](https://make.fun/competitions/gta6-trophy-guide-01)
[![Reward](https://make.fun/competitions/gta6-trophy-guide-01/reward.svg)](https://make.fun/competitions/gta6-trophy-guide-01)

# Neon Leonida — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI, built for the make.fun competition [`gta6-trophy-guide-01`](https://make.fun/competitions/gta6-trophy-guide-01) ("Build the best GTA 6 trophy guide").

- **Owner:** [gokonk-7](https://github.com/gokonk-7) · **Repo:** gta6-trophy-guide
- **Referral:** [make.fun/r/sqj6a0rx](https://make.fun/r/sqj6a0rx)
- **Prize:** $250 pot, top 50 share (1st $50) · **Entry:** free · **Deadline:** 21 Nov 2026, 18:00 WIB

## What it is

A static web app that opens in a desktop browser and works with the network off:

- **Checklist** — every official trophy with its exact name, description and grade; progress saved in the browser (localStorage), export/import as JSON, filters by grade/kind/status, text search, and a spoiler-free mode that hides story and hidden trophies until earned.
- **Roadmap** — three phases to the platinum (story → 100% grind → strangers & clean-up), each with its own progress bar.
- **Missables** — the one possibly-missable trophy (Positive Mental Attitude, Chapter 1), the time-sensitive Yago race, the permanent criminal-profile warning, and save discipline.
- **Next up** — a planner that ranks your remaining trophies: time-sensitive first, then story order, then the grind.
- **A guide to each trophy** in our own words — what to do, where and how, when it can be missed — with its sources cited beside it (Exophase and PSNProfiles for names/descriptions/grades; GTABase and Outputlag for the how-to). Five trophies whose exact steps are still unconfirmed say so plainly instead of inventing a method.

55 trophies: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 27 visible, 28 hidden; all single-player, no online trophies; about 200 hours to the platinum.

## Run it

```sh
node serve.ts   # serves app/ at http://localhost:8080/
```

Or open `app/index.html` through any static file server. No build step, no network at run time.

## Build the dossier

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, stdlib only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `buildDossier` library (`vendor/makefun-frontend.ts`, copied from the kit unchanged). The build is deterministic: two runs write identical bytes.

## Screenshots

Four renders at 1280×800 (JPEG, quality 82), taken with Playwright Chromium from the running app with progress seeded at 13/55 earned:

1. `1-checklist.jpg` — checklist, progress and filters, spoiler mode on
2. `2-guide.jpg` — the Positive Mental Attitude guide, missable warning and sources
3. `3-roadmap.jpg` — the three-phase roadmap to the platinum
4. `4-missables.jpg` — missables and save discipline

## Sources

- [Exophase — official trophy list](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
- [PSNProfiles — trophy list](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)
- [GTABase — trophy list & how-to](https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series)
- [Outputlag — trophy list & how-to](https://outputlag.com/guides/gta-6-trophy-list/)

## License

MIT. An unofficial fan-made guide — not affiliated with Rockstar Games or Take-Two Interactive, and it uses no Rockstar logo or official artwork. Trophy names and descriptions are shown as PlayStation publishes them.
