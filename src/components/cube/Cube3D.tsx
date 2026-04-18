import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Standard Rubik's color palette
const COLORS = {
  U: '#ffffff',
  D: '#ffd500',
  F: '#009b48',
  B: '#0045ad',
  R: '#b71234',
  L: '#ff5800',
  inner: '#111111',
};

type Move = string;
type FaceLetter = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';

const AXIS_FOR_FACE: Record<string, { axis: 'x' | 'y' | 'z'; layer: 1 | 0 | -1; dir: 1 | -1 }> = {
  R: { axis: 'x', layer: 1, dir: -1 },
  L: { axis: 'x', layer: -1, dir: 1 },
  U: { axis: 'y', layer: 1, dir: -1 },
  D: { axis: 'y', layer: -1, dir: 1 },
  F: { axis: 'z', layer: 1, dir: -1 },
  B: { axis: 'z', layer: -1, dir: 1 },
};

// For each face: which axis the sticker sits on, the world coord on that axis,
// and the two in-plane axes (u = column direction, v = row direction).
// Reading order is row-major top-left to bottom-right of that face, viewed from outside.
const FACE_READ: Record<
  FaceLetter,
  { normalAxis: 'x' | 'y' | 'z'; normalVal: 1 | -1; uAxis: 'x' | 'y' | 'z'; uDir: 1 | -1; vAxis: 'x' | 'y' | 'z'; vDir: 1 | -1 }
> = {
  // U (top, y=+1): rows go from back(-z is top of face? No: top row of U seen from above is the back row, i.e., z=-1)
  U: { normalAxis: 'y', normalVal: 1, uAxis: 'x', uDir: 1, vAxis: 'z', vDir: 1 },
  // D (bottom, y=-1): viewed from below — top row = front (z=+1)
  D: { normalAxis: 'y', normalVal: -1, uAxis: 'x', uDir: 1, vAxis: 'z', vDir: -1 },
  // F (front, z=+1): top row = U (y=+1), columns from L(-x) to R(+x)
  F: { normalAxis: 'z', normalVal: 1, uAxis: 'x', uDir: 1, vAxis: 'y', vDir: -1 },
  // B (back, z=-1): viewed from behind — top row = U, columns from R(+x) to L(-x)
  B: { normalAxis: 'z', normalVal: -1, uAxis: 'x', uDir: -1, vAxis: 'y', vDir: -1 },
  // R (right, x=+1): top row = U, columns from F(+z) to B(-z)
  R: { normalAxis: 'x', normalVal: 1, uAxis: 'z', uDir: -1, vAxis: 'y', vDir: -1 },
  // L (left, x=-1): top row = U, columns from B(-z) to F(+z)
  L: { normalAxis: 'x', normalVal: -1, uAxis: 'z', uDir: 1, vAxis: 'y', vDir: -1 },
};

// Map original (home) cubie face direction to face letter
function homeFaceFromDirection(dir: THREE.Vector3): FaceLetter | null {
  const ax = Math.abs(dir.x), ay = Math.abs(dir.y), az = Math.abs(dir.z);
  if (ax > ay && ax > az) return dir.x > 0 ? 'R' : 'L';
  if (ay > ax && ay > az) return dir.y > 0 ? 'U' : 'D';
  if (az > ax && az > ay) return dir.z > 0 ? 'F' : 'B';
  return null;
}

function Cubie({ position }: { position: [number, number, number] }) {
  const [x, y, z] = position;
  const materials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ color: x === 1 ? COLORS.R : COLORS.inner }),
      new THREE.MeshStandardMaterial({ color: x === -1 ? COLORS.L : COLORS.inner }),
      new THREE.MeshStandardMaterial({ color: y === 1 ? COLORS.U : COLORS.inner }),
      new THREE.MeshStandardMaterial({ color: y === -1 ? COLORS.D : COLORS.inner }),
      new THREE.MeshStandardMaterial({ color: z === 1 ? COLORS.F : COLORS.inner }),
      new THREE.MeshStandardMaterial({ color: z === -1 ? COLORS.B : COLORS.inner }),
    ],
    [x, y, z]
  );

  return (
    <mesh
      position={position}
      material={materials}
      castShadow
      receiveShadow
      userData={{ cubie: true, home: { x, y, z } }}
    >
      <boxGeometry args={[0.96, 0.96, 0.96]} />
    </mesh>
  );
}

