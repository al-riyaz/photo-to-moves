import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { toast } from '@/hooks/use-toast';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Sign in — CubeSolver AI';
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/', { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate('/', { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: `${window.location.origin}/`,
    });
    if (error) {
      toast({ title: 'Sign-in failed', description: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome to CubeSolver AI</CardTitle>
          <CardDescription>Sign in to save your scrambles and solutions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="hero" className="w-full" disabled={loading} onClick={signInWithGoogle}>
            {loading ? 'Redirecting…' : 'Continue with Google'}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
            Continue without signing in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
