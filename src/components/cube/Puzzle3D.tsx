import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const INNER = '#111111';

/** Default colors for the standard URFDLB scheme used by 2x2 and 4x4. */
const DEFAULT_COLOR_MAP: Record<string, string> = {
  U: '#ffffff', D: '#ffd500', F: '#009b48', B: '#0045ad', R: '#b71234', L: '#ff5800',
};

type Grids = Record<string, string[]>;

function visibleFaceColor(faceKey: string, cells: string[] | undefined, colorMap: Record<string, string>, centerIndex: number) {
  if (!cells?.length) return INNER;
  const center = cells[centerIndex] ?? cells[0] ?? faceKey;
  const movedSticker = cells.find((c, i) => i !== centerIndex && c && c !== center);
  return colorMap[movedSticker || center] || INNER;
}

// ───────────────────────────── NxNxN viewer ─────────────────────────────
// For 2x2 / 4x4. Face sticker order matches NetCubeWorkspace row-major sampling:
// rows top→bottom, cols left→right, viewed from outside the puzzle.
function NxNxN({ n, grids, colorMap }: { n: number; grids: Grids; colorMap: Record<string, string> }) {
  const cubies = useMemo(() => {
    const size = 0.95;
    const half = (n - 1) / 2;
    const items: { pos: [number, number, number]; mats: THREE.MeshStandardMaterial[] }[] = [];

    // Helper to look up a sticker color for face f at (row, col)
    const sticker = (f: string, row: number, col: number): string => {
      const g = grids[f];
      if (!g) return INNER;
      const ch = g[row * n + col];
      return colorMap[ch] || INNER;
    };

    for (let ix = 0; ix < n; ix++) {
      for (let iy = 0; iy < n; iy++) {
        for (let iz = 0; iz < n; iz++) {
          const x = ix - half, y = iy - half, z = iz - half;
          // material order: +x, -x, +y, -y, +z, -z
          const mats = [INNER, INNER, INNER, INNER, INNER, INNER];
          // R face: x = n-1; row from top (y high → row 0), col from front (z high → col 0? matches F→B)
          if (ix === n - 1) mats[0] = sticker('R', (n - 1) - iy, (n - 1) - iz);
          if (ix === 0)     mats[1] = sticker('L', (n - 1) - iy, iz);
          if (iy === n - 1) mats[2] = sticker('U', (n - 1) - iz, ix);
          if (iy === 0)     mats[3] = sticker('D', iz, ix);
          if (iz === n - 1) mats[4] = sticker('F', (n - 1) - iy, ix);
          if (iz === 0)     mats[5] = sticker('B', (n - 1) - iy, (n - 1) - ix);
          items.push({
            pos: [x, y, z],
            mats: mats.map((c) => new THREE.MeshStandardMaterial({ color: c })),
          });
        }
      }
    }
    return { items, size };
  }, [n, grids, colorMap]);

  return (
    <group>
      {cubies.items.map((c, i) => (
        <mesh key={i} position={c.pos} material={c.mats}>
          <boxGeometry args={[cubies.size, cubies.size, cubies.size]} />
        </mesh>
      ))}
    </group>
  );
}

