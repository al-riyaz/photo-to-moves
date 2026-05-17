import React from 'react';
import NetCubeWorkspace, { type NetCubeConfig } from '@/components/cube/NetCubeWorkspace';
import { solvePyraminx, validatePyraminxGrids } from '@/lib/solvers/solverPyraminx';
import { scramblePyraminx } from '@/lib/scramblers';
import Puzzle3D from '@/components/cube/Puzzle3D';

const SWATCH: Record<string, string> = {
  U: 'cube-U', L: 'cube-L', R: 'cube-R', B: 'cube-B',
};

const config: NetCubeConfig = {
  title: 'Pyraminx',
  description: 'Four triangular faces, nine stickers each (3 tip + 3 axial + 3 edge).',
  letters: ['U', 'L', 'R', 'B'],
  swatchClassMap: SWATCH,
  faces: [
    { key: 'U', title: 'Top', stickerCount: 9, gridCols: 3 },
    { key: 'L', title: 'Left', stickerCount: 9, gridCols: 3 },
    { key: 'R', title: 'Right', stickerCount: 9, gridCols: 3 },
    { key: 'B', title: 'Back', stickerCount: 9, gridCols: 3 },
  ],
  validate: (g) => validatePyraminxGrids(g as any),
  solve: (g) => solvePyraminx(g as any),
  scramble: () => scramblePyraminx(),
  render3D: (g, cam, handleRef) => <Puzzle3D kind={{ type: 'tetra' }} grids={g} colorMap={{ U: '#ffffff', L: '#ff5800', R: '#b71234', B: '#009b48' }} camera={cam} handleRef={handleRef} />,
  notation: (
    <div className="text-xs text-muted-foreground space-y-1">
      <p><span className="font-medium text-foreground">U / L / R / B</span> — turn an entire face (including the tip) 120° clockwise.</p>
      <p><span className="font-medium text-foreground">u / l / r / b</span> — turn only the tip cubie.</p>
      <p>Append <code className="font-mono">'</code> for counter-clockwise.</p>
      <p className="italic">Output is a beginner-method guide. Tips first, then layer-by-layer.</p>
    </div>
  ),
};

const PyraminxWorkspace: React.FC = () => <NetCubeWorkspace config={config} />;
export default PyraminxWorkspace;
