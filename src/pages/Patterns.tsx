import React, { useCallback, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Boxes, Play, RotateCcw } from 'lucide-react';
import { Cube3D, type Cube3DHandle } from '@/components/cube/Cube3D';
import SiteFooter from '@/components/SiteFooter';
import heroImg from '@/assets/patterns-hero.jpg';

const SITE = 'https://cubesolver.trend2print.com';

type FaceLetter = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';

// A fully solved cube: every face shows nine of its own stickers.
function solvedFacelets(): Record<string, string[]> {
  const faces: FaceLetter[] = ['U', 'R', 'F', 'D', 'L', 'B'];
  const grids: Record<string, string[]> = {};
  for (const f of faces) grids[f] = Array(9).fill(f);
  return grids;
}

interface Pattern {
  id: string;
  name: string;
  algorithm: string;
  description: string;
}

const PATTERNS: Pattern[] = [
  {
    id: 'checkerboard',
    name: 'Checkerboard',
    algorithm: "M2 E2 S2",
    description:
      'The classic six-face checkerboard. Every face becomes a two-color grid because each slice is turned 180°. The easiest and most recognizable pattern of all.',
  },
  {
    id: 'cube-in-a-cube',
    name: 'Cube in a Cube',
    algorithm: "F L F U' R U F2 L2 U' L' B D' B' L2 U",
    description:
      'A smaller cube appears nested inside each corner, giving the illusion of a cube trapped within the cube. A crowd favorite for photos.',
  },
  {
    id: 'cube-in-a-cube-in-a-cube',
    name: 'Cube in a Cube in a Cube',
    algorithm: "U' L' U' F' R2 B' R F U B2 U B' L U' F U R F'",
    description:
      'Takes the nested illusion one step further — three layers of cubes appear stacked inside one another.',
  },
  {
    id: 'superflip',
    name: 'Superflip',
    algorithm: "R L U2 F U' D F2 R2 B2 L U2 F' B' U R2 D F2 U R2 U",
    description:
      'Every corner is home but all twelve edges are flipped. Famous for being one of the hardest positions to reach — it always needs 20 moves to solve.',
  },
  {
    id: 'four-spots',
    name: 'Four Spots',
    algorithm: "F2 B2 U D' R2 L2 U D'",
    description:
      'Four faces keep their solid center color while the other two swap, leaving a clean set of colored spots.',
  },
  {
    id: 'six-spots',
    name: 'Six Spots',
    algorithm: "U D' R L' F B' U D'",
    description:
      'Every face keeps its center but the surrounding stickers rotate, so each side shows a single dot in a different color.',
  },
  {
    id: 'cross',
    name: 'Plus / Cross',
    algorithm: "U F B' L2 U2 L2 F' B U2 L2 U",
    description:
      'A bold plus sign appears on every face — a striking symmetrical pattern that looks great on a shelf.',
  },
  {
    id: 'python',
    name: 'Python',
    algorithm: "F2 R' B' U R' L F' L F' B D' R B L2",
    description:
      'Winding bands of color snake diagonally across the cube like a coiled python.',
  },
];

const Move: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="font-mono text-foreground bg-muted rounded px-1.5 py-0.5">{children}</code>
);

// The 3D cube only knows face turns (R U F D L B). Rewrite slice moves
// (M, E, S) into the equivalent two face turns so every pattern plays.
const SLICE_EXPANSIONS: Record<string, string[]> = {
  M: ['R', "L'"],
  "M'": ["R'", 'L'],
  M2: ['R2', 'L2'],
  E: ['U', "D'"],
  "E'": ["U'", 'D'],
  E2: ['U2', 'D2'],
  S: ["F'", 'B'],
  "S'": ['F', "B'"],
  S2: ['F2', 'B2'],
};

function expandMoves(algorithm: string): string[] {
  return algorithm
    .trim()
    .split(/\s+/)
    .flatMap((m) => SLICE_EXPANSIONS[m] ?? [m]);
}

