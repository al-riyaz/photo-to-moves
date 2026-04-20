import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Upload, Palette, Shuffle, Play, Box, Info, CheckCircle2 } from 'lucide-react';
import { CubeFaceUploader } from '@/components/cube/CubeFaceUploader';
import { CubeColorGrid } from '@/components/cube/CubeColorGrid';
import { Cube3D, generateScramble, type Cube3DHandle } from '@/components/cube/Cube3D';
import type { Face, RGB } from '@/lib/color-utils';
import { FACE_ORDER, rgbDistance, rotateGrid } from '@/lib/color-utils';
import { buildFaceletsString, solveFacelets, validateFaceletCounts } from '@/lib/cube-solver';

const FACE_META: { face: Face; title: string }[] = [
  { face: 'U', title: 'Top' },
  { face: 'F', title: 'Front' },
  { face: 'R', title: 'Right' },
  { face: 'L', title: 'Left' },
  { face: 'B', title: 'Back' },
  { face: 'D', title: 'Bottom' },
];

type FaceState = {
  rgb: RGB[];
  labels: (Face | '')[];
  rotation: number;
  imageUrl?: string;
};

const emptyLabels = Array.from({ length: 9 }, () => '' as const);
const makeEmptyFaces = (): Record<Face, FaceState> => ({
  U: { rgb: [], labels: [...emptyLabels], rotation: 0 },
  R: { rgb: [], labels: [...emptyLabels], rotation: 0 },
  F: { rgb: [], labels: [...emptyLabels], rotation: 0 },
  D: { rgb: [], labels: [...emptyLabels], rotation: 0 },
  L: { rgb: [], labels: [...emptyLabels], rotation: 0 },
  B: { rgb: [], labels: [...emptyLabels], rotation: 0 },
});

