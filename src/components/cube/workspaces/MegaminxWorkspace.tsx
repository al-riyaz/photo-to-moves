import React from 'react';
import NetCubeWorkspace, { type NetCubeConfig } from '@/components/cube/NetCubeWorkspace';
import { solveMegaminx, validateMegaminxGrids, MEGA_FACES } from '@/lib/solvers/solverMegaminx';
import { scrambleMegaminx } from '@/lib/scramblers';
import Puzzle3D from '@/components/cube/Puzzle3D';

const SWATCH_COLOR: Record<string, string> = {
  U: '#ffffff', F: '#009b48', R: '#b71234', L: '#0046ad',
  BL: '#ff5800', BR: '#ffd500', D: '#808080', DBL: '#90ee90',
  DBR: '#ff69b4', DL: '#87ceeb', DR: '#9370db', B: '#deb887',
};

const config: NetCubeConfig = {
  title: 'Megaminx',
  description: 'Twelve pentagonal faces, eleven stickers each (1 center + 5 corners + 5 edges).',
  letters: MEGA_FACES,
  swatchColorMap: SWATCH_COLOR,
  faces: MEGA_FACES.map((f) => ({
    key: f,
    title: f,
    stickerCount: 11,
    gridCols: 4,
  })),
  validate: (g) => validateMegaminxGrids(g as any),
  solve: (g) => solveMegaminx(g as any),
  scramble: () => scrambleMegaminx(),
  render3D: (g, cam, handleRef) => <Puzzle3D kind={{ type: 'dodeca', faceOrder: MEGA_FACES }} grids={g} colorMap={SWATCH_COLOR} camera={cam} handleRef={handleRef} />,
  notation: (
    <div className="text-xs text-muted-foreground space-y-1">
      <p><span className="font-medium text-foreground">R++ / R--</span> — double-turn (72° × 2) of right adjacent layers; + clockwise, − counter-clockwise.</p>
      <p><span className="font-medium text-foreground">U / U'</span> — top face 72° clockwise / counter-clockwise.</p>
      <p><span className="font-medium text-foreground">D++ / D--</span> — bottom equivalent.</p>
      <p className="italic">Output is a Layer-By-Layer (LBL) guide. Megaminx has 10⁶⁸ states — no in-browser optimal solver exists.</p>
    </div>
  ),
};

const MegaminxWorkspace: React.FC = () => <NetCubeWorkspace config={config} />;
export default MegaminxWorkspace;
