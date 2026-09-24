**English** · [简体中文](README.zh-CN.md)

# World Cup 2026 Handbook ⚽

Rank the groups, project the knockout bracket, and watch live win probabilities from a real prediction market. Mobile-first, built around the 52 US-hosted matches.

**▶ Play it:**
- 🇬🇧 English — https://ericthlai.github.io/worldcup26-bracket/
- 🇨🇳 中文 — https://ericthlai.github.io/worldcup26-bracket/zh/

Your picks save automatically in your own browser. No login, nothing uploaded.

## Features
- **Fixtures** — all 52 US-hosted group matches, each with a live win / draw / win probability bar from the [Polymarket](https://polymarket.com) prediction market
- **Groups** — tap teams to rank each group. Top 2 advance, 3rd enters the best-third pool
- **Bracket** — interactive knockout bracket that auto-fills from your group rankings, plus a live title-odds board
- **Share** — generates a shareable prediction-card image

## Tech
Single static page, no build step. [Preact](https://preactjs.com) and [HTM](https://github.com/developit/htm) load from local files, predictions live in `localStorage`, and odds are fetched client-side from the public Polymarket Gamma API. Hosted on GitHub Pages.

The English (`/`) and Chinese (`/zh/`) pages are two separately maintained copies of the same app, not shared code. They share the squad data file and the same `localStorage` key, so your predictions carry across languages, and there's a footer link between them.

## Run locally
```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Sister project
[**worldcup-odds**](https://github.com/ericthlai/worldcup26-odds) takes the same tournament and computes it: a 20,000-trial Monte Carlo simulation with a Dixon-Coles goal model, the FIFA Annex C best-third table, and calibration against Polymarket. It tells you which teams are likely to meet where. This one lets you make the calls yourself.

## How this was built
- **I decided:** the scope (the 52 US-hosted fixtures, group ranking by hand, a pick-your-own bracket), the EN/ZH pages as two separately maintained copies, localStorage-only persistence with no login, and the limits listed below.
- **The agent generated:** a large share of the implementation. 8 of 23 commits carry a Claude co-author trailer; not every agent session leaves one, so treat that count as a lower bound.
- **I verified:** by manual review. There is no automated test suite; the tiebreak and bracket logic is checked by hand.

## Known limitations
- The English and Chinese pages are two separately maintained copies of the same app, not one shared codebase — a fix applied to one page does not automatically apply to the other.
- Only the 52 US-hosted group-stage matches are listed on the Fixtures tab. Canada- and Mexico-hosted games are not shown there, though group standings and the auto-filled bracket account for all 72 group matches via live results.
- The 8 best-third-place bracket slots are only auto-filled once all 12 groups have finished all 6 of their matches, even for a team that has already mathematically clinched a spot.
- The third-place-to-bracket-slot mapping is this project's own reconstruction of the tournament's allocation rule, not a verbatim copy of FIFA's official table. Treat the pre-final-day auto-fill as best-effort.
- Live scores come from ESPN's public scoreboard API and win probabilities from Polymarket's public API. The ESPN request raises its default result cap to 200 so all 104 tournament matches can be returned, but either provider can still change its response format, team-name spelling, or abbreviation scheme without notice.
- Run `node --test test/*.test.mjs` for bilingual feed/venue contracts, saved-state recovery, dependent bracket picks, and immediate persistence. Tournament tiebreak rules and live provider response schemas are not covered by these tests.
- Predictions are stored only in your browser's `localStorage`. Clearing site data, switching browsers or devices, or private/incognito mode all lose them; there is no account or cloud sync.
- The squad and lineup data (projected XI, market values) is a pre-tournament projection compiled from public sources (Transfermarkt, official squad lists) and is not updated live for matchday changes.

## Disclaimer
Kickoff times follow the official FIFA app. The percentages are implied probabilities from the Polymarket betting market, shown for entertainment.
