// Megaminx layer-by-layer guide. State space is ~10^68 — no in-browser optimal
// solver exists. We validate the input and return a beginner LBL outline.

export type MegaFace =
  | 'U' | 'F' | 'L' | 'R' | 'BL' | 'BR'   // Top half (6 faces)
  | 'D' | 'DBL' | 'DBR' | 'DL' | 'DR' | 'B'; // Bottom half (6 faces)

export const MEGA_FACES: MegaFace[] = ['U', 'F', 'L', 'R', 'BL', 'BR', 'D', 'DBL', 'DBR', 'DL', 'DR', 'B'];

export function validateMegaminxGrids(grids: Record<string, string[]>): { ok: boolean; message?: string } {
  const counts: Record<string, number> = {};
  for (const f of MEGA_FACES) counts[f] = 0;
  for (const f of MEGA_FACES) {
    const g = grids[f];
    if (!g || g.length !== 11) return { ok: false, message: `Face ${f} must have 11 stickers` };
    for (const ch of g) {
      if (!(ch in counts)) return { ok: false, message: `Invalid color ${ch} on face ${f}` };
      counts[ch]++;
    }
  }
  for (const k of Object.keys(counts)) {
    if (counts[k] !== 11) return { ok: false, message: `Each color must appear 11 times (${k}=${counts[k]})` };
  }
  return { ok: true };
}

export function solveMegaminx(grids: Record<string, string[]>): string {
  const allSolved = MEGA_FACES.every((f) => grids[f].every((c) => c === grids[f][0]));
  if (allSolved) return 'Already solved';
  return [
    '// Megaminx — Layer-by-Layer (LBL) method',
    '// 1. Build a 5-pointed star on U around the U-center.',
    "R++ U   R-- U'",
    '// 2. Solve the first-layer corners (using R U R\' U\' insertions).',
    "R U R' U'   x5 (around U)",
    '// 3. Solve the 5 second-layer edges (insert into FR slot).',
    "U R U' R' U' F' U F",
    '// 4. Build the second star on D — repeat steps 1-3 on the bottom 5 faces.',
    "D-- L'   D++ L",
    '// 5. Orient last layer (Sune-style):',
    "R U R' U R U2 R'",
    '// 6. Permute last layer (Megaminx PLL):',
    "R U R' F' R U R' U' R' F R2 U' R'",
    '// Notation: R++/R-- = double-turn (72°*2) of right two adjacent layers; \',\' = inverse 36° turn.',
  ].join('  ');
}