import { hpaToInHg } from "@/lib/format";

export const HERMANN = {
  name: "Hermann, MO",
  lat: 38.7042,
  lon: -91.4371,
};

export type Forecast = {
  latitude: number;
  longitude: number;
  timezone: string;
  utcOffsetSeconds: number;
  current: {
    time: string;
    tempF: number;
    apparentF: number;
    humidity: number;
    weatherCode: number;
    cloud: number;
    pressureHpa: number;
    windMph: number;
    windDeg: number;
    gustMph: number;
    precipIn: number;
  };
  hourly: {
    time: string[];
    pressureHpa: number[];
    cloud: number[];
    tempF: number[];
    windMph: number[];
  };
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
    weatherCode: number[];
    tempMax: number[];
    tempMin: number[];
    precip: number[];
    windMax: number[];
  };
};

export type PressureRead = {
  inHg: number;
  delta: number;
  label: "rising" | "steady" | "falling";
};

type MeteoResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset_seconds: number;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    precipitation: number;
  };
  hourly: {
    time: string[];
    pressure_msl: number[];
    cloud_cover: number[];
    temperature_2m: number[];
    wind_speed_10m: number[];
  };
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
  };
};

export async function fetchForecast(lat: number, lon: number): Promise<Forecast> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat.toFixed(4));
  url.searchParams.set("longitude", lon.toFixed(4));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "precipitation",
    ].join(","),
  );
  url.searchParams.set(
    "hourly",
    ["pressure_msl", "cloud_cover", "temperature_2m", "wind_speed_10m"].join(","),
  );
  url.searchParams.set(
    "daily",
    [
      "sunrise",
      "sunset",
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "wind_speed_10m_max",
    ].join(","),
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("past_days", "1");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("precipitation_unit", "inch");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Weather is unavailable right now (${response.status}).`);
  }
  const json = (await response.json()) as MeteoResponse;
  return {
    latitude: json.latitude,
    longitude: json.longitude,
    timezone: json.timezone,
    utcOffsetSeconds: json.utc_offset_seconds,
    current: {
      time: json.current.time,
      tempF: json.current.temperature_2m,
      apparentF: json.current.apparent_temperature,
      humidity: json.current.relative_humidity_2m,
      weatherCode: json.current.weather_code,
      cloud: json.current.cloud_cover,
      pressureHpa: json.current.pressure_msl,
      windMph: json.current.wind_speed_10m,
      windDeg: json.current.wind_direction_10m,
      gustMph: json.current.wind_gusts_10m,
      precipIn: json.current.precipitation,
    },
    hourly: {
      time: json.hourly.time,
      pressureHpa: json.hourly.pressure_msl,
      cloud: json.hourly.cloud_cover,
      tempF: json.hourly.temperature_2m,
      windMph: json.hourly.wind_speed_10m,
    },
    daily: {
      time: json.daily.time,
      sunrise: json.daily.sunrise,
      sunset: json.daily.sunset,
      weatherCode: json.daily.weather_code,
      tempMax: json.daily.temperature_2m_max,
      tempMin: json.daily.temperature_2m_min,
      precip: json.daily.precipitation_sum,
      windMax: json.daily.wind_speed_10m_max,
    },
  };
}

export function parseLocalTime(localIso: string, utcOffsetSeconds: number): Date {
  const [datePart, timePart = "00:00"] = localIso.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm || 0) - utcOffsetSeconds * 1000);
}

export function pressureRead(forecast: Forecast, now = new Date()): PressureRead {
  const times = forecast.hourly.time.map((stamp) =>
    parseLocalTime(stamp, forecast.utcOffsetSeconds).getTime(),
  );
  const nowMs = now.getTime();
  const idx = nearestIndex(times, nowMs);
  const prev = nearestIndex(times, nowMs - 3 * 3_600_000);
  const current = forecast.hourly.pressureHpa[idx] ?? forecast.current.pressureHpa;
  const earlier = forecast.hourly.pressureHpa[prev] ?? current;
  const inHg = hpaToInHg(current);
  const delta = hpaToInHg(current - earlier);
  const label = delta >= 0.03 ? "rising" : delta <= -0.03 ? "falling" : "steady";
  return { inHg, delta, label };
}

export function nearestIndex(times: number[], target: number): number {
  let best = 0;
  let bestDelta = Number.POSITIVE_INFINITY;
  times.forEach((time, index) => {
    const delta = Math.abs(time - target);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = index;
    }
  });
  return best;
}

export function milesBetween(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function placeLabel(lat: number, lon: number, usingGps: boolean): string {
  if (!usingGps) return HERMANN.name;
  const miles = milesBetween({ lat, lon }, HERMANN);
  if (miles < 15) return "Hermann area";
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `GPS ${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lon).toFixed(2)}°${ew}`;
}