type RubiksCubeProps = {
  queue: React.MutableRefObject<Move[]>;
  groupOutRef: React.MutableRefObject<THREE.Group | null>;
  idleRef: React.MutableRefObject<boolean>;
};

const RubiksCube: React.FC<RubiksCubeProps> = ({ queue, groupOutRef, idleRef }) => {
  const groupRef = useRef<THREE.Group>(null);
  const animRef = useRef<{
    pivot: THREE.Group;
    targetAngle: number;
    currentAngle: number;
    speed: number;
    cubies: THREE.Object3D[];
    axis: 'x' | 'y' | 'z';
  } | null>(null);

  React.useEffect(() => {
    groupOutRef.current = groupRef.current;
  });

  const cubies = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) arr.push([x, y, z]);
    return arr;
  }, []);

  const startMove = (move: Move) => {
    if (!groupRef.current) return;
    const face = move[0];
    const meta = AXIS_FOR_FACE[face];
    if (!meta) return;
    const isPrime = move.includes("'");
    const isDouble = move.includes('2');
    const angle = (Math.PI / 2) * (isDouble ? 2 : 1) * meta.dir * (isPrime ? -1 : 1);

    const pivot = new THREE.Group();
    groupRef.current.add(pivot);

    const selected: THREE.Object3D[] = [];
    groupRef.current.children.forEach((child) => {
      if (!child.userData.cubie) return;
      const pos = child.position;
      const v = meta.axis === 'x' ? pos.x : meta.axis === 'y' ? pos.y : pos.z;
      if (Math.round(v) === meta.layer) selected.push(child);
    });
    selected.forEach((c) => pivot.attach(c));

    animRef.current = {
      pivot,
      targetAngle: angle,
      currentAngle: 0,
      speed: Math.PI * 2,
      cubies: selected,
      axis: meta.axis,
    };
    idleRef.current = false;
  };

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (!animRef.current) {
      const next = queue.current.shift();
      if (next) {
        startMove(next);
      } else {
        idleRef.current = true;
      }
      return;
    }
    const a = animRef.current;
    const step = Math.sign(a.targetAngle) * Math.min(a.speed * delta, Math.abs(a.targetAngle - a.currentAngle));
    a.currentAngle += step;
    if (a.axis === 'x') a.pivot.rotation.x = a.currentAngle;
    if (a.axis === 'y') a.pivot.rotation.y = a.currentAngle;
    if (a.axis === 'z') a.pivot.rotation.z = a.currentAngle;

    if (Math.abs(a.currentAngle - a.targetAngle) < 1e-4) {
      a.pivot.updateMatrixWorld(true);
      const parent = groupRef.current!;
      [...a.cubies].forEach((c) => {
        parent.attach(c);
        c.position.set(Math.round(c.position.x), Math.round(c.position.y), Math.round(c.position.z));
        c.rotation.x = Math.round(c.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
        c.rotation.y = Math.round(c.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
        c.rotation.z = Math.round(c.rotation.z / (Math.PI / 2)) * (Math.PI / 2);
      });
      parent.remove(a.pivot);
      animRef.current = null;
    }
  });

  return (
    <group ref={groupRef}>
      {cubies.map((p, i) => (
        <Cubie key={i} position={p} />
      ))}
    </group>
  );
};

