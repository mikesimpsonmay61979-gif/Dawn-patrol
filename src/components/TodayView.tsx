"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MoonDisc } from "@/components/MoonDisc";
import { formatClock, formatWhen, prettyNow } from "@/lib/dates";
import { compass, skyBand, weatherLabel } from "@/lib/format";
import { usePro } from "@/lib/pro";
import { coarseDawnRating, rateConditions } from "@/lib/rating";
import {
  localDayStart,
  moonInfo,
  nearestDawnMajor,
  solunarPeriods,
  type SolunarPeriod,
} from "@/lib/solunar";
import {
  fetchForecast,
  HERMANN,
  nearestIndex,
  parseLocalTime,
  placeLabel,
  pressureRead,
  type Forecast,
} from "@/lib/weather";

type Spot = { lat: number; lon: number; gps: boolean };

export function TodayView() {
  const { pro, ready } = usePro();
  const [mounted, setMounted] = useState(false);
  const [spot, setSpot] = useState<Spot>({ ...HERMANN, gps: false });
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [geoNote, setGeoNote] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchForecast(spot.lat, spot.lon)
      .then((data) => {
        if (!cancelled) setForecast(data);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Weather didn't load.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mounted, spot.lat, spot.lon, attempt]);

  async function locate() {
    setLocating(true);
    setGeoNote(null);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("unavailable"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 10 * 60 * 1000,
        });
      });
      setSpot({ lat: position.coords.latitude, lon: position.coords.longitude, gps: true });
    } catch {
      setGeoNote("Stayed on Hermann. Location was blocked or timed out.");
    } finally {
      setLocating(false);
    }
  }

  if (!mounted || (loading && !forecast)) return <TodaySkeleton />;

  return (
    <div className="space-y-4">
      {error && !forecast ? (
        <div className="card">
          <p className="font-display text-2xl">Weather is out.</p>
          <p className="mt-2 text-sm text-mist-300">{error} Hermann is still the home water when it comes back.</p>
          <button type="button" className="btn btn-blaze mt-4" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </button>
        </div>
      ) : null}

      {forecast ? (
        <ForecastBody
          forecast={forecast}
          spot={spot}
          locating={locating}
          geoNote={geoNote}
          pro={ready && pro}
          onLocate={locate}
          onHermann={() => setSpot({ ...HERMANN, gps: false })}
        />
      ) : null}
    </div>
  );
}

