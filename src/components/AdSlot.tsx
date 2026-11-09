"use client";

import { useEffect, useRef } from "react";
import { adsenseClient, adsenseConfigured, adsenseSlot, showAdPlaceholder, type AdPlacement } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

/**
 * In-flow display unit. It never uses a fixed, sticky, or full-screen format.
 * Create the matching AdSense unit as a responsive display ad, not an anchor,
 * vignette, or interstitial.
 */
export function AdSlot({ placement }: { placement: AdPlacement }) {
  const ref = useRef<HTMLModElement>(null);
  const client = adsenseClient();
  const slot = adsenseSlot(placement);
  const live = adsenseConfigured(placement);

  useEffect(() => {
    if (!live) return;
    const node = ref.current;
    if (!node || node.dataset.dpFilled === "1") return;
    node.dataset.dpFilled = "1";
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // A blocked script or a second mount should not take the page down.
    }
  }, [live]);

  if (!live) {
    if (!showAdPlaceholder()) return null;
    return (
      <aside className="ad-slot" role="complementary" aria-label="Advertisement">
        <p className="ad-slot-label">Advertisement</p>
      </aside>
    );
  }

  return (
    <aside className="ad-slot ad-slot-live" role="complementary" aria-label="Advertisement">
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
