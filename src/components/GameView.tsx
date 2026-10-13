"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { missouriDate, prettyDate } from "@/lib/dates";
import {
  bestOption,
  buildDaily,
  buildDrift,
  buildWatch,
  emptySave,
  groupLabel,
  liveStreak,
  loadGame,
  nudgeFor,
  recordDaily,
  recordDrift,
  recordWatch,
  saveGame,
  scorePicks,
  scoreTitle,
  shareText,
  square,
  type GameSave,
  type Picks,
  type Puzzle,
  type SavedPlay,
} from "@/lib/game";
import type { Option } from "@/lib/game-types";
import { usePro } from "@/lib/pro";

const EMPTY_PICKS: Picks = { spot: "", play: "", window: "" };

export function GameView() {
  const { pro, ready } = usePro();
  const [today, setToday] = useState<string | null>(null);
  const [save, setSave] = useState<GameSave>(emptySave());
  const [picks, setPicks] = useState<Picks>(EMPTY_PICKS);
  const [nudged, setNudged] = useState(false);
  const [copied, setCopied] = useState(false);
  const [drift, setDrift] = useState<Puzzle | null>(null);
  const [driftPicks, setDriftPicks] = useState<Picks>(EMPTY_PICKS);
  const [watchOpen, setWatchOpen] = useState(false);
  const [watchPicks, setWatchPicks] = useState<Picks>(EMPTY_PICKS);

  useEffect(() => {
    setToday(missouriDate());
    setSave(loadGame());
  }, []);

  if (!today) return <div className="skel h-64" />;
  const date = today;

  const puzzle = buildDaily(date);
  const played = save.history.find((item) => item.date === date && item.mode === "daily");
  const streak = liveStreak(save, date);
  const watch = buildWatch(date);
  const watchPlayed = save.watches.find((item) => item.date === date);

  function commit(next: GameSave) {
    setSave(next);
    saveGame(next);
  }

  function submitDaily() {
    if (!picks.spot || !picks.play || !picks.window || played) return;
    const scored = scorePicks(puzzle, picks);
    const play: SavedPlay = {
      date,
      mode: "daily",
      score: scored.total,
      quarryId: puzzle.quarry.id,
      quarryName: puzzle.quarry.name,
      kind: puzzle.quarry.kind,
      picks,
      parts: scored.parts,
    };
    commit(recordDaily(save, play));
  }

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Same card for everyone</p>
          <h1 className="font-display text-4xl leading-none">The Read</h1>
        </div>
        <p className="text-right text-sm">
          <span className="block text-mist-500">{prettyDate(date, true)}</span>
          <span className="font-semibold text-dawn-300">{streak > 0 ? `${streak}-day streak` : "No streak yet"}</span>
        </p>
      </header>

      {played ? (
        <ResultCard puzzle={puzzle} play={played} streak={liveStreak(save, date)} copied={copied} onCopy={setCopied} />
      ) : (
        <PuzzleCard
          puzzle={puzzle}
          picks={picks}
          onPick={setPicks}
          nudged={nudged}
          onNudge={() => setNudged(true)}
          onSubmit={submitDaily}
        />
      )}

      <details className="card text-sm text-mist-300">
        <summary className="cursor-pointer font-medium text-mist-100">How the card works</summary>
        <p className="mt-2 leading-relaxed">
          One puzzle a day, dated on Missouri time, so Hermann and Kansas City get the same card. Three calls, three points each. A limit is 9. The scoring is a field rule you can learn: current, cover, light, and the glass. It is a game, not a promise about a real fish or a real deer.
        </p>
      </details>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Extra reads</h2>
        {ready && pro ? (
          <>
            <article className="card">
              <p className="eyebrow">Second watch</p>
              <p className="mt-1 text-sm text-mist-300">
                The other side of today. {watch.quarry.kind === "hunt" ? "A hunt" : "A fish"} that doesn&apos;t touch the streak.
              </p>
              {watchPlayed ? (
                <ResultCard puzzle={watch} play={watchPlayed} streak={0} copied={false} onCopy={() => undefined} compact />
              ) : watchOpen ? (
                <div className="mt-3">
                  <PuzzleCard
                    puzzle={watch}
                    picks={watchPicks}
                    onPick={setWatchPicks}
                    nudged={false}
                    onNudge={() => undefined}
                    hideNudge
                    onSubmit={() => {
                      if (!watchPicks.spot || !watchPicks.play || !watchPicks.window) return;
                      const scored = scorePicks(watch, watchPicks);
                      commit(
                        recordWatch(save, {
                          date,
                          mode: "watch",
                          score: scored.total,
                          quarryId: watch.quarry.id,
                          quarryName: watch.quarry.name,
                          kind: watch.quarry.kind,
                          picks: watchPicks,
                          parts: scored.parts,
                        }),
                      );
                    }}
                  />
                </div>
              ) : (
                <button type="button" className="btn btn-ghost mt-3" onClick={() => setWatchOpen(true)}>
                  Start second watch
                </button>
              )}
            </article>
            <article className="card">
              <p className="eyebrow">Drift</p>
              <p className="mt-1 text-sm text-mist-300">A practice card. New every time. Streak stays put.</p>
              {drift ? (
                <div className="mt-3">
                  {driftPicks.spot && save.drifts[0]?.salt === drift.id ? (
                    <ResultCard
                      puzzle={drift}
                      play={save.drifts[0]}
                      streak={0}
                      copied={false}
                      onCopy={() => undefined}
                      compact
                    />
                  ) : (
                    <PuzzleCard
                      puzzle={drift}
                      picks={driftPicks}
                      onPick={setDriftPicks}
                      nudged={false}
                      onNudge={() => undefined}
                      hideNudge
                      onSubmit={() => {
                        if (!driftPicks.spot || !driftPicks.play || !driftPicks.window) return;
                        const scored = scorePicks(drift, driftPicks);
                        const play: SavedPlay = {
                          date,
                          mode: "drift",
                          score: scored.total,
                          quarryId: drift.quarry.id,
                          quarryName: drift.quarry.name,
                          kind: drift.quarry.kind,
                          picks: driftPicks,
                          parts: scored.parts,
                          salt: drift.id,
                        };
                        commit(recordDrift(save, play));
                      }}
                    />
                  )}
                </div>
              ) : null}
              <button
                type="button"
                className="btn btn-ghost mt-3"
                onClick={() => {
                  const salt = `${Date.now().toString(36)}`;
                  setDrift(buildDrift(date, salt));
                  setDriftPicks(EMPTY_PICKS);
                }}
              >
                {drift ? "Another drift" : "Run a drift"}
              </button>
            </article>
          </>
        ) : (
          <Link href="/pro" className="card block">
            <p className="font-medium">Second Watch and Drift are Pro.</p>
            <p className="mt-1 text-sm text-mist-300">The daily card stays free. The demo switch on the Pro page unlocks the rest on this phone.</p>
          </Link>
        )}
      </section>

      <Leaderboard save={save} />
    </div>
  );
}

