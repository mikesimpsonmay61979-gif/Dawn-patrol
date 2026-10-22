"use client";

import dynamic from "next/dynamic";
import { Fragment, useMemo, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { PLACES, WATER_FILTERS, type WaterGroup } from "@/data/places";
import { adSlotRendered } from "@/lib/ads";

const PlacesMap = dynamic(() => import("@/components/PlacesMap").then((mod) => mod.PlacesMap), {
  ssr: false,
  loading: () => <div className="map-frame skel" />,
});

export function PlacesView() {
  const [filter, setFilter] = useState<WaterGroup | "All">("All");
  const [selectedId, setSelectedId] = useState<string | null>(PLACES[0]?.id ?? null);
  const places = useMemo(
    () => (filter === "All" ? PLACES : PLACES.filter((place) => place.water === filter)),
    [filter],
  );

  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">Starter set · not a complete atlas</p>
        <h1 className="font-display text-4xl leading-none">Places</h1>
        <p className="mt-2 text-sm leading-relaxed text-mist-300">
          Real public access along the Missouri near Hermann, plus the Gasconade and the Osage. Pins mark a published point, not the boundary. Floods close ramps. Read the area page before you go.
        </p>
      </header>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {WATER_FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            className={`chip shrink-0 ${filter === item ? "is-on" : ""}`}
            onClick={() => {
              setFilter(item);
              const next = item === "All" ? PLACES : PLACES.filter((place) => place.water === item);
              setSelectedId(next[0]?.id ?? null);
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <PlacesMap key={filter} places={places} selectedId={selectedId} onSelect={setSelectedId} />
      <p className="text-[11px] leading-relaxed text-mist-500">
        Map tiles © OpenStreetMap contributors. Area names and descriptions follow Missouri Department of Conservation and Missouri State Parks pages.
      </p>
      <ul className="space-y-2">
        {places.map((place, index) => {
          const selected = place.id === selectedId;
          return (
            <Fragment key={place.id}>
            <li>
              <button
                type="button"
                onClick={() => setSelectedId(place.id)}
                className={`card w-full text-left ${selected ? "border-blaze-500" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-medium leading-tight">{place.name}</h2>
                  <span className="pill pill-soon shrink-0">{place.water === "Upland" ? "Upland" : "Water"}</span>
                </div>
                <p className="mt-1 text-xs text-mist-500">
                  {place.kind} · {place.county} County · {place.manager}
                </p>
                <p className="mt-1 text-sm text-mist-300">{place.blurb}</p>
                <a
                  className="mt-2 inline-flex text-sm font-semibold text-blaze-400"
                  href={place.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  Area page ↗
                </a>
              </button>
            </li>
            {index === 2 && adSlotRendered("places") ? (
              <li>
                <AdSlot placement="places" />
              </li>
            ) : null}
            </Fragment>
          );
        })}
        {adSlotRendered("places") && places.length > 0 && places.length < 3 ? (
          <li>
            <AdSlot placement="places" />
          </li>
        ) : null}
      </ul>
    </div>
  );
}