const Patterns: React.FC = () => {
  const cubeRef = useRef<Cube3DHandle | null>(null);
  const [active, setActive] = useState<string | null>(null);

  const reset = useCallback(() => {
    cubeRef.current?.paintFromFacelets(solvedFacelets());
    setActive(null);
  }, []);

  const play = useCallback((pattern: Pattern) => {
    const cube = cubeRef.current;
    if (!cube) return;
    cube.paintFromFacelets(solvedFacelets());
    cube.setView('ISO');
    cube.enqueue(expandMoves(pattern.algorithm));
    setActive(pattern.id);
  }, []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Rubik\u2019s Cube Patterns: Algorithms for Checkerboard, Superflip & More',
    description:
      'A gallery of the most popular Rubik\u2019s Cube patterns with the exact algorithm for each, animated in 3D.',
    author: { '@type': 'Organization', name: 'CubeSolver AI' },
    mainEntityOfPage: `${SITE}/patterns`,
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Cube Patterns', item: `${SITE}/patterns` },
    ],
  };

  return (
    <div className="min-h-screen bg-hero">
      <Helmet>
        <title>Rubik's Cube Patterns & Algorithms | CubeSolver AI</title>
        <meta
          name="description"
          content="Cool Rubik's Cube patterns with step-by-step algorithms: Checkerboard, Cube in a Cube, Superflip, Six Spots and more — each animated in 3D."
        />
        <link rel="canonical" href={`${SITE}/patterns`} />
        <meta property="og:title" content="Rubik's Cube Patterns & Algorithms" />
        <meta
          property="og:description"
          content="A gallery of the best Rubik's Cube patterns with the exact algorithm for each, animated in 3D."
        />
        <meta property="og:url" content={`${SITE}/patterns`} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Helmet>

      <main className="container max-w-4xl py-8 space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/" className="hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to solver
          </Link>
          <Link to="/guide" className="hover:text-foreground">3x3 guide</Link>
          <Link to="/notation" className="hover:text-foreground">Notation</Link>
          <Link to="/blog" className="hover:text-foreground">Blog</Link>
        </nav>

        <header className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Rubik's Cube Patterns
          </h1>
          <p className="text-muted-foreground text-lg">
            Once your cube is solved, don't stop there. Apply one of these classic algorithms from a
            solved cube to create eye-catching patterns like the Checkerboard, Cube in a Cube, and the
            legendary Superflip. Pick a pattern below to watch it build in 3D, then copy the moves onto
            your own cube. To undo any pattern, just perform the algorithm in reverse — or{' '}
            <Link to="/" className="text-primary underline underline-offset-4">scan your cube</Link>{' '}
            to reset it instantly.
          </p>
          <img
            src={heroImg}
            alt="Rubik's Cubes showing checkerboard, cube-in-a-cube, and cross patterns"
            width={1024}
            height={640}
            className="rounded-xl border border-border w-full"
          />
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="md:sticky md:top-6 self-start space-y-3">
            <Cube3D handleRef={cubeRef} />
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {active
                  ? `Playing: ${PATTERNS.find((p) => p.id === active)?.name}`
                  : 'Drag to rotate. Pick a pattern to animate it.'}
              </p>
              <Button size="sm" variant="outline" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                <span className="ml-2">Solved</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {PATTERNS.map((p) => (
              <Card key={p.id} className={active === p.id ? 'border-primary bg-card/60' : 'bg-card/60'}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between gap-2 text-lg">
                    {p.name}
                    <Button size="sm" variant="secondary" onClick={() => play(p)}>
                      <Play className="h-4 w-4" />
                      <span className="ml-1">Play</span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                  <p className="font-mono text-sm text-foreground break-words">
                    <Move>{p.algorithm}</Move>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">How to use these algorithms</h2>
          <p className="text-muted-foreground">
            Always start from a fully solved cube. Hold the cube in a fixed orientation (white on top,
            green in front is standard) and apply the moves in order using standard{' '}
            <Link to="/notation" className="text-primary underline underline-offset-4">cube notation</Link>.
            A letter is a clockwise quarter turn, an apostrophe (<Move>R'</Move>) means
            counter-clockwise, and a <Move>2</Move> means a half turn. Slice moves like <Move>M</Move>,{' '}
            <Move>E</Move>, and <Move>S</Move> turn the middle layers.
          </p>
          <p className="text-muted-foreground">
            Made a mistake and lost track? You don't have to scramble and start over — enter your cube's
            colors into CubeSolver AI and get back to solved in the fewest moves possible.
          </p>
        </section>

        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-primary" /> Cube not solved yet?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Patterns only work from a solved cube. Scan your cube or enter its colors and CubeSolver AI
              computes the fastest solution, then walks you through it move by move.
            </p>
            <Button asChild variant="hero">
              <Link to="/">Solve my cube now</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Patterns;