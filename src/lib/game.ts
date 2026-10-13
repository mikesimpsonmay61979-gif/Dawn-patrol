import {
  FISH_PLACES,
  HUNT_PLACES,
  MONTH_POOL,
  QUARRIES,
  QUARRY_BY_ID,
} from "@/data/quarries";
import { addDays, prettyDate } from "@/lib/dates";
import type { Conditions, Ground, Kind, MoonName, Option, Peak, Quarry, Scored, ScoreMap, Sky, Stage, Trend, Water, WindDir } from "@/lib/game-types";

export type Puzzle = {
  id: string;
  date: string;
  mode: "daily" | "watch" | "drift";
  quarry: Quarry;
  conditions: Conditions;
  scene: string;
  spots: Option[];
  plays: Option[];
  windows: Option[];
  scores: {
    spots: ScoreMap;
    plays: ScoreMap;
    windows: ScoreMap;
  };
};

export type Picks = {
  spot: string;
  play: string;
  window: string;
};

export type SavedPlay = {
  date: string;
  mode: "daily" | "watch" | "drift";
  score: number;
  quarryId: string;
  quarryName: string;
  kind: Kind;
  picks: Picks;
  parts: [number, number, number];
  salt?: string;
};

export type GameSave = {
  lastPlayed: string | null;
  streak: number;
  bestStreak: number;
  history: SavedPlay[];
  watches: SavedPlay[];
  drifts: SavedPlay[];
};

export const GAME_KEY = "dawn-patrol-game";

