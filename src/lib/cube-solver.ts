import type { Face } from './color-utils';

export type FaceGrid = Record<Face, string[]>; // each string is one of 'U','R','F','D','L','B'

export function buildFaceletsString(grids: FaceGrid): string {
  // Order expected by Kociemba: U, R, F, D, L, B — each in row-major 0..8
  const order: Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];
  return order.map((f) => grids[f].join('')).join('');
}

export function validateFaceletCounts(facelets: string): { ok: boolean; message?: string } {
  const counts: Record<string, number> = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 };
  for (const ch of facelets) {
    if (!(ch in counts)) return { ok: false, message: `Invalid color letter: ${ch}` };
    counts[ch]!++;
  }
  const problems: string[] = [];
  for (const k of Object.keys(counts)) {
    if (counts[k] !== 9) problems.push(`${k}=${counts[k]}`);
  }
  if (problems.length) return { ok: false, message: `Each face color must appear 9 times: ${problems.join(', ')}` };
  return { ok: true };
}

export async function solveFacelets(facelets: string): Promise<string> {
  // Attempt to support different min2phase builds
  const mod: any = await import('min2phase');
  if (typeof mod.solve === 'function') {
    return mod.solve(facelets);
  }
  if (typeof mod.default === 'function') {
    return mod.default(facelets);
  }
  if (mod.Search) {
    // Java-style API
    const search = new mod.Search();
    const result = search.solution(facelets, 21, 100000000, 0, 0);
    return result as string;
  }
  throw new Error('No suitable solver function found in min2phase');
}
