import React, { useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { CubeFaceUploader } from '@/components/cube/CubeFaceUploader';
import { CubeColorGrid } from '@/components/cube/CubeColorGrid';
import { Cube3D, generateScramble, type Cube3DHandle } from '@/components/cube/Cube3D';
import { useRef } from 'react';
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
  rotation: number; // 0..3, clockwise
  imageUrl?: string;
};

const emptyLabels = Array.from({ length: 9 }, () => '' as const);

const Index: React.FC = () => {
  const [faces, setFaces] = useState<Record<Face, FaceState>>(
    () => ({ U: { rgb: [], labels: [...emptyLabels], rotation: 0 }, R: { rgb: [], labels: [...emptyLabels], rotation: 0 }, F: { rgb: [], labels: [...emptyLabels], rotation: 0 }, D: { rgb: [], labels: [...emptyLabels], rotation: 0 }, L: { rgb: [], labels: [...emptyLabels], rotation: 0 }, B: { rgb: [], labels: [...emptyLabels], rotation: 0 } })
  );
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

  const canAutoMap = centers.size === 6;

  const autoAssignForFace = useCallback((face: Face) => {
    if (!canAutoMap) return;
    const st = faces[face];
    if (st.rgb.length !== 9) return;
    const rotated = rotateGrid(st.rgb, st.rotation) as RGB[];
    const centerEntries = Array.from(centers.entries());
    const newLabels = rotated.map((c) => {
      let best: { d: number; face: Face } | null = null;
      for (const [label, ctr] of centerEntries) {
        const d = rgbDistance(c, ctr);
        if (!best || d < best.d) best = { d, face: label };
      }
      return best!.face;
    });
    setFaces((prev) => ({ ...prev, [face]: { ...prev[face], labels: newLabels as Face[] } }));
  }, [canAutoMap, centers, faces]);

  const allLabelsPresent = useMemo(() => {
    return FACE_ORDER.every((f) => faces[f].labels.filter(Boolean).length === 9);
  }, [faces]);

  const buildAndSolve = async () => {
    try {
      let grids: Record<Face, Face[]>;
      if (allLabelsPresent) {
        grids = FACE_ORDER.reduce((acc, f) => {
          acc[f] = faces[f].labels as Face[];
          return acc;
        }, {} as Record<Face, Face[]>);
      } else {
        // Fall back to reading the 54 stickers from the 3D cube
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

  return (
    <div className="min-h-screen bg-hero" onMouseMove={onMouseMove}>
      <main className="container py-10 space-y-8">
        <header className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">CubeSolver AI — From photos to solved in seconds</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Upload six faces or enter colors manually. We map your cube state and compute an optimal solution using Kociemba’s two-phase algorithm.</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="hero" size="lg" onClick={buildAndSolve}>Solve Now</Button>
            <a href="#manual" className="text-sm text-primary underline underline-offset-4">Manual entry</a>
          </div>
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          <Card className="tilt-on-hover">
            <CardHeader>
              <CardTitle>3D Cube</CardTitle>
              <CardDescription>Drag to rotate. Scramble to generate a random sequence.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Cube3D handleRef={cube3dRef} />
              <div className="flex items-center gap-2">
                <Button variant="hero" onClick={handleScramble}>Scramble</Button>
                {scramble.length > 0 && (
                  <span className="text-xs text-muted-foreground font-mono break-words">{scramble.join(' ')}</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="tilt-on-hover">
            <CardHeader>
              <CardTitle>Upload Images</CardTitle>
              <CardDescription>Top, Front, Right, Left, Back, Bottom — clear, well-lit photos work best.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-5">
              {FACE_META.map(({ face, title }) => (
                <CubeFaceUploader
                  key={face}
                  face={face}
                  title={`${title}`}
                  onProcessed={(rgb, url) => {
                    setFaces((prev) => ({
                      ...prev,
                      [face]: { ...prev[face], rgb, imageUrl: url, labels: [...emptyLabels] },
                    }));
                    // Only auto-assign for this face if we already have all centers
                    setTimeout(() => autoAssignForFace(face), 0);
                  }}
                />
              ))}
            </CardContent>
          </Card>

          <Card id="manual" className="tilt-on-hover">
            <CardHeader>
              <CardTitle>Review & Edit Colors</CardTitle>
              <CardDescription>Click stickers to cycle colors. Rotate a face if your photo orientation differs.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-5">
              {FACE_META.map(({ face, title }) => {
                const st = faces[face];
                return (
                  <CubeColorGrid
                    key={face}
                    face={face}
                    title={`${title}`}
                    cells={st.labels}
                    onChange={(cells) => setFaces((prev) => ({ ...prev, [face]: { ...prev[face], labels: cells } }))}
                    onRotate={() => {
                      setFaces((prev) => ({
                        ...prev,
                        [face]: {
                          ...prev[face],
                          rotation: (prev[face].rotation + 1) % 4,
                          rgb: prev[face].rgb.length ? (rotateGrid(prev[face].rgb, 1) as RGB[]) : prev[face].rgb,
                          labels: (prev[face].labels.filter(Boolean).length ? rotateGrid(prev[face].labels, 1) : prev[face].labels) as (Face | '')[],
                        },
                      }));
                    }}
                  />
                );
              })}
              <div className="sm:col-span-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-block w-4 h-4 rounded-sm border cube-U" /> U (Top)
                  <span className="inline-block w-4 h-4 rounded-sm border cube-F" /> F (Front)
                  <span className="inline-block w-4 h-4 rounded-sm border cube-R" /> R (Right)
                  <span className="inline-block w-4 h-4 rounded-sm border cube-L" /> L (Left)
                  <span className="inline-block w-4 h-4 rounded-sm border cube-B" /> B (Back)
                  <span className="inline-block w-4 h-4 rounded-sm border cube-D" /> D (Bottom)
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid md:grid-cols-3 gap-6 items-start">
          <Card className="md:col-span-2 tilt-on-hover">
            <CardHeader>
              <CardTitle>Solution</CardTitle>
              <CardDescription>Shortest sequence (where possible). Use the stepper to follow along.</CardDescription>
            </CardHeader>
            <CardContent>
              {solution ? (
                <div className="space-y-4">
                  <div className="text-lg font-mono break-words">{solution}</div>
                  <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={() => setStepIdx((i) => Math.max(0, i - 1))}>Prev</Button>
                    <Button onClick={() => setStepIdx((i) => Math.min(solution.split(' ').length - 1, i + 1))}>Next</Button>
                    <span className="text-sm text-muted-foreground">Step {stepIdx + 1} / {solution.split(' ').length}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No solution yet. Upload faces and click Solve.</p>
              )}
            </CardContent>
          </Card>

          <Card className="tilt-on-hover">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Validation requires 9 of each color (U, R, F, D, L, B).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="hero" className="w-full" onClick={buildAndSolve} disabled={!allLabelsPresent}>Solve</Button>
              <Button variant="outline" className="w-full" onClick={() => { setSolution(null); setStepIdx(0); }}>Clear Solution</Button>
              <Button variant="ghost" className="w-full" onClick={() => {
                setFaces({ U: { rgb: [], labels: [...emptyLabels], rotation: 0 }, R: { rgb: [], labels: [...emptyLabels], rotation: 0 }, F: { rgb: [], labels: [...emptyLabels], rotation: 0 }, D: { rgb: [], labels: [...emptyLabels], rotation: 0 }, L: { rgb: [], labels: [...emptyLabels], rotation: 0 }, B: { rgb: [], labels: [...emptyLabels], rotation: 0 } });
              }}>Reset All</Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Index;
