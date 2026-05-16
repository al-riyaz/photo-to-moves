import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type CubeType = '3x3' | '2x2' | '4x4' | 'pyraminx' | 'megaminx' | 'mirror';

export const CUBE_LABELS: Record<CubeType, string> = {
  '3x3': '3x3',
  '2x2': '2x2',
  '4x4': '4x4',
  pyraminx: 'Pyraminx',
  megaminx: 'Megaminx',
  mirror: 'Mirror',
};

export const CubeTypeMenu: React.FC<{ value: CubeType; onChange: (v: CubeType) => void }> = ({ value, onChange }) => (
  <Tabs value={value} onValueChange={(v) => onChange(v as CubeType)}>
    <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
      {(Object.keys(CUBE_LABELS) as CubeType[]).map((k) => (
        <TabsTrigger key={k} value={k}>{CUBE_LABELS[k]}</TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

export default CubeTypeMenu;
