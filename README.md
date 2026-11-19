# Neon Leonida — GTA VI Trophy Guide &amp; Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/gokonk-7/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/gokonk-7/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

The best offline guide and tracker for the **55 PlayStation 5 trophies** of
Grand Theft Auto VI — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze — built for the
[make.fun bounty gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).
Made by [gokonk-7](https://github.com/gokonk-7). Referral: https://make.fun/r/sqj6a0rx

## What it does

- **Checklist** — every trophy with its official name, description and grade.
  Tick trophies off; progress is saved in your browser (localStorage) and
  survives reloads. Per-trophy notes, export/import as JSON, and filters by
  grade, kind, status and search text.
- **Spoiler-safe** — hides story trophies and hidden trophies (name,
  description and guide) until you earn them.
- **Roadmap** — three phases to the platinum with per-phase progress:
  story, the 100% grind, then strangers &amp; clean-up.
- **Missables** — the one possibly-missable trophy (Positive Mental
  Attitude, Chapter 1 balcony), Yago's time-sensitive race, the permanent
  Irredeemable profile warning, and save discipline (15 manual slots, one
  save per chapter start, one before the final mission).
- **Next up** — a planner that ranks your remaining trophies: time-sensitive
  first, then story order, then the grind.
- **Cited guides** — every trophy has a guide in our own words (what to do,
  where and how, when it can be missed) with its sources linked. Five
  trophies whose steps are not yet pinned down say so plainly instead of
  inventing a method.

## Run it

```bash
node serve.ts
# open http://localhost:8080/
```

No build step, no network requests, no accounts, no ads. Keyboard:
`/` focuses search, `1`–`5` switch tabs.

## Build the entry

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
into the output directory and writes `dossier.json` with the kit's
`buildDossier`. Two runs write identical bytes.

## Sources

Names, descriptions and grades are the official 55-trophy list, cross-checked
against [GTABase](https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series)
and [Outputlag](https://outputlag.com/guides/gta-6-trophy-list/), which agree
exactly, and the kit's starter data. Guides are paraphrased in our own words
and cite GTABase / Outputlag per trophy; see also
[Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
and [PSNProfiles](https://psnprofiles.com/trophies/grand-theft-auto-vi).

## License

MIT. Unofficial fan guide — not affiliated with Rockstar Games, no Rockstar
logo or official artwork.
