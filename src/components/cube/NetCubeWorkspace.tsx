import React, { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Palette, Play, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { averageColor, classifyStickerColor, type RGB } from '@/lib/color-utils';

export type FacelKey = string;

export type NetCubeFaceConfig = {
  key: FacelKey;
  title: string;
  stickerCount: number;        // total stickers on this face
  /** Grid columns to render in the manual color editor. e.g. 2 for 2x2, 4 for 4x4. */
  gridCols?: number;
  /** Optional custom cell renderer (for non-rectangular layouts like pyraminx). */
  renderCells?: (cells: string[], onClick: (i: number) => void) => React.ReactNode;
  /** Optional image sampler. Defaults to gridCols × (stickerCount/gridCols) row-major averaging. */
};

export type NetCubeConfig = {
  title: string;
  description: string;
  faces: NetCubeFaceConfig[];
  /** Letter palette for the color-cycle and color-class swatches. */
  letters: FacelKey[];
  /** Tailwind background classes per letter, e.g. { U: 'cube-U', R: 'cube-R', ... } */
  swatchClassMap: Record<FacelKey, string>;
  /** Notation legend rendered under the solution. */
  notation: React.ReactNode;
  /** Solver: receives grids keyed by face key, returns solution string (sync or async). */
  solve: (grids: Record<FacelKey, string[]>) => string | Promise<string>;
  /** Validator: returns ok=false to short-circuit before solving. */
  validate?: (grids: Record<FacelKey, string[]>) => { ok: boolean; message?: string };
  /** Optional notice rendered at the top of the workspace. */
  notice?: React.ReactNode;
};

function sampleGridAverages(img: HTMLImageElement, cols: number, rows: number): RGB[] {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const maxDim = 768;
  let w = img.naturalWidth, h = img.naturalHeight;
  if (w > maxDim || h > maxDim) {
    if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
    else { w = Math.round((w * maxDim) / h); h = maxDim; }
  }
  canvas.width = w; canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);
  const cellW = Math.floor(w / cols);
  const cellH = Math.floor(h / rows);
  const padX = Math.floor(cellW * 0.18);
  const padY = Math.floor(cellH * 0.18);
  const out: RGB[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW + padX, y = r * cellH + padY;
      const sw = Math.max(1, cellW - padX * 2), sh = Math.max(1, cellH - padY * 2);
      out.push(averageColor(ctx.getImageData(x, y, sw, sh).data));
    }
  }
  return out;
}

export const NetCubeWorkspace: React.FC<{ config: NetCubeConfig }> = ({ config }) => {
  const initGrids = useMemo(() => {
    const g: Record<FacelKey, string[]> = {};
    for (const f of config.faces) g[f.key] = Array(f.stickerCount).fill('');
    return g;
  }, [config]);
  const [grids, setGrids] = useState<Record<FacelKey, string[]>>(initGrids);
  const [previews, setPreviews] = useState<Record<FacelKey, string | undefined>>({});
  const [solution, setSolution] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);

  const cycle = (faceKey: FacelKey, idx: number) => {
    setGrids((prev) => {
      const next = { ...prev, [faceKey]: [...prev[faceKey]] };
      const cur = next[faceKey][idx];
      const letters = config.letters;
      if (!cur) next[faceKey][idx] = letters[0];
      else {
        const i = letters.indexOf(cur);
        next[faceKey][idx] = letters[(i + 1) % letters.length];
      }
      return next;
    });
    setSolution(null);
  };

  const handleFile = (face: NetCubeFaceConfig, file: File) => {
    const url = URL.createObjectURL(file);
    setPreviews((p) => ({ ...p, [face.key]: url }));
    const img = new Image();
    img.onload = () => {
      const cols = face.gridCols ?? Math.round(Math.sqrt(face.stickerCount));
      const rows = Math.ceil(face.stickerCount / cols);
      const rgbs = sampleGridAverages(img, cols, rows).slice(0, face.stickerCount);
      const labels = rgbs.map((rgb) => {
        const cls = classifyStickerColor(rgb);
        // If face letter set differs from default URFDLB (e.g. pyraminx UFLR), map closest by available letters.
        return config.letters.includes(cls) ? cls : config.letters[0];
      });
      setGrids((prev) => ({ ...prev, [face.key]: labels }));
      setSolution(null);
    };
    img.src = url;
  };

  const resetFace = (faceKey: FacelKey) => {
    setGrids((prev) => ({ ...prev, [faceKey]: Array(prev[faceKey].length).fill('') }));
    setPreviews((p) => ({ ...p, [faceKey]: undefined }));
    setSolution(null);
  };

  const resetAll = () => { setGrids(initGrids); setPreviews({}); setSolution(null); };

  const doSolve = async () => {
    try {
      if (config.validate) {
        const v = config.validate(grids);
        if (!v.ok) { toast({ title: 'Invalid cube state', description: v.message }); return; }
      }
      setSolving(true);
      toast({ title: 'Solving...', description: `Computing solution for ${config.title}` });
      const res = await config.solve(grids);
      setSolution(res || 'Already solved');
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Solve failed', description: e?.message || 'Unknown error' });
    } finally {
      setSolving(false);
    }
  };

  const facesFilled = config.faces.filter((f) => grids[f.key].every(Boolean)).length;

  return (
    <div className="space-y-6">
      {config.notice}
      <Card>
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
          <CardDescription>{config.description} — {facesFilled}/{config.faces.length} faces filled.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.faces.map((face) => {
              const cells = grids[face.key];
              const cols = face.gridCols ?? Math.round(Math.sqrt(face.stickerCount));
              return (
                <div key={face.key} className="space-y-2 p-3 rounded-md border bg-card">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{face.title} <span className="text-muted-foreground">({face.key})</span></h3>
                    <div className="flex items-center gap-1">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(face, f); }}
                        />
                        <Button asChild size="sm" variant="outline"><span><Upload className="h-3.5 w-3.5" /></span></Button>
                      </label>
                      <Button size="sm" variant="ghost" onClick={() => resetFace(face.key)} aria-label="Reset face">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {previews[face.key] && (
                    <img src={previews[face.key]} alt={`${face.title} preview`} className="w-full max-h-24 object-contain rounded-sm border" />
                  )}
                  {face.renderCells ? (
                    face.renderCells(cells, (i) => cycle(face.key, i))
                  ) : (
                    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                      {cells.map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => cycle(face.key, i)}
                          className={cn(
                            'aspect-square rounded-sm border focus:outline-none focus:ring-2 focus:ring-ring',
                            c ? config.swatchClassMap[c] : 'bg-muted'
                          )}
                          title={c || 'Unset'}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="hero" onClick={doSolve} disabled={solving}>
              <Play className="h-4 w-4" /> {solving ? 'Solving...' : 'Solve'}
            </Button>
            <Button variant="ghost" onClick={resetAll}>Reset all</Button>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-2 ml-auto">
              <Palette className="h-3.5 w-3.5" /> Click stickers to cycle colors
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {config.letters.map((l) => (
              <span key={l} className="inline-flex items-center gap-1">
                <span className={cn('inline-block w-3 h-3 rounded-sm border', config.swatchClassMap[l])} />
                {l}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Solution</CardTitle>
          <CardDescription>Solver output and notation legend.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {solution ? (
            <pre className="text-sm font-mono whitespace-pre-wrap break-words p-3 rounded-md border bg-muted/40">{solution}</pre>
          ) : (
            <p className="text-muted-foreground text-sm">Enter your cube colors (upload photos or click stickers), then click Solve.</p>
          )}
          <div className="pt-2 border-t text-sm">{config.notation}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetCubeWorkspace;