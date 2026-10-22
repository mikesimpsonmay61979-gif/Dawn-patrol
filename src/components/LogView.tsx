"use client";

import { useEffect, useState } from "react";
import { missouriDate, prettyDate } from "@/lib/dates";
import {
  compressPhoto,
  downloadCsv,
  emptyDraft,
  loadLog,
  saveLog,
  SPECIES_SUGGESTIONS,
  type LogEntry,
  type LogKind,
} from "@/lib/log";

type Draft = Omit<LogEntry, "id" | "createdAt">;

export function LogView() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);

  useEffect(() => {
    setEntries(loadLog());
    setDraft(emptyDraft(missouriDate()));
    setMounted(true);
  }, []);

  function persist(next: LogEntry[]) {
    const sorted = [...next].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    try {
      saveLog(sorted);
      setEntries(sorted);
      setError(null);
      return true;
    } catch {
      setError("This phone is full. Remove a photo or an old entry, then try again.");
      return false;
    }
  }

  async function onPhoto(file: File | undefined) {
    if (!file || !draft) return;
    if (!file.type.startsWith("image/")) {
      setError("Use a photo file.");
      return;
    }
    try {
      const photo = await compressPhoto(file);
      setDraft({ ...draft, photo });
      setPhotoName(file.name);
      setError(null);
    } catch {
      setError("Couldn't read that photo.");
    }
  }

  function submit() {
    if (!draft) return;
    const species = draft.species.trim();
    const location = draft.location.trim();
    if (!species || !location || !draft.date) {
      setError("Species, date, and location are required.");
      return;
    }
    const count = Math.max(1, Math.round(Number(draft.count) || 1));
    const nextDraft = { ...draft, species, location, count, notes: draft.notes.trim() };
    if (editing) {
      const ok = persist(entries.map((entry) => (entry.id === editing ? { ...entry, ...nextDraft } : entry)));
      if (!ok) return;
    } else {
      const entry: LogEntry = {
        ...nextDraft,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      const ok = persist([entry, ...entries]);
      if (!ok && entry.photo) {
        const without = { ...entry, photo: undefined };
        if (persist([without, ...entries])) {
          setError("Saved without the photo. Storage on this phone was full.");
        } else {
          return;
        }
      } else if (!ok) {
        return;
      }
    }
    setOpen(false);
    setEditing(null);
    setPhotoName(null);
    setDraft(emptyDraft(missouriDate()));
  }

  function startEdit(entry: LogEntry) {
    setEditing(entry.id);
    setDraft({
      kind: entry.kind,
      species: entry.species,
      date: entry.date,
      location: entry.location,
      count: entry.count,
      notes: entry.notes,
      photo: entry.photo,
    });
    setPhotoName(entry.photo ? "Current photo" : null);
    setOpen(true);
    setError(null);
  }

  if (!mounted || !draft) return <div className="skel h-48" />;

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">On this phone</p>
          <h1 className="font-display text-4xl leading-none">Log</h1>
        </div>
        <button
          type="button"
          className="btn btn-blaze btn-tiny"
          onClick={() => downloadCsv(entries, `dawn-patrol-log-${missouriDate()}.csv`)}
          disabled={entries.length === 0}
        >
          Export CSV
        </button>
      </header>
      <p className="text-sm text-mist-300">
        {entries.length} {entries.length === 1 ? "entry" : "entries"} on this phone. No limit. Photos stay on this device.
      </p>

      {open ? (
        <form
          className="card space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            {(["catch", "harvest"] as LogKind[]).map((kind) => (
              <button
                key={kind}
                type="button"
                className={`chip ${draft.kind === kind ? "is-on" : ""}`}
                onClick={() => setDraft({ ...draft, kind })}
              >
                {kind === "catch" ? "Catch" : "Harvest"}
              </button>
            ))}
          </div>
          <label className="block text-sm">
            Species
            <input
              className="field mt-1"
              list="species-list"
              value={draft.species}
              onChange={(event) => setDraft({ ...draft, species: event.target.value })}
              required
            />
            <datalist id="species-list">
              {SPECIES_SUGGESTIONS.map((species) => (
                <option key={species} value={species} />
              ))}
            </datalist>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm">
              Date
              <input
                className="field mt-1"
                type="date"
                value={draft.date}
                onChange={(event) => setDraft({ ...draft, date: event.target.value })}
                required
              />
            </label>
            <label className="block text-sm">
              Count
              <input
                className="field mt-1"
                type="number"
                min={1}
                inputMode="numeric"
                value={draft.count}
                onChange={(event) => setDraft({ ...draft, count: Number(event.target.value) })}
                required
              />
            </label>
          </div>
          <label className="block text-sm">
            Location
            <input
              className="field mt-1"
              value={draft.location}
              placeholder="Gasconade, below Hermann"
              onChange={(event) => setDraft({ ...draft, location: event.target.value })}
              required
            />
          </label>
          <label className="block text-sm">
            Notes
            <textarea
              className="field mt-1"
              value={draft.notes}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
              placeholder="Wind, bait, what you'd do differently"
            />
          </label>
          <label className="block text-sm">
            Photo
            <input
              className="mt-1 block w-full text-sm"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) => onPhoto(event.target.files?.[0])}
            />
          </label>
          {draft.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.photo} alt={photoName ?? "Log photo preview"} className="h-36 w-full rounded-xl object-cover" />
          ) : null}
          {error ? <p className="text-sm text-blaze-400">{error}</p> : null}
          <div className="flex gap-2">
            <button type="submit" className="btn btn-blaze flex-1">
              {editing ? "Save changes" : "Add to the book"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setOpen(false);
                setEditing(null);
                setError(null);
                setDraft(emptyDraft(missouriDate()));
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="btn btn-blaze w-full"
          onClick={() => {
            setEditing(null);
            setDraft(emptyDraft(missouriDate()));
            setOpen(true);
          }}
        >
          Add an entry
        </button>
      )}

      {entries.length === 0 ? (
        <div className="card">
          <p className="font-display text-2xl">The book is empty.</p>
          <p className="mt-2 text-sm leading-relaxed text-mist-300">
            A deer, a limit of crappie, a morning that went sideways. Write the spot down before you forget which bend it was.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="card">
              <div className="flex gap-3">
                {entry.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={entry.photo} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-medium leading-tight">{entry.species}</h2>
                    <span className="pill pill-soon">{entry.kind}</span>
                  </div>
                  <p className="text-sm text-mist-500">
                    {prettyDate(entry.date)} · {entry.count} · {entry.location}
                  </p>
                  {entry.notes ? <p className="mt-1 text-sm text-mist-300">{entry.notes}</p> : null}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn btn-ghost btn-tiny" onClick={() => startEdit(entry)}>
                  Edit
                </button>
                {pendingDelete === entry.id ? (
                  <button
                    type="button"
                    className="btn btn-blaze btn-tiny"
                    onClick={() => {
                      persist(entries.filter((item) => item.id !== entry.id));
                      setPendingDelete(null);
                    }}
                  >
                    Confirm delete
                  </button>
                ) : (
                  <button type="button" className="btn btn-ghost btn-tiny" onClick={() => setPendingDelete(entry.id)}>
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
