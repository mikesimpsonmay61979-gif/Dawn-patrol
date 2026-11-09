import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">Soul Healing Studios</p>
        <h1 className="font-display text-4xl leading-none">About</h1>
      </header>
      <section className="card space-y-3 text-sm leading-relaxed text-mist-300">
        <p>
          Dawn Patrol is free. Weather, the seven-day solunar, the daily card, Second Watch, Drift, seasons, the map, and an unlimited harvest log on this phone all come with the app.
        </p>
        <p>
          There is no subscription. Advertising, when it is turned on, sits in the page: a banner on Today, a unit under a finished Read, and a unit in the Seasons and Places lists. Ads do not cover the card or the map.
        </p>
      </section>
      <section className="card space-y-2 text-sm leading-relaxed text-mist-300">
        <h2 className="font-display text-2xl text-mist-100">Support</h2>
        <p>
          Questions, corrections, and takedown notes:{" "}
          <a className="font-semibold text-blaze-400" href="mailto:minddriftstudio79@gmail.com">
            minddriftstudio79@gmail.com
          </a>
        </p>
        <p>Soul Healing Studios. Hermann, Missouri.</p>
        <p>
          <Link href="/privacy" className="font-semibold text-blaze-400">
            Privacy and ads
          </Link>
        </p>
      </section>
      <p className="px-1 text-xs leading-relaxed text-mist-500">
        Built for Michael Simpson, Hermann, Missouri. Seasons are a planning aid. Confirm dates, your zone, and your county on mdc.mo.gov before you hunt or fish.
      </p>
    </div>
  );
}
