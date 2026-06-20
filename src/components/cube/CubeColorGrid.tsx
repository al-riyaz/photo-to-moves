import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Face } from '@/lib/color-utils';
import { RotateCcw } from 'lucide-react';
import React from 'react';

const LETTERS: Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];

type Props = {
  face: Face;
  title: string;
  cells: (Face | '')[]; // length 9
  onChange: (cells: (Face | '')[]) => void;
  onRotate?: () => void;
};

export const CubeColorGrid: React.FC<Props> = ({ face, title, cells, onChange, onRotate }) => {
  const cycle = (idx: number) => {
    const next = [...cells];
    const cur = next[idx];
    if (!cur) {
      next[idx] = LETTERS[0];
    } else {
      const i = LETTERS.indexOf(cur as Face);
      next[idx] = LETTERS[(i + 1) % LETTERS.length];
    }
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title} ({face})</h3>
        {onRotate && (
          <Button size="sm" variant="outline" onClick={onRotate} aria-label={`Rotate ${title}`}>
            <RotateCcw className="mr-2" /> Rotate
          </Button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1 p-2 rounded-md border bg-card tilt-on-hover">
        {cells.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => cycle(i)}
            aria-label={`${title} sticker row ${Math.floor(i / 3) + 1} column ${(i % 3) + 1}, ${c ? `color ${c}` : 'unset'}`}
            className={cn(
              'aspect-square rounded-sm border transition-opacity focus:outline-none focus:ring-2 focus:ring-ring',
              c ? `cube-${c}` : 'bg-muted'
            )}
            title={(c as string) || 'Unset'}
          />
        ))}
      </div>
    </div>
  );
};
