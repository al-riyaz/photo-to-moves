import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Boxes } from 'lucide-react';
import heroImg from '@/assets/guide-2x2-hero.jpg';
import step1Img from '@/assets/guide-2x2-step1.jpg';
import step2Img from '@/assets/guide-2x2-step2.jpg';
import step3Img from '@/assets/guide-2x2-step3.jpg';

const SITE = 'https://trend2print.com';

const Move: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="font-mono text-foreground bg-muted rounded px-1.5 py-0.5">{children}</code>
);

const Guide2x2: React.FC = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Solve a 2x2 Rubik\u2019s Cube',
    description:
      'A beginner-friendly, step-by-step guide to solving the 2x2 Pocket Cube using the Layer-by-Layer method.',
    totalTime: 'PT10M',
    step: [
      { '@type': 'HowToStep', name: 'Solve the first layer' },
      { '@type': 'HowToStep', name: 'Orient the last layer (all yellow on top)' },
      { '@type': 'HowToStep', name: 'Permute the last layer corners' },
    ],
  };

  return (
    <div className="min-h-screen bg-hero">
      <Helmet>
        <title>How to Solve a 2x2 Rubik's Cube Guide | CubeSolver AI</title>
        <meta
          name="description"
          content="Learn how to solve a 2x2 Pocket Cube step by step with the beginner Layer-by-Layer method. Simple notation, just three short algorithms, and clear screenshots."
        />
        <link rel="canonical" href={`${SITE}/guide/2x2`} />
        <meta property="og:title" content="How to Solve a 2x2 Rubik's Cube — Beginner's Guide" />
        <meta
          property="og:description"
          content="A step-by-step beginner guide to solving the 2x2 Pocket Cube using the Layer-by-Layer method."
        />
        <meta property="og:url" content={`${SITE}/guide/2x2`} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main className="container max-w-3xl py-8 space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/" className="hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to solver
          </Link>
          <Link to="/guide" className="hover:text-foreground">3x3 guide</Link>
        </nav>

        <header className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            How to Solve a 2x2 Rubik's Cube
          </h1>
          <p className="text-muted-foreground text-lg">
            The 2x2 Pocket Cube has no centers or edges — just eight corners. That makes it the perfect
            place to start. This guide solves it in three easy stages with only three short algorithms.
            Stuck partway? Use the{' '}
            <Link to="/" className="text-primary underline underline-offset-4">CubeSolver AI solver</Link>{' '}
            to finish instantly.
          </p>
          <img
            src={heroImg}
            alt="Solved 2x2 Rubik's Pocket Cube"
            width={1024}
            height={640}
            className="rounded-xl border border-border w-full"
          />
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Understanding the notation</h2>
          <p className="text-muted-foreground">
            Every move turns one face 90°. A letter alone is a clockwise quarter turn, a letter with
            an apostrophe (prime) is counter-clockwise, and a letter with a 2 is a half turn (180°).
            On a 2x2 you only ever need four faces.
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><Move>R</Move> Right face clockwise</div>
              <div><Move>R'</Move> Right face counter-clockwise</div>
              <div><Move>U</Move> Up (top) face clockwise</div>
              <div><Move>U'</Move> Up face counter-clockwise</div>
              <div><Move>F</Move> Front face clockwise</div>
              <div><Move>D</Move> Down (bottom) face clockwise</div>
              <div><Move>R2</Move> Right face half turn (180°)</div>
              <div><Move>U2</Move> Up face half turn (180°)</div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 1: Solve the first layer</h2>
          <p className="text-muted-foreground">
            Pick a color to start with — white is traditional. Hold the cube with white on top and build
            all four white corners so each one has white facing up and its two side colors matching the
            faces it touches. Then flip the cube so the solved layer is on the bottom.
          </p>
          <img
            src={step1Img}
            alt="2x2 cube with the first white layer completed"
            loading="lazy"
            width={768}
            height={576}
            className="rounded-xl border border-border w-full"
          />
          <h3 className="text-lg font-medium">Tip</h3>
          <p className="text-muted-foreground">
            To place a corner sitting in the bottom layer, position it directly below its target spot
            and repeat the trigger <Move>R' D' R D</Move> until it pops up correctly oriented. Most
            first layers can be built intuitively in just a few moves.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 2: Orient the last layer (all yellow on top)</h2>
          <p className="text-muted-foreground">
            With the solved layer on the bottom, get every yellow sticker on the top face pointing up.
            Hold the cube so a corner that still needs yellow on top is at the front-right, then repeat
            this trigger:
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 font-mono text-foreground">
              R' D' R D
            </CardContent>
          </Card>
          <p className="text-muted-foreground">
            Run the trigger 2 or 4 times until that corner shows yellow on top, then turn only the top
            face (<Move>U</Move>) to bring the next unsolved corner to front-right — never rotate the
            whole cube. The top will look scrambled until the last corner snaps in; that's normal.
          </p>
          <img
            src={step2Img}
            alt="2x2 cube with the entire yellow face oriented on top"
            loading="lazy"
            width={768}
            height={576}
            className="rounded-xl border border-border w-full"
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 3: Permute the last layer corners</h2>
          <p className="text-muted-foreground">
            All yellow is up, but the corners may sit in the wrong positions. First find a face where
            two side colors already match — hold that solved pair at the back. Then run this algorithm
            to cycle the remaining corners into place:
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 font-mono text-foreground">
              R' F R' B2 R F' R' B2 R2
            </CardContent>
          </Card>
          <p className="text-muted-foreground">
            If no face has a matching pair yet, run the algorithm once from any angle to create one,
            then re-orient and repeat. When the corners line up, the cube is solved!
          </p>
          <img
            src={step3Img}
            alt="Fully solved 2x2 Rubik's Pocket Cube"
            loading="lazy"
            width={768}
            height={576}
            className="rounded-xl border border-border w-full"
          />
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

export default Guide2x2;