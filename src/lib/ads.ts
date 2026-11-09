export const AD_PLACEMENTS = ["today", "game", "seasons", "places"] as const;

export type AdPlacement = (typeof AD_PLACEMENTS)[number];

const CLIENT_PATTERN = /^ca-pub-\d{16}$/;
const SLOT_PATTERN = /^\d{8,12}$/;

const SLOT_ENV: Record<AdPlacement, string | undefined> = {
  today: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TODAY,
  game: process.env.NEXT_PUBLIC_ADSENSE_SLOT_GAME,
  seasons: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SEASONS,
  places: process.env.NEXT_PUBLIC_ADSENSE_SLOT_PLACES,
};

function clean(value: string | undefined, pattern: RegExp): string | undefined {
  const trimmed = value?.trim() ?? "";
  return pattern.test(trimmed) ? trimmed : undefined;
}

/** `ca-pub-################`. Empty or malformed values count as unset. */
export function adsenseClient(): string | undefined {
  return clean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT, CLIENT_PATTERN);
}

/**
 * Per-placement unit, or `NEXT_PUBLIC_ADSENSE_SLOT` when that placement has none.
 * Digits only, so a bad value cannot be written into the ad tag.
 */
export function adsenseSlot(placement: AdPlacement): string | undefined {
  return clean(SLOT_ENV[placement], SLOT_PATTERN) ?? clean(process.env.NEXT_PUBLIC_ADSENSE_SLOT, SLOT_PATTERN);
}

export function adsenseConfigured(placement: AdPlacement): boolean {
  return Boolean(adsenseClient() && adsenseSlot(placement));
}

/** Development shows a labeled placeholder. Production renders nothing until both ids are set. */
export function showAdPlaceholder(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function adSlotRendered(placement: AdPlacement): boolean {
  return adsenseConfigured(placement) || showAdPlaceholder();
}

/** `pub-################` from `ca-pub-################`, for ads.txt. */
export function adsensePublisherId(client = adsenseClient()): string | undefined {
  if (!client) return undefined;
  const publisher = client.replace(/^ca-/, "");
  return /^pub-\d{16}$/.test(publisher) ? publisher : undefined;
}
