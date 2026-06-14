import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type CubeType = '3x3' | '2x2' | '4x4' | 'pyraminx' | 'megaminx' | 'mirror';

export const CUBE_LABELS: Record<Extract<CubeType, '3x3'>, string> = {
  '3x3': '3x3',
};

export const CubeTypeMenu: React.FC<{ value: CubeType; onChange: (v: CubeType) => void }> = ({ value, onChange }) => {
  const keys = Object.keys(CUBE_LABELS) as Array<keyof typeof CUBE_LABELS>;
  
  if (keys.length <= 1) {
    return null; // Hide selector entirely if there is only one cube type
  }

  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as CubeType)}>
      <TabsList className="grid grid-cols-1 w-full max-w-xs mx-auto">
        {keys.map((k) => (
          <TabsTrigger key={k} value={k}>{CUBE_LABELS[k]}</TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default CubeTypeMenu;
