"use client";

import { useEffect, useRef } from "react";
import type { DivIcon, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Place } from "@/data/places";

export function PlacesMap({
  places,
  selectedId,
  onSelect,
}: {
  places: Place[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markers = useRef<Map<string, LeafletMarker>>(new Map());
  const onSelectRef = useRef(onSelect);
  const selectedRef = useRef(selectedId);
  onSelectRef.current = onSelect;
  selectedRef.current = selectedId;

  useEffect(() => {
    let cancelled = false;
    const hostEl = host.current;
    const timers: number[] = [];
    (async () => {
      const leaflet = await import("leaflet");
      if (cancelled || !hostEl || mapRef.current) return;
      const L = leaflet.default;
      const map = L.map(hostEl, { scrollWheelZoom: false }).setView([38.7, -91.55], 9);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 17,
      }).addTo(map);
      const bounds = L.latLngBounds([]);
      places.forEach((place) => {
        const marker = L.marker([place.lat, place.lon], { icon: pinIcon(L, false), keyboard: true })
          .addTo(map)
          .bindPopup(popupHtml(place));
        marker.on("click", () => onSelectRef.current(place.id));
        markers.current.set(place.id, marker);
        bounds.extend([place.lat, place.lon]);
      });
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [28, 28] });
      mapRef.current = map;
      const settle = () => {
        if (cancelled || mapRef.current !== map) return;
        map.invalidateSize();
        const id = selectedRef.current;
        const marker = id ? markers.current.get(id) : undefined;
        if (marker) marker.openPopup();
      };
      requestAnimationFrame(settle);
      timers.push(window.setTimeout(settle, 200));
    })();
    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      mapRef.current?.remove();
      mapRef.current = null;
      markers.current.clear();
    };
  }, [places]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const leaflet = await import("leaflet");
      if (cancelled) return;
      const L = leaflet.default;
      markers.current.forEach((marker, id) => {
        marker.setIcon(pinIcon(L, id === selectedId));
      });
      if (!selectedId || !mapRef.current) return;
      const place = places.find((item) => item.id === selectedId);
      const marker = markers.current.get(selectedId);
      if (!place || !marker) return;
      mapRef.current.flyTo([place.lat, place.lon], Math.max(mapRef.current.getZoom(), 11), { duration: 0.45 });
      marker.openPopup();
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, places]);

  return (
    <div
      ref={host}
      className="map-frame"
      style={{ height: "20.5rem", minHeight: "20.5rem", width: "100%" }}
      role="region"
      aria-label="Map of starter public access"
    />
  );
}

function pinIcon(L: { divIcon: (options: object) => DivIcon }, on: boolean) {
  return L.divIcon({
    className: "dp-pin-wrap",
    html: `<span class="dp-pin${on ? " is-on" : ""}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

function popupHtml(place: Place): string {
  return `<div class="dp-popup"><strong>${escapeHtml(place.name)}</strong><p>${escapeHtml(place.blurb)}</p><p>${escapeHtml(place.kind)} · ${escapeHtml(place.county)} County</p><p><a href="${escapeHtml(place.href)}" target="_blank" rel="noreferrer">Area page</a></p><p>Starter pin, not a boundary.</p></div>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
