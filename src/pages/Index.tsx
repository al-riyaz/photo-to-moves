import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import CubeTypeMenu, { type CubeType } from "@/components/cube/CubeTypeMenu";
import ThreeByThreeWorkspace from "@/components/cube/workspaces/ThreeByThreeWorkspace";
import TwoByTwoWorkspace from "@/components/cube/workspaces/TwoByTwoWorkspace";
import FourByFourWorkspace from "@/components/cube/workspaces/FourByFourWorkspace";
import PyraminxWorkspace from "@/components/cube/workspaces/PyraminxWorkspace";
import MegaminxWorkspace from "@/components/cube/workspaces/MegaminxWorkspace";
import MirrorWorkspace from "@/components/cube/workspaces/MirrorWorkspace";

const Index: React.FC = () => {
  const [cubeType, setCubeType] = useState<CubeType>("3x3");

  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    document.documentElement.style.setProperty("--cursor-x", `${x}%`);
    document.documentElement.style.setProperty("--cursor-y", `${y}%`);
  };

  return (
    <div className="min-h-screen bg-hero" onMouseMove={onMouseMove}>
      <Helmet>
        <title>AI Cube Scanner &amp; Solution Generator</title>
        <meta
          name="description"
          content="Upload six cube faces or enter colors to get the fastest Rubik's Cube solution instantly."
        />
        <link rel="canonical" href="https://trend2print.com/" />
        <meta property="og:url" content="https://trend2print.com/" />
      </Helmet>
      <main className="container max-w-6xl py-6 space-y-6">
        <header className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Rubik&#39;s Cube Solver Online | AI Cube Scanner &amp; Solution Generator
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pick your puzzle, upload face photos or enter colors, and get a solution.
          </p>
          <p className="text-sm text-muted-foreground">
            New to cubing?{" "}
            <Link to="/guide" className="text-primary underline underline-offset-4">
              Read our How to Solve a Rubik's Cube guide
            </Link>
          </p>
        </header>
        <h2 className="sr-only">Rubik's Cube solver workspace</h2>
        <CubeTypeMenu value={cubeType} onChange={setCubeType} />
        {cubeType === "3x3" && <ThreeByThreeWorkspace />}
        {cubeType === "2x2" && <TwoByTwoWorkspace />}
        {cubeType === "4x4" && <FourByFourWorkspace />}
        {cubeType === "pyraminx" && <PyraminxWorkspace />}
        {cubeType === "megaminx" && <MegaminxWorkspace />}
        {cubeType === "mirror" && <MirrorWorkspace />}
      </main>
    </div>
  );
};

export default Index;
