import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Helmet>
        <title>Page Not Found — CubeSolver AI</title>
        <meta name="description" content="This page doesn't exist. Head back to CubeSolver AI to scan and solve your Rubik's Cube." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://cubesolver.trend2print.com/" />
        <meta property="og:title" content="Page Not Found — CubeSolver AI" />
        <meta property="og:description" content="This page doesn't exist. Head back to CubeSolver AI to scan and solve your Rubik's Cube." />
        <meta property="og:url" content="https://cubesolver.trend2print.com/404" />
      </Helmet>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
        <a href="/" className="text-primary underline underline-offset-4 hover:no-underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
