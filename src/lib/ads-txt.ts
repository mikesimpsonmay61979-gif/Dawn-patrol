import { adsensePublisherId } from "@/lib/ads";

const GOOGLE_CERT = "f08c47fec0942fa0";

const RECORD =
  /^(?:#.*|[a-z0-9.-]+,\s*[^,\s]+,\s*(?:DIRECT|RESELLER)(?:,\s*[a-f0-9]{16})?)$/i;

/**
 * Body for /ads.txt and /app-ads.txt.
 * `ADS_TXT` wins when it contains at least one valid line.
 * Otherwise a real Google record is emitted from NEXT_PUBLIC_ADSENSE_CLIENT.
 * With neither, the response is a comment-only placeholder.
 */
export function buildAdsTxt(): string {
  const override = sanitizeAdsTxt(process.env.ADS_TXT);
  if (override) return override;

  const publisher = adsensePublisherId();
  if (publisher) {
    return `google.com, ${publisher}, DIRECT, ${GOOGLE_CERT}\n`;
  }

  return [
    "# Dawn Patrol ads.txt placeholder",
    "# Served at /ads.txt and /app-ads.txt.",
    "# This file does not authorize a seller until a Google publisher id is set.",
    "#",
    "# Set NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-################ to publish:",
    `#   google.com, pub-################, DIRECT, ${GOOGLE_CERT}`,
    "#",
    "# Or set ADS_TXT to the full file (one record per line) when you need",
    "# extra sellers. Google's certification authority id is " + GOOGLE_CERT + ".",
    "# See docs/PLAY_STORE_ADS.md and the README.",
    "",
  ].join("\n");
}

export function adsTxtResponse(): Response {
  return new Response(buildAdsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function sanitizeAdsTxt(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && RECORD.test(line));
  if (lines.length === 0) return undefined;
  return `${lines.join("\n")}\n`;
}
