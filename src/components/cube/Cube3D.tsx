import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Standard Rubik's color palette
const COLORS = {
  U: '#ffffff', // white (top)
  D: '#ffd500', // yellow (bottom)
  F: '#009b48', // green (front)
  B: '#0045ad', // blue (back)
  R: '#b71234', // red (right)
  L: '#ff5800', // orange (left)
  inner: '#111111',
};

type Move = string; // e.g. "R", "U'", "F2"

const AXIS_FOR_FACE: Record<string, { axis: 'x' | 'y' | 'z'; layer: 1 | 0 | -1; dir: 1 | -1 }> = {
  R: { axis: 'x', layer: 1, dir: -1 },
  L: { axis: 'x', layer: -1, dir: 1 },
  U: { axis: 'y', layer: 1, dir: -1 },
  D: { axis: 'y', layer: -1, dir: 1 },
  F: { axis: 'z', layer: 1, dir: -1 },
  B: { axis: 'z', layer: -1, dir: 1 },
};

function Cubie({ position }: { position: [number, number, number] }) {
  const [x, y, z] = position;
  // Materials per face: order = +x, -x, +y, -y, +z, -z
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
    <mesh position={position} material={materials} castShadow receiveShadow userData={{ cubie: true }}>
      <boxGeometry args={[0.96, 0.96, 0.96]} />
    </mesh>
  );
}

type RubiksCubeProps = {
  queue: React.MutableRefObject<Move[]>;
};

const RubiksCube: React.FC<RubiksCubeProps> = ({ queue }) => {
  const groupRef = useRef<THREE.Group>(null);
  const animRef = useRef<{
    pivot: THREE.Group;
    targetAngle: number;
    currentAngle: number;
    speed: number;
    cubies: THREE.Object3D[];
    axis: 'x' | 'y' | 'z';
  } | null>(null);

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
      speed: Math.PI * 2, // rad/sec
      cubies: selected,
      axis: meta.axis,
    };
  };

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (!animRef.current) {
      const next = queue.current.shift();
      if (next) startMove(next);
      return;
    }
    const a = animRef.current;
    const step = Math.sign(a.targetAngle) * Math.min(a.speed * delta, Math.abs(a.targetAngle - a.currentAngle));
    a.currentAngle += step;
    if (a.axis === 'x') a.pivot.rotation.x = a.currentAngle;
    if (a.axis === 'y') a.pivot.rotation.y = a.currentAngle;
    if (a.axis === 'z') a.pivot.rotation.z = a.currentAngle;

    if (Math.abs(a.currentAngle - a.targetAngle) < 1e-4) {
      // Bake transform back into the parent group
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

export type Cube3DHandle = {
  enqueue: (moves: string[]) => void;
};

type Props = {
  handleRef: React.MutableRefObject<Cube3DHandle | null>;
};

export const Cube3D: React.FC<Props> = ({ handleRef }) => {
  const queue = useRef<string[]>([]);

  React.useEffect(() => {
    handleRef.current = {
      enqueue: (moves) => {
        queue.current.push(...moves);
      },
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
        <RubiksCube queue={queue} />
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
    // avoid like R L R (same axis twice in a row sandwich)
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