const SKIES: Sky[] = ["clear", "partly", "overcast", "storm"];
const TRENDS: Trend[] = ["rising", "steady", "falling"];
const WATERS: Water[] = ["clear", "stained", "muddy"];
const STAGES: Stage[] = ["low", "stable", "rising"];
const MOONS: MoonName[] = ["new", "crescent", "quarter", "gibbous", "full"];
const PEAKS: Peak[] = ["dawn", "morning", "midday", "dusk", "night"];
const WINDS: WindDir[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

const TEMP_BASE = [34, 38, 48, 58, 68, 78, 84, 82, 74, 60, 48, 38];

export function emptySave(): GameSave {
  return { lastPlayed: null, streak: 0, bestStreak: 0, history: [], watches: [], drifts: [] };
}

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function pickIndex<T>(rng: () => number, list: T[]): T {
  return list[Math.floor(rng() * list.length)];
}

export function buildDaily(date: string): Puzzle {
  return buildPuzzle(date, "", "daily", "any");
}

export function buildWatch(date: string): Puzzle {
  const daily = buildDaily(date);
  const kind: Kind = daily.quarry.kind === "fish" ? "hunt" : "fish";
  return buildPuzzle(date, "watch", "watch", kind);
}

export function buildDrift(date: string, salt: string): Puzzle {
  return buildPuzzle(date, `drift:${salt}`, "drift", "any");
}

export function buildPuzzle(
  date: string,
  salt: string,
  mode: Puzzle["mode"],
  kind: Kind | "any",
): Puzzle {
  const rng = mulberry32(hashString(salt ? `${date}:${salt}` : date));
  const month = Number(date.slice(5, 7));
  const pool = (MONTH_POOL[month] ?? MONTH_POOL[10]).filter((id) => {
    if (kind === "any") return true;
    return QUARRY_BY_ID[id]?.kind === kind;
  });
  const usable = pool.length ? pool : QUARRIES.filter((q) => kind === "any" || q.kind === kind).map((q) => q.id);
  const quarry = QUARRY_BY_ID[pickIndex(rng, usable)];
  const places = quarry.kind === "fish" ? FISH_PLACES : HUNT_PLACES;
  const place = pickIndex(rng, places);
  const conditions = rollConditions(rng, month, quarry.id, place);
  const scores = {
    spots: quarry.scoreSpots(conditions),
    plays: quarry.scorePlays(conditions),
    windows: quarry.scoreWindows(conditions),
  };
  return {
    id: salt ? `${date}:${salt}` : date,
    date,
    mode,
    quarry,
    conditions,
    scene: writeScene(quarry, conditions),
    spots: pickThree(quarry.spots, scores.spots, rng),
    plays: pickThree(quarry.plays, scores.plays, rng),
    windows: pickThree(quarry.windows, scores.windows, rng),
    scores,
  };
}

function rollConditions(rng: () => number, month: number, quarryId: string, place: string): Conditions {
  const tempF = clamp(TEMP_BASE[month - 1] + randInt(rng, -10, 12), 18, 98);
  let windMph = randInt(rng, 2, 22);
  const windFrom = pickIndex(rng, WINDS);
  let sky = pickIndex(rng, SKIES);
  let pressure = pickIndex(rng, TRENDS);
  let water = pickIndex(rng, WATERS);
  let stage = pickIndex(rng, STAGES);
  const moon = pickIndex(rng, MOONS);
  const peak = pickIndex(rng, PEAKS);
  let ground: Ground = "damp";

  if (sky === "storm") {
    pressure = "falling";
    windMph = Math.max(windMph, 14);
    if (rng() < 0.75) stage = "rising";
    if (rng() < 0.8) water = rng() < 0.5 ? "muddy" : "stained";
    ground = "flooded";
  } else if (stage === "rising" && rng() < 0.7) {
    water = rng() < 0.6 ? "muddy" : "stained";
    ground = "flooded";
  } else if (stage === "low" && sky === "clear") {
    water = rng() < 0.65 ? "clear" : "stained";
    ground = "dry";
  } else {
    ground = sky === "clear" ? "dry" : "damp";
  }

  return {
    quarryId,
    month,
    tempF,
    windMph,
    windFrom,
    sky,
    pressure,
    water,
    stage,
    moon,
    peak,
    ground,
    place,
  };
}

function writeScene(quarry: Quarry, c: Conditions): string {
  const glass =
    c.pressure === "falling" ? "Glass falling." : c.pressure === "rising" ? "Glass rising." : "Glass steady.";
  const sky = { clear: "clear", partly: "partly cloudy", overcast: "overcast", storm: "stormy" }[c.sky];
  const place = c.place.charAt(0).toUpperCase() + c.place.slice(1);
  if (quarry.kind === "fish") {
    const stage = c.stage === "rising" ? "coming up" : c.stage === "low" ? "low" : "holding";
    return `${place}. ${c.tempF}°, ${sky}, wind ${c.windFrom} ${c.windMph}. Water is ${c.water} and ${stage}. ${glass} Solunar peak at ${c.peak}.`;
  }
  const ground =
    c.ground === "flooded" ? "The bottoms are wet." : c.ground === "dry" ? "The woods are dry." : "Leaf litter is damp.";
  return `${place}. ${c.tempF}°, ${sky}, wind ${c.windFrom} ${c.windMph}. ${ground} ${glass} Moon ${c.moon}, solunar peak at ${c.peak}.`;
}

export function pickThree(options: Option[], scores: ScoreMap, rng: () => number): Option[] {
  const ranked = [...options].sort(
    (a, b) => (scores[b.id]?.points ?? 0) - (scores[a.id]?.points ?? 0) || a.id.localeCompare(b.id),
  );
  const best = ranked[0];
  const minPts = Math.min(...options.map((option) => scores[option.id]?.points ?? 0));
  const traps = ranked.filter((option) => option.id !== best.id && (scores[option.id]?.points ?? 0) === minPts);
  const trap = traps.length ? traps[Math.floor(rng() * traps.length)] : ranked[ranked.length - 1];
  const rest = ranked.filter((option) => option.id !== best.id && option.id !== trap.id);
  const bestPts = scores[best.id]?.points ?? 0;
  const trapPts = scores[trap.id]?.points ?? 0;
  const between = rest.filter((option) => {
    const points = scores[option.id]?.points ?? 0;
    return points < bestPts && points > trapPts;
  });
  const midPool = between.length ? between : rest;
  const mid = midPool[Math.floor(rng() * midPool.length)] ?? rest[0];
  const chosen: Option[] = [];
  for (const item of [best, mid, trap]) {
    if (item && !chosen.some((option) => option.id === item.id)) chosen.push(item);
  }
  for (const item of ranked) {
    if (chosen.length >= 3) break;
    if (!chosen.some((option) => option.id === item.id)) chosen.push(item);
  }
  for (let i = chosen.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const swap = chosen[i];
    chosen[i] = chosen[j];
    chosen[j] = swap;
  }
  return chosen;
}

export function scorePicks(puzzle: Puzzle, picks: Picks): { total: number; parts: [number, number, number]; reasons: [Scored, Scored, Scored] } {
  const spot = puzzle.scores.spots[picks.spot] ?? { points: 0 as const, why: "That setup isn't on the card." };
  const play = puzzle.scores.plays[picks.play] ?? { points: 0 as const, why: "That play isn't on the card." };
  const window = puzzle.scores.windows[picks.window] ?? { points: 0 as const, why: "That hour isn't on the card." };
  return {
    total: spot.points + play.points + window.points,
    parts: [spot.points, play.points, window.points],
    reasons: [spot, play, window],
  };
}

export function bestOption(options: Option[], scores: ScoreMap): Option {
  return [...options].sort(
    (a, b) => (scores[b.id]?.points ?? 0) - (scores[a.id]?.points ?? 0) || a.id.localeCompare(b.id),
  )[0];
}

export function scoreTitle(score: number): string {
  if (score >= 9) return "Limit";
  if (score >= 7) return "Solid read";
  if (score >= 5) return "Enough to stay";
  if (score >= 3) return "Skunk nearby";
  return "Coffee won";
}

export function square(points: number): string {
  if (points >= 3) return "🟩";
  if (points === 2) return "🟨";
  if (points === 1) return "🟧";
  return "⬛";
}

export function shareText(play: SavedPlay, streak: number): string {
  return [
    `Dawn Patrol · ${prettyDate(play.date)}`,
    play.quarryName,
    `${play.parts.map(square).join("")}  ${play.score}/9`,
    `Streak ${streak}`,
  ].join("\n");
}

export function liveStreak(save: GameSave, today: string): number {
  if (save.lastPlayed === today || save.lastPlayed === addDays(today, -1)) return save.streak;
  return 0;
}

export function recordDaily(save: GameSave, play: SavedPlay): GameSave {
  if (save.history.some((item) => item.date === play.date && item.mode === "daily")) return save;
  const continued = save.lastPlayed === addDays(play.date, -1);
  const streak = continued ? save.streak + 1 : 1;
  return {
    ...save,
    lastPlayed: play.date,
    streak,
    bestStreak: Math.max(save.bestStreak, streak),
    history: [play, ...save.history].slice(0, 120),
  };
}

export function recordWatch(save: GameSave, play: SavedPlay): GameSave {
  if (save.watches.some((item) => item.date === play.date)) return save;
  return { ...save, watches: [play, ...save.watches].slice(0, 60) };
}

export function recordDrift(save: GameSave, play: SavedPlay): GameSave {
  return { ...save, drifts: [play, ...save.drifts].slice(0, 12) };
}

export function loadGame(): GameSave {
  if (typeof window === "undefined") return emptySave();
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return emptySave();
    const parsed = JSON.parse(raw) as Partial<GameSave>;
    return {
      lastPlayed: typeof parsed.lastPlayed === "string" ? parsed.lastPlayed : null,
      streak: typeof parsed.streak === "number" ? parsed.streak : 0,
      bestStreak: typeof parsed.bestStreak === "number" ? parsed.bestStreak : 0,
      history: Array.isArray(parsed.history) ? parsed.history.filter(isPlay) : [],
      watches: Array.isArray(parsed.watches) ? parsed.watches.filter(isPlay) : [],
      drifts: Array.isArray(parsed.drifts) ? parsed.drifts.filter(isPlay) : [],
    };
  } catch {
    return emptySave();
  }
}

export function saveGame(save: GameSave) {
  localStorage.setItem(GAME_KEY, JSON.stringify(save));
}

function isPlay(value: unknown): value is SavedPlay {
  if (!value || typeof value !== "object") return false;
  const play = value as SavedPlay;
  return typeof play.date === "string" && typeof play.score === "number" && Array.isArray(play.parts);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function nudgeFor(puzzle: Puzzle): string {
  const best = bestOption(puzzle.spots, puzzle.scores.spots);
  return best.tell;
}

export function groupLabel(kind: Kind, group: "spot" | "play" | "window"): string {
  if (group === "window") return "When";
  if (kind === "fish") return group === "spot" ? "Water" : "Bait";
  return group === "spot" ? "Cover" : "Play";
}
