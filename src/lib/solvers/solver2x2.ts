// Optimal 2x2 (Pocket Cube) solver via IDA* on cubie-level state.
// State: 7 corners (one fixed as DBL reference), with permutation (0..6) and orientation (0..2).
// We only need U, R, F face turns — L/D/B turns are redundant since opposite-face turns plus a whole-cube rotation produce the same effect.

type State = { cp: number[]; co: number[] };

const SOLVED: State = { cp: [0, 1, 2, 3, 4, 5, 6], co: [0, 0, 0, 0, 0, 0, 0] };

// Corner indexing (only 7 movable corners — DBL fixed):
// 0=URF 1=UFL 2=ULB 3=UBR 4=DFR 5=DLF 6=DBL_fixed_not_used  (we use 6 as DRB)
// Actually: 0=URF, 1=UFL, 2=ULB, 3=UBR, 4=DFR, 5=DLF, 6=DRB

// Permutation cycle for each move on positions [URF,UFL,ULB,UBR,DFR,DLF,DRB]
// and corresponding orientation deltas.
type Move = { perm: number[]; ori: number[] };

// U: URF -> UBR -> ULB -> UFL -> URF (clockwise viewed from top). Orientations unchanged.
const U: Move = { perm: [3, 0, 1, 2, 4, 5, 6], ori: [0, 0, 0, 0, 0, 0, 0] };
// R: URF -> DFR -> DRB -> UBR -> URF. Orientations: +2, +1, +2, +1 on those 4.
// Order of indices [0=URF,1=UFL,2=ULB,3=UBR,4=DFR,5=DLF,6=DRB]
// After R: position URF gets DFR; position UBR gets URF; position DRB gets UBR; position DFR gets DRB.
const R: Move = { perm: [4, 1, 2, 0, 6, 5, 3], ori: [2, 0, 0, 1, 1, 0, 2] };
// F: URF -> UFL -> DLF -> DFR -> URF. Orientations: +1,+2,+1,+2 cycled.
// After F: URF gets DFR; UFL gets URF; DLF gets UFL; DFR gets DLF.
const F: Move = { perm: [4, 0, 2, 3, 5, 1, 6], ori: [1, 2, 0, 0, 2, 1, 0] };

const MOVES: Record<string, Move> = { U, R, F };

function apply(s: State, m: Move): State {
  const cp = new Array<number>(7);
  const co = new Array<number>(7);
  for (let i = 0; i < 7; i++) {
    cp[i] = s.cp[m.perm[i]];
    co[i] = (s.co[m.perm[i]] + m.ori[i]) % 3;
  }
  return { cp, co };
}

function mul(m1: Move, m2: Move): Move {
  // Apply m1 then m2: resulting perm[i] = m1.perm[m2.perm[i]]
  const perm = new Array<number>(7);
  const ori = new Array<number>(7);
  for (let i = 0; i < 7; i++) {
    perm[i] = m1.perm[m2.perm[i]];
    ori[i] = (m1.ori[m2.perm[i]] + m2.ori[i]) % 3;
  }
  return { perm, ori };
}

function buildMoves(): Record<string, Move> {
  const out: Record<string, Move> = {};
  for (const face of ['U', 'R', 'F'] as const) {
    const m1 = MOVES[face];
    const m2 = mul(m1, m1);
    const m3 = mul(m2, m1);
    out[face] = m1;
    out[face + '2'] = m2;
    out[face + "'"] = m3;
  }
  return out;
}

const ALL_MOVES = buildMoves();
const MOVE_NAMES = Object.keys(ALL_MOVES);

function isSolved(s: State): boolean {
  for (let i = 0; i < 7; i++) {
    if (s.cp[i] !== i || s.co[i] !== 0) return false;
  }
  return true;
}

function stateKey(s: State): string {
  return s.cp.join(',') + '|' + s.co.join(',');
}

// Build a state from a facelets string in URFDLB order, 24 stickers (each face is 2x2 row-major).
// We derive each corner cubie's position and orientation by inspecting the 3 stickers of each corner.

export type FaceLetter = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';

// For each corner, list of 3 facelet indices in the 24-string (order matters: first is the "U/D color" reference for orientation).
// Facelet indices: U:0-3, R:4-7, F:8-11, D:12-15, L:16-19, B:20-23. Each face row-major:
//   U:  0 1
//       2 3   (viewed from above; row 0 = back; col 0 = left? we use standard: U[0]=ULB, U[1]=UBR, U[2]=UFL, U[3]=URF)
// To keep things simple we use the standard cubejs-like layout adapted to 2x2:
//   U: [ULB, UBR, UFL, URF]
//   R: [URF, UBR, DFR, DRB]
//   F: [UFL, URF, DLF, DFR]
//   D: [DLF, DFR, DBL_fixed, DRB]
//   L: [ULB, UFL, DBL_fixed, DLF]
//   B: [UBR, ULB, DRB, DBL_fixed]

const CORNER_FACELETS: { name: string; stickers: [number, number, number] }[] = [
  // [U/D sticker first, then the next two in clockwise order looking at the U/D]
  { name: 'URF', stickers: [3, 4, 9] }, // U[3], R[0], F[1]
  { name: 'UFL', stickers: [2, 8, 17] }, // U[2], F[0], L[1]
  { name: 'ULB', stickers: [0, 16, 21] }, // U[0], L[0], B[1]
  { name: 'UBR', stickers: [1, 20, 5] }, // U[1], B[0], R[1]
  { name: 'DFR', stickers: [13, 11, 6] }, // D[1], F[3], R[2]
  { name: 'DLF', stickers: [12, 19, 10] }, // D[0], L[3], F[2]
  { name: 'DRB', stickers: [15, 7, 22] }, // D[3], R[3], B[2]
];