function PuzzleCard({
  puzzle,
  picks,
  onPick,
  nudged,
  onNudge,
  onSubmit,
  hideNudge = false,
}: {
  puzzle: Puzzle;
  picks: Picks;
  onPick: (next: Picks) => void;
  nudged: boolean;
  onNudge: () => void;
  onSubmit: () => void;
  hideNudge?: boolean;
}) {
  const ready = Boolean(picks.spot && picks.play && picks.window);
  return (
    <article className="card space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-3xl leading-none">{puzzle.quarry.name}</h2>
        <span className="pill pill-most-waters">{puzzle.quarry.kind}</span>
      </div>
      <p className="text-sm leading-relaxed text-mist-300">{puzzle.scene}</p>
      <ChoiceGroup
        label={groupLabel(puzzle.quarry.kind, "spot")}
        options={puzzle.spots}
        value={picks.spot}
        onChange={(spot) => onPick({ ...picks, spot })}
      />
      <ChoiceGroup
        label={groupLabel(puzzle.quarry.kind, "play")}
        options={puzzle.plays}
        value={picks.play}
        onChange={(play) => onPick({ ...picks, play })}
      />
      <ChoiceGroup
        label={groupLabel(puzzle.quarry.kind, "window")}
        options={puzzle.windows}
        value={picks.window}
        onChange={(window) => onPick({ ...picks, window })}
      />
      {nudged ? <p className="text-sm text-dawn-300">Nudge: {nudgeFor(puzzle)}.</p> : null}
      <div className="flex gap-2">
        <button type="button" className="btn btn-blaze flex-1" disabled={!ready} onClick={onSubmit}>
          Call it
        </button>
        {hideNudge ? null : (
          <button type="button" className="btn btn-ghost" onClick={onNudge} disabled={nudged}>
            Nudge
          </button>
        )}
      </div>
    </article>
  );
}

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="eyebrow">{label}</legend>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`choice ${value === option.id ? "is-on" : ""}`}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
        >
          <span className="block font-semibold">{option.label}</span>
          <span className="mt-0.5 block text-sm text-mist-300">{option.detail}</span>
        </button>
      ))}
    </fieldset>
  );
}

