export type PuzzleGrids = Record<string, string[]>;

type Axis = 'x' | 'y' | 'z';
type Vec = { x: number; y: number; z: number };

const CUBE_FACES = ['U', 'R', 'F', 'D', 'L', 'B'] as const;
const PYRA_FACES = ['U', 'L', 'R', 'B'] as const;
const MEGA_FACES = ['U', 'F', 'L', 'R', 'BL', 'BR', 'D', 'DBL', 'DBR', 'DL', 'DR', 'B'];

const CUBE_META: Record<string, { axis: Axis; highSide: boolean; dir: 1 | -1 }> = {
  R: { axis: 'x', highSide: true, dir: -1 },
  L: { axis: 'x', highSide: false, dir: 1 },
  U: { axis: 'y', highSide: true, dir: -1 },
  D: { axis: 'y', highSide: false, dir: 1 },
  F: { axis: 'z', highSide: true, dir: -1 },
  B: { axis: 'z', highSide: false, dir: 1 },
};

export function tokenizeMoves(text: string): string[] {
  return text
    .split(/\s+/)
    .map((m) => m.trim())
    .filter(Boolean)
    .map((m) => m.replace(/[,:;]+$/g, ''));
}

export function invertPuzzleMove(move: string): string {
  if (move.endsWith('++')) return move.slice(0, -2) + '--';
  if (move.endsWith('--')) return move.slice(0, -2) + '++';
  if (move.endsWith('2')) return move;
  if (move.endsWith("'")) return move.slice(0, -1);
  return move + "'";
}

export function isExecutablePuzzleMove(grids: PuzzleGrids, move: string): boolean {
  return canApplyCubeMove(grids, move) || canApplyPyraminxMove(grids, move) || canApplyMegaminxMove(grids, move);
}

export function applyPuzzleMove(grids: PuzzleGrids, move: string): PuzzleGrids {
  if (canApplyCubeMove(grids, move)) return applyCubeMove(grids, move);
  if (canApplyPyraminxMove(grids, move)) return applyPyraminxMove(grids, move);
  if (canApplyMegaminxMove(grids, move)) return applyMegaminxMove(grids, move);
  return cloneGrids(grids);
}

function cloneGrids(grids: PuzzleGrids): PuzzleGrids {
  return Object.fromEntries(Object.entries(grids).map(([k, v]) => [k, [...v]]));
}

function cubeSize(grids: PuzzleGrids): number | null {
  if (!CUBE_FACES.every((f) => Array.isArray(grids[f]))) return null;
  const n = Math.sqrt(grids.U.length);
  return Number.isInteger(n) && n >= 2 ? n : null;
}

