# Dawn Patrol

A Missouri-first hunting and fishing app for the Hermann stretch of the river. Free to use. Pro is a local demo until Stripe is connected. Built for Michael Simpson, Hermann, Missouri.

Dawn Patrol is a mobile-first Progressive Web App: timber green, blaze orange, and a dawn sky. It runs with no paid API keys.

## What you can do

**Today.** Current weather, wind, and the barometer trend from the free [Open-Meteo](https://open-meteo.com/) forecast. The phone’s location is used when you allow it; otherwise the spot is Hermann, MO (38.7042, -91.4371). Sunrise and sunset come from the same forecast. Moon phase and solunar major/minor periods are computed on the device from the moon’s position. Bite and move ratings are a simple read of wind, pressure, light, and the moon — a planning aid, not a promise.

**The Read.** One hunt-or-fish card per day, the same card for everyone, seeded by the Missouri (America/Chicago) date. You call the water or cover, the bait or play, and the hour. Each call is worth up to 3. A limit is 9. Streaks, a shareable result, and a ledger of past scores stay in `localStorage` on this phone. There is no account and no global leaderboard.

**Seasons.** A static snapshot of common Missouri game and fish seasons, labeled as a planning aid. Every row links to an official Missouri Department of Conservation page. This app does not state bag limits, and it is not the Wildlife Code. Confirm the season, your zone, and your county on [mdc.mo.gov](https://mdc.mo.gov/) before you hunt or fish.

**Places.** A Leaflet map on OpenStreetMap tiles with a starter set of real public conservation areas and river access near the Missouri, Gasconade, and Osage. Pins are published points, not boundaries. Access and area rules change.

**Log.** A catch and harvest book stored on the phone: species, date, location, count, notes, and an optional photo. Export to CSV anytime. The free book holds 12 entries. Entries already saved are kept if Pro is turned off.

**Pro.** $4.99/month or $29.99/year on the pricing page. Pro clears the sponsor strip, adds a seven-day solunar and dawn rating, lifts the log cap, and unlocks Second Watch plus Drift (practice cards that don’t touch the daily streak). The switch on that page unlocks Pro locally so you can try it. It does not charge a card.

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

No environment variables are required.

1. Push this repo to GitHub.
2. In Vercel, import the project. Framework preset: Next.js. Build command: `npm run build`. Output is the default Next.js build.
3. Deploy. `npm start` locally is the same server Vercel runs.

Open-Meteo and OpenStreetMap are called from the browser. Nothing in the deploy needs a secret.

## How paid Pro would be wired

Money is intentionally not collected yet. The hook is in two places:

- `src/lib/billing.ts` — plan ids, the $4.99 and $29.99 prices, and `startCheckout()`.
- `src/app/api/checkout/route.ts` — `POST /api/checkout` with `{ "plan": "monthly" | "yearly" }`.

Today that route returns `501` and tells the page to use the demo switch. To turn on Stripe later:

1. `npm install stripe`
2. Set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_MONTHLY`, and `STRIPE_PRICE_YEARLY` in Vercel (recurring prices for $4.99/month and $29.99/year).
3. In the checkout route, create a Checkout Session in `subscription` mode and return `{ "url": session.url }`. The commented block in that file is the shape of the call.
4. Add a webhook route for `checkout.session.completed` and `customer.subscription.deleted` once there is an account to attach the subscription to. Right now Pro is a flag in `localStorage` (`dawn-patrol-pro`). A real subscription should set that entitlement on a server, not trust the phone.

The demo switch stays useful for screenshots and for trying the Pro screens without a card.

## Data, on purpose

- Weather: Open-Meteo, no key.
- Map tiles: OpenStreetMap. Attribution stays on the map.
- Seasons: transcribed in October 2026 from MDC season pages, the 2026–27 deer and turkey date release, the 2026–27 Migratory Bird and Waterfowl Hunting Digest, and the fishing summary effective March 1, 2026. Sources are linked at the bottom of the Seasons screen.
- Places: a small starter list. Hermann Riverfront Park is a city ramp. The Katy Trail is a Missouri State Park. The rest are MDC areas or accesses.

Solunar times are a short astronomical approximation, accurate to a fraction of an hour, which sits inside a two-hour major period.

## Scripts

`scripts/make-icons.py` redraws the PNG icons. `scripts/check-puzzles.ts` checks that each daily card is stable, that a 3-point answer is always on the card, and that a few season statuses for 13 October 2026 match the snapshot. Run it with `npx tsx scripts/check-puzzles.ts` if you want that check. It is not part of `npm run build`.