function ForecastBody({
  forecast,
  spot,
  locating,
  geoNote,
  pro,
  onLocate,
  onHermann,
}: {
  forecast: Forecast;
  spot: Spot;
  locating: boolean;
  geoNote: string | null;
  pro: boolean;
  onLocate: () => void;
  onHermann: () => void;
}) {
  const now = new Date();
  const zone = forecast.timezone || "America/Chicago";
  const todayIndex = forecastDayIndex(forecast, now);
  const sunrise = parseLocalTime(forecast.daily.sunrise[todayIndex], forecast.utcOffsetSeconds);
  const sunset = parseLocalTime(forecast.daily.sunset[todayIndex], forecast.utcOffsetSeconds);
  const dayStart = localDayStart(now, forecast.utcOffsetSeconds);
  const periods = solunarPeriods(dayStart, spot.lat, spot.lon);
  const moon = moonInfo(now);
  const pressure = pressureRead(forecast, now);
  const ratings = rateConditions({
    now,
    timeZone: zone,
    tempF: forecast.current.tempF,
    windMph: forecast.current.windMph,
    cloud: forecast.current.cloud,
    pressure: pressure.label,
    pressureDelta: pressure.delta,
    sunrise,
    sunset,
    moon,
    periods,
  });
  const band = heroBand(now, sunrise, sunset, forecast.current.weatherCode);
  const days = weekDays(forecast, spot.lat, spot.lon, todayIndex);
  const arrow = pressure.label === "rising" ? "↑" : pressure.label === "falling" ? "↓" : "→";

  return (
    <>
      <section className={`dawn-hero dawn-hero-${band}`}>
        <div className="dawn-hero-body">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">{placeLabel(spot.lat, spot.lon, spot.gps)}</p>
              <p className="mt-1 text-sm text-white/85">{prettyNow(now, zone)}</p>
            </div>
            <button type="button" className="btn btn-ghost btn-tiny" onClick={spot.gps ? onHermann : onLocate}>
              {locating ? "Locating…" : spot.gps ? "Hermann" : "Use my location"}
            </button>
          </div>
          <div className="mt-6 flex items-end justify-between gap-3">
            <div>
              <p className="font-display nums text-7xl leading-none tracking-tight">
                {Math.round(forecast.current.tempF)}°
              </p>
              <p className="mt-1 text-lg">{weatherLabel(forecast.current.weatherCode)}</p>
              <p className="text-sm text-white/75">Feels {Math.round(forecast.current.apparentF)}°</p>
            </div>
            <dl className="space-y-1 text-right text-sm">
              <div>
                <dt className="sr-only">Wind</dt>
                <dd>
                  {compass(forecast.current.windDeg)} {Math.round(forecast.current.windMph)} mph
                </dd>
              </div>
              <div>
                <dt className="sr-only">Gust</dt>
                <dd className="text-white/75">Gust {Math.round(forecast.current.gustMph)}</dd>
              </div>
              <div>
                <dt className="sr-only">Barometric pressure</dt>
                <dd>
                  {pressure.inHg.toFixed(2)} in {arrow} {pressure.label}
                </dd>
              </div>
              <div>
                <dt className="sr-only">Humidity</dt>
                <dd className="text-white/75">{forecast.current.humidity}% humidity</dd>
              </div>
            </dl>
          </div>
          {geoNote ? <p className="mt-3 text-xs text-white/80">{geoNote}</p> : null}
        </div>
        <Ridge />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <RatingCard label="Bite" rating={ratings.bite} />
        <RatingCard label="Move" rating={ratings.move} />
      </section>
      <p className="px-1 text-xs leading-relaxed text-mist-500">
        A field estimate from wind, the glass, light, and the moon. Fish and deer don&apos;t sign contracts.
      </p>

      <section className="card grid grid-cols-2 gap-3">
        <div>
          <p className="eyebrow">Sunrise</p>
          <p className="font-display mt-1 text-2xl">{formatClock(forecast.daily.sunrise[todayIndex])}</p>
        </div>
        <div>
          <p className="eyebrow">Sunset</p>
          <p className="font-display mt-1 text-2xl">{formatClock(forecast.daily.sunset[todayIndex])}</p>
        </div>
        <div className="col-span-2 flex items-center gap-3 border-t border-white/8 pt-3">
          <MoonDisc phase={moon.phase} waxing={moon.waxing} />
          <div>
            <p className="font-medium">{moon.name}</p>
            <p className="text-sm text-mist-500">{Math.round(moon.illumination * 100)}% lit · age {moon.age.toFixed(1)} days</p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl">Solunar</h2>
          <p className="text-xs text-mist-500">Major 2 hr · minor 1 hr</p>
        </div>
        <SolunarTrack periods={periods} dayStart={dayStart} now={now} />
        <ul className="mt-3 space-y-2">
          {periods.map((period) => (
            <li key={`${period.label}-${period.start.toISOString()}`} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${period.kind === "major" ? "bg-blaze-500" : "bg-dawn-400"}`} />
                {period.label}
                <span className="text-mist-500">{period.kind}</span>
              </span>
              <span className="nums">
                {formatWhen(period.start, zone)} – {formatWhen(period.end, zone)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-mist-500">
          Computed from the moon&apos;s position for this spot. Close enough to plan a morning, not a tide table.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl">This week</h2>
        <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
          {days.map((day) => (
            <div key={day.date} className="card min-w-[5.6rem] shrink-0 px-3 py-2 text-center">
              <p className="text-xs text-mist-500">{day.weekday}</p>
              <p className="mt-1 text-sm">{day.sky}</p>
              <p className="font-display nums text-xl">{day.high}°</p>
              <p className="text-xs text-mist-500">{day.low}°</p>
            </div>
          ))}
        </div>
        {pro ? (
          <ul className="mt-3 space-y-2">
            {days.map((day) => (
              <li key={`${day.date}-read`} className="card flex items-center justify-between gap-3 py-2">
                <div>
                  <p className="text-sm font-semibold">{day.weekday}</p>
                  <p className="text-xs text-mist-500">{day.major}</p>
                </div>
                <p className="nums text-sm">
                  Bite {day.bite.toFixed(1)} · Move {day.move.toFixed(1)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <Link href="/pro" className="card mt-3 block">
            <p className="eyebrow">Pro read</p>
            <p className="mt-1 font-medium">Seven dawns of bite, move, and the major period.</p>
            <p className="mt-1 text-sm text-blaze-400">Unlock on the Pro page</p>
          </Link>
        )}
      </section>

      {!pro ? (
        <aside className="card border-dashed">
          <p className="eyebrow">Field note</p>
          <p className="mt-1 text-sm leading-relaxed text-mist-300">
            Reserved for a Hermann-area sponsor. Pro hides this strip. Nothing here is a paid ad yet.
          </p>
        </aside>
      ) : null}

      <p className="px-1 text-xs leading-relaxed text-mist-500">
        Weather from Open-Meteo, no key. Home water is Hermann, Missouri, until you share a location.
      </p>
    </>
  );
}

function RatingCard({ label, rating }: { label: string; rating: { score: number; title: string; factors: string[] } }) {
  return (
    <article className="card">
      <p className="eyebrow">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <div
          className="score-ring grid h-[4.6rem] w-[4.6rem] place-items-center rounded-full"
          style={{ ["--p" as string]: String(rating.score / 10) }}
        >
          <div className="grid h-[3.55rem] w-[3.55rem] place-items-center rounded-full bg-timber-950">
            <span className="font-display nums text-xl">{rating.score.toFixed(1)}</span>
          </div>
        </div>
        <div>
          <p className="font-medium leading-tight">{rating.title}</p>
          <ul className="mt-1 space-y-0.5 text-xs text-mist-500">
            {rating.factors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function SolunarTrack({
  periods,
  dayStart,
  now,
}: {
  periods: SolunarPeriod[];
  dayStart: Date;
  now: Date;
}) {
  const start = dayStart.getTime();
  const span = 86_400_000;
  const nowPct = clamp(((now.getTime() - start) / span) * 100, 0, 100);
  return (
    <div className="mt-3">
      <div className="solunar-track" aria-hidden>
        {periods.map((period) => {
          const left = ((period.start.getTime() - start) / span) * 100;
          const width = ((period.end.getTime() - period.start.getTime()) / span) * 100;
          return (
            <span
              key={`${period.label}-${period.start.toISOString()}`}
              className={period.kind === "major" ? "solunar-major" : "solunar-minor"}
              style={{ left: `${clamp(left, 0, 100)}%`, width: `${Math.max(1.2, width)}%` }}
            />
          );
        })}
        <span className="solunar-now" style={{ left: `${nowPct}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-mist-500">
        <span>12a</span>
        <span>6a</span>
        <span>Noon</span>
        <span>6p</span>
        <span>12a</span>
      </div>
    </div>
  );
}

type DayCard = {
  date: string;
  weekday: string;
  sky: string;
  high: number;
  low: number;
  bite: number;
  move: number;
  major: string;
};

function weekDays(forecast: Forecast, lat: number, lon: number, todayIndex: number): DayCard[] {
  const days: DayCard[] = [];
  for (let index = todayIndex; index < forecast.daily.time.length && days.length < 7; index++) {
    const date = forecast.daily.time[index];
    const sunriseStamp = forecast.daily.sunrise[index];
    const sunrise = parseLocalTime(sunriseStamp, forecast.utcOffsetSeconds);
    const dayStart = parseLocalTime(`${date}T00:00`, forecast.utcOffsetSeconds);
    const periods = solunarPeriods(dayStart, lat, lon);
    const major = nearestDawnMajor(periods, sunrise);
    const times = forecast.hourly.time.map((stamp) => parseLocalTime(stamp, forecast.utcOffsetSeconds).getTime());
    const hourIndex = nearestIndex(times, sunrise.getTime());
    const earlier = nearestIndex(times, sunrise.getTime() - 3 * 3_600_000);
    const pressureNow = forecast.hourly.pressureHpa[hourIndex] ?? forecast.current.pressureHpa;
    const pressureThen = forecast.hourly.pressureHpa[earlier] ?? pressureNow;
    const delta = (pressureNow - pressureThen) / 33.8638866667;
    const pressure = delta >= 0.03 ? "rising" : delta <= -0.03 ? "falling" : "steady";
    const moon = moonInfo(sunrise);
    const near =
      major !== null && Math.abs(major.start.getTime() + 60 * 60 * 1000 - sunrise.getTime()) < 90 * 60 * 1000;
    const rated = coarseDawnRating({
      tempF: forecast.hourly.tempF[hourIndex] ?? forecast.daily.tempMax[index],
      windMph: forecast.hourly.windMph[hourIndex] ?? forecast.daily.windMax[index],
      cloud: forecast.hourly.cloud[hourIndex] ?? 40,
      pressure,
      moonIllumination: moon.illumination,
      majorNearSunrise: near,
    });
    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      weekday: "short",
    }).format(new Date(`${date}T00:00:00Z`));
    days.push({
      date,
      weekday: days.length === 0 ? "Today" : weekday,
      sky: shortSky(forecast.daily.weatherCode[index] ?? 0),
      high: Math.round(forecast.daily.tempMax[index] ?? 0),
      low: Math.round(forecast.daily.tempMin[index] ?? 0),
      bite: rated.bite,
      move: rated.move,
      major: major
        ? `${major.label} ${formatWhen(major.start, forecast.timezone)}`
        : "Major period later",
    });
  }
  return days;
}

function forecastDayIndex(forecast: Forecast, now: Date): number {
  const local = new Intl.DateTimeFormat("en-CA", {
    timeZone: forecast.timezone || "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const index = forecast.daily.time.indexOf(local);
  if (index >= 0) return index;
  return Math.min(1, forecast.daily.time.length - 1);
}

function heroBand(now: Date, sunrise: Date, sunset: Date, code: number): string {
  if (skyBand(code) === "storm") return "storm";
  const t = now.getTime();
  const sr = sunrise.getTime();
  const ss = sunset.getTime();
  if (t < sr - 45 * 60 * 1000 || t > ss + 45 * 60 * 1000) return "night";
  if (Math.abs(t - sr) <= 50 * 60 * 1000) return "dawn";
  if (Math.abs(t - ss) <= 50 * 60 * 1000) return "dusk";
  return "day";
}

function shortSky(code: number): string {
  const label = weatherLabel(code);
  if (label === "Mostly clear" || label === "Partly cloudy") return "Partly";
  if (label === "Snow showers") return "Snow";
  return label;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function Ridge() {
  return (
    <svg className="ridge" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden>
      <path d="M0 48 L48 44 L78 28 L112 42 L150 16 L188 38 L230 22 L268 40 L312 26 L352 44 L400 34 L400 80 L0 80 Z" fill="#14241c" />
      <path d="M0 58 L60 52 L96 40 L140 56 L176 38 L220 52 L270 44 L320 58 L370 48 L400 54 L400 80 L0 80 Z" fill="#0c1410" />
    </svg>
  );
}

function TodaySkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="dawn-hero dawn-hero-dawn">
        <div className="dawn-hero-body">
          <div className="skel h-4 w-28" />
          <div className="skel mt-6 h-16 w-32" />
        </div>
        <Ridge />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="skel h-28" />
        <div className="skel h-28" />
      </div>
      <div className="skel h-36" />
    </div>
  );
}
