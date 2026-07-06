import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Boxes } from 'lucide-react';
import SiteFooter from '@/components/SiteFooter';

const SITE = 'https://trend2print.com';

const Move: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="font-mono text-foreground bg-muted rounded px-1.5 py-0.5">{children}</code>
);

const Guide4x4: React.FC = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Solve a 4x4 Rubik\u2019s Cube',
    description:
      'A step-by-step guide to solving the 4x4 Rubik\u2019s Revenge using the reduction method, including parity fixes.',
    totalTime: 'PT30M',
    step: [
      { '@type': 'HowToStep', name: 'Solve the six centers' },
      { '@type': 'HowToStep', name: 'Pair up the twelve edges' },
      { '@type': 'HowToStep', name: 'Solve it like a 3x3' },
      { '@type': 'HowToStep', name: 'Fix OLL and PLL parity' },
    ],
  };

  return (
    <div className="min-h-screen bg-hero">
      <Helmet>
        <title>How to Solve a 4x4 Rubik's Cube Guide | CubeSolver AI</title>
        <meta
          name="description"
          content="Learn how to solve a 4x4 Rubik's Revenge with the reduction method: build centers, pair edges, solve like a 3x3, and fix both parity cases with clear algorithms."
        />
        <link rel="canonical" href={`${SITE}/guide/4x4`} />
        <meta property="og:title" content="How to Solve a 4x4 Rubik's Cube — Reduction Method" />
        <meta
          property="og:description"
          content="A step-by-step guide to solving the 4x4 Rubik's Revenge using the reduction method, including parity fixes."
        />
        <meta property="og:url" content={`${SITE}/guide/4x4`} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main className="container max-w-3xl py-8 space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/" className="hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to solver
          </Link>
          <Link to="/guide" className="hover:text-foreground">3x3 guide</Link>
          <Link to="/guide/2x2" className="hover:text-foreground">2x2 guide</Link>
        </nav>

        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            How to Solve a 4x4 Rubik's Cube
          </h1>
          <p className="text-muted-foreground text-lg">
            The 4x4, known as the Rubik's Revenge, looks intimidating but is solved with a clever
            shortcut called the <strong>reduction method</strong>: you rearrange the extra pieces until
            the 4x4 behaves exactly like a familiar 3x3, then solve it the way you already know. This
            guide assumes you can already solve a 3x3 — if not, start with our{' '}
            <Link to="/guide" className="text-primary underline underline-offset-4">3x3 beginner guide</Link>.
            Stuck? The{' '}
            <Link to="/" className="text-primary underline underline-offset-4">CubeSolver AI solver</Link>{' '}
            handles the 4x4 too.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Why the 4x4 is different</h2>
          <p className="text-muted-foreground">
            Unlike a 3x3, the 4x4 has no fixed center pieces — each face is made of four movable center
            tiles, and there are two of every edge piece. Because the centers can move, you can't rely
            on their color to tell you where a face belongs. The reduction method solves this by first
            grouping the four centers of each color together, then joining the matching edge pairs, so
            that every "super piece" acts like a single 3x3 piece.
          </p>
          <p className="text-muted-foreground">
            Note the wide-turn notation: a lowercase letter such as <Move>r</Move> or capital-w such as{' '}
            <Move>Rw</Move> turns the outer layer <em>plus</em> the layer just behind it. See the{' '}
            <Link to="/notation" className="text-primary underline underline-offset-4">notation reference</Link>{' '}
            if that's new to you.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 1: Solve the centers</h2>
          <p className="text-muted-foreground">
            Build each face's 2x2 block of center tiles. Start with one color (white), then its opposite
            (yellow), and finish the remaining four around the middle. To join two center tiles without
            wrecking a finished center, place one tile in the top-back and one in the front, then use a
            wide turn to bring them together and an inner-slice turn to lock them in — for example{' '}
            <Move>Uw</Move> to bring a strip up, adjust, and <Move>Uw'</Move> to restore.
          </p>
          <p className="text-muted-foreground">
            Keep the last two centers opposite each other so you can build them without disturbing the
            four you already finished. When all six 2x2 centers are solid, place white on top and yellow
            on the bottom.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 2: Pair the edges</h2>
          <p className="text-muted-foreground">
            There are twelve edge positions, each split into two tiles that must be matched into a
            single edge. Bring two matching edge tiles to the front-left and front-right slots, then
            use this pairing trigger to merge them without breaking your centers:
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 font-mono text-foreground">
              Uw' (R U R' F R' F' R) Uw
            </CardContent>
          </Card>
          <p className="text-muted-foreground">
            A simpler beginner approach: hold an unpaired edge at front-right, flip its partner up with{' '}
            <Move>U'</Move>, slot them together with <Move>Rw</Move>, restore the top with{' '}
            <Move>U</Move>, and undo with <Move>Rw'</Move>. Work through pairs until all twelve edges are
            joined. For the final pairs, use the "double-edge flip" so you never disturb the ones already done.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 3: Solve it like a 3x3</h2>
          <p className="text-muted-foreground">
            With solved centers and paired edges, the 4x4 now behaves like a 3x3 — treat each 2x2 center
            as a single center and each edge pair as a single edge. Run through the same Layer-by-Layer
            method from our{' '}
            <Link to="/guide" className="text-primary underline underline-offset-4">3x3 guide</Link>:
            first layer cross and corners, middle layer, then the last layer. Use only outer-face turns
            here — never inner slices — so you don't break your reduction.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 4: Fix parity (the 4x4-only cases)</h2>
          <p className="text-muted-foreground">
            Sometimes the last layer reaches a position that's impossible on a real 3x3. These are called
            parity errors, and every 4x4 solver hits them. There are two.
          </p>
          <h3 className="text-lg font-medium">OLL parity — a single flipped edge</h3>
          <p className="text-muted-foreground">
            If one last-layer edge is flipped by itself while making the yellow cross, apply:
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 font-mono text-foreground">
              Rw U2 Rw U2 Rw U2 Rw U2 Rw U2 Rw
            </CardContent>
          </Card>
          <h3 className="text-lg font-medium">PLL parity — two swapped edges</h3>
          <p className="text-muted-foreground">
            If the cube is solved except for two last-layer edges that need to swap, hold them at the
            front and back of the top layer and apply:
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 font-mono text-foreground">
              Rw2 U2 Rw2 Uw2 Rw2 Uw2
            </CardContent>
          </Card>
          <p className="text-muted-foreground">
            After the correct parity fix, finish the last layer normally — and the 4x4 is solved. With
            practice, spotting and clearing parity becomes automatic.
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
              Don't fight the parity by hand — enter your 4x4's colors and CubeSolver AI computes a full
              solution you can follow move by move.
            </p>
            <Button asChild variant="hero">
              <Link to="/">Solve my 4x4 now</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Guide4x4;