function parseCubeMove(move: string) {
  const m = move.match(/^(\d+)?([URFDLB])(w)?(2|')?$/);
  if (!m) return null;
  return { prefix: m[1] ? Number(m[1]) : undefined, face: m[2], wide: Boolean(m[3]), suffix: m[4] || '' };
}

function canApplyCubeMove(grids: PuzzleGrids, move: string): boolean {
  return cubeSize(grids) !== null && parseCubeMove(move) !== null;
}

function posForFaceCell(face: string, row: number, col: number, n: number): Vec {
  switch (face) {
    case 'R': return { x: n - 1, y: n - 1 - row, z: n - 1 - col };
    case 'L': return { x: 0, y: n - 1 - row, z: col };
    case 'U': return { x: col, y: n - 1, z: n - 1 - row };
    case 'D': return { x: col, y: 0, z: row };
    case 'F': return { x: col, y: n - 1 - row, z: n - 1 };
    default: return { x: n - 1 - col, y: n - 1 - row, z: 0 };
  }
}

function normalForFace(face: string): Vec {
  switch (face) {
    case 'R': return { x: 1, y: 0, z: 0 };
    case 'L': return { x: -1, y: 0, z: 0 };
    case 'U': return { x: 0, y: 1, z: 0 };
    case 'D': return { x: 0, y: -1, z: 0 };
    case 'F': return { x: 0, y: 0, z: 1 };
    default: return { x: 0, y: 0, z: -1 };
  }
}

function faceFromNormal(v: Vec): string {
  if (v.x === 1) return 'R';
  if (v.x === -1) return 'L';
  if (v.y === 1) return 'U';
  if (v.y === -1) return 'D';
  if (v.z === 1) return 'F';
  return 'B';
}

function cellForFacePos(face: string, pos: Vec, n: number): { row: number; col: number } {
  switch (face) {
    case 'R': return { row: n - 1 - pos.y, col: n - 1 - pos.z };
    case 'L': return { row: n - 1 - pos.y, col: pos.z };
    case 'U': return { row: n - 1 - pos.z, col: pos.x };
    case 'D': return { row: pos.z, col: pos.x };
    case 'F': return { row: n - 1 - pos.y, col: pos.x };
    default: return { row: n - 1 - pos.y, col: n - 1 - pos.x };
  }
}

function rotatePos(pos: Vec, axis: Axis, dir: 1 | -1, n: number): Vec {
  const { x, y, z } = pos;
  if (axis === 'x') return dir === 1 ? { x, y: n - 1 - z, z: y } : { x, y: z, z: n - 1 - y };
  if (axis === 'y') return dir === 1 ? { x: z, y, z: n - 1 - x } : { x: n - 1 - z, y, z: x };
  return dir === 1 ? { x: n - 1 - y, y: x, z } : { x: y, y: n - 1 - x, z };
}

function rotateNormal(v: Vec, axis: Axis, dir: 1 | -1): Vec {
  const { x, y, z } = v;
  if (axis === 'x') return dir === 1 ? { x, y: -z, z: y } : { x, y: z, z: -y };
  if (axis === 'y') return dir === 1 ? { x: z, y, z: -x } : { x: -z, y, z: x };
  return dir === 1 ? { x: -y, y: x, z } : { x: y, y: -x, z };
}

function applyCubeQuarter(grids: PuzzleGrids, face: string, width: number, dir: 1 | -1): PuzzleGrids {
  const n = cubeSize(grids)!;
  const meta = CUBE_META[face];
  const out: PuzzleGrids = Object.fromEntries(CUBE_FACES.map((f) => [f, Array(n * n).fill('')])) as PuzzleGrids;
  const inLayer = (pos: Vec) => {
    const coord = pos[meta.axis];
    return meta.highSide ? coord >= n - width : coord < width;
  };

  for (const f of CUBE_FACES) {
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        const idx = row * n + col;
        const selected = inLayer(posForFaceCell(f, row, col, n));
        const nextPos = selected ? rotatePos(posForFaceCell(f, row, col, n), meta.axis, dir, n) : posForFaceCell(f, row, col, n);
        const nextNormal = selected ? rotateNormal(normalForFace(f), meta.axis, dir) : normalForFace(f);
        const nextFace = faceFromNormal(nextNormal);
        const nextCell = cellForFacePos(nextFace, nextPos, n);
        out[nextFace][nextCell.row * n + nextCell.col] = grids[f][idx];
      }
    }
  }
  return { ...grids, ...out };
}

function applyCubeMove(grids: PuzzleGrids, move: string): PuzzleGrids {
  const n = cubeSize(grids)!;
  const parsed = parseCubeMove(move)!;
  const meta = CUBE_META[parsed.face];
  const width = Math.min(n, parsed.wide ? parsed.prefix || 2 : 1);
  const turns = parsed.suffix === '2' ? 2 : 1;
  const dir = (meta.dir * (parsed.suffix === "'" ? -1 : 1)) as 1 | -1;
  let out = cloneGrids(grids);
  for (let i = 0; i < turns; i++) out = applyCubeQuarter(out, parsed.face, width, dir);
  return out;
}

function canApplyPyraminxMove(grids: PuzzleGrids, move: string): boolean {
  return PYRA_FACES.every((f) => grids[f]?.length === 9) && /^[ULRBulrb]'?$/.test(move);
}

