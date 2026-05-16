import React from 'react';
import NetCubeWorkspace, { type NetCubeConfig } from '@/components/cube/NetCubeWorkspace';
import { solve2x2, validate2x2Grids } from '@/lib/solvers/solver2x2';
import { scramble2x2 } from '@/lib/scramblers';
import Puzzle3D from '@/components/cube/Puzzle3D';

const SWATCH: Record<string, string> = {
  U: 'cube-U', R: 'cube-R', F: 'cube-F', D: 'cube-D', L: 'cube-L', B: 'cube-B',
};

const config: NetCubeConfig = {
  title: '2x2 (Pocket Cube)',
  description: 'Six faces, four stickers each.',
  letters: ['U', 'R', 'F', 'D', 'L', 'B'],
  swatchClassMap: SWATCH,
  faces: [
    { key: 'U', title: 'Top', stickerCount: 4, gridCols: 2 },
    { key: 'F', title: 'Front', stickerCount: 4, gridCols: 2 },
    { key: 'R', title: 'Right', stickerCount: 4, gridCols: 2 },
    { key: 'L', title: 'Left', stickerCount: 4, gridCols: 2 },
    { key: 'B', title: 'Back', stickerCount: 4, gridCols: 2 },
    { key: 'D', title: 'Bottom', stickerCount: 4, gridCols: 2 },
  ],
  validate: (g) => validate2x2Grids(g as any),
  solve: (g) => solve2x2(g as any),
  scramble: () => scramble2x2(),
  render3D: (g) => <Puzzle3D kind={{ type: 'cube', n: 2 }} grids={g} />,
  notation: (
    <div className="grid sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
      <div><span className="font-medium text-foreground">Faces:</span> U, D, F, B, L, R (90° clockwise)</div>
      <div><span className="font-medium text-foreground">Prime:</span> U', D', F', B', L', R' (counter-clockwise)</div>
      <div><span className="font-medium text-foreground">Double:</span> U2, D2, F2, B2, L2, R2 (180°)</div>
    </div>
  ),
};

const TwoByTwoWorkspace: React.FC = () => <NetCubeWorkspace config={config} />;
export default TwoByTwoWorkspace;