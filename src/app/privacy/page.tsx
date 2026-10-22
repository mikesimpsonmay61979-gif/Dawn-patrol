import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Dawn Patrol uses location, on-device storage, and Google advertising.",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">Soul Healing Studios</p>
        <h1 className="font-display text-4xl leading-none">Privacy</h1>
        <p className="mt-2 text-sm text-mist-500">Updated October 22, 2026</p>
      </header>

      <section className="card space-y-3 text-sm leading-relaxed text-mist-300">
        <p>
          Dawn Patrol is a free hunting and fishing app published by Soul Healing Studios. This page covers the website and the same app if it is installed from a browser or offered on Google Play.
        </p>
        <p>
          Contact:{" "}
          <a className="font-semibold text-blaze-400" href="mailto:minddriftstudio79@gmail.com">
            minddriftstudio79@gmail.com
          </a>
        </p>
      </section>

      <section className="card space-y-3 text-sm leading-relaxed text-mist-300">
        <h2 className="font-display text-2xl text-mist-100">On this device</h2>
        <p>
          There is no account. The harvest log, including any photo you attach, the daily card scores, streaks, and the advertising-notice flag stay in this browser&apos;s local storage. Export is a CSV you download yourself. Soul Healing Studios does not receive that book and does not run a leaderboard.
        </p>
      </section>

      <section className="card space-y-3 text-sm leading-relaxed text-mist-300">
        <h2 className="font-display text-2xl text-mist-100">Location</h2>
        <p>
          Today can use this device&apos;s location when you tap &quot;Use my location.&quot; The coordinates are sent to Open-Meteo to request the forecast for that spot, and they are used on the device to compute solunar times. Dawn Patrol does not keep a location history.
        </p>
        <p>
          If you decline, or if the request times out, the spot stays Hermann, Missouri (38.7042, -91.4371). You can return to that spot with the Hermann button.
        </p>
        <p>
          Advertising partners do not receive a location you saved with us, because we do not store one. If ads are enabled, Google may still infer a coarse location from your IP address or, on an Android app, from the advertising ID and device settings, under Google&apos;s own policy.
        </p>
      </section>

      <section className="card space-y-3 text-sm leading-relaxed text-mist-300">
        <h2 className="font-display text-2xl text-mist-100">Advertising</h2>
        <p>
          The website uses Google AdSense when a publisher id and ad unit are configured. An Android build on Google Play may use Google AdMob as well as, or instead of, those web units. Until that configuration is present, the production app shows no ad units.
        </p>
        <p>
          Google may set or read cookies, including cookies that measure an ad and limit how often you see it, and on a mobile app may use the device advertising ID. Ads may be personalized from activity on this app and on other sites and apps that use Google services, or they may be non-personalized, depending on your settings and, where the law requires it, your consent.
        </p>
        <p>Soul Healing Studios does not sell personal information.</p>
        <h3 className="font-medium text-mist-100">Opt out of personalized ads</h3>
        <ul className="space-y-2">
          <li>
            <Out href="https://adssettings.google.com/">Google Ads Settings</Out>
          </li>
          <li>
            <Out href="https://myadcenter.google.com/">My Ad Center</Out>
          </li>
          <li>
            <Out href="https://policies.google.com/technologies/ads">How Google uses advertising cookies and IDs</Out>
          </li>
          <li>
            <Out href="https://policies.google.com/technologies/partner-sites">How Google uses information from partner sites and apps</Out>
          </li>
          <li>
            <Out href="https://optout.networkadvertising.org/">Network Advertising Initiative opt-out</Out>
          </li>
          <li>
            <Out href="https://optout.aboutads.info/">Digital Advertising Alliance opt-out</Out>
          </li>
          <li>
            <Out href="https://youradchoices.com/appchoices">AppChoices, for mobile apps</Out>
          </li>
          <li>
            <Out href="https://www.youronlinechoices.eu/">Your Online Choices, for Europe</Out>
          </li>
        </ul>
        <p>
          On Android, open Settings, then Google, then Ads, or Settings, then Privacy, then Ads. Delete the advertising ID or turn off ad personalization. The menu names differ by Android version.
        </p>
        <p>
          On an iPhone, use Settings, then Privacy &amp; Security, then Tracking, plus the cookie controls in Safari. A home-screen install uses that browser&apos;s cookie store.
        </p>
      </section>

      <section className="card space-y-3 text-sm leading-relaxed text-mist-300">
        <h2 className="font-display text-2xl text-mist-100">Consent notice</h2>
        <p>
          The first time you open the app, a short notice says that Dawn Patrol is free and may show ads. Dismissing it stores a flag on this device only. That flag is not sent to Soul Healing Studios. Where Google requires its own message, including in the European Economic Area, the United Kingdom, and Switzerland, AdSense or AdMob may show that message before personalized ads. The notice in this app does not replace Google&apos;s message.
        </p>
      </section>

      <section className="card space-y-3 text-sm leading-relaxed text-mist-300">
        <h2 className="font-display text-2xl text-mist-100">Children</h2>
        <p>
          Dawn Patrol is a hunting and fishing tool. It is not directed at children under 13, and Soul Healing Studios does not knowingly collect personal information from them.
        </p>
      </section>

      <section className="card space-y-3 text-sm leading-relaxed text-mist-300">
        <h2 className="font-display text-2xl text-mist-100">Changes</h2>
        <p>
          If this policy changes, the date at the top of this page changes with it. The current version is always at this address.
        </p>
        <p>
          <Link href="/about" className="font-semibold text-blaze-400">
            About Dawn Patrol
          </Link>
        </p>
      </section>
    </div>
  );
}

function Out({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="font-semibold text-blaze-400" href={href} target="_blank" rel="noreferrer">
      {children} ↗
    </a>
  );
}