function ResultCard({
  puzzle,
  play,
  streak,
  copied,
  onCopy,
  compact = false,
}: {
  puzzle: Puzzle;
  play: SavedPlay;
  streak: number;
  copied: boolean;
  onCopy: (copied: boolean) => void;
  compact?: boolean;
}) {
  const scored = scorePicks(puzzle, play.picks);
  const text = shareText(play, streak);
  const rows = [
    { label: groupLabel(puzzle.quarry.kind, "spot"), options: puzzle.spots, scores: puzzle.scores.spots, pick: play.picks.spot, reason: scored.reasons[0] },
    { label: groupLabel(puzzle.quarry.kind, "play"), options: puzzle.plays, scores: puzzle.scores.plays, pick: play.picks.play, reason: scored.reasons[1] },
    { label: groupLabel(puzzle.quarry.kind, "window"), options: puzzle.windows, scores: puzzle.scores.windows, pick: play.picks.window, reason: scored.reasons[2] },
  ];

  async function copy() {
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(text);
      onCopy(true);
    } catch {
      onCopy(false);
    }
  }

  return (
    <article className={compact ? "mt-3 space-y-3" : "card space-y-3"}>
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">{scoreTitle(play.score)}</p>
          <p className="font-display nums text-5xl leading-none">{play.score}/9</p>
        </div>
        <p className="text-2xl tracking-tight" aria-label="Score squares">
          {play.parts.map(square).join("")}
        </p>
      </div>
      <ul className="space-y-3">
        {rows.map((row) => {
          const chosen = row.options.find((option) => option.id === row.pick);
          const best = bestOption(row.options, row.scores);
          return (
            <li key={row.label}>
              <p className="text-xs tracking-wide text-mist-500 uppercase">{row.label}</p>
              <p className="font-medium">
                {square(row.reason.points)} {chosen?.label ?? "—"}
              </p>
              <p className="text-sm text-mist-300">{row.reason.why}</p>
              {best.id !== row.pick ? (
                <p className="text-sm text-dawn-300">The read was {best.label.toLowerCase()}.</p>
              ) : null}
            </li>
          );
        })}
      </ul>
      {compact ? null : (
        <>
          <pre className="overflow-x-auto rounded-xl bg-timber-950 p-3 text-sm leading-relaxed text-mist-100">{text}</pre>
          <button type="button" className="btn btn-blaze" onClick={copy}>
            {copied ? "Copied" : "Share the card"}
          </button>
        </>
      )}
    </article>
  );
}

function Leaderboard({ save }: { save: GameSave }) {
  const rows = useMemo(() => save.history.slice(0, 14), [save.history]);
  const best = save.history.reduce((max, item) => Math.max(max, item.score), 0);
  const average =
    save.history.length === 0
      ? 0
      : save.history.reduce((sum, item) => sum + item.score, 0) / save.history.length;

  return (
    <section className="card">
      <p className="eyebrow">On this phone</p>
      <h2 className="font-display text-2xl">Ledger</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-mist-300">Call today&apos;s card and it lands here. Nothing leaves the phone.</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-mist-300">
            Best {best}/9 · average {average.toFixed(1)} · best streak {save.bestStreak}
          </p>
          <ul className="mt-3 divide-y divide-white/8">
            {rows.map((row) => (
              <li key={`${row.date}-${row.quarryId}`} className="flex items-center justify-between py-2 text-sm">
                <span>
                  <span className="text-mist-500">{prettyDate(row.date)}</span> {row.quarryName}
                </span>
                <span className="nums">
                  {row.parts.map(square).join("")} {row.score}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
