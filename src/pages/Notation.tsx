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

const Notation: React.FC = () => {
  return (
    <div className="min-h-screen bg-hero">
      <Helmet>
        <title>Rubik's Cube Notation &amp; Algorithm Reference | CubeSolver AI</title>
        <meta
          name="description"
          content="A complete reference for Rubik's Cube notation: face turns, prime and double moves, wide and slice turns, cube rotations, and the most useful beginner algorithms."
        />
        <link rel="canonical" href={`${SITE}/notation`} />
        <meta property="og:title" content="Rubik's Cube Notation & Algorithm Reference" />
        <meta property="og:description" content="Understand every letter and symbol in cube notation, plus the essential beginner algorithms." />
        <meta property="og:url" content={`${SITE}/notation`} />
        <meta property="og:type" content="article" />
      </Helmet>

      <main className="container max-w-3xl py-8 space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/" className="hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to solver
          </Link>
          <Link to="/guide" className="hover:text-foreground">3x3 guide</Link>
        </nav>

        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Rubik's Cube notation &amp; algorithm reference
          </h1>
          <p className="text-muted-foreground text-lg">
            Every cube tutorial in the world is written in the same shorthand. Once you can read it,
            any algorithm becomes a simple set of instructions. This page explains the whole system,
            from a single face turn to full cube rotations, and collects the algorithms you'll use most.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">The six faces</h2>
          <p className="text-muted-foreground">
            A cube has six faces, and each is named for its position relative to how you hold the puzzle.
            Each letter means "turn this face 90° clockwise, as if you were looking straight at it."
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><Move>U</Move> Up — the top face</div>
              <div><Move>D</Move> Down — the bottom face</div>
              <div><Move>R</Move> Right — the right-hand face</div>
              <div><Move>L</Move> Left — the left-hand face</div>
              <div><Move>F</Move> Front — the face toward you</div>
              <div><Move>B</Move> Back — the face away from you</div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Modifiers: prime and double</h2>
          <p className="text-muted-foreground">
            Two small marks change what a letter means. This is how a handful of faces turns into every
            possible move.
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 space-y-2 text-sm">
              <div><Move>R</Move> quarter turn clockwise (90°)</div>
              <div><Move>R'</Move> "R prime" — quarter turn counter-clockwise (90° the other way)</div>
              <div><Move>R2</Move> half turn (180°) — direction doesn't matter</div>
            </CardContent>
          </Card>
          <p className="text-muted-foreground">
            "Clockwise" is always judged from the perspective of looking directly at that face. So a
            clockwise <Move>L</Move> from the left side looks counter-clockwise if you glance at it from
            the right.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Wide turns and slice moves</h2>
          <p className="text-muted-foreground">
            Bigger cubes and some advanced 3x3 methods use turns that move more than the outer layer.
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 space-y-2 text-sm">
              <div><Move>r</Move>, <Move>u</Move>, <Move>f</Move>… (lowercase) wide turns — the outer face plus the layer directly behind it</div>
              <div><Move>Rw</Move>, <Move>Uw</Move>… alternative wide-turn notation used for 4x4 and larger</div>
              <div><Move>M</Move> middle slice — the layer between L and R, turned in the L direction</div>
              <div><Move>E</Move> equator slice — the layer between U and D, turned in the D direction</div>
              <div><Move>S</Move> standing slice — the layer between F and B, turned in the F direction</div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Whole-cube rotations</h2>
          <p className="text-muted-foreground">
            Sometimes an instruction rotates the entire cube in your hands without changing how it's
            solved — useful for repositioning before the next step.
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 space-y-2 text-sm">
              <div><Move>x</Move> rotate the whole cube around the R axis (like an R turn)</div>
              <div><Move>y</Move> rotate the whole cube around the U axis (like a U turn)</div>
              <div><Move>z</Move> rotate the whole cube around the F axis (like an F turn)</div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Reading an algorithm</h2>
          <p className="text-muted-foreground">
            An algorithm is just a list of moves performed left to right. Take the famous "sexy move":
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 font-mono text-foreground">R U R' U'</CardContent>
          </Card>
          <p className="text-muted-foreground">
            Read it as: Right clockwise, Up clockwise, Right counter-clockwise, Up counter-clockwise.
            Repeat that same four-move trigger six times and the cube returns exactly to where it
            started — proof that these moves are perfectly reversible.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Essential beginner algorithms</h2>
          <p className="text-muted-foreground">
            These are the algorithms our{' '}
            <Link to="/guide" className="text-primary underline underline-offset-4">3x3 guide</Link>{' '}
            relies on. Keep this list handy while you learn.
          </p>
          <Card className="bg-card/60">
            <CardContent className="py-4 space-y-2 font-mono text-foreground text-sm">
              <div><span className="font-sans text-muted-foreground">Insert a corner:</span> R' D' R D</div>
              <div><span className="font-sans text-muted-foreground">Middle edge (right):</span> U R U' R' U' F' U F</div>
              <div><span className="font-sans text-muted-foreground">Middle edge (left):</span> U' L' U L U F U' F'</div>
              <div><span className="font-sans text-muted-foreground">Yellow cross:</span> F R U R' U' F'</div>
              <div><span className="font-sans text-muted-foreground">Position last corners:</span> U R U' L' U R' U' L</div>
              <div><span className="font-sans text-muted-foreground">Cycle last edges:</span> R U' R U R U R U' R' U' R2</div>
            </CardContent>
          </Card>
        </section>

        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-primary" /> Put it into practice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Want to see notation in action? Solve your cube and watch each move play out on the 3D
              model, step by step.
            </p>
            <Button asChild variant="hero">
              <Link to="/">Open the solver</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Notation;