// ───────────────────────────── Tetrahedron (Pyraminx) ─────────────────────────────
function Tetrahedron({ grids, colorMap }: { grids: Grids; colorMap: Record<string, string> }) {
  // 4 vertices of a regular tetrahedron
  const v = [
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(1, -1, -1),
    new THREE.Vector3(-1, 1, -1),
    new THREE.Vector3(-1, -1, 1),
  ];
  // Each face = 3 vertices; pick a face letter; color from center sticker (index 4 of 9)
  const facesDef: Array<{ key: string; idx: [number, number, number] }> = [
    { key: 'U', idx: [0, 2, 1] },
    { key: 'L', idx: [0, 3, 2] },
    { key: 'R', idx: [0, 1, 3] },
    { key: 'B', idx: [1, 2, 3] },
  ];
  return (
    <group scale={1.4}>
      {facesDef.map((f) => {
        const g = grids[f.key];
        const centerColor = visibleFaceColor(f.key, g, colorMap, 4);
        const positions = new Float32Array([
          v[f.idx[0]].x, v[f.idx[0]].y, v[f.idx[0]].z,
          v[f.idx[1]].x, v[f.idx[1]].y, v[f.idx[1]].z,
          v[f.idx[2]].x, v[f.idx[2]].y, v[f.idx[2]].z,
        ]);
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.computeVertexNormals();
        return (
          <mesh key={f.key} geometry={geom}>
            <meshStandardMaterial color={centerColor} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

// ───────────────────────────── Dodecahedron (Megaminx) ─────────────────────────────
function Dodecahedron({ grids, colorMap, faceOrder }: {
  grids: Grids; colorMap: Record<string, string>; faceOrder: string[];
}) {
  // Build a dodecahedron and color each pentagonal face from its center sticker (index 0).
  const { faces } = useMemo(() => {
    const geom = new THREE.DodecahedronGeometry(1.6, 0);
    const pos = geom.getAttribute('position');
    // DodecahedronGeometry yields 12 faces × 3 triangles × 3 verts = 108 verts.
    // Group triangles into faces by averaged normal direction.
    const triCount = pos.count / 3;
    const tris: { verts: THREE.Vector3[]; normal: THREE.Vector3 }[] = [];
    for (let i = 0; i < triCount; i++) {
      const a = new THREE.Vector3().fromBufferAttribute(pos, i * 3);
      const b = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 1);
      const c = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 2);
      const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize();
      tris.push({ verts: [a, b, c], normal: n });
    }
    // Cluster by normal
    const groups: { normal: THREE.Vector3; tris: typeof tris }[] = [];
    for (const t of tris) {
      let g = groups.find((gr) => gr.normal.dot(t.normal) > 0.95);
      if (!g) { g = { normal: t.normal.clone(), tris: [] }; groups.push(g); }
      g.tris.push(t);
    }
    // Sort groups deterministically (by y desc, then z, then x) so faceOrder maps consistently.
    groups.sort((a, b) => b.normal.y - a.normal.y || b.normal.z - a.normal.z || b.normal.x - a.normal.x);
    const faces = groups.map((g, i) => {
      const verts: number[] = [];
      for (const t of g.tris) {
        for (const v of t.verts) verts.push(v.x, v.y, v.z);
      }
      const fg = new THREE.BufferGeometry();
      fg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
      fg.computeVertexNormals();
      return { geom: fg, faceKey: faceOrder[i] };
    });
    return { faces };
  }, [faceOrder]);

  return (
    <group>
      {faces.map((f, i) => {
        const g = grids[f.faceKey];
        const color = visibleFaceColor(f.faceKey, g, colorMap, 0);
        return (
          <mesh key={i} geometry={f.geom}>
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}

// ───────────────────────────── Public viewer ─────────────────────────────
export type Puzzle3DKind =
  | { type: 'cube'; n: 2 | 4 }
  | { type: 'tetra' }
  | { type: 'dodeca'; faceOrder: string[] };

type Props = {
  kind: Puzzle3DKind;
  grids: Grids;
  colorMap?: Record<string, string>;
  camera?: [number, number, number];
};

export const Puzzle3D: React.FC<Props> = ({ kind, grids, colorMap, camera }) => {
  const cm = { ...DEFAULT_COLOR_MAP, ...(colorMap || {}) };
  const cam: [number, number, number] = camera || (kind.type === 'cube' ? [kind.n + 2, kind.n + 2, kind.n + 3] : [4, 4, 5]);
  // Remount Canvas when camera changes so OrbitControls re-anchors to the new view.
  const camKey = cam.join(',');
  return (
    <div className="w-full aspect-square rounded-md border bg-card overflow-hidden">
      <Canvas key={camKey} camera={{ position: cam, fov: 40 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={0.8} />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} />
        {kind.type === 'cube' && <NxNxN n={kind.n} grids={grids} colorMap={cm} />}
        {kind.type === 'tetra' && <Tetrahedron grids={grids} colorMap={cm} />}
        {kind.type === 'dodeca' && <Dodecahedron grids={grids} colorMap={cm} faceOrder={kind.faceOrder} />}
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
};

export default Puzzle3D;