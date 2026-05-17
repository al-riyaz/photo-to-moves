import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const INNER = '#111111';

/** Default colors for the standard URFDLB scheme used by 2x2 and 4x4. */
const DEFAULT_COLOR_MAP: Record<string, string> = {
  U: '#ffffff', D: '#ffd500', F: '#009b48', B: '#0045ad', R: '#b71234', L: '#ff5800',
};

type Grids = Record<string, string[]>;
type Axis = 'x' | 'y' | 'z';

type MotionPlan<T> = {
  axis: THREE.Vector3;
  angle: number;
  selected: (item: T) => boolean;
};

export type Puzzle3DHandle = {
  playMove: (move: string) => Promise<void>;
};

const CUBE_META: Record<string, { axis: Axis; highSide: boolean; dir: 1 | -1 }> = {
  R: { axis: 'x', highSide: true, dir: -1 },
  L: { axis: 'x', highSide: false, dir: 1 },
  U: { axis: 'y', highSide: true, dir: -1 },
  D: { axis: 'y', highSide: false, dir: 1 },
  F: { axis: 'z', highSide: true, dir: -1 },
  B: { axis: 'z', highSide: false, dir: 1 },
};

const PYRA_VERTICES = [
  new THREE.Vector3(1, 1, 1),
  new THREE.Vector3(1, -1, -1),
  new THREE.Vector3(-1, 1, -1),
  new THREE.Vector3(-1, -1, 1),
];

const PYRA_FACES: Array<{ key: string; idx: [number, number, number] }> = [
  { key: 'U', idx: [0, 2, 1] },
  { key: 'L', idx: [0, 3, 2] },
  { key: 'R', idx: [0, 1, 3] },
  { key: 'B', idx: [1, 2, 3] },
];

const PYRA_TIPS: Record<string, number[]> = {
  U: [0, 1, 3],
  L: [0, 2, 6],
  R: [2, 5, 8],
  B: [6, 7, 8],
};

const PYRA_ADJACENT: Record<string, Array<[string, number[]]>> = {
  U: [['L', [0, 1, 2]], ['R', [0, 1, 2]], ['B', [0, 1, 2]]],
  L: [['U', [0, 3, 6]], ['B', [2, 5, 8]], ['R', [0, 3, 6]]],
  R: [['U', [2, 5, 8]], ['L', [2, 5, 8]], ['B', [0, 3, 6]]],
  B: [['U', [6, 7, 8]], ['R', [6, 7, 8]], ['L', [6, 7, 8]]],
};

function visibleFaceColor(faceKey: string, cells: string[] | undefined, colorMap: Record<string, string>, centerIndex: number) {
  if (!cells?.length) return INNER;
  const center = cells[centerIndex] ?? cells[0] ?? faceKey;
  const movedSticker = cells.find((c, i) => i !== centerIndex && c && c !== center);
  return colorMap[movedSticker || center] || INNER;
}

function colorFor(label: string | undefined, fallback: string, colorMap: Record<string, string>) {
  return colorMap[label || fallback] || INNER;
}

