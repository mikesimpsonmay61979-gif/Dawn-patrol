export type Kind = "fish" | "hunt";

export type Sky = "clear" | "partly" | "overcast" | "storm";
export type Trend = "rising" | "steady" | "falling";
export type Water = "clear" | "stained" | "muddy";
export type Stage = "low" | "stable" | "rising";
export type MoonName = "new" | "crescent" | "quarter" | "gibbous" | "full";
export type Peak = "dawn" | "morning" | "midday" | "dusk" | "night";
export type Ground = "dry" | "damp" | "flooded";
export type WindDir = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

export type Conditions = {
  quarryId: string;
  month: number;
  tempF: number;
  windMph: number;
  windFrom: WindDir;
  sky: Sky;
  pressure: Trend;
  water: Water;
  stage: Stage;
  moon: MoonName;
  peak: Peak;
  ground: Ground;
  place: string;
};

export type Scored = { points: 0 | 1 | 2 | 3; why: string };

export type Option = {
  id: string;
  label: string;
  detail: string;
  tell: string;
};

export type ScoreMap = Record<string, Scored>;

export type Quarry = {
  id: string;
  name: string;
  kind: Kind;
  spots: Option[];
  plays: Option[];
  windows: Option[];
  scoreSpots: (c: Conditions) => ScoreMap;
  scorePlays: (c: Conditions) => ScoreMap;
  scoreWindows: (c: Conditions) => ScoreMap;
};

export function scored(points: 0 | 1 | 2 | 3, why: string): Scored {
  return { points, why };
}
