// Scramble notation generators for the non-3x3 puzzles.
// Output is a WCA-style move string the user can apply to their physical puzzle.

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const SUFFIX = ['', "'", '2'] as const;

/** 2x2 — only need 3 face axes (URF); opposite-face turns are redundant. */
export function scramble2x2(length = 11): string {
  const faces = ['U', 'R', 'F'] as const;
  const out: string[] = [];
  let last = '';
  while (out.length < length) {
    const f = pick(faces);
    if (f === last) continue;
    out.push(f + pick(SUFFIX));
    last = f;
  }
  return out.join(' ');
}

/** 4x4 — WCA-style: outer turns + wide turns. */
export function scramble4x4(length = 40): string {
  const faces = ['U', 'D', 'L', 'R', 'F', 'B'] as const;
  const wides = ['Uw', 'Dw', 'Lw', 'Rw', 'Fw', 'Bw'] as const;
  const sameAxis = (a: string, b: string) => {
    const norm = (s: string) => s.replace('w', '');
    const pairs: Record<string, string> = { U: 'D', D: 'U', L: 'R', R: 'L', F: 'B', B: 'F' };
    const na = norm(a), nb = norm(b);
    return na === nb || pairs[na] === nb;
  };
  const out: string[] = [];
  let last = '', prev = '';
  while (out.length < length) {
    const useWide = Math.random() < 0.45;
    const f = useWide ? pick(wides) : pick(faces);
    if (f === last) continue;
    if (sameAxis(f, last) && sameAxis(f, prev)) continue;
    out.push(f + pick(SUFFIX));
    prev = last;
    last = f;
  }
  return out.join(' ');
}

/** Pyraminx — WCA style: 10 moves of U L R B (+ prime), then optional tips u l r b. */
export function scramblePyraminx(length = 10): string {
  const faces = ['U', 'L', 'R', 'B'] as const;
  const out: string[] = [];
  let last = '';
  while (out.length < length) {
    const f = pick(faces);
    if (f === last) continue;
    out.push(f + (Math.random() < 0.5 ? '' : "'"));
    last = f;
  }
  // Tips
  const tips: string[] = [];
  for (const t of ['u', 'l', 'r', 'b']) {
    if (Math.random() < 0.6) tips.push(t + (Math.random() < 0.5 ? '' : "'"));
  }
  return [...out, ...tips].join(' ');
}

/** Megaminx — WCA "Pochmann" style: 7 lines × 10 moves of R±±/D±± + U/U'. */
export function scrambleMegaminx(lines = 7): string {
  const out: string[] = [];
  for (let i = 0; i < lines; i++) {
    const seq: string[] = [];
    for (let j = 0; j < 5; j++) {
      seq.push('R' + (Math.random() < 0.5 ? '++' : '--'));
      seq.push('D' + (Math.random() < 0.5 ? '++' : '--'));
    }
    seq.push(Math.random() < 0.5 ? 'U' : "U'");
    out.push(seq.join(' '));
  }
  return out.join('\n');
}