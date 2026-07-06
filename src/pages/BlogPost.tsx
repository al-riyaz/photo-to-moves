import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Boxes } from 'lucide-react';
import SiteFooter from '@/components/SiteFooter';
import { getPost, blogPosts } from '@/data/blog-posts';

const SITE = 'https://trend2print.com';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPost(slug) : undefined;

  if (!post) {
    return (
      <div className="min-h-screen bg-hero">
        <Helmet>
          <title>Article not found | CubeSolver AI</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <main className="container max-w-3xl py-16 space-y-4 text-center">
          <h1 className="text-3xl font-bold">Article not found</h1>
          <p className="text-muted-foreground">That article doesn't exist or may have moved.</p>
          <Button asChild variant="hero">
            <Link to="/blog">Browse all articles</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'CubeSolver AI' },
    publisher: { '@type': 'Organization', name: 'CubeSolver AI' },
    mainEntityOfPage: `${SITE}/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-hero">
      <Helmet>
        <title>{`${post.title} | CubeSolver AI`}</title>
        <meta name="description" content={post.description} />
        <link rel="canonical" href={`${SITE}/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:url" content={`${SITE}/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main className="container max-w-3xl py-8 space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/" className="hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Solver
          </Link>
          <Link to="/blog" className="hover:text-foreground">All articles</Link>
        </nav>

        <header className="space-y-3">
          <div className="text-xs uppercase tracking-wide text-primary">{post.tag}</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{post.title}</h1>
          <div className="text-sm text-muted-foreground">
            {formatDate(post.date)} · {post.readingTime}
          </div>
        </header>

        <article className="space-y-4 leading-relaxed">{post.body}</article>

        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-primary" /> Try the solver
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Scan your cube or enter its colors and get the fastest solution, animated move by move.
            </p>
            <Button asChild variant="hero">
              <Link to="/">Open the solver</Link>
            </Button>
          </CardContent>
        </Card>

        {related.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Keep reading</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <Card key={r.slug} className="bg-card/60 transition-colors hover:border-primary/50">
                  <CardContent className="py-4 space-y-2">
                    <Link to={`/blog/${r.slug}`} className="font-semibold hover:underline underline-offset-4">
                      {r.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{r.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

export default BlogPost;