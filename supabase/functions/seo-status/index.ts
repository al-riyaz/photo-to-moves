// Google Search Console verification status checklist.
// Runs server-side so the connector gateway credentials never reach the browser.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://trend2print.com/";
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

type Check = {
  id: string;
  label: string;
  status: "pass" | "fail" | "warn" | "unknown";
  detail: string;
};

function gscHeaders() {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const gscKey = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
  return {
    lovableKey,
    gscKey,
    headers: {
      Authorization: `Bearer ${lovableKey ?? ""}`,
      "X-Connection-Api-Key": gscKey ?? "",
      "Content-Type": "application/json",
    },
  };
}

async function checkLiveSite(): Promise<Check> {
  try {
    const res = await fetch(SITE_URL, { redirect: "follow" });
    if (!res.ok) {
      return {
        id: "live",
        label: "Site is published and reachable",
        status: "fail",
        detail: `${SITE_URL} returned HTTP ${res.status}.`,
      };
    }
    return {
      id: "live",
      label: "Site is published and reachable",
      status: "pass",
      detail: `${SITE_URL} responded with HTTP 200.`,
    };
  } catch (e) {
    return {
      id: "live",
      label: "Site is published and reachable",
      status: "fail",
      detail: `Could not reach ${SITE_URL}: ${String(e)}`,
    };
  }
}

async function checkMetaTag(): Promise<Check> {
  try {
    const res = await fetch(SITE_URL, { redirect: "follow" });
    const html = await res.text();
    const has = /name=["']google-site-verification["']/i.test(html);
    return {
      id: "meta",
      label: "Verification meta tag is live",
      status: has ? "pass" : "fail",
      detail: has
        ? "Found the google-site-verification meta tag in the live HTML."
        : "Meta tag not found yet — publish the latest version so it goes live.",
    };
  } catch (e) {
    return {
      id: "meta",
      label: "Verification meta tag is live",
      status: "fail",
      detail: `Could not read the live HTML: ${String(e)}`,
    };
  }
}

async function checkSearchConsole(): Promise<Check[]> {
  const { lovableKey, gscKey, headers } = gscHeaders();
  if (!lovableKey || !gscKey) {
    return [
      {
        id: "verified",
        label: "Domain verified in Search Console",
        status: "unknown",
        detail: "Search Console connection is not available in this environment.",
      },
    ];
  }
  try {
    const res = await fetch(`${GATEWAY}/webmasters/v3/sites`, { headers });
    if (!res.ok) {
      const body = await res.text();
      return [
        {
          id: "verified",
          label: "Domain verified in Search Console",
          status: "fail",
          detail: `Search Console API error ${res.status}: ${body.slice(0, 200)}`,
        },
      ];
    }
    const data = await res.json();
    const sites: Array<{ siteUrl: string; permissionLevel?: string }> =
      data.siteEntry ?? [];
    const match = sites.find(
      (s) => s.siteUrl?.replace(/\/$/, "") === SITE_URL.replace(/\/$/, ""),
    );
    const added: Check = {
      id: "added",
      label: "Site added to Search Console",
      status: match ? "pass" : "fail",
      detail: match
        ? `Found ${match.siteUrl} in your Search Console properties.`
        : "Site is not in your Search Console property list yet.",
    };
    const verified: Check = {
      id: "verified",
      label: "Domain verified in Search Console",
      status: match
        ? match.permissionLevel === "siteUnverifiedUser"
          ? "fail"
          : "pass"
        : "fail",
      detail: match
        ? `Permission level: ${match.permissionLevel ?? "unknown"}.`
        : "Verification pending — run the checklist again after publishing.",
    };
    return [added, verified];
  } catch (e) {
    return [
      {
        id: "verified",
        label: "Domain verified in Search Console",
        status: "fail",
        detail: `Search Console request failed: ${String(e)}`,
      },
    ];
  }
}

async function checkSitemap(): Promise<Check> {
  try {
    const res = await fetch(`${SITE_URL}sitemap.xml`, { redirect: "follow" });
    const ok = res.ok && (await res.text()).includes("<urlset");
    return {
      id: "sitemap",
      label: "Sitemap is accessible",
      status: ok ? "pass" : "warn",
      detail: ok
        ? `${SITE_URL}sitemap.xml is live.`
        : `${SITE_URL}sitemap.xml not reachable yet (HTTP ${res.status}).`,
    };
  } catch (e) {
    return {
      id: "sitemap",
      label: "Sitemap is accessible",
      status: "warn",
      detail: `Could not read sitemap: ${String(e)}`,
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const [live, meta, sitemap, sc] = await Promise.all([
      checkLiveSite(),
      checkMetaTag(),
      checkSitemap(),
      checkSearchConsole(),
    ]);
    const checks: Check[] = [live, meta, ...sc, sitemap];
    const verified =
      checks.find((c) => c.id === "verified")?.status === "pass";
    return new Response(
      JSON.stringify({
        site: SITE_URL,
        verified,
        checkedAt: new Date().toISOString(),
        checks,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});