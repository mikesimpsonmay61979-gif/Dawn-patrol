import type { Season, SeasonRange } from "@/data/seasons";
import { addDays, daysUntil, monthDay, prettyDate } from "@/lib/dates";

export type SeasonPill = "open" | "closed" | "soon" | "check-county" | "most-waters";

export function rangeContains(range: SeasonRange, iso: string): boolean {
  if (range.type === "dates") return iso >= range.start && iso <= range.end;
  const md = monthDay(iso);
  if (range.start <= range.end) return md >= range.start && md <= range.end;
  return md >= range.start || md <= range.end;
}

export function isInSeason(season: Season, iso: string): boolean {
  return season.ranges.some((range) => rangeContains(range, iso));
}

export function seasonPill(season: Season, iso: string): SeasonPill {
  if (isInSeason(season, iso)) {
    if (season.coverage === "open-counties") return "check-county";
    if (season.coverage === "most-waters") return "most-waters";
    return "open";
  }
  const next = daysUntilNextOpen(season, iso);
  if (next !== null && next <= 35) return "soon";
  return "closed";
}

export function daysUntilNextOpen(season: Season, iso: string): number | null {
  let best: number | null = null;
  for (const range of season.ranges) {
    for (const start of upcomingStarts(range, iso)) {
      const delta = daysUntil(iso, start);
      if (delta > 0 && (best === null || delta < best)) best = delta;
    }
  }
  return best;
}

function upcomingStarts(range: SeasonRange, iso: string): string[] {
  if (range.type === "dates") return [range.start];
  const year = Number(iso.slice(0, 4));
  return [`${year}-${range.start}`, `${year + 1}-${range.start}`];
}

export function formatSeasonWhen(season: Season): string {
  if (season.ranges.length === 1 && isAllYear(season.ranges[0])) return "Open all year";
  return season.ranges.map(formatRange).join(" · ");
}

function isAllYear(range: SeasonRange): boolean {
  return range.type === "annual" && range.start === "01-01" && range.end === "12-31";
}

function formatRange(range: SeasonRange): string {
  if (range.type === "dates") {
    return `${prettyDate(range.start)} – ${prettyDate(range.end)}`;
  }
  const year = 2026;
  const start = `${year}-${range.start}`;
  const endYear = range.start <= range.end ? year : year + 1;
  const end = `${endYear}-${range.end}`;
  return `${prettyDate(start)} – ${prettyDate(end)}`;
}

export function pillLabel(pill: SeasonPill): string {
  switch (pill) {
    case "open":
      return "Open";
    case "closed":
      return "Closed";
    case "soon":
      return "Soon";
    case "check-county":
      return "Check county";
    case "most-waters":
      return "Most waters";
  }
}

export function nextOpenLabel(season: Season, iso: string): string | null {
  const days = daysUntilNextOpen(season, iso);
  if (days === null || isInSeason(season, iso)) return null;
  if (days === 1) return "Opens tomorrow";
  if (days <= 35) return `Opens in ${days} days`;
  return null;
}

export function seasonSortKey(season: Season, iso: string): string {
  const pill = seasonPill(season, iso);
  const rank = pill === "open" || pill === "check-county" || pill === "most-waters" ? "0" : pill === "soon" ? "1" : "2";
  const next = daysUntilNextOpen(season, iso);
  const soon = next === null ? "999" : String(next).padStart(3, "0");
  return `${rank}-${soon}-${season.species}-${season.portion}`;
}

export function addDaysIso(iso: string, days: number): string {
  return addDays(iso, days);
}
