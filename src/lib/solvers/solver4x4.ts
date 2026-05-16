// 4x4 (Rubik's Revenge) reduction-method guide. A full coordinate solver for 4x4
// is not browser-feasible; we return a deterministic reduction-method outline that
// the user can follow.

export type Face4 = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';
const FACES: Face4[] = ['U', 'R', 'F', 'D', 'L', 'B'];

export function validate4x4Grids(grids: Record<Face4, string[]>): { ok: boolean; message?: string } {
  const counts: Record<string, number> = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 };
  for (const f of FACES) {
    const g = grids[f];
    if (!g || g.length !== 16) return { ok: false, message: `Face ${f} must have 16 stickers` };
    for (const ch of g) {
      if (!(ch in counts)) return { ok: false, message: `Invalid color ${ch} on face ${f}` };
      counts[ch]++;
    }
  }
  for (const k of Object.keys(counts)) {
    if (counts[k] !== 16) return { ok: false, message: `Each color must appear 16 times (${k}=${counts[k]})` };
  }
  return { ok: true };
}

export function solve4x4(grids: Record<Face4, string[]>): string {
  const allSolved = FACES.every((f) => grids[f].every((c) => c === grids[f][0]));
  if (allSolved) return 'Already solved';
  return [
    '// Reduction method — solve the 4x4 as a 3x3 after pairing centers + edges.',
    '// 1. Solve the 6 centers (each 2x2 block in the middle of each face).',
    "Uw R U R' Uw'   3Uw L' U' L 3Uw'",
    '// 2. Pair the 12 edges (each pair = 2 stickers that belong together).',
    "Uw R U R' F R' F' Uw'",
    '// 3. Solve like a 3x3 (use any 3x3 method — beginner / CFOP).',
    "F R U R' U' F'   R U R' U R U2 R'",
    '// 4. Fix parities (OLL parity / PLL parity) if encountered:',
    "// OLL parity:",
    "Rw U2 Rw U2 Rw U2 Rw U2 Rw U2",
    "// PLL parity:",
    "Rw2 U2 Rw2 Uw2 Rw2 Uw2",
  ].join('  ');
}