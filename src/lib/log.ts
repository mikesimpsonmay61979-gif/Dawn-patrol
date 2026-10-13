import { csvEscape } from "@/lib/format";

export const LOG_KEY = "dawn-patrol-log";
export const FREE_LOG_LIMIT = 12;

export type LogKind = "catch" | "harvest";

export type LogEntry = {
  id: string;
  kind: LogKind;
  species: string;
  date: string;
  location: string;
  count: number;
  notes: string;
  photo?: string;
  createdAt: string;
};

export const SPECIES_SUGGESTIONS = [
  "White-tailed deer",
  "Wild turkey",
  "Mourning dove",
  "Mallard",
  "Canada goose",
  "Wood duck",
  "Gray squirrel",
  "Fox squirrel",
  "Cottontail",
  "Bobwhite quail",
  "Channel catfish",
  "Blue catfish",
  "Flathead catfish",
  "Largemouth bass",
  "Smallmouth bass",
  "Spotted bass",
  "White crappie",
  "Black crappie",
  "Bluegill",
  "Walleye",
  "Sauger",
  "Rainbow trout",
  "Brown trout",
  "Paddlefish",
  "Freshwater drum",
];

export function emptyDraft(today: string): Omit<LogEntry, "id" | "createdAt"> {
  return {
    kind: "catch",
    species: "",
    date: today,
    location: "",
    count: 1,
    notes: "",
  };
}

function isEntry(value: unknown): value is LogEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as LogEntry;
  return (
    typeof entry.id === "string" &&
    (entry.kind === "catch" || entry.kind === "harvest") &&
    typeof entry.species === "string" &&
    typeof entry.date === "string" &&
    typeof entry.location === "string" &&
    typeof entry.count === "number" &&
    typeof entry.notes === "string"
  );
}

export function loadLog(): LogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEntry).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  } catch {
    return [];
  }
}

export function saveLog(entries: LogEntry[]) {
  localStorage.setItem(LOG_KEY, JSON.stringify(entries));
}

export function entriesToCsv(entries: LogEntry[]): string {
  const header = ["kind", "species", "date", "location", "count", "notes", "photo"];
  const lines = entries.map((entry) =>
    [
      entry.kind,
      entry.species,
      entry.date,
      entry.location,
      entry.count,
      entry.notes,
      entry.photo ? "attached" : "",
    ]
      .map(csvEscape)
      .join(","),
  );
  return `\uFEFF${header.join(",")}\n${lines.join("\n")}\n`;
}

export function downloadCsv(entries: LogEntry[], filename: string) {
  const blob = new Blob([entriesToCsv(entries)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function compressPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxEdge = 960;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not read that photo.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.68);
}
