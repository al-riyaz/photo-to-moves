# Multi-Cube Solver Expansion

Goal: add full support for 2x2, 4x4, Pyraminx, Megaminx, and Mirror cubes alongside the existing 3x3 — with a cube-type selector, per-cube 3D model, photo upload + manual correction, and a working solver. The existing 3x3 pipeline stays completely untouched.

## 1. Cube Selector Menu

Add a top-of-page selector (`Tabs` or `Select`) with 6 options: 3x3, 2x2, 4x4, Pyraminx, Megaminx, Mirror.
The selected cube drives which Workspace component renders below. State lives in `Index.tsx`; each cube is a self-contained component under `src/components/cube/workspaces/`.

```text
Index.tsx
└── <CubeTypeMenu/>
└── switch(selected):
    ├── ThreeByThreeWorkspace  (existing code, untouched)
    ├── TwoByTwoWorkspace
    ├── FourByFourWorkspace
    ├── PyraminxWorkspace
    ├── MegaminxWorkspace
    └── MirrorWorkspace
```

## 2. Per-Cube Implementation

Each workspace follows the same shape as the current 3x3 page: face uploaders → color grid editor → 3D viewer → Solve/Scramble buttons → move list.

### 2x2 (Pocket Cube)
- **3D**: reuse a stripped-down version of `Cube3D` with 2x2x2 cubies and 4 stickers per face.
- **Upload**: 6 face uploads, 2×2 color sampling (reuse `sample3x3Averages` adapted to 2×2).
- **Solver**: BFS/IDA* in TypeScript — 2x2 has only ~3.67M reachable states, optimal solver runs in <100ms in browser. Will implement a compact cubie-level solver (no library dependency needed). Output: standard R/U/F notation (L/D/B normalized away).

### 4x4 (Rubik's Revenge)
- **3D**: 4x4x4 cubies, supports wide turns (`Rw`, `Uw`, etc.) and inner slices.
- **Upload**: 6 faces, 4×4 color sampling.
- **Solver**: Reduction method generator — pair centers → pair edges → solve as 3x3 using existing cubejs solver. Output uses 4x4 notation. Not optimal but reliable.

### Pyraminx
- **3D**: tetrahedron with 4 faces × 9 triangular stickers (4 corner trips + 1 center + 3 edges + 1 axial = 9 per face).
- **Upload**: 4 face uploads, triangular sampling grid (sample 9 triangle centroids).
- **Solver**: IDA* over ~75k state space — trivial in JS, implemented inline. Notation: U/L/R/B + tips u/l/r/b.

### Megaminx
- **3D**: dodecahedron with 12 pentagonal faces × 11 stickers each (132 total).
- **Upload**: 12 face uploads, pentagonal 11-sticker sampling.
- **Solver**: layer-by-layer algorithm generator (no optimal solver exists in JS for megaminx's 10^68 states). Produces a valid solution sequence, not optimal. Notation: R++/R--/D++/D--/U style.

### Mirror Cube
- **3D**: 3x3 with variable-size cubies (silver stickers, shape-based recognition).
- **Upload**: since all stickers are silver, photo upload detects *cubie size/shape* per position. For MVP we sample brightness/shadow and let the user correct via the grid (which shows a "shape" picker instead of colors).
- **Solver**: identical to 3x3 (cubejs) — internally we map shapes to U/R/F/D/L/B and reuse `solveFacelets`.

## 3. Shared Plumbing

- New `src/lib/solvers/` directory with one file per cube: `solver2x2.ts`, `solver4x4.ts`, `solverPyraminx.ts`, `solverMegaminx.ts`. Mirror reuses `cube-solver.ts`.
- New `src/components/cube/` 3D components: `Cube2x2.tsx`, `Cube4x4.tsx`, `Pyraminx3D.tsx`, `Megaminx3D.tsx`, `MirrorCube3D.tsx`. Each exposes the same handle interface (`enqueue`, `waitUntilIdle`, `readFacelets`, `paintFromFacelets`, `setView`).
- Generic `FaceUploaderGrid` that accepts an `n×n` (or polygonal) sampling pattern, replacing the 3x3-hardcoded one for new cubes only.
- Instruction card updated with notation legends per cube type.

## 4. Constraints & Honesty

- Megaminx solver will be **non-optimal** (LBL generator). No browser-feasible optimal solver exists.
- 4x4 solver will be **non-optimal** (reduction method, ~80–120 move solutions).
- 2x2, 3x3, Pyraminx, Mirror = optimal/near-optimal solutions.
- Photo color detection on Megaminx (12 faces, 132 stickers) will need careful framing by the user; manual correction is expected.

## 5. Rollout Order

I'll implement in this order in a single pass, committing piece by piece so you can preview as it lands:
1. Cube selector menu + refactor `Index.tsx` to host workspaces (3x3 unchanged behavior).
2. Mirror cube (cheapest — reuses 3x3).
3. 2x2 (solver + 3D + uploader).
4. Pyraminx (solver + 3D + uploader).
5. 4x4 (solver + 3D + uploader).
6. Megaminx (solver + 3D + uploader).

Each step keeps the app building and the 3x3 path 100% intact.

---

This is a large change (~10–15 new files, ~2000 lines). Want me to proceed with all 6 steps in this turn, or stop after the menu + first cube so you can review?