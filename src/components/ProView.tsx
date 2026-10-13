"use client";

import { useState } from "react";
import { PLANS, PRO_FEATURES, startCheckout, type PlanId } from "@/lib/billing";
import { usePro } from "@/lib/pro";

export function ProView() {
  const { pro, ready, setPro } = usePro();
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<PlanId | null>(null);

  async function checkout(plan: PlanId) {
    setPending(plan);
    setNotice(null);
    const result = await startCheckout(plan);
    setPending(null);
    if (result.ok) {
      window.location.href = result.url;
      return;
    }
    setNotice(result.message);
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">$4.99 a month · $29.99 a year</p>
        <h1 className="font-display text-4xl leading-none">Dawn Patrol Pro</h1>
        <p className="mt-2 text-sm leading-relaxed text-mist-300">
          The free app is the whole morning: weather, today&apos;s solunar, the daily card, seasons, the starter map, and a 12-entry log. Pro is the part that earns its keep.
        </p>
      </header>

      <div className="grid gap-3">
        {(Object.values(PLANS)).map((plan) => (
          <article key={plan.id} className={`card ${plan.id === "yearly" ? "border-dawn-400/50" : ""}`}>
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl">{plan.name}</h2>
              {plan.id === "yearly" ? <span className="pill pill-most-waters">Best value</span> : null}
            </div>
            <p className="font-display nums mt-1 text-4xl">
              {plan.price} <span className="text-base text-mist-500">{plan.cadence}</span>
            </p>
            <p className="mt-1 text-sm text-mist-300">{plan.blurb}</p>
            <button
              type="button"
              className="btn btn-blaze mt-3 w-full"
              onClick={() => checkout(plan.id)}
              disabled={pending !== null}
            >
              {pending === plan.id ? "Checking…" : `Choose ${plan.price}`}
            </button>
          </article>
        ))}
      </div>
      {notice ? <p className="card text-sm leading-relaxed text-mist-300">{notice}</p> : null}

      <section className="card">
        <h2 className="font-display text-2xl">What Pro changes</h2>
        <ul className="mt-3 space-y-3">
          {PRO_FEATURES.map((feature) => (
            <li key={feature.title}>
              <p className="font-medium">{feature.title}</p>
              <p className="text-sm text-mist-300">{feature.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">Try it on this phone</h2>
            <p className="mt-1 text-sm text-mist-300">
              A local demo switch. It does not bill anyone, and it does not leave this browser.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={ready && pro}
            className={`switch ${ready && pro ? "is-on" : ""}`}
            onClick={() => setPro(!pro)}
          >
            <span />
            <span className="sr-only">{pro ? "Turn Pro off" : "Unlock Pro on this phone"}</span>
          </button>
        </div>
        {ready && pro ? (
          <p className="mt-3 text-sm text-dawn-300">Pro is unlocked here. A real subscription is not active.</p>
        ) : (
          <p className="mt-3 text-sm text-mist-500">Off. The free app is what you have.</p>
        )}
      </section>

      <section className="text-xs leading-relaxed text-mist-500">
        Payments are not connected. When they are, checkout will be a Stripe subscription using the price ids in the server route. No card form lives in this app.
      </section>
    </div>
  );
}
