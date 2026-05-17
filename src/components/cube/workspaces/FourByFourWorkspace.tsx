import React from 'react';
import NetCubeWorkspace, { type NetCubeConfig } from '@/components/cube/NetCubeWorkspace';
import { solve4x4, validate4x4Grids } from '@/lib/solvers/solver4x4';
import { scramble4x4 } from '@/lib/scramblers';
import Puzzle3D from '@/components/cube/Puzzle3D';

const SWATCH: Record<string, string> = {
  U: 'cube-U', R: 'cube-R', F: 'cube-F', D: 'cube-D', L: 'cube-L', B: 'cube-B',
};

const config: NetCubeConfig = {
  title: "4x4 (Rubik's Revenge)",
  description: 'Six faces, sixteen stickers each.',
  letters: ['U', 'R', 'F', 'D', 'L', 'B'],
  swatchClassMap: SWATCH,
  faces: [
    { key: 'U', title: 'Top', stickerCount: 16, gridCols: 4 },
    { key: 'F', title: 'Front', stickerCount: 16, gridCols: 4 },
    { key: 'R', title: 'Right', stickerCount: 16, gridCols: 4 },
    { key: 'L', title: 'Left', stickerCount: 16, gridCols: 4 },
    { key: 'B', title: 'Back', stickerCount: 16, gridCols: 4 },
    { key: 'D', title: 'Bottom', stickerCount: 16, gridCols: 4 },
  ],
  validate: (g) => validate4x4Grids(g as any),
  solve: (g) => solve4x4(g as any),
  scramble: () => scramble4x4(),
  render3D: (g, cam, handleRef) => <Puzzle3D kind={{ type: 'cube', n: 4 }} grids={g} camera={cam} handleRef={handleRef} />,
  notation: (
    <div className="text-xs text-muted-foreground space-y-1">
      <p><span className="font-medium text-foreground">U / R / F / D / L / B</span> — outer face turns (same as 3x3).</p>
      <p><span className="font-medium text-foreground">Uw / Rw / Fw / Dw / Lw / Bw</span> — wide turns (two outer layers together).</p>
      <p><span className="font-medium text-foreground">3Uw / 3Rw …</span> — turn the outer three layers together (effectively the inner slice).</p>
      <p>Add <code className="font-mono">'</code> for counter-clockwise, <code className="font-mono">2</code> for 180°.</p>
      <p className="italic">Output is a reduction-method guide, not move-by-move optimal — 4x4 optimal solvers do not run in the browser.</p>
    </div>
  ),
};

const FourByFourWorkspace: React.FC = () => <NetCubeWorkspace config={config} />;
export default FourByFourWorkspace;