const Index: React.FC = () => {
  const [faces, setFaces] = useState<Record<Face, FaceState>>(makeEmptyFaces);
  const [solution, setSolution] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [scramble, setScramble] = useState<string[]>([]);
  const cube3dRef = useRef<Cube3DHandle | null>(null);

  const handleScramble = () => {
    const moves = generateScramble(20);
    setScramble(moves);
    cube3dRef.current?.enqueue(moves);
    toast({ title: 'Scrambling', description: moves.join(' ') });
  };

  // Reference RGB colors for each face (matches Cube3D COLORS palette).
  const REF_COLORS: Record<Face, RGB> = {
    U: [255, 255, 255], // white
    D: [255, 213, 0],   // yellow
    F: [0, 155, 72],    // green
    B: [0, 69, 173],    // blue
    R: [183, 18, 52],   // red
    L: [255, 88, 0],    // orange
  };

  const centers = useMemo(() => {
    const map = new Map<Face, RGB>();
    for (const f of FACE_ORDER) {
      const st = faces[f];
      if (st.rgb.length === 9) {
        const rotated = rotateGrid(st.rgb, st.rotation) as RGB[];
        map.set(f, rotated[4]);
      }
    }
    return map;
  }, [faces]);

  const autoAssignForFace = useCallback((face: Face) => {
    const st = faces[face];
    if (st.rgb.length !== 9) return;
    const rotated = rotateGrid(st.rgb, st.rotation) as RGB[];
    // Prefer measured centers from already-uploaded faces; fall back to reference palette for any missing face.
    const centerEntries: [Face, RGB][] = FACE_ORDER.map((f) => [f, centers.get(f) ?? REF_COLORS[f]]);
    const newLabels = rotated.map((c) => {
      let best: { d: number; face: Face } | null = null;
      for (const [label, ctr] of centerEntries) {
        const d = rgbDistance(c, ctr);
        if (!best || d < best.d) best = { d, face: label };
      }
      return best!.face;
    });
    setFaces((prev) => ({ ...prev, [face]: { ...prev[face], labels: newLabels as Face[] } }));
  }, [centers, faces]);

  const facesFilled = useMemo(
    () => FACE_ORDER.filter((f) => faces[f].labels.filter(Boolean).length === 9).length,
    [faces]
  );
  const imagesUploaded = useMemo(
    () => FACE_ORDER.filter((f) => faces[f].rgb.length === 9).length,
    [faces]
  );
  const allLabelsPresent = useMemo(() => {
    return FACE_ORDER.every((f) => faces[f].labels.filter(Boolean).length === 9);
  }, [faces]);

  const applyLabelsTo3D = useCallback(async (facesArg?: Record<Face, FaceState>, silent = true): Promise<boolean> => {
    const src = facesArg ?? faces;
    await cube3dRef.current?.waitUntilIdle();
    // Start every face white; overlay only stickers the user has actually set.
    const grids = FACE_ORDER.reduce((acc, f) => {
      const labels = src[f].labels;
      acc[f] = labels.map((l) => (l || 'U')) as Face[];
      return acc;
    }, {} as Record<Face, Face[]>);
    cube3dRef.current?.paintFromFacelets(grids as any);
    if (!silent) {
      toast({ title: 'Cube updated', description: 'Painted 3D cube from your colors.' });
    }
    return true;
  }, [faces]);

  // Auto-sync 3D cube whenever labels change (covers uploads, edits, rotations, auto-assign).
  const labelsKey = useMemo(
    () => FACE_ORDER.map((f) => faces[f].labels.join('')).join('|'),
    [faces]
  );
  useEffect(() => {
    applyLabelsTo3D(faces, true);
    setSolution(null);
    setStepIdx(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labelsKey]);

  const buildAndSolve = async (sourceFromLabels?: boolean) => {
    try {
      let grids: Record<Face, Face[]>;
      let scrambleStr: string | null = scramble.length ? scramble.join(' ') : null;
      if (sourceFromLabels || allLabelsPresent) {
        if (!allLabelsPresent) {
          toast({ title: 'Incomplete colors', description: 'Fill all 54 stickers first.' });
          return;
        }
        grids = FACE_ORDER.reduce((acc, f) => {
          acc[f] = faces[f].labels as Face[];
          return acc;
        }, {} as Record<Face, Face[]>);
        cube3dRef.current?.paintFromFacelets(grids as any);
        scrambleStr = null;
      } else {
        await cube3dRef.current?.waitUntilIdle();
        const read = cube3dRef.current?.readFacelets();
        if (!read) {
          toast({ title: 'Incomplete faces', description: 'Upload images, enter colors, or scramble the 3D cube first.' });
          return;
        }
        grids = read as Record<Face, Face[]>;
        toast({ title: 'Reading from 3D cube', description: 'Using current 3D cube state as input.' });
      }
      const facelets = buildFaceletsString(grids as any);
      const v = validateFaceletCounts(facelets);
      if (!v.ok) {
        toast({ title: 'Invalid configuration', description: v.message });
        return;
      }
      toast({ title: 'Solving...', description: 'Running Kociemba two-phase algorithm' });
      const res = await solveFacelets(facelets);
      setSolution(res);
      setStepIdx(0);
      toast({ title: 'Solution found', description: res });

    } catch (e: any) {
      console.error(e);
      toast({ title: 'Solve failed', description: e?.message || 'Unknown error' });
    }
  };

  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    document.documentElement.style.setProperty('--cursor-x', `${x}%`);
    document.documentElement.style.setProperty('--cursor-y', `${y}%`);
  };

  const moves = solution ? solution.split(' ').filter(Boolean) : [];
  const invert = (m: string) => {
    if (m.endsWith('2')) return m;
    if (m.endsWith("'")) return m[0];
    return m[0] + "'";
  };

  return (
    <div className="min-h-screen bg-hero" onMouseMove={onMouseMove}>
      <main className="container max-w-6xl py-6 space-y-6">
        <header className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">CubeSolver AI</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Scramble, upload photos, or enter colors — then watch the optimal solution play out in 3D.
          </p>
        </header>

        {/* How to use — quick onboarding */}
        <Card className="bg-card/60">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="grid sm:grid-cols-3 gap-4 text-sm w-full">
                <div>
                  <p className="font-medium mb-1">1. Input your cube</p>
                  <ul className="text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Click <Upload className="inline h-3.5 w-3.5" /> to upload 6 face photos (Top, Front, Right, Left, Back, Bottom).</li>
                    <li>Or click <Palette className="inline h-3.5 w-3.5" /> and tap stickers to cycle colors manually.</li>
                    <li>Use <strong>Rotate</strong> in a face if it's mis-oriented.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">2. Verify the 3D cube</p>
                  <ul className="text-muted-foreground space-y-1 list-disc pl-4">
                    <li>The 3D cube updates live as you input colors.</li>
                    <li>Drag to rotate, or use <strong>Front / Top / 3D…</strong> view buttons.</li>
                    <li>Re-open <Palette className="inline h-3.5 w-3.5" /> to fix any wrong stickers.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">3. Scramble or Solve</p>
                  <ul className="text-muted-foreground space-y-1 list-disc pl-4">
                    <li><strong>Scramble</strong> randomizes the cube to practice.</li>
                    <li><strong>Solve</strong> computes the optimal sequence (Kociemba).</li>
                    <li>Use <strong>Prev / Next</strong> to step through moves on the 3D cube.</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid lg:grid-cols-5 gap-6">
          {/* Big 3D cube */}
          <Card className="lg:col-span-3 tilt-on-hover">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  3D Cube
                  {facesFilled > 0 && (
                    <span className="text-xs font-normal text-muted-foreground inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      {facesFilled}/6 faces
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Drag to rotate. Upload photos or edit colors — the cube updates live.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {/* Upload icon dialog */}
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
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Upload Face Images</DialogTitle>
                      <DialogDescription>
                        Top, Front, Right, Left, Back, Bottom — clear, well-lit photos. Cube updates live.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {FACE_META.map(({ face, title }) => (
                        <CubeFaceUploader
                          key={face}
                          face={face}
                          title={title}
                          onProcessed={(rgb, url) => {
                            setFaces((prev) => ({
                              ...prev,
                              [face]: { ...prev[face], rgb, imageUrl: url, labels: [...emptyLabels] },
                            }));
                            // auto-assign on next tick; the effect then syncs the 3D cube.
                            setTimeout(() => autoAssignForFace(face), 0);
                          }}
                        />
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Edit colors icon dialog */}
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
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Review & Edit Colors</DialogTitle>
                      <DialogDescription>
                        Click stickers to cycle colors. Cube updates live.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {FACE_META.map(({ face, title }) => {
                        const st = faces[face];
                        return (
                          <CubeColorGrid
                            key={face}
                            face={face}
                            title={title}
                            cells={st.labels}
                            onChange={(cells) => {
                              setFaces((prev) => ({ ...prev, [face]: { ...prev[face], labels: cells } }));
                            }}
                            onRotate={() => {
                              setFaces((prev) => ({
                                ...prev,
                                [face]: {
                                  ...prev[face],
                                  rotation: (prev[face].rotation + 1) % 4,
                                  rgb: prev[face].rgb.length ? (rotateGrid(prev[face].rgb, 1) as RGB[]) : prev[face].rgb,
                                  labels: (prev[face].labels.filter(Boolean).length
                                    ? rotateGrid(prev[face].labels, 1)
                                    : prev[face].labels) as (Face | '')[],
                                },
                              }));
                            }}
                          />
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm border cube-U" /> U</span>
                      <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm border cube-F" /> F</span>
                      <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm border cube-R" /> R</span>
                      <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm border cube-L" /> L</span>
                      <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm border cube-B" /> B</span>
                      <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm border cube-D" /> D</span>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mx-auto w-full max-w-xl">
                <Cube3D handleRef={cube3dRef} />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {(['F', 'B', 'U', 'D', 'L', 'R', 'ISO'] as const).map((v) => {
                  const labels: Record<string, string> = {
                    F: 'Front', B: 'Back', U: 'Top', D: 'Bottom', L: 'Left', R: 'Right', ISO: '3D',
                  };
                  return (
                    <Button
                      key={v}
                      variant="outline"
                      size="sm"
                      onClick={() => cube3dRef.current?.setView(v)}
                    >
                      {v === 'ISO' && <Box className="h-4 w-4" />}
                      {labels[v]}
                    </Button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="hero" onClick={handleScramble}>
                  <Shuffle className="h-4 w-4" /> Scramble
                </Button>
                <Button variant="hero" onClick={() => buildAndSolve(false)}>
                  <Play className="h-4 w-4" /> Solve
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFaces(makeEmptyFaces());
                    setSolution(null);
                    setStepIdx(0);
                    setScramble([]);
                  }}
                >
                  Reset
                </Button>
                {scramble.length > 0 && (
                  <span className="text-xs text-muted-foreground font-mono break-words">{scramble.join(' ')}</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Big solution panel */}
          <Card className="lg:col-span-2 tilt-on-hover">
            <CardHeader>
              <CardTitle>Solution</CardTitle>
              <CardDescription>Step through the moves — the 3D cube animates each one.</CardDescription>
            </CardHeader>
            <CardContent>
              {solution ? (
                <div className="space-y-4">
                  <div className="text-lg font-mono break-words flex flex-wrap gap-1">
                    {moves.map((m, i) => (
                      <span
                        key={i}
                        className={`px-1.5 py-0.5 rounded ${i === stepIdx ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (stepIdx <= 0) return;
                        const prevMove = moves[stepIdx - 1];
                        cube3dRef.current?.enqueue([invert(prevMove)]);
                        setStepIdx((i) => Math.max(0, i - 1));
                      }}
                    >
                      Prev
                    </Button>
                    <Button
                      onClick={() => {
                        if (stepIdx >= moves.length) return;
                        const nextMove = moves[stepIdx];
                        cube3dRef.current?.enqueue([nextMove]);
                        setStepIdx((i) => Math.min(moves.length, i + 1));
                      }}
                    >
                      Next
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Step {Math.min(stepIdx + 1, moves.length)} / {moves.length}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No solution yet. Scramble or upload faces, then click Solve.</p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Index;