// Read 54 facelets from current cube state.
function readFacelets(group: THREE.Group): Record<FaceLetter, FaceLetter[]> {
  const cubies = group.children.filter((c) => c.userData.cubie);
  // index cubies by their current rounded position
  const byPos = new Map<string, THREE.Object3D>();
  for (const c of cubies) {
    const key = `${Math.round(c.position.x)},${Math.round(c.position.y)},${Math.round(c.position.z)}`;
    byPos.set(key, c);
  }

  const result = {} as Record<FaceLetter, FaceLetter[]>;
  const faces: FaceLetter[] = ['U', 'R', 'F', 'D', 'L', 'B'];
  for (const f of faces) {
    const meta = FACE_READ[f];
    const stickers: FaceLetter[] = [];
    // row 0..2 (top to bottom of face), col 0..2 (left to right)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        // map row/col (0..2) to coordinates -1..+1 along u and v axes
        const u = (col - 1) * meta.uDir;
        const v = (row - 1) * meta.vDir;
        const pos: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
        pos[meta.normalAxis] = meta.normalVal;
        pos[meta.uAxis] = u;
        pos[meta.vAxis] = v;
        const key = `${pos.x},${pos.y},${pos.z}`;
        const cubie = byPos.get(key);
        if (!cubie) {
          stickers.push('U');
          continue;
        }
        // Determine the outward world direction we want to sample
        const worldDir = new THREE.Vector3(0, 0, 0);
        worldDir[meta.normalAxis] = meta.normalVal;
        // Convert that world direction into the cubie's local space
        cubie.updateMatrixWorld(true);
        const inv = new THREE.Matrix4().copy(cubie.matrixWorld).invert();
        // Use direction transform (no translation): use a quaternion approach
        const localDir = worldDir.clone().applyMatrix4(inv);
        // Subtract the local origin's world->local translation effect by re-doing as direction:
        const originLocal = new THREE.Vector3(0, 0, 0).applyMatrix4(inv);
        localDir.sub(originLocal).normalize();
        // The home face that originally pointed in localDir tells us the color
        const home = homeFaceFromDirection(localDir);
        stickers.push(home || 'U');
      }
    }
    result[f] = stickers;
  }
  return result;
}

export type Cube3DHandle = {
  enqueue: (moves: string[]) => void;
  waitUntilIdle: () => Promise<void>;
  readFacelets: () => Record<FaceLetter, FaceLetter[]> | null;
};

type Props = {
  handleRef: React.MutableRefObject<Cube3DHandle | null>;
};

export const Cube3D: React.FC<Props> = ({ handleRef }) => {
  const queue = useRef<string[]>([]);
  const groupRef = useRef<THREE.Group | null>(null);
  const idleRef = useRef<boolean>(true);

  React.useEffect(() => {
    handleRef.current = {
      enqueue: (moves) => {
        queue.current.push(...moves);
        idleRef.current = false;
      },
      waitUntilIdle: () =>
        new Promise<void>((resolve) => {
          const check = () => {
            if (idleRef.current && queue.current.length === 0) resolve();
            else setTimeout(check, 60);
          };
          check();
        }),
      readFacelets: () => (groupRef.current ? readFacelets(groupRef.current) : null),
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef]);

  return (
    <div className="w-full aspect-square rounded-md border bg-card overflow-hidden">
      <Canvas camera={{ position: [4, 4, 5], fov: 40 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={0.8} />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} />
        <RubiksCube queue={queue} groupOutRef={groupRef} idleRef={idleRef} />
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
};

const FACES = ['U', 'D', 'L', 'R', 'F', 'B'] as const;
const SUFFIX = ['', "'", '2'] as const;

export function generateScramble(length = 20): string[] {
  const moves: string[] = [];
  let lastFace = '';
  let secondLastFace = '';
  while (moves.length < length) {
    const face = FACES[Math.floor(Math.random() * FACES.length)];
    if (face === lastFace) continue;
    const sameAxis = (a: string, b: string) =>
      (['U', 'D'].includes(a) && ['U', 'D'].includes(b)) ||
      (['L', 'R'].includes(a) && ['L', 'R'].includes(b)) ||
      (['F', 'B'].includes(a) && ['F', 'B'].includes(b));
    if (sameAxis(face, lastFace) && sameAxis(face, secondLastFace)) continue;
    const suf = SUFFIX[Math.floor(Math.random() * SUFFIX.length)];
    moves.push(face + suf);
    secondLastFace = lastFace;
    lastFace = face;
  }
  return moves;
}
