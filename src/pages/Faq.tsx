import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Boxes } from 'lucide-react';
import SiteFooter from '@/components/SiteFooter';

const SITE = 'https://trend2print.com';

const faqs: { q: string; a: React.ReactNode; plain: string }[] = [
  {
    q: 'Is CubeSolver AI free to use?',
    a: (
      <>Yes. Every solver and every guide on the site is completely free. There is no account,
      subscription, download, or hidden paywall — open the page and start solving.</>
    ),
    plain:
      'Yes. Every solver and guide on the site is completely free. There is no account, subscription, download, or hidden paywall.',
  },
  {
    q: 'How does the cube solver work?',
    a: (
      <>You give the solver the current state of your cube — either by uploading photos of the six
      faces or by tapping the colors into an on-screen grid. It checks that the arrangement is a real,
      solvable cube, then runs a solving algorithm (the Kociemba two-phase method for the 3x3) to
      compute an efficient sequence of moves. The result is shown in standard notation and animated on
      a 3D cube you can step through.</>
    ),
    plain:
      'You give the solver the current state of your cube by uploading photos or entering colors. It validates the cube, then computes an efficient move sequence using a solving algorithm and shows it on a 3D model.',
  },
  {
    q: 'Which puzzles can I solve here?',
    a: (
      <>The 2x2 Pocket Cube, the standard 3x3 Rubik's Cube, the 4x4 Rubik's Revenge, the Pyraminx, the
      Megaminx, and mirror cubes. Pick your puzzle from the menu on the home page.</>
    ),
    plain:
      'The 2x2, 3x3, 4x4, Pyraminx, Megaminx and mirror cubes. Pick your puzzle from the menu on the home page.',
  },
  {
    q: 'What is the fewest number of moves to solve a Rubik\u2019s Cube?',
    a: (
      <>Any legal scramble of a 3x3 can be solved in 20 moves or fewer — a result mathematicians call
      "God's Number." Our solver aims for short, efficient solutions but does not always hit the exact
      theoretical minimum, because finding the absolute optimum for every scramble is far slower.</>
    ),
    plain:
      "Any 3x3 scramble can be solved in 20 moves or fewer, a result called God's Number. Our solver produces short, efficient solutions but not always the exact minimum.",
  },
  {
    q: 'Do my cube photos leave my device?',
    a: (
      <>The 3x3 solving computation runs directly in your browser, so the solving process happens on
      your own device. We recommend using the tool in good lighting so the colors are read correctly.</>
    ),
    plain:
      'The 3x3 solving computation runs directly in your browser on your own device.',
  },
  {
    q: 'The solver says my cube is invalid. What went wrong?',
    a: (
      <>An "invalid cube" message means the colors you entered can't form a real cube — usually a
      misread sticker, a wrong center color, or a duplicated piece. Double-check each face, make sure
      every color appears exactly nine times (for a 3x3), and confirm the center colors match a
      standard color scheme before solving again.</>
    ),
    plain:
      'An invalid cube means the entered colors cannot form a real cube. Check for misread stickers, wrong centers, or duplicated pieces, and make sure each color appears the correct number of times.',
  },
  {
    q: 'Can I learn to solve a cube without the solver?',
    a: (
      <>Absolutely, and we encourage it. Our step-by-step guides teach the beginner Layer-by-Layer
      method for the <Link to="/guide" className="text-primary underline underline-offset-4">3x3</Link>{' '}
      and <Link to="/guide/2x2" className="text-primary underline underline-offset-4">2x2</Link>, and
      the <Link to="/notation" className="text-primary underline underline-offset-4">notation
      reference</Link> explains every symbol used in an algorithm.</>
    ),
    plain:
      'Yes. Our step-by-step guides teach the beginner Layer-by-Layer method for the 3x3 and 2x2, and the notation reference explains every algorithm symbol.',
  },
  {
    q: 'How long does it take to learn to solve a Rubik\u2019s Cube?',
    a: (
      <>Most people can learn to solve a 3x3 from scratch in a few hours spread over a day or two
      using the Layer-by-Layer method. The 2x2 is even quicker — often under an hour. Speed comes
      later, with practice and finger tricks.</>
    ),
    plain:
      'Most people learn the 3x3 in a few hours over a day or two using the Layer-by-Layer method. The 2x2 is often under an hour. Speed comes with practice.',
  },
];

const Faq: React.FC = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.plain },
    })),
  };

  return (
    <div className="min-h-screen bg-hero">
      <Helmet>
        <title>Rubik's Cube Solver FAQ — Common Questions Answered | CubeSolver AI</title>
        <meta
          name="description"
          content="Answers to common questions about solving a Rubik's Cube online: how the solver works, which puzzles are supported, God's Number, invalid cubes, and learning to solve."
        />
        <link rel="canonical" href={`${SITE}/faq`} />
        <meta property="og:title" content="Rubik's Cube Solver FAQ" />
        <meta property="og:description" content="Common questions about the online cube solver and learning to solve, answered." />
        <meta property="og:url" content={`${SITE}/faq`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main className="container max-w-3xl py-8 space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to solver
          </Link>
        </nav>

        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Frequently asked questions</h1>
          <p className="text-muted-foreground text-lg">
            Everything you might want to know about the CubeSolver AI solver, the puzzles it supports,
            and learning to solve a cube yourself.
          </p>
        </header>

        <section className="space-y-6">
          {faqs.map((f) => (
            <article key={f.q} className="space-y-2">
              <h2 className="text-xl font-semibold">{f.q}</h2>
              <p className="text-muted-foreground">{f.a}</p>
            </article>
          ))}
        </section>

        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-primary" /> Still stuck?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Skip the guesswork — scan your cube or enter its colors and let CubeSolver AI compute the
              fastest solution for you.
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

export default Faq;