const CORNER_NAMES = ['URF', 'UFL', 'ULB', 'UBR', 'DFR', 'DLF', 'DRB'];

function cornerSet(name: string): Set<FaceLetter> {
  return new Set(name.split('') as FaceLetter[]);
}

const CORNER_SETS = CORNER_NAMES.map(cornerSet);

export function parse2x2Facelets(facelets: string): State {
  if (facelets.length !== 24) throw new Error('2x2 needs 24 facelets');
  const cp = new Array<number>(7);
  const co = new Array<number>(7);
  for (let i = 0; i < 7; i++) {
    const stickers = CORNER_FACELETS[i].stickers.map((idx) => facelets[idx] as FaceLetter);
    const set = new Set(stickers);
    // Find which solved corner has this color set
    const which = CORNER_SETS.findIndex((s) => s.size === set.size && [...s].every((x) => set.has(x)));
    if (which < 0) throw new Error(`Invalid corner colors at position ${i}: ${stickers.join('')}`);
    cp[i] = which;
    // Orientation: index (0,1,2) of where the U or D sticker is among the 3 positions
    const ori = stickers.findIndex((x) => x === 'U' || x === 'D');
    if (ori < 0) throw new Error(`Corner missing U/D sticker at position ${i}`);
    co[i] = ori;
  }
  return { cp, co };
}

// IDA* solver. Heuristic: zero (BFS-like). 2x2 max depth is 11 (half-turn metric), usually 6-9.
// Use bidirectional BFS for speed.
export function solve2x2(facelets: string): string {
  const start = parse2x2Facelets(facelets);
  if (isSolved(start)) return 'Already solved';

  // Bidirectional BFS
  const fwd = new Map<string, { dist: number; prev?: string; move?: string }>();
  const bwd = new Map<string, { dist: number; prev?: string; move?: string }>();
  fwd.set(stateKey(start), { dist: 0 });
  bwd.set(stateKey(SOLVED), { dist: 0 });

  let fwdFrontier: { state: State; key: string }[] = [{ state: start, key: stateKey(start) }];
  let bwdFrontier: { state: State; key: string }[] = [{ state: SOLVED, key: stateKey(SOLVED) }];

  let meetKey: string | null = null;
  let maxIter = 12;

  for (let depth = 0; depth < maxIter && !meetKey; depth++) {
    // expand smaller frontier
    const expandFwd = fwdFrontier.length <= bwdFrontier.length;
    const frontier = expandFwd ? fwdFrontier : bwdFrontier;
    const visited = expandFwd ? fwd : bwd;
    const other = expandFwd ? bwd : fwd;
    const next: { state: State; key: string }[] = [];
    for (const { state, key } of frontier) {
      const here = visited.get(key)!;
      let lastFace = '';
      if (here.move) lastFace = here.move[0];
      for (const mn of MOVE_NAMES) {
        if (mn[0] === lastFace) continue;
        const ns = apply(state, ALL_MOVES[mn]);
        const nk = stateKey(ns);
        if (visited.has(nk)) continue;
        visited.set(nk, { dist: here.dist + 1, prev: key, move: mn });
        if (other.has(nk)) {
          meetKey = nk;
          break;
        }
        next.push({ state: ns, key: nk });
      }
      if (meetKey) break;
    }
    if (expandFwd) fwdFrontier = next;
    else bwdFrontier = next;
    if (!frontier.length) break;
  }

  if (!meetKey) throw new Error('No solution found within depth limit');

  // Reconstruct: forward path from start to meetKey
  const fwdMoves: string[] = [];
  let cur = meetKey;
  while (cur && fwd.get(cur)?.prev) {
    const node = fwd.get(cur)!;
    fwdMoves.unshift(node.move!);
    cur = node.prev!;
  }
  // Backward path: from meetKey to SOLVED. Each backward move was applied to reach a state from the *next* one — to undo, we invert.
  const bwdMoves: string[] = [];
  cur = meetKey;
  while (cur && bwd.get(cur)?.prev) {
    const node = bwd.get(cur)!;
    // The move recorded brought us from node.prev to cur in the backward search,
    // which corresponds to going from cur back to node.prev in the forward direction → invert.
    bwdMoves.push(invertMove(node.move!));
    cur = node.prev!;
  }

  return [...fwdMoves, ...bwdMoves].join(' ');
}

function invertMove(m: string): string {
  if (m.endsWith('2')) return m;
  if (m.endsWith("'")) return m[0];
  return m[0] + "'";
}

export function validate2x2Facelets(facelets: string): { ok: boolean; message?: string } {
  if (facelets.length !== 24) return { ok: false, message: '2x2 needs 24 facelets' };
  const counts: Record<string, number> = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 };
  for (const ch of facelets) {
    if (!(ch in counts)) return { ok: false, message: `Invalid color: ${ch}` };
    counts[ch]++;
  }
  for (const k of Object.keys(counts)) {
    if (counts[k] !== 4) return { ok: false, message: `Each color must appear 4 times (${k}=${counts[k]})` };
  }
  return { ok: true };
}

// Builds the 24-char facelets string from grids in URFDLB order.
export function build2x2Facelets(grids: Record<FaceLetter, string[]>): string {
  return (['U', 'R', 'F', 'D', 'L', 'B'] as const).map((f) => grids[f].join('')).join('');
}