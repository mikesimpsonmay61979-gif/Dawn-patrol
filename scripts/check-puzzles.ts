import { QUARRIES } from "../src/data/quarries";
import { SEASONS } from "../src/data/seasons";
import { addDays } from "../src/lib/dates";
import { buildDaily, buildDrift } from "../src/lib/game";
import { entriesToCsv } from "../src/lib/log";
import { seasonPill } from "../src/lib/seasons";
import { moonAltitude, moonInfo } from "../src/lib/solunar";

const ids = new Set<string>();
for (const quarry of QUARRIES) {
  if (ids.has(quarry.id)) throw new Error(`duplicate quarry ${quarry.id}`);
  ids.add(quarry.id);
  for (const [group, options, score] of [
    ["spots", quarry.spots, quarry.scoreSpots],
    ["plays", quarry.plays, quarry.scorePlays],
    ["windows", quarry.windows, quarry.scoreWindows],
  ] as const) {
    const optionIds = new Set(options.map((option) => option.id));
    if (optionIds.size !== options.length) throw new Error(`${quarry.id} ${group} duplicate ids`);
    const sample = buildDaily("2026-10-13").conditions;
    sample.quarryId = quarry.id;
    const scores = score(sample);
    for (const id of optionIds) {
      if (!scores[id]) throw new Error(`${quarry.id} ${group} missing score ${id}`);
    }
    for (const key of Object.keys(scores)) {
      if (!optionIds.has(key)) throw new Error(`${quarry.id} ${group} extra score ${key}`);
    }
  }
}

const seen = new Map<string, Set<number>>();
for (let day = 0; day < 90; day++) {
  const date = addDays("2026-01-15", day);
  const first = buildDaily(date);
  const second = buildDaily(date);
  if (JSON.stringify(first.spots.map((o) => o.id)) !== JSON.stringify(second.spots.map((o) => o.id))) {
    throw new Error(`daily not stable ${date}`);
  }
  for (const [name, options, scores] of [
    ["spots", first.spots, first.scores.spots],
    ["plays", first.plays, first.scores.plays],
    ["windows", first.windows, first.scores.windows],
  ] as const) {
    if (options.length !== 3) throw new Error(`${date} ${name} count`);
    const unique = new Set(options.map((option) => option.id));
    if (unique.size !== 3) throw new Error(`${date} ${name} repeats`);
    const shownMax = Math.max(...options.map((option) => scores[option.id].points));
    const allMax = Math.max(...Object.values(scores).map((score) => score.points));
    if (shownMax !== allMax || allMax !== 3) throw new Error(`${date} ${first.quarry.id} ${name} max ${shownMax}/${allMax}`);
  }
  const bestIndex = first.spots.findIndex(
    (option) => first.scores.spots[option.id].points === 3,
  );
  const key = first.quarry.id;
  const bucket = seen.get(key) ?? new Set<number>();
  bucket.add(bestIndex);
  seen.set(key, bucket);
}

const oct = buildDaily("2026-10-13");
console.log("Oct 13", oct.quarry.name, oct.scene);
console.log(
  "spots",
  oct.spots.map((option) => `${option.label}:${oct.scores.spots[option.id].points}`).join(" | "),
);

const phase = moonInfo(new Date(Date.UTC(2000, 0, 6, 18, 14, 0)));
if (phase.age > 0.05) throw new Error(`new moon epoch drifted ${phase.age}`);
const alt = moonAltitude(Date.UTC(2026, 9, 13, 12, 0, 0), 38.7, -91.44);
if (alt < -90 || alt > 90 || Number.isNaN(alt)) throw new Error(`bad altitude ${alt}`);

const deer = SEASONS.find((season) => season.id === "deer-archery");
const turkey = SEASONS.find((season) => season.id === "turkey-fall-firearms");
const teal = SEASONS.find((season) => season.id === "teal");
if (!deer || seasonPill(deer, "2026-10-13") !== "open") throw new Error("archery should be open");
if (!turkey || seasonPill(turkey, "2026-10-13") !== "check-county") throw new Error("fall turkey should check county");
if (!teal || seasonPill(teal, "2026-10-13") !== "closed") throw new Error("teal should be closed");

const csv = entriesToCsv([
  {
    id: "1",
    kind: "catch",
    species: 'Channel "cat"',
    date: "2026-10-13",
    location: "Gasconade, below Hermann",
    count: 2,
    notes: "line one\nline two",
    createdAt: "2026-10-13T00:00:00.000Z",
  },
]);
if (!csv.includes('"Channel ""cat"""')) throw new Error("csv quote escape failed");
if (!csv.startsWith("\uFEFF")) throw new Error("csv missing bom");

const driftA = buildDrift("2026-10-13", "a");
const driftB = buildDrift("2026-10-13", "b");
if (driftA.scene === driftB.scene && driftA.quarry.id === driftB.quarry.id) {
  console.log("note: two drifts collided, salts still differ in options?");
}
console.log("altitude sample", alt.toFixed(1));
console.log("best-index spread", [...seen.entries()].map(([id, set]) => `${id}:${[...set].join(",")}`).join(" "));
console.log("ok");
