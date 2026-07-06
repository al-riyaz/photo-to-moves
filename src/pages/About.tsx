import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Boxes } from 'lucide-react';
import SiteFooter from '@/components/SiteFooter';

const SITE = 'https://trend2print.com';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-hero">
      <Helmet>
        <title>About CubeSolver AI — Our Free Rubik's Cube Solver</title>
        <meta
          name="description"
          content="Learn about CubeSolver AI: a free online Rubik's Cube solver and tutorial hub. How it works, who it's for, the algorithms behind it, and why we built it."
        />
        <link rel="canonical" href={`${SITE}/about`} />
        <meta property="og:title" content="About CubeSolver AI" />
        <meta property="og:description" content="A free online Rubik's Cube solver and learning hub — how it works and why we built it." />
        <meta property="og:url" content={`${SITE}/about`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="container max-w-3xl py-8 space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to solver
          </Link>
        </nav>

        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About CubeSolver AI</h1>
          <p className="text-muted-foreground text-lg">
            CubeSolver AI is a free, browser-based tool that solves twisty puzzles and teaches you how
            to solve them yourself. There is nothing to install, no account to create, and no cost —
            just point your cube at the camera or enter the colors and get a clear, step-by-step
            solution in seconds.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">What the tool does</h2>
          <p className="text-muted-foreground">
            Most people who pick up a Rubik's Cube get stuck. The classic 3x3 has more than 43
            quintillion possible states, so trial and error almost never works. CubeSolver AI removes
            that frustration: it reads the six faces of your scrambled cube — either from photos you
            upload or from colors you tap into an on-screen grid — validates that the arrangement is a
            real, solvable cube, and then computes an efficient sequence of moves that returns it to a
            solved state.
          </p>
          <p className="text-muted-foreground">
            The solution is shown as standard cube notation and animated on an interactive 3D model
            you can rotate and step through one move at a time, so you can follow along at your own
            pace without losing your place.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">The puzzles we support</h2>
          <p className="text-muted-foreground">
            The solver goes well beyond the standard 3x3. It handles the 2x2 Pocket Cube, the 4x4
            Rubik's Revenge, the Pyraminx, the Megaminx and mirror-style cubes, each with a workspace
            tuned to how that puzzle is scrambled and read. Whichever puzzle is gathering dust in your
            drawer, there is a good chance we can bring it back to life.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">The technology behind it</h2>
          <p className="text-muted-foreground">
            For the 3x3, CubeSolver AI uses the Kociemba two-phase algorithm — the same family of
            method that competitive solving software relies on. Instead of brute-forcing billions of
            positions, it splits the search into two phases that dramatically shrink the number of
            moves required, typically returning a solution of around twenty moves or fewer. Other
            puzzles use dedicated solvers written specifically for their mechanics. All of this runs
            directly in your browser, which means your cube data never has to leave your device.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Learn, don't just solve</h2>
          <p className="text-muted-foreground">
            A one-click solution is satisfying, but solving a cube from memory is genuinely rewarding.
            That is why we pair the solver with plain-English tutorials. Our{' '}
            <Link to="/guide" className="text-primary underline underline-offset-4">3x3 beginner guide</Link>{' '}
            teaches the Layer-by-Layer method, the{' '}
            <Link to="/guide/2x2" className="text-primary underline underline-offset-4">2x2 guide</Link>{' '}
            is the fastest way to learn your first cube, and our{' '}
            <Link to="/notation" className="text-primary underline underline-offset-4">notation reference</Link>{' '}
            demystifies the letters and symbols every algorithm uses.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Who it's for</h2>
          <p className="text-muted-foreground">
            Curious beginners who just want their cube solved once, parents helping a frustrated kid,
            teachers using puzzles in the classroom, and speedcubers checking an optimal solve all use
            CubeSolver AI. We keep the interface simple enough for a first-timer while staying accurate
            enough for enthusiasts.
          </p>
        </section>

        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-primary" /> Ready to solve your cube?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Scan your cube or enter the colors and get the fastest solution, then follow it move by
              move on the 3D model.
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

export default About;