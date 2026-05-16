import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Palette, Play, RotateCcw, Shuffle, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { averageColor, classifyStickerColor, type RGB } from '@/lib/color-utils';

export type FacelKey = string;

export type NetCubeFaceConfig = {
  key: FacelKey;
  title: string;
  stickerCount: number;
  gridCols?: number;
  renderCells?: (cells: string[], onClick: (i: number) => void) => React.ReactNode;
};

export type NetCubeConfig = {
  title: string;
  description: string;
  faces: NetCubeFaceConfig[];
  letters: FacelKey[];
  swatchClassMap?: Record<FacelKey, string>;
  swatchColorMap?: Record<FacelKey, string>;
  notation: React.ReactNode;
  solve: (grids: Record<FacelKey, string[]>) => string | Promise<string>;
  validate?: (grids: Record<FacelKey, string[]>) => { ok: boolean; message?: string };
  notice?: React.ReactNode;
  scramble?: () => string;
  render3D?: (grids: Record<FacelKey, string[]>) => React.ReactNode;
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

/** Default solved-state grid: every sticker = face letter (or first letter if face key isn't a letter). */
function makeSolvedGrids(config: NetCubeConfig): Record<FacelKey, string[]> {
  const g: Record<FacelKey, string[]> = {};
  for (const f of config.faces) {
    const fill = config.letters.includes(f.key) ? f.key : config.letters[0];
    g[f.key] = Array(f.stickerCount).fill(fill);
  }
  return g;
}

export const NetCubeWorkspace: React.FC<{ config: NetCubeConfig }> = ({ config }) => {
  // Start in solved state so the 3D view renders fully colored by default (like 3x3).
  const solvedGrids = useMemo(() => makeSolvedGrids(config), [config]);
  const [grids, setGrids] = useState<Record<FacelKey, string[]>>(solvedGrids);
  const [previews, setPreviews] = useState<Record<FacelKey, string | undefined>>({});
  const [solution, setSolution] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);
  const [scramble, setScramble] = useState<string | null>(null);

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

  const resetAll = () => {
    setGrids(makeSolvedGrids(config));
    setPreviews({});
    setSolution(null);
    setScramble(null);
  };

  const doScramble = () => {
    if (!config.scramble) return;
    const s = config.scramble();
    setScramble(s);
    toast({ title: 'Scramble generated', description: 'Apply this sequence to your puzzle, then upload faces.' });
  };

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
  const imagesUploaded = Object.values(previews).filter(Boolean).length;

  const renderFaceGrid = (face: NetCubeFaceConfig) => {
    const cells = grids[face.key];
    const cols = face.gridCols ?? Math.round(Math.sqrt(face.stickerCount));
    if (face.renderCells) return face.renderCells(cells, (i) => cycle(face.key, i));
    return (
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {cells.map((c, i) => {
          const cls = c && config.swatchClassMap?.[c];
          const inlineColor = c && !cls ? config.swatchColorMap?.[c] : undefined;
          return (
            <button
              key={i}
              type="button"
              onClick={() => cycle(face.key, i)}
              className={cn(
                'aspect-square rounded-sm border focus:outline-none focus:ring-2 focus:ring-ring',
                cls || (c ? '' : 'bg-muted')
              )}
              style={inlineColor ? { backgroundColor: inlineColor } : undefined}
              title={c || 'Unset'}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {config.notice}
      <section className="grid lg:grid-cols-5 gap-6">
        {/* Big 3D view */}
        <Card className="lg:col-span-3 tilt-on-hover">
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                {config.title}
                {facesFilled > 0 && (
                  <span className="text-xs font-normal text-muted-foreground inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    {facesFilled}/{config.faces.length} faces
                  </span>
                )}
              </CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Upload dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Upload face images" title="Upload face images" className="relative">
                    <Upload className="h-4 w-4" />
                    {imagesUploaded > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] leading-none rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                        {imagesUploaded}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Upload Face Images</DialogTitle>
                    <DialogDescription>
                      Upload a clear photo of each face — colors are detected automatically.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {config.faces.map((face) => (
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
                        {renderFaceGrid(face)}
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit colors dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Edit colors" title="Edit colors" className="relative">
                    <Palette className="h-4 w-4" />
                    {facesFilled > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] leading-none rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                        {facesFilled}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Review & Edit Colors</DialogTitle>
                    <DialogDescription>
                      Click stickers to cycle colors.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {config.faces.map((face) => (
                      <div key={face.key} className="space-y-2 p-3 rounded-md border bg-card">
                        <h3 className="text-sm font-medium">{face.title} <span className="text-muted-foreground">({face.key})</span></h3>
                        {renderFaceGrid(face)}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                    {config.letters.map((l) => {
                      const cls = config.swatchClassMap?.[l];
                      const col = !cls ? config.swatchColorMap?.[l] : undefined;
                      return (
                        <span key={l} className="inline-flex items-center gap-1">
                          <span className={cn('inline-block w-3 h-3 rounded-sm border', cls)} style={col ? { backgroundColor: col } : undefined} />
                          {l}
                        </span>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mx-auto w-full max-w-xl">
              {config.render3D ? config.render3D(grids) : (
                <p className="text-sm text-muted-foreground text-center py-12">3D view unavailable for this puzzle.</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {config.scramble && (
                <Button variant="hero" onClick={doScramble}>
                  <Shuffle className="h-4 w-4" /> Scramble
                </Button>
              )}
              <Button variant="hero" onClick={doSolve} disabled={solving}>
                <Play className="h-4 w-4" /> {solving ? 'Solving...' : 'Solve'}
              </Button>
              <Button variant="ghost" onClick={resetAll}>Reset</Button>
              {scramble && (
                <span className="text-xs text-muted-foreground font-mono break-words">{scramble}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Solution panel */}
        <Card className="lg:col-span-2 tilt-on-hover">
          <CardHeader>
            <CardTitle>Solution</CardTitle>
            <CardDescription>Solver output and notation legend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {solution ? (
              <pre className="text-sm font-mono whitespace-pre-wrap break-words p-3 rounded-md border bg-muted/40 max-h-96 overflow-y-auto">{solution}</pre>
            ) : (
              <p className="text-muted-foreground text-sm">Scramble, upload face photos, or edit colors — then click Solve.</p>
            )}
            <div className="pt-2 border-t text-sm">{config.notation}</div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default NetCubeWorkspace;
