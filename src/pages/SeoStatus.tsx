import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const SITE = 'https://trend2print.com';

type Status = 'pass' | 'fail' | 'warn' | 'unknown';

interface Check {
  id: string;
  label: string;
  status: Status;
  detail: string;
}

interface Result {
  site: string;
  verified: boolean;
  checkedAt: string;
  checks: Check[];
}

const statusIcon: Record<Status, React.ReactNode> = {
  pass: <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden />,
  fail: <XCircle className="h-5 w-5 text-destructive" aria-hidden />,
  warn: <AlertTriangle className="h-5 w-5 text-yellow-500" aria-hidden />,
  unknown: <HelpCircle className="h-5 w-5 text-muted-foreground" aria-hidden />,
};

const statusLabel: Record<Status, string> = {
  pass: 'Passed',
  fail: 'Action needed',
  warn: 'Warning',
  unknown: 'Unknown',
};

const SeoStatus: React.FC = () => {
  const [result, setResult] = React.useState<Result | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const run = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('seo-status');
      if (error) throw error;
      setResult(data as Result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    run();
  }, [run]);

  return (
    <div className="min-h-screen bg-hero">
      <Helmet>
        <title>Search Console Status — CubeSolver AI</title>
        <meta name="description" content="Automated checklist confirming Google Search Console verification for CubeSolver AI." />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`${SITE}/seo-status`} />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to solver
        </Link>

        <h1 className="mb-6 text-3xl font-bold tracking-tight">Search Console Status</h1>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-2xl">Search Console verification</CardTitle>
              <Button onClick={run} disabled={loading} size="sm" variant="outline">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Re-run checks</span>
              </Button>
            </div>
            {result && (
              <p className="text-sm text-muted-foreground">
                {result.verified
                  ? '✅ Your domain is verified in Google Search Console.'
                  : 'Verification not complete yet — work through the checklist below.'}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {loading && !result && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Running checklist…
              </div>
            )}

            {result?.checks.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-4"
              >
                <div className="mt-0.5">{statusIcon[c.status]}</div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{c.label}</span>
                    <span className="text-xs text-muted-foreground">
                      · {statusLabel[c.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground break-words">
                    {c.detail}
                  </p>
                </div>
              </div>
            ))}

            {result && (
              <p className="pt-2 text-xs text-muted-foreground">
                Last checked {new Date(result.checkedAt).toLocaleString()} ·{' '}
                {result.site}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">What to do next</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Publish the app so the verification meta tag goes live.</p>
            <p>2. Make sure your custom domain points to the published site.</p>
            <p>3. Re-run the checks above until every item passes.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeoStatus;