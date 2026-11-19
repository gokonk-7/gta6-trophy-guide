[![gta6-trophy-guide-01](https://make.fun/api/competitions/gta6-trophy-guide-01/badge.svg)](https://make.fun/competitions/gta6-trophy-guide-01)
[![Rank](https://make.fun/api/competitions/gta6-trophy-guide-01/rank.svg)](https://make.fun/competitions/gta6-trophy-guide-01)
[![Reward](https://make.fun/api/competitions/gta6-trophy-guide-01/reward.svg)](https://make.fun/competitions/gta6-trophy-guide-01)

# Neon Leonida — GTA VI Trophy Guide & Tracker

The best offline guide and tracker for the 55 PlayStation 5 trophies of **Grand Theft Auto VI** (launched 19 November 2026). Built for the make.fun competition [gta6-trophy-guide-01](https://make.fun/competitions/gta6-trophy-guide-01) — $250 pot, top 50 share, entry free.

**Referral:** [make.fun/r/sqj6a0rx](https://make.fun/r/sqj6a0rx)

## What it is

A static, offline web app — no network requests, no build step:

- **Checklist** of all 55 official trophies (exact names, descriptions, grades), saved in the browser, with search, grade/kind/status filters and a spoiler setting that hides story and hidden trophies until earned.
- **A guide for every trophy** in our own words, citing its sources (GTABase, Outputlag, Exophase, PSNProfiles). Trophies whose steps are not yet pinned down say so plainly instead of inventing a method.
- **Roadmap** to the platinum in 3 phases, **Missables** page (the one possibly-missable meditation, Yago's time-sensitive race, save discipline) and a **Next-up planner**.
- **Export / import** of progress as JSON, plus per-trophy notes.

## Run it

```sh
node serve.ts        # then open http://localhost:8080/
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/dossier.json
```

## Sources

- Exophase — https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/ (official list)
- PSNProfiles — https://psnprofiles.com/trophies/43531-grand-theft-auto-vi (official list)
- GTABase — https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series (how-to)
- Outputlag — https://outputlag.com/guides/gta-6-trophy-list/ (how-to)

Fan-made guide. No Rockstar Games logo, official artwork or game screenshots. MIT licensed — see `LICENSE`.
