import type { Face } from './color-utils';

export type FaceGrid = Record<Face, string[]>;

export function buildFaceletsString(grids: FaceGrid): string {
  // cubejs order: U, R, F, D, L, B — each in row-major 0..8
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

let solverInitialized = false;
let cubeLib: any = null;

async function getCube() {
  if (!cubeLib) {
    const mod: any = await import('cubejs');
    cubeLib = mod.default ?? mod;
  }
  return cubeLib;
}

export async function solveFacelets(facelets: string): Promise<string> {
  const Cube = await getCube();
  if (!solverInitialized) {
    Cube.initSolver();
    solverInitialized = true;
  }
  const cube = Cube.fromString(facelets);
  const solution: string = cube.solve();
  if (!solution || !solution.trim()) return 'Already solved';
  return solution;
}