function parseCubeMove(move: string) {
  const m = move.match(/^(\d+)?([URFDLB])(w)?(2|')?$/);
  if (!m) return null;
  return { prefix: m[1] ? Number(m[1]) : undefined, face: m[2], wide: Boolean(m[3]), suffix: m[4] || '' };
}

function parseMegaMove(move: string) {
  const m = move.match(/^([A-Z]+)(\+\+|--|2|')?$/);
  if (!m) return null;
  return { face: m[1], suffix: m[2] || '' };
}

function axisVector(axis: Axis) {
  return new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
}

function faceNormalFromPoints(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) {
  return new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize();
}

function basisForNormal(normal: THREE.Vector3) {
  const up = Math.abs(normal.y) > 0.88 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const u = new THREE.Vector3().crossVectors(up, normal).normalize();
  const v = new THREE.Vector3().crossVectors(normal, u).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal.clone().normalize());
  return { u, v, quaternion };
}

function stickerOffset(index: number, spacing: number) {
  return { x: (index % 3 - 1) * spacing, y: (1 - Math.floor(index / 3)) * spacing };
}

function MotionGroup({ axis, angle, onDone, children }: {
  axis: THREE.Vector3;
  angle: number;
  onDone: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const currentRef = useRef(0);
  const doneRef = useRef(false);

  React.useEffect(() => {
    currentRef.current = 0;
    doneRef.current = false;
    ref.current?.rotation.set(0, 0, 0);
  }, [axis.x, axis.y, axis.z, angle]);

  useFrame((_, delta) => {
    if (!ref.current || doneRef.current) return;
    const remaining = angle - currentRef.current;
    const step = Math.sign(remaining) * Math.min(Math.PI * 2.4 * delta, Math.abs(remaining));
    currentRef.current += step;
    ref.current.setRotationFromAxisAngle(axis, currentRef.current);

    if (Math.abs(angle - currentRef.current) < 0.001) {
      doneRef.current = true;
      ref.current.setRotationFromAxisAngle(axis, angle);
      onDone();
    }
  });

  return <group ref={ref}>{children}</group>;
}

// ───────────────────────────── NxNxN viewer ─────────────────────────────
type CubeCubie = {
  key: string;
  pos: [number, number, number];
  coords: { ix: number; iy: number; iz: number };
  mats: THREE.MeshStandardMaterial[];
};

function cubeMotionPlan(n: number, move: string): MotionPlan<CubeCubie> | null {
  const parsed = parseCubeMove(move);
  if (!parsed) return null;
  const meta = CUBE_META[parsed.face];
  const width = Math.min(n, parsed.wide ? parsed.prefix || 2 : 1);
  const turns = parsed.suffix === '2' ? 2 : 1;
  const dir = meta.dir * (parsed.suffix === "'" ? -1 : 1);
  const coordFor = (c: CubeCubie) => c.coords[meta.axis === 'x' ? 'ix' : meta.axis === 'y' ? 'iy' : 'iz'];
  return {
    axis: axisVector(meta.axis),
    angle: (Math.PI / 2) * turns * dir,
    selected: (c) => meta.highSide ? coordFor(c) >= n - width : coordFor(c) < width,
  };
}

function NxNxN({ n, grids, colorMap, activeMove, onMotionDone }: {
  n: number;
  grids: Grids;
  colorMap: Record<string, string>;
  activeMove: string | null;
  onMotionDone: () => void;
}) {
  const cubies = useMemo(() => {
    const size = 0.95;
    const half = (n - 1) / 2;
    const items: CubeCubie[] = [];

    const sticker = (f: string, row: number, col: number): string => {
      const g = grids[f];
      if (!g) return INNER;
      const ch = g[row * n + col];
      return colorFor(ch, f, colorMap);
    };

    for (let ix = 0; ix < n; ix++) {
      for (let iy = 0; iy < n; iy++) {
        for (let iz = 0; iz < n; iz++) {
          const x = ix - half, y = iy - half, z = iz - half;
          const mats = [INNER, INNER, INNER, INNER, INNER, INNER];
          if (ix === n - 1) mats[0] = sticker('R', (n - 1) - iy, (n - 1) - iz);
          if (ix === 0)     mats[1] = sticker('L', (n - 1) - iy, iz);
          if (iy === n - 1) mats[2] = sticker('U', (n - 1) - iz, ix);
          if (iy === 0)     mats[3] = sticker('D', iz, ix);
          if (iz === n - 1) mats[4] = sticker('F', (n - 1) - iy, ix);
          if (iz === 0)     mats[5] = sticker('B', (n - 1) - iy, (n - 1) - ix);
          items.push({
            key: `${ix}-${iy}-${iz}`,
            pos: [x, y, z],
            coords: { ix, iy, iz },
            mats: mats.map((c) => new THREE.MeshStandardMaterial({ color: c })),
          });
        }
      }
    }
    return { items, size };
  }, [n, grids, colorMap]);

  const plan = useMemo(() => activeMove ? cubeMotionPlan(n, activeMove) : null, [n, activeMove]);
  const renderCubie = (c: CubeCubie) => (
    <mesh key={c.key} position={c.pos} material={c.mats} castShadow receiveShadow>
      <boxGeometry args={[cubies.size, cubies.size, cubies.size]} />
    </mesh>
  );

  if (!plan) {
    return <group>{cubies.items.map(renderCubie)}</group>;
  }

  const moving = cubies.items.filter(plan.selected);
  const staticItems = cubies.items.filter((c) => !plan.selected(c));
  return (
    <group>
      {staticItems.map(renderCubie)}
      <MotionGroup axis={plan.axis} angle={plan.angle} onDone={onMotionDone}>
        {moving.map(renderCubie)}
      </MotionGroup>
    </group>
  );
}

// ───────────────────────────── Tetrahedron (Pyraminx) ─────────────────────────────
type StickerItem = {
  key: string;
  faceKey: string;
  idx: number;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  color: string;
  radius: number;
  sides: number;
};

type PyraFace = {
  key: string;
  geom: THREE.BufferGeometry;
  normal: THREE.Vector3;
  center: THREE.Vector3;
};

function pyraminxMotionPlan(move: string, faces: PyraFace[]): MotionPlan<StickerItem> | null {
  if (!/^[ULRBulrb]'?$/.test(move)) return null;
  const face = move[0].toUpperCase();
  const faceData = faces.find((f) => f.key === face);
  if (!faceData) return null;
  const prime = move.endsWith("'");
  const tipOnly = move[0] === move[0].toLowerCase();
  const selectedCells = tipOnly
    ? new Set(PYRA_TIPS[face].map((idx) => `${face}:${idx}`))
    : new Set([
        ...Array.from({ length: 9 }, (_, idx) => `${face}:${idx}`),
        ...PYRA_ADJACENT[face].flatMap(([f, cells]) => cells.map((idx) => `${f}:${idx}`)),
      ]);

  return {
    axis: faceData.normal.clone().normalize(),
    angle: (Math.PI * 2 / 3) * (prime ? -1 : 1),
    selected: (item) => selectedCells.has(`${item.faceKey}:${item.idx}`),
  };
}

function Tetrahedron({ grids, colorMap, activeMove, onMotionDone }: {
  grids: Grids;
  colorMap: Record<string, string>;
  activeMove: string | null;
  onMotionDone: () => void;
}) {
  const { faces, stickers } = useMemo(() => {
    const builtFaces = PYRA_FACES.map((f) => {
      const a = PYRA_VERTICES[f.idx[0]];
      const b = PYRA_VERTICES[f.idx[1]];
      const c = PYRA_VERTICES[f.idx[2]];
      const positions = new Float32Array([a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z]);
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geom.computeVertexNormals();
      return {
        key: f.key,
        geom,
        normal: faceNormalFromPoints(a, b, c),
        center: new THREE.Vector3().addVectors(a, b).add(c).multiplyScalar(1 / 3),
      };
    });

    const stickerItems = builtFaces.flatMap((face) => {
      const { u, v, quaternion } = basisForNormal(face.normal);
      return Array.from({ length: 9 }, (_, idx) => {
        const offset = stickerOffset(idx, 0.34);
        const position = face.center.clone()
          .addScaledVector(u, offset.x)
          .addScaledVector(v, offset.y)
          .addScaledVector(face.normal, 0.035);
        return {
          key: `${face.key}-${idx}`,
          faceKey: face.key,
          idx,
          position,
          quaternion,
          color: colorFor(grids[face.key]?.[idx], face.key, colorMap),
          radius: idx === 4 ? 0.11 : 0.095,
          sides: 3,
        };
      });
    });

    return { faces: builtFaces, stickers: stickerItems };
  }, [grids, colorMap]);

  const plan = useMemo(() => activeMove ? pyraminxMotionPlan(activeMove, faces) : null, [activeMove, faces]);
  const renderSticker = (s: StickerItem) => (
    <mesh key={s.key} position={s.position} quaternion={s.quaternion}>
      <circleGeometry args={[s.radius, s.sides]} />
      <meshStandardMaterial color={s.color} side={THREE.DoubleSide} />
    </mesh>
  );

  const moving = plan ? stickers.filter(plan.selected) : [];
  const staticStickers = plan ? stickers.filter((s) => !plan.selected(s)) : stickers;

  return (
    <group scale={1.4}>
      {faces.map((f) => (
        <mesh key={f.key} geometry={f.geom}>
          <meshStandardMaterial color={visibleFaceColor(f.key, grids[f.key], colorMap, 4)} side={THREE.DoubleSide} transparent opacity={0.32} />
        </mesh>
      ))}
      {staticStickers.map(renderSticker)}
      {plan && (
        <MotionGroup axis={plan.axis} angle={plan.angle} onDone={onMotionDone}>
          {moving.map(renderSticker)}
        </MotionGroup>
      )}
    </group>
  );
}

// ───────────────────────────── Dodecahedron (Megaminx) ─────────────────────────────
type DodecaFace = {
  geom: THREE.BufferGeometry;
  faceKey: string;
  normal: THREE.Vector3;
  center: THREE.Vector3;
};

function megaminxMotionPlan(move: string, faces: DodecaFace[], faceOrder: string[]): MotionPlan<StickerItem> | null {
  const parsed = parseMegaMove(move);
  if (!parsed) return null;
  const faceData = faces.find((f) => f.faceKey === parsed.face);
  const faceIndex = faceOrder.indexOf(parsed.face);
  if (!faceData || faceIndex < 0) return null;

  const dir = parsed.suffix === '--' || parsed.suffix === "'" ? -1 : 1;
  const turns = parsed.suffix === '++' || parsed.suffix === '--' || parsed.suffix === '2' ? 2 : 1;
  const neighbors = Array.from({ length: 5 }, (_, i) => faceOrder[(faceIndex + i + 1) % faceOrder.length]);
  const selectedCells = new Set([
    ...Array.from({ length: 11 }, (_, idx) => `${parsed.face}:${idx}`),
    ...neighbors.flatMap((f, i) => [1 + i * 2, 2 + i * 2].filter((idx) => idx < 11).map((idx) => `${f}:${idx}`)),
  ]);

  return {
    axis: faceData.normal.clone().normalize(),
    angle: (Math.PI * 2 / 5) * turns * dir,
    selected: (item) => selectedCells.has(`${item.faceKey}:${item.idx}`),
  };
}

function Dodecahedron({ grids, colorMap, faceOrder, activeMove, onMotionDone }: {
  grids: Grids;
  colorMap: Record<string, string>;
  faceOrder: string[];
  activeMove: string | null;
  onMotionDone: () => void;
}) {
  const { faces, stickers } = useMemo(() => {
    const geom = new THREE.DodecahedronGeometry(1.6, 0);
    const pos = geom.getAttribute('position');
    const triCount = pos.count / 3;
    const tris: { verts: THREE.Vector3[]; normal: THREE.Vector3 }[] = [];
    for (let i = 0; i < triCount; i++) {
      const a = new THREE.Vector3().fromBufferAttribute(pos, i * 3);
      const b = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 1);
      const c = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 2);
      const n = faceNormalFromPoints(a, b, c);
      tris.push({ verts: [a, b, c], normal: n });
    }

    const groups: { normal: THREE.Vector3; tris: typeof tris }[] = [];
    for (const t of tris) {
      let g = groups.find((gr) => gr.normal.dot(t.normal) > 0.95);
      if (!g) { g = { normal: t.normal.clone(), tris: [] }; groups.push(g); }
      g.tris.push(t);
    }

    groups.sort((a, b) => b.normal.y - a.normal.y || b.normal.z - a.normal.z || b.normal.x - a.normal.x);
    const builtFaces = groups.map((g, i) => {
      const verts: number[] = [];
      const center = new THREE.Vector3();
      let count = 0;
      for (const t of g.tris) {
        for (const vert of t.verts) {
          verts.push(vert.x, vert.y, vert.z);
          center.add(vert);
          count += 1;
        }
      }
      center.multiplyScalar(1 / Math.max(1, count));
      const fg = new THREE.BufferGeometry();
      fg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
      fg.computeVertexNormals();
      return { geom: fg, faceKey: faceOrder[i], normal: g.normal.clone().normalize(), center };
    });

    const stickerItems = builtFaces.flatMap((face) => {
      const { u, v, quaternion } = basisForNormal(face.normal);
      return Array.from({ length: 11 }, (_, idx) => {
        const isCenter = idx === 0;
        const ringIndex = idx - 1;
        const angle = Math.PI / 2 + ringIndex * (Math.PI * 2 / 10);
        const radius = isCenter ? 0 : ringIndex % 2 === 0 ? 0.62 : 0.38;
        const position = face.center.clone()
          .addScaledVector(u, Math.cos(angle) * radius)
          .addScaledVector(v, Math.sin(angle) * radius)
          .addScaledVector(face.normal, 0.035);
        return {
          key: `${face.faceKey}-${idx}`,
          faceKey: face.faceKey,
          idx,
          position,
          quaternion,
          color: colorFor(grids[face.faceKey]?.[idx], face.faceKey, colorMap),
          radius: isCenter ? 0.13 : 0.105,
          sides: 5,
        };
      });
    });

    return { faces: builtFaces, stickers: stickerItems };
  }, [grids, colorMap, faceOrder]);

  const plan = useMemo(() => activeMove ? megaminxMotionPlan(activeMove, faces, faceOrder) : null, [activeMove, faces, faceOrder]);
  const renderSticker = (s: StickerItem) => (
    <mesh key={s.key} position={s.position} quaternion={s.quaternion}>
      <circleGeometry args={[s.radius, s.sides]} />
      <meshStandardMaterial color={s.color} side={THREE.DoubleSide} />
    </mesh>
  );

  const moving = plan ? stickers.filter(plan.selected) : [];
  const staticStickers = plan ? stickers.filter((s) => !plan.selected(s)) : stickers;

  return (
    <group>
      {faces.map((f, i) => (
        <mesh key={i} geometry={f.geom}>
          <meshStandardMaterial color={visibleFaceColor(f.faceKey, grids[f.faceKey], colorMap, 0)} transparent opacity={0.28} />
        </mesh>
      ))}
      {staticStickers.map(renderSticker)}
      {plan && (
        <MotionGroup axis={plan.axis} angle={plan.angle} onDone={onMotionDone}>
          {moving.map(renderSticker)}
        </MotionGroup>
      )}
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
  handleRef?: React.MutableRefObject<Puzzle3DHandle | null>;
};

function canAnimateMove(kind: Puzzle3DKind, move: string) {
  if (kind.type === 'cube') return Boolean(parseCubeMove(move));
  if (kind.type === 'tetra') return /^[ULRBulrb]'?$/.test(move);
  const parsed = parseMegaMove(move);
  return Boolean(parsed && kind.faceOrder.includes(parsed.face));
}

export const Puzzle3D: React.FC<Props> = ({ kind, grids, colorMap, camera, handleRef }) => {
  const cm = { ...DEFAULT_COLOR_MAP, ...(colorMap || {}) };
  const cam: [number, number, number] = camera || (kind.type === 'cube' ? [kind.n + 2, kind.n + 2, kind.n + 3] : [4, 4, 5]);
  const camKey = cam.join(',');
  const [activeMove, setActiveMove] = useState<string | null>(null);
  const resolveRef = useRef<(() => void) | null>(null);

  const finishMotion = React.useCallback(() => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    resolve?.();
    setActiveMove(null);
  }, []);

  React.useEffect(() => {
    if (!handleRef) return;
    handleRef.current = {
      playMove: (move: string) => {
        if (!canAnimateMove(kind, move)) return Promise.resolve();
        return new Promise<void>((resolve) => {
          resolveRef.current = resolve;
          setActiveMove(move);
        });
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef, kind]);

  return (
    <div className="w-full aspect-square rounded-md border bg-card overflow-hidden">
      <Canvas key={camKey} camera={{ position: cam, fov: 40 }} shadows>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={0.8} />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} />
        {kind.type === 'cube' && <NxNxN n={kind.n} grids={grids} colorMap={cm} activeMove={activeMove} onMotionDone={finishMotion} />}
        {kind.type === 'tetra' && <Tetrahedron grids={grids} colorMap={cm} activeMove={activeMove} onMotionDone={finishMotion} />}
        {kind.type === 'dodeca' && <Dodecahedron grids={grids} colorMap={cm} faceOrder={kind.faceOrder} activeMove={activeMove} onMotionDone={finishMotion} />}
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
};

export default Puzzle3D;
