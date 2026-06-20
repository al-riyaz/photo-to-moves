import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Boxes } from 'lucide-react';

const SITE = 'https://trend2print.com';

const Move: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="font-mono text-foreground bg-muted rounded px-1.5 py-0.5">{children}</code>
);

const Guide: React.FC = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Solve a Rubik\u2019s Cube',
    description:
      'A beginner-friendly, step-by-step guide to solving a 3x3 Rubik\u2019s Cube using the Layer-by-Layer method.',
    totalTime: 'PT20M',
    step: [
      { '@type': 'HowToStep', name: 'Make the white cross' },
      { '@type': 'HowToStep', name: 'Solve the white corners' },
      { '@type': 'HowToStep', name: 'Solve the middle layer edges' },
      { '@type': 'HowToStep', name: 'Make the yellow cross' },
      { '@type': 'HowToStep', name: 'Orient the last layer (yellow face)' },
      { '@type': 'HowToStep', name: 'Position and permute the last layer' },
    ],
  };

  return (
    <div className="min-h-screen bg-hero">
      <Helmet>
        <title>How to Solve a Rubik's Cube Guide | CubeSolver AI</title>
        <meta
          name="description"
          content="Learn how to solve a 3x3 Rubik's Cube step by step with the beginner Layer-by-Layer method. Clear notation, simple algorithms, and tips to never get stuck."
        />
        <link rel="canonical" href={`${SITE}/guide`} />
        <meta property="og:title" content="How to Solve a Rubik's Cube — Beginner's Guide" />
        <meta
          property="og:description"
          content="A step-by-step beginner guide to solving the 3x3 Rubik's Cube using the Layer-by-Layer method."
        />
        <meta property="og:url" content={`${SITE}/guide`} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main className="container max-w-3xl py-8 space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to solver
          </Link>
        </nav>

        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            How to Solve a Rubik's Cube
          </h1>
          <p className="text-muted-foreground text-lg">
            A complete beginner's guide to solving the 3x3 Rubik's Cube using the Layer-by-Layer
            method. No experience required — just follow each stage in order. Stuck partway? Use the{' '}
            <Link to="/" className="text-primary underline underline-offset-4">CubeSolver AI solver</Link>{' '}
            to finish instantly.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Understanding the notation</h2>
          <p className="text-muted-foreground">
            Every move turns one face 90°. A letter alone is a clockwise quarter turn, a letter with
            an apostrophe (prime) is counter-clockwise, and a letter with a 2 is a half turn (180°).
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><Move>R</Move> Right face clockwise</div>
              <div><Move>R'</Move> Right face counter-clockwise</div>
              <div><Move>L</Move> Left face clockwise</div>
              <div><Move>U</Move> Up (top) face clockwise</div>
              <div><Move>D</Move> Down (bottom) face clockwise</div>
              <div><Move>F</Move> Front face clockwise</div>
              <div><Move>B</Move> Back face clockwise</div>
              <div><Move>U2</Move> Up face half turn (180°)</div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 1: Make the white cross</h2>
          <p className="text-muted-foreground">
            Hold the cube with the white center on top. Find the four white edge pieces and move each
            one so it forms a plus sign on the white face — and importantly, so each edge's second
            color matches the center of the side it touches. The result is a white cross with matching
            side colors.
          </p>
          <h3 className="text-lg font-medium">Tip</h3>
          <p className="text-muted-foreground">
            Bring a white edge to the bottom layer, line it up under its matching center, then turn
            that face twice (e.g. <Move>F2</Move>) to lift it into place.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 2: Solve the white corners</h2>
          <p className="text-muted-foreground">
            Now fill the four white corners to complete the first layer. Find a white corner in the
            bottom layer, position it directly below where it needs to go, then repeat this algorithm
            until the corner pops up correctly oriented:
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 font-mono text-foreground">
              R' D' R D
            </CardContent>
          </Card>
          <p className="text-muted-foreground">
            Repeat the sequence (1, 3, or 5 times) until that corner is white-on-top and the side
            colors match. Do this for all four corners — the entire first layer is now done.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 3: Solve the middle layer edges</h2>
          <p className="text-muted-foreground">
            Flip the cube so white is on the bottom. Find a top-layer edge that has no yellow on it,
            and align it with its matching front center. Then send it left or right.
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 space-y-2 font-mono text-foreground">
              <div>Insert to the <span className="font-sans text-muted-foreground">right:</span> U R U' R' U' F' U F</div>
              <div>Insert to the <span className="font-sans text-muted-foreground">left:</span> U' L' U L U F U' F'</div>
            </CardContent>
          </Card>
          <p className="text-muted-foreground">
            If an edge is stuck in the wrong middle slot, run either algorithm once to kick it out,
            then insert it correctly. The first two layers are now complete.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 4: Make the yellow cross</h2>
          <p className="text-muted-foreground">
            With yellow now on top, you'll see a dot, an L-shape, or a line. Apply this algorithm to
            progress toward a full yellow cross:
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 font-mono text-foreground">
              F R U R' U' F'
            </CardContent>
          </Card>
          <p className="text-muted-foreground">
            Dot → L-shape → line → cross. Hold an L-shape so the two edges point up and left; hold a
            line horizontally. Repeat until the yellow cross appears.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 5: Orient the last layer (all yellow on top)</h2>
          <p className="text-muted-foreground">
            Get all yellow corners facing up. Hold the cube so a non-yellow corner sits at the
            front-right-top, then repeat the Step 2 trigger:
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 font-mono text-foreground">
              R' D' R D
            </CardContent>
          </Card>
          <p className="text-muted-foreground">
            Keep the same orientation and only turn the top face (<Move>U</Move>) to bring the next
            unsolved corner to front-right — never rotate the whole cube here. The top will look
            scrambled until the last corner snaps in; that's normal.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 6: Position the final pieces</h2>
          <p className="text-muted-foreground">
            First cycle the corners into place. Hold the cube with any correctly-placed corner at the
            back-right and run this until all four corners match their faces:
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 font-mono text-foreground">
              U R U' L' U R' U' L
            </CardContent>
          </Card>
          <p className="text-muted-foreground">
            Finally, cycle the last edges. With a solved face at the back, repeat until the cube is
            complete:
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 font-mono text-foreground">
              R U' R U R U R U' R' U' R2
            </CardContent>
          </Card>
          <p className="text-muted-foreground">
            That's it — the Rubik's Cube is solved! With practice you'll get faster and start
            recognizing patterns instantly.
          </p>
        </section>

        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-primary" /> Stuck on a step?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Don't unscramble by hand — scan your cube or enter the colors and CubeSolver AI computes
              the fastest solution, then walks you through it move by move.
            </p>
            <Button asChild variant="hero">
              <Link to="/">Solve my cube now</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Guide;
