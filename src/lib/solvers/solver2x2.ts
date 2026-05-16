// 2x2 solver: expand 2x2 corners into a 3x3 with solved edges/centers, then use cubejs.
// Every face turn is valid on 2x2, so the cubejs result is directly applicable.

import { solveFacelets } from '@/lib/cube-solver';

export type FaceLetter = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';
const FACE_ORDER: FaceLetter[] = ['U', 'R', 'F', 'D', 'L', 'B'];

/** grids: each face has 4 stickers row-major: [tl, tr, bl, br]. */
export function expand2x2To3x3(grids: Record<FaceLetter, string[]>): string {
  let out = '';
  for (const f of FACE_ORDER) {
    const g = grids[f];
    if (g.length !== 4) throw new Error(`Face ${f} must have 4 stickers`);
    // 3x3 positions: tl, t, tr,  l, c, r,  bl, b, br
    // We place corners from 2x2; edges + center = f (solved).
    out += g[0]; out += f; out += g[1];
    out += f;    out += f; out += f;
    out += g[2]; out += f; out += g[3];
  }
  return out;
}

export function validate2x2Grids(grids: Record<FaceLetter, string[]>): { ok: boolean; message?: string } {
  const counts: Record<string, number> = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 };
  for (const f of FACE_ORDER) {
    const g = grids[f];
    if (!g || g.length !== 4) return { ok: false, message: `Face ${f} must have 4 stickers` };
    for (const ch of g) {
      if (!(ch in counts)) return { ok: false, message: `Invalid color ${ch} on face ${f}` };
      counts[ch]++;
    }
  }
  for (const k of Object.keys(counts)) {
    if (counts[k] !== 4) return { ok: false, message: `Each color must appear 4 times (${k}=${counts[k]})` };
  }
  return { ok: true };
}

export async function solve2x2(grids: Record<FaceLetter, string[]>): Promise<string> {
  const facelets = expand2x2To3x3(grids);
  return solveFacelets(facelets);
}