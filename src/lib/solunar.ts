/**
 * Solunar periods from a low-precision moon position (Meeus-style short series).
 * Good to a fraction of an hour, which is inside the width of a major period.
 * This is a planning aid, not a nautical almanac.
 */

const DEG = Math.PI / 180;
const SYNODIC = 29.53058867;
const KNOWN_NEW = Date.UTC(2000, 0, 6, 18, 14, 0);
const HORIZON = -0.55;

export type MoonInfo = {
  age: number;
  illumination: number;
  name: string;
  waxing: boolean;
  phase: number;
};

export type SolunarPeriod = {
  kind: "major" | "minor";
  label: "Overhead" | "Underfoot" | "Moonrise" | "Moonset";
  start: Date;
  end: Date;
};

function norm(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function sinD(d: number): number {
  return Math.sin(d * DEG);
}

function cosD(d: number): number {
  return Math.cos(d * DEG);
}

export function julianDate(ms: number): number {
  return ms / 86_400_000 + 2_440_587.5;
}

export function moonEquatorial(ms: number): { ra: number; dec: number } {
  const d = julianDate(ms) - 2_451_545.0;
  const L = norm(218.316 + 13.176396 * d);
  const M = norm(134.963 + 13.064993 * d);
  const F = norm(93.272 + 13.22935 * d);
  const lon = norm(L + 6.289 * sinD(M));
  const lat = 5.128 * sinD(F);
  const eps = 23.4393 - 0.0000004 * d;
  const ra = Math.atan2(sinD(lon) * cosD(eps) - Math.tan(lat * DEG) * sinD(eps), cosD(lon)) * (180 / Math.PI);
  const dec =
    Math.asin(sinD(lat) * cosD(eps) + cosD(lat) * sinD(eps) * sinD(lon)) * (180 / Math.PI);
  return { ra: norm(ra), dec };
}

function gmst(ms: number): number {
  const d = julianDate(ms) - 2_451_545.0;
  return norm(280.46061837 + 360.98564736629 * d);
}

export function moonAltitude(ms: number, lat: number, lon: number): number {
  const { ra, dec } = moonEquatorial(ms);
  const lst = norm(gmst(ms) + lon);
  let ha = norm(lst - ra);
  if (ha > 180) ha -= 360;
  return (
    Math.asin(sinD(lat) * sinD(dec) + cosD(lat) * cosD(dec) * cosD(ha)) * (180 / Math.PI)
  );
}

export function moonInfo(date: Date): MoonInfo {
  let age = ((date.getTime() - KNOWN_NEW) / 86_400_000) % SYNODIC;
  if (age < 0) age += SYNODIC;
  const illumination = (1 - Math.cos((2 * Math.PI * age) / SYNODIC)) / 2;
  const waxing = age < SYNODIC / 2;
  let name = "New";
  if (age < 1.85) name = "New";
  else if (age < 5.54) name = "Waxing crescent";
  else if (age < 9.23) name = "First quarter";
  else if (age < 12.91) name = "Waxing gibbous";
  else if (age < 16.61) name = "Full";
  else if (age < 20.3) name = "Waning gibbous";
  else if (age < 23.99) name = "Last quarter";
  else if (age < 27.68) name = "Waning crescent";
  return { age, illumination, name, waxing, phase: age / SYNODIC };
}

export function localDayStart(now: Date, utcOffsetSeconds: number): Date {
  const localMs = now.getTime() + utcOffsetSeconds * 1000;
  const local = new Date(localMs);
  const startUtc =
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) -
    utcOffsetSeconds * 1000;
  return new Date(startUtc);
}

export function solunarPeriods(
  dayStart: Date,
  lat: number,
  lon: number,
): SolunarPeriod[] {
  const start = dayStart.getTime();
  const end = start + 86_400_000;
  const step = 10 * 60 * 1000;
  const samples: { t: number; alt: number }[] = [];
  for (let t = start - 3 * 3_600_000; t <= start + 27 * 3_600_000; t += step) {
    samples.push({ t, alt: moonAltitude(t, lat, lon) });
  }

  let max = samples[0];
  let min = samples[0];
  const rises: number[] = [];
  const sets: number[] = [];
  for (let i = 1; i < samples.length; i++) {
    const current = samples[i];
    const prev = samples[i - 1];
    if (current.alt > max.alt) max = current;
    if (current.alt < min.alt) min = current;
    if (prev.alt < HORIZON && current.alt >= HORIZON && current.alt !== prev.alt) {
      const f = (HORIZON - prev.alt) / (current.alt - prev.alt);
      rises.push(prev.t + f * (current.t - prev.t));
    } else if (prev.alt >= HORIZON && current.alt < HORIZON && current.alt !== prev.alt) {
      const f = (prev.alt - HORIZON) / (prev.alt - current.alt);
      sets.push(prev.t + f * (current.t - prev.t));
    }
  }

  const periods: SolunarPeriod[] = [
    period("major", "Overhead", max.t, 60),
    period("major", "Underfoot", min.t, 60),
    ...rises.map((t) => period("minor", "Moonrise", t, 30)),
    ...sets.map((t) => period("minor", "Moonset", t, 30)),
  ];

  return periods
    .filter((item) => item.end.getTime() > start && item.start.getTime() < end)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

function period(
  kind: SolunarPeriod["kind"],
  label: SolunarPeriod["label"],
  center: number,
  halfMinutes: number,
): SolunarPeriod {
  const half = halfMinutes * 60 * 1000;
  return { kind, label, start: new Date(center - half), end: new Date(center + half) };
}

export function periodActive(periods: SolunarPeriod[], now: Date, kind?: SolunarPeriod["kind"]): boolean {
  const t = now.getTime();
  return periods.some((period) => {
    if (kind && period.kind !== kind) return false;
    return t >= period.start.getTime() && t <= period.end.getTime();
  });
}

export function nearestDawnMajor(periods: SolunarPeriod[], sunrise: Date): SolunarPeriod | null {
  const majors = periods.filter((period) => period.kind === "major");
  if (!majors.length) return null;
  return majors.reduce((best, period) => {
    const bestDelta = Math.abs(best.start.getTime() - sunrise.getTime());
    const delta = Math.abs(period.start.getTime() - sunrise.getTime());
    return delta < bestDelta ? period : best;
  });
}
