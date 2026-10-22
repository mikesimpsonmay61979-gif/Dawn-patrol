"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "dawn-patrol-ad-notice";

export function ConsentNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      // Private mode can reject storage. Hide the notice for this view anyway.
    }
    setVisible(false);
  }

  return (
    <aside className="consent-notice" role="region" aria-label="Advertising notice">
      <p className="text-sm leading-relaxed text-mist-300">
        Dawn Patrol is free and may show ads. Google AdSense and AdMob can use cookies and an advertising ID.{" "}
        <Link href="/privacy" className="font-semibold text-blaze-400">
          Privacy
        </Link>
      </p>
      <button type="button" className="btn btn-ghost btn-tiny mt-3" onClick={dismiss}>
        OK
      </button>
    </aside>
  );
}
