const COMPASS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
] as const;

export function compass(degrees: number): string {
  const index = Math.round(degrees / 22.5) % 16;
  return COMPASS[index] ?? "N";
}

export function hpaToInHg(hpa: number): number {
  return hpa / 33.8638866667;
}

/** WMO weather interpretation codes used by Open-Meteo. */
export function weatherLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code === 1) return "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code >= 95) return "Thunder";
  return "Mixed sky";
}

export function skyBand(code: number): "storm" | "clear" | "cloud" {
  if (code >= 61 && code <= 67) return "storm";
  if (code >= 80 && code <= 82) return "storm";
  if (code >= 95) return "storm";
  if (code >= 71 && code <= 77) return "storm";
  if (code === 0 || code === 1) return "clear";
  return "cloud";
}

export function csvEscape(value: string | number): string {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}
