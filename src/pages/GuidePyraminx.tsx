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

const GuidePyraminx: React.FC = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Solve a Pyraminx',
    description:
      'A beginner-friendly, step-by-step guide to solving the Pyraminx pyramid puzzle.',
    totalTime: 'PT10M',
    step: [
      { '@type': 'HowToStep', name: 'Solve the tips' },
      { '@type': 'HowToStep', name: 'Solve the centers' },
      { '@type': 'HowToStep', name: 'Solve the first layer' },
      { '@type': 'HowToStep', name: 'Solve the last layer' },
    ],
  };

  return (
    <div className="min-h-screen bg-hero">
      <Helmet>
        <title>How to Solve a Pyraminx Guide | CubeSolver AI</title>
        <meta
          name="description"
          content="Learn how to solve a Pyraminx step by step: solve the tips and centers, build the first layer, then finish the last layer with two easy algorithms."
        />
        <link rel="canonical" href={`${SITE}/guide/pyraminx`} />
        <meta property="og:title" content="How to Solve a Pyraminx — Beginner's Guide" />
        <meta
          property="og:description"
          content="A step-by-step beginner guide to solving the Pyraminx pyramid puzzle."
        />
        <meta property="og:url" content={`${SITE}/guide/pyraminx`} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main className="container max-w-3xl py-8 space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/" className="hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to solver
          </Link>
          <Link to="/guide" className="hover:text-foreground">3x3 guide</Link>
          <Link to="/guide/4x4" className="hover:text-foreground">4x4 guide</Link>
        </nav>

        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            How to Solve a Pyraminx
          </h1>
          <p className="text-muted-foreground text-lg">
            The Pyraminx is a four-sided pyramid puzzle and one of the easiest twisty puzzles to learn —
            many people solve it in under a minute after a little practice. It has just two algorithms
            worth memorizing. Stuck partway? The{' '}
            <Link to="/" className="text-primary underline underline-offset-4">CubeSolver AI solver</Link>{' '}
            supports the Pyraminx too.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Understanding the pieces and notation</h2>
          <p className="text-muted-foreground">
            A Pyraminx has three kinds of pieces: four <strong>tips</strong> (the small corners that
            twist on their own), four <strong>centers</strong> just below each tip, and six{' '}
            <strong>edges</strong>. Moves are named for the four corners you hold: <Move>U</Move> (up),{' '}
            <Move>L</Move> (left), <Move>R</Move> (right), and <Move>B</Move> (back). A lowercase letter
            turns only the tip; an uppercase letter turns the whole corner layer. A prime (') means
            counter-clockwise.
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><Move>U</Move> turn the top corner layer clockwise</div>
              <div><Move>U'</Move> turn the top corner layer counter-clockwise</div>
              <div><Move>L</Move>, <Move>R</Move>, <Move>B</Move> the other corner layers</div>
              <div><Move>u l r b</Move> turn only the matching tip</div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 1: Solve the tips</h2>
          <p className="text-muted-foreground">
            Each tip only touches three colors and turns independently, so this is trivial: twist every
            tip so its three colors match the three center colors right below it. All four tips can be
            done in a few seconds and never need to be touched again.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 2: Solve the centers</h2>
          <p className="text-muted-foreground">
            Now line up the four center pieces so each face shows a consistent color around its middle.
            Turn the three lower corner layers (<Move>L</Move>, <Move>R</Move>, <Move>B</Move>) until the
            centers form matching color triangles on every face. This is intuitive and usually takes just
            a few turns — once the centers agree, the puzzle's "frame" is set.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 3: Solve the first layer</h2>
          <p className="text-muted-foreground">
            Choose a face to solve first and place its three bottom edges. Hold that face toward you and
            insert each edge using the same trigger you'd use on a cube. If an edge is in the bottom but
            flipped, use this to insert it correctly:
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 font-mono text-foreground">R U R' U' &nbsp;or&nbsp; L' U' L U</CardContent>
          </Card>
          <p className="text-muted-foreground">
            Repeat until one whole face and the layer beneath it are complete. Only the three top edges
            remain.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Step 4: Solve the last layer</h2>
          <p className="text-muted-foreground">
            The three remaining edges will be in one of a few simple states. Two algorithms cover
            everything.
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 space-y-2 font-mono text-foreground">
              <div><span className="font-sans text-muted-foreground">Cycle the edges:</span> R U R' U R U R'</div>
              <div><span className="font-sans text-muted-foreground">Flip two edges:</span> R U R' U' R U R' U'</div>
            </CardContent>
          </Card>
          <p className="text-muted-foreground">
            If the edges are in the right spots but two are flipped, use the second algorithm. If they
            need to move positions, use the first. Apply, re-check, and the Pyraminx is solved. With a
            little repetition you'll recognize the last-layer case instantly.
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
              Enter your Pyraminx colors and CubeSolver AI computes the solution, then walks you through
              it move by move.
            </p>
            <Button asChild variant="hero">
              <Link to="/">Solve my Pyraminx now</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
};

export default GuidePyraminx;