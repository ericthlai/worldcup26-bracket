**English** · [简体中文](README.zh-CN.md)

# World Cup 2026 Handbook ⚽

Rank the groups, project the knockout bracket, and watch live win probabilities from a real prediction market. Mobile-first, built around the 52 US-hosted matches.

**▶ Play it:**
- 🇬🇧 English — https://ericthlai.github.io/worldcup26/
- 🇨🇳 中文 — https://ericthlai.github.io/worldcup26/zh/

Your picks save automatically in your own browser. No login, nothing uploaded.

## Features
- **Fixtures** — all 52 US-hosted group matches, each with a live win / draw / win probability bar from the [Polymarket](https://polymarket.com) prediction market
- **Groups** — tap teams to rank each group. Top 2 advance, 3rd enters the best-third pool
- **Bracket** — interactive knockout bracket that auto-fills from your group rankings, plus a live title-odds board
- **Share** — generates a shareable prediction-card image

## Tech
Single static page, no build step. [Preact](https://preactjs.com) and [HTM](https://github.com/developit/htm) load from local files, predictions live in `localStorage`, and odds are fetched client-side from the public Polymarket Gamma API. Hosted on GitHub Pages.

The English (`/`) and Chinese (`/zh/`) versions share the same logic and the same saved predictions, with a footer link between them.

## Run locally
```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Sister project
[**worldcup-odds**](https://github.com/ericthlai/worldcup-odds) takes the same tournament and computes it: a 20,000-trial Monte Carlo simulation with a Dixon-Coles goal model, the FIFA Annex C best-third table, and calibration against Polymarket. It tells you which teams are likely to meet where. This one lets you make the calls yourself.

## Disclaimer
Kickoff times follow the official FIFA app. The percentages are implied probabilities from the Polymarket betting market, shown for entertainment.
