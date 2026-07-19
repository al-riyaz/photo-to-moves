import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SiteFooter from '@/components/SiteFooter';

const SITE = 'https://trend2print.com';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-hero">
      <Helmet>
        <title>Privacy Policy — CubeSolver AI</title>
        <meta
          name="description"
          content="CubeSolver AI's privacy policy: what data the web app and Android app collect, how camera photos are used on-device only, and how advertising data is handled."
        />
        <link rel="canonical" href={`${SITE}/privacy`} />
        <meta property="og:title" content="Privacy Policy — CubeSolver AI" />
        <meta property="og:description" content="What CubeSolver AI collects, how camera photos stay on-device, and how ad data is handled." />
        <meta property="og:url" content={`${SITE}/privacy`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="container max-w-3xl py-8 space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to solver
          </Link>
        </nav>

        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">
            This policy covers both the CubeSolver AI website and the CubeSolver AI Android app.
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Camera and cube photos</h2>
          <p className="text-muted-foreground">
            Both the website and the Android app let you photograph or upload images of your
            cube's faces so the app can read the sticker colors. Those photos, and the color
            data extracted from them, are processed <strong>entirely on your device</strong> — in
            the Android app, the camera photos are decoded, sampled for color, and then
            discarded; in the web app, uploaded images are read directly in your browser. In
            neither case are your cube photos uploaded to, or stored on, any server we operate.
            We have no access to them.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Cube-solving data</h2>
          <p className="text-muted-foreground">
            The solving algorithm itself runs locally — in your browser on the website, and
            entirely on-device in the Android app. The colors you scan or enter and the
            resulting solution are not transmitted to us.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Advertising (Android app)</h2>
          <p className="text-muted-foreground">
            The Android app shows ads served through Google's Mobile Ads SDK and uses Google's
            User Messaging Platform to request advertising consent where required (for example,
            for users in the European Economic Area, the UK, and Switzerland). These SDKs may
            collect an advertising identifier and general device/usage information to serve and
            measure ads, governed by{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-4"
            >
              Google's Privacy Policy
            </a>
            . You can manage ad personalization for your Google account, and reset or limit your
            device's advertising identifier, from your Android system settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Accounts and personal data</h2>
          <p className="text-muted-foreground">
            Neither the website nor the Android app requires you to create an account or provide
            personal information to use the cube-solving features.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Website analytics</h2>
          <p className="text-muted-foreground">
            The website may use standard, aggregated web analytics to understand traffic to our
            guides and pages. This does not include your cube photos or color data, which never
            leave your browser.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p className="text-muted-foreground">
            Questions about this policy are welcome — reach out via the contact method listed in
            the CubeSolver AI Android app's Play Store listing, or learn more about the project
            on our <Link to="/about" className="text-primary underline underline-offset-4">About page</Link>.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Privacy;
