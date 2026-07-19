import React from 'react';
import { Link } from 'react-router-dom';
import { Boxes } from 'lucide-react';

const linkClass = 'text-muted-foreground hover:text-foreground transition-colors';

const SiteFooter: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border mt-16">
      <div className="container max-w-6xl py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div className="space-y-3">
          <Link to="/" className="inline-flex items-center gap-2 font-semibold text-foreground">
            <Boxes className="h-5 w-5 text-primary" /> CubeSolver AI
          </Link>
          <p className="text-muted-foreground">
            Free online cube solver and learning hub. Scan or enter your colors and get the fastest
            step-by-step solution for the 3x3, 2x2, 4x4, Pyraminx, Megaminx and more.
          </p>
        </div>

        <nav aria-label="Solving guides" className="space-y-2">
          <h2 className="font-semibold text-foreground">Solving guides</h2>
          <ul className="space-y-1.5">
            <li><Link to="/guide" className={linkClass}>3x3 Rubik's Cube</Link></li>
            <li><Link to="/guide/2x2" className={linkClass}>2x2 Pocket Cube</Link></li>
            <li><Link to="/guide/4x4" className={linkClass}>4x4 Rubik's Revenge</Link></li>
            <li><Link to="/guide/pyraminx" className={linkClass}>Pyraminx</Link></li>
            <li><Link to="/notation" className={linkClass}>Notation &amp; algorithms</Link></li>
          </ul>
        </nav>

        <nav aria-label="Articles" className="space-y-2">
          <h2 className="font-semibold text-foreground">Articles</h2>
          <ul className="space-y-1.5">
            <li><Link to="/blog" className={linkClass}>All articles</Link></li>
            <li><Link to="/blog/speedcubing-tips-for-beginners" className={linkClass}>Speedcubing tips</Link></li>
            <li><Link to="/blog/how-a-cube-solver-works" className={linkClass}>How a solver works</Link></li>
            <li><Link to="/blog/best-cubes-for-beginners" className={linkClass}>Best cubes for beginners</Link></li>
          </ul>
        </nav>

        <nav aria-label="Company" className="space-y-2">
          <h2 className="font-semibold text-foreground">CubeSolver AI</h2>
          <ul className="space-y-1.5">
            <li><Link to="/" className={linkClass}>Cube solver</Link></li>
            <li><Link to="/about" className={linkClass}>About</Link></li>
            <li><Link to="/faq" className={linkClass}>FAQ</Link></li>
            <li><Link to="/privacy" className={linkClass}>Privacy Policy</Link></li>
          </ul>
        </nav>
      </div>
      <div className="container max-w-6xl border-t border-border py-6 text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <p>&copy; {year} CubeSolver AI. Free Rubik's Cube solver and tutorials.</p>
        <p>Rubik's Cube&reg; is a trademark of Spin Master. This site is not affiliated with the trademark owner.</p>
      </div>
    </footer>
  );
};

export default SiteFooter;