"use client";

import { useEffect, useMemo, useState } from "react";
import { SEASON_DISCLAIMER, SEASON_SOURCES, SEASONS } from "@/data/seasons";
import { missouriDate } from "@/lib/dates";
import { formatSeasonWhen, nextOpenLabel, pillLabel, seasonPill, seasonSortKey, type SeasonPill } from "@/lib/seasons";

type Filter = "all" | "open" | "hunt" | "fish";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open now" },
  { id: "hunt", label: "Hunt" },
  { id: "fish", label: "Fish" },
];

export function SeasonsView() {
  const [today, setToday] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => setToday(missouriDate()), []);

  const rows = useMemo(() => {
    if (!today) return [];
    const needle = query.trim().toLowerCase();
    return SEASONS.filter((season) => {
      if (filter === "hunt" || filter === "fish") {
        if (season.group !== filter) return false;
      }
      if (filter === "open") {
        const pill = seasonPill(season, today);
        if (pill === "closed" || pill === "soon") return false;
      }
      if (!needle) return true;
      return `${season.species} ${season.portion} ${season.note}`.toLowerCase().includes(needle);
    }).sort((a, b) => seasonSortKey(a, today).localeCompare(seasonSortKey(b, today)));
  }, [today, filter, query]);

  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">Missouri · check before you go</p>
        <h1 className="font-display text-4xl leading-none">Seasons</h1>
      </header>
      <div className="card border-dawn-400/40 bg-[#2a2114] text-sm leading-relaxed text-dawn-300">
        {SEASON_DISCLAIMER}
      </div>
      <label className="block">
        <span className="sr-only">Search seasons</span>
        <input
          className="field"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search deer, crappie, middle zone…"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`chip ${filter === item.id ? "is-on" : ""}`}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {!today ? <div className="skel h-40" /> : null}
      <ul className="space-y-3">
        {today
          ? rows.map((season) => {
              const pill = seasonPill(season, today);
              const soon = nextOpenLabel(season, today);
              return (
                <li key={season.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs tracking-wide text-mist-500 uppercase">{season.group}</p>
                      <h2 className="font-display text-2xl leading-tight">{season.species}</h2>
                      <p className="text-sm text-mist-300">{season.portion}</p>
                    </div>
                    <StatusPill pill={pill} />
                  </div>
                  <p className="mt-2 text-sm font-medium">{formatSeasonWhen(season)}</p>
                  {soon ? <p className="text-sm text-sky-200">{soon}</p> : null}
                  <p className="mt-2 text-sm leading-relaxed text-mist-300">{season.note}</p>
                  <a
                    className="mt-3 inline-flex text-sm font-semibold text-blaze-400"
                    href={season.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {season.linkLabel} ↗
                  </a>
                </li>
              );
            })
          : null}
      </ul>
      {today && rows.length === 0 ? (
        <p className="text-sm text-mist-300">Nothing matches. Try a species, or clear the filter.</p>
      ) : null}
      <section className="card text-sm text-mist-300">
        <p className="font-medium text-mist-100">Where these dates came from</p>
        <p className="mt-1 leading-relaxed">
          Transcribed in October 2026 from MDC season pages, the deer and turkey date release, the 2026–27 migratory bird digest, and the fishing summary effective March 1, 2026. Bag limits are left off on purpose.
        </p>
        <ul className="mt-2 space-y-1">
          {SEASON_SOURCES.map((source) => (
            <li key={source.href}>
              <a className="text-blaze-400" href={source.href} target="_blank" rel="noreferrer">
                {source.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StatusPill({ pill }: { pill: SeasonPill }) {
  return <span className={`pill pill-${pill}`}>{pillLabel(pill)}</span>;
}