function rotateGrid3(cells: string[], prime: boolean): string[] {
  const cw = [6, 3, 0, 7, 4, 1, 8, 5, 2].map((i) => cells[i]);
  if (!prime) return cw;
  return [2, 5, 8, 1, 4, 7, 0, 3, 6].map((i) => cells[i]);
}

function cycleChunks(out: PuzzleGrids, chunks: Array<[string, number[]]>, reverse: boolean) {
  const vals = chunks.map(([f, idx]) => idx.map((i) => out[f][i]));
  chunks.forEach(([f, idx], i) => {
    const from = reverse ? (i + 1) % chunks.length : (i - 1 + chunks.length) % chunks.length;
    idx.forEach((cell, j) => { out[f][cell] = vals[from][j]; });
  });
}

function applyPyraminxMove(grids: PuzzleGrids, move: string): PuzzleGrids {
  const out = cloneGrids(grids);
  const face = move[0].toUpperCase();
  const prime = move.endsWith("'");
  const tipOnly = move[0] === move[0].toLowerCase();
  if (tipOnly) {
    const tipMap: Record<string, number[]> = { U: [0, 1, 3], L: [0, 2, 6], R: [2, 5, 8], B: [6, 7, 8] };
    const idx = tipMap[face];
    const vals = idx.map((i) => out[face][i]);
    idx.forEach((cell, i) => { out[face][cell] = vals[prime ? (i + 1) % idx.length : (i - 1 + idx.length) % idx.length]; });
    return out;
  }
  out[face] = rotateGrid3(out[face], prime);
  const adjacent: Record<string, Array<[string, number[]]>> = {
    U: [['L', [0, 1, 2]], ['R', [0, 1, 2]], ['B', [0, 1, 2]]],
    L: [['U', [0, 3, 6]], ['B', [2, 5, 8]], ['R', [0, 3, 6]]],
    R: [['U', [2, 5, 8]], ['L', [2, 5, 8]], ['B', [0, 3, 6]]],
    B: [['U', [6, 7, 8]], ['R', [6, 7, 8]], ['L', [6, 7, 8]]],
  };
  cycleChunks(out, adjacent[face], prime);
  return out;
}

function parseMegaMove(move: string) {
  const m = move.match(/^([A-Z]+)(\+\+|--|2|')?$/);
  if (!m) return null;
  return { face: m[1], suffix: m[2] || '' };
}

function canApplyMegaminxMove(grids: PuzzleGrids, move: string): boolean {
  const parsed = parseMegaMove(move);
  return Boolean(parsed && grids[parsed.face]?.length === 11 && Object.keys(grids).length >= 12);
}

function rotateMegaFace(cells: string[], steps: number): string[] {
  const out = [...cells];
  const ring = cells.slice(1);
  const len = ring.length;
  for (let i = 0; i < len; i++) out[i + 1] = ring[(i - steps + len * 10) % len];
  return out;
}

function applyMegaminxMove(grids: PuzzleGrids, move: string): PuzzleGrids {
  const parsed = parseMegaMove(move)!;
  const order = MEGA_FACES.filter((f) => grids[f]?.length === 11);
  const out = cloneGrids(grids);
  const faceIndex = order.indexOf(parsed.face);
  if (faceIndex < 0) return out;
  const dir = parsed.suffix === '--' || parsed.suffix === "'" ? -1 : 1;
  const turns = parsed.suffix === '++' || parsed.suffix === '--' || parsed.suffix === '2' ? 2 : 1;
  out[parsed.face] = rotateMegaFace(out[parsed.face], dir * turns);
  const neighbors = Array.from({ length: 5 }, (_, i) => order[(faceIndex + i + 1) % order.length]);
  const chunks = neighbors.map((f, i) => [f, [1 + i * 2, 2 + i * 2].filter((idx) => idx < 11)] as [string, number[]]);
  for (let i = 0; i < turns; i++) cycleChunks(out, chunks, dir < 0);
  return out;
}