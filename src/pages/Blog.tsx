import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import SiteFooter from '@/components/SiteFooter';
import { blogPosts } from '@/data/blog-posts';

const SITE = 'https://trend2print.com';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const Blog: React.FC = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'CubeSolver AI Blog',
    url: `${SITE}/blog`,
    blogPost: blogPosts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      datePublished: p.date,
      url: `${SITE}/blog/${p.slug}`,
      description: p.description,
    })),
  };

  return (
    <div className="min-h-screen bg-hero">
      <Helmet>
        <title>Cubing Blog — Tips, Guides &amp; How-Tos | CubeSolver AI</title>
        <meta
          name="description"
          content="Articles on speedcubing, how cube solvers work, buying your first speed cube, and getting faster at the Rubik's Cube. Practical tips from CubeSolver AI."
        />
        <link rel="canonical" href={`${SITE}/blog`} />
        <meta property="og:title" content="CubeSolver AI Blog — Cubing Tips & Guides" />
        <meta property="og:description" content="Speedcubing tips, buying guides, and how cube solvers work." />
        <meta property="og:url" content={`${SITE}/blog`} />
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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">The CubeSolver AI blog</h1>
          <p className="text-muted-foreground text-lg">
            Tips, explainers, and buying advice to help you solve faster and enjoy the hobby more.
          </p>
        </header>

        <section className="space-y-5">
          {blogPosts.map((post) => (
            <Card key={post.slug} className="bg-card/60 transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="text-xs uppercase tracking-wide text-primary">{post.tag}</div>
                <CardTitle className="text-2xl">
                  <Link to={`/blog/${post.slug}`} className="hover:underline underline-offset-4">
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">{post.description}</p>
                <div className="text-sm text-muted-foreground">
                  {formatDate(post.date)} · {post.readingTime}
                </div>
                <Link
                  to={`/blog/${post.slug}`}
                  className="text-primary underline underline-offset-4 text-sm"
                >
                  Read article →
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Blog;