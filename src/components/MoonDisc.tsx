export function MoonDisc({ phase, waxing }: { phase: number; waxing: boolean }) {
  const r = 15;
  const cx = 20;
  const cy = 20;
  const clamped = Math.min(0.999, Math.max(0.001, phase));
  const mag = Math.cos(clamped * 2 * Math.PI);
  const rx = Math.max(0.4, Math.abs(mag) * r);
  const gibbous = mag < 0;
  const sweep = waxing ? 1 : 0;
  const terminator = gibbous === waxing ? 0 : 1;
  const d = [
    `M ${cx} ${cy - r}`,
    `A ${r} ${r} 0 1 ${sweep} ${cx} ${cy + r}`,
    `A ${rx} ${r} 0 1 ${terminator} ${cx} ${cy - r}`,
  ].join(" ");

  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="20" r="16" fill="#1a140c" stroke="#f0b429" strokeWidth="1.2" />
      <path d={d} fill="#f6d58a" />
    </svg>
  );
}
