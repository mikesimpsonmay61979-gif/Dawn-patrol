# Dawn Patrol

A Missouri-first hunting and fishing app for the Hermann stretch of the river. Completely free. Built for Michael Simpson, Hermann, Missouri, and published by Soul Healing Studios.

Dawn Patrol is a mobile-first Progressive Web App: timber green, blaze orange, and a dawn sky. It runs with no paid API keys. There is no subscription and no locked feature.

## What you can do

**Today.** Current weather, wind, and the barometer trend from the free [Open-Meteo](https://open-meteo.com/) forecast. The phone’s location is used when you allow it; otherwise the spot is Hermann, MO (38.7042, -91.4371). Sunrise and sunset come from the same forecast. Moon phase and solunar major/minor periods are computed on the device from the moon’s position. Bite and move ratings are a simple read of wind, pressure, light, and the moon — a planning aid, not a promise. The next seven dawns show a bite rating, a move rating, and the morning major period.

**The Read.** One hunt-or-fish card per day, the same card for everyone, seeded by the Missouri (America/Chicago) date. You call the water or cover, the bait or play, and the hour. Each call is worth up to 3. A limit is 9. Streaks, a shareable result, and a ledger of past scores stay in `localStorage` on this phone. There is no account and no global leaderboard. Second Watch is the other quarry the same day. Drift is a practice card. Neither one changes the daily streak.

**Seasons.** A static snapshot of common Missouri game and fish seasons, labeled as a planning aid. Every row links to an official Missouri Department of Conservation page. This app does not state bag limits, and it is not the Wildlife Code. Confirm the season, your zone, and your county on [mdc.mo.gov](https://mdc.mo.gov/) before you hunt or fish.

**Places.** A Leaflet map on OpenStreetMap tiles with a starter set of real public conservation areas and river access near the Missouri, Gasconade, and Osage. Pins are published points, not boundaries. Access and area rules change.

**Log.** A catch and harvest book stored on the phone: species, date, location, count, notes, and an optional photo. Export to CSV anytime. There is no entry cap.

**About.** Who publishes the app, how to write [minddriftstudio79@gmail.com](mailto:minddriftstudio79@gmail.com), and a link to the privacy page. The old Pro address (`/pro`) redirects here.

## Run it

Node 20 or newer.

```bash
npm install
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000). For development with hot reload, use `npm run dev`.

Install it from the browser: Add to Home Screen on iOS, or the install icon in Chrome. The manifest, icons, and service worker are included. The service worker registers in production (`npm start` or a deploy), not during `npm run dev`.

## Deploy to Vercel

No environment variables are required. Ads stay off until you set the ones below.

1. Push this repo to GitHub.
2. In Vercel, import the project. Framework preset: Next.js. Build command: `npm run build`. Output is the default Next.js build.
3. Deploy. `npm start` locally is the same server Vercel runs.

Open-Meteo and OpenStreetMap are called from the browser. Nothing in the deploy needs a secret.

`NEXT_PUBLIC_*` values are inlined at build time. Set them in the host before `npm run build`, then redeploy when they change. `ADS_TXT` is read when `/ads.txt` is requested.

## Advertising

`<AdSlot>` in `src/components/AdSlot.tsx` is a normal-flow display unit. Placements:

- Today, under the seven-day read
- The Read, under a finished daily card (not while the card is still open)
- Seasons, in the list
- Places, in the list under the map

Units are never fixed, sticky, or full screen. In AdSense, create responsive display units only. Do not turn on anchor ads, vignettes, or interstitials. Those cover the page.

| Variable | Role |
| --- | --- |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-` plus 16 digits. Loads `adsbygoogle.js`. |
| `NEXT_PUBLIC_ADSENSE_SLOT` | Digit unit id used wherever a placement slot is empty. |
| `NEXT_PUBLIC_ADSENSE_SLOT_TODAY` | Today banner. |
| `NEXT_PUBLIC_ADSENSE_SLOT_GAME` | Under the daily result. |
| `NEXT_PUBLIC_ADSENSE_SLOT_SEASONS` | In the seasons list. |
| `NEXT_PUBLIC_ADSENSE_SLOT_PLACES` | In the places list. |
| `ADS_TXT` | Optional full body for `/ads.txt` and `/app-ads.txt`. |

A client id or slot that does not match those shapes counts as unset. When a placement is unset, `npm run dev` draws a dashed box labeled Advertisement. A production build draws nothing and does not load the AdSense script.

`/ads.txt` is the site file. `/app-ads.txt` serves the same body for a developer website hosted on this domain. With `NEXT_PUBLIC_ADSENSE_CLIENT` set and no `ADS_TXT`, the line is:

```text
google.com, pub-################, DIRECT, f08c47fec0942fa0
```

With neither set, both URLs return a comment-only placeholder. Names and the Play Console steps are in [docs/PLAY_STORE_ADS.md](docs/PLAY_STORE_ADS.md). Copy `.env.example` when you are ready to fill them in.

A short notice on first launch says the app may show ads and links to `/privacy`. Dismissing it stores a flag on the phone. It does not replace Google’s own consent message where Google requires one.

## Data, on purpose

- Weather: Open-Meteo, no key.
- Map tiles: OpenStreetMap. Attribution stays on the map.
- Seasons: transcribed in October 2026 from MDC season pages, the 2026–27 deer and turkey date release, the 2026–27 Migratory Bird and Waterfowl Hunting Digest, and the fishing summary effective March 1, 2026. Sources are linked at the bottom of the Seasons screen.
- Places: a small starter list. Hermann Riverfront Park is a city ramp. The Katy Trail is a Missouri State Park. The rest are MDC areas or accesses.

Solunar times are a short astronomical approximation, accurate to a fraction of an hour, which sits inside a two-hour major period.

## Scripts

`scripts/make-icons.py` redraws the PNG icons. `scripts/check-puzzles.ts` checks that each daily card is stable, that a 3-point answer is always on the card, and that a few season statuses for 13 October 2026 match the snapshot. Run it with `npx tsx scripts/check-puzzles.ts` if you want that check. It is not part of `npm run build`.
