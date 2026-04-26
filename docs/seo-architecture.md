# CoinTrace AI SEO Architecture Spec

This document is the source of truth for how SEO works in the CoinTrace AI
Next.js App Router project.

Future agents must read this before changing SEO, public landing pages,
metadata, sitemap, robots, favicon metadata, JSON-LD, or trust/legal pages.
Do not invent a separate SEO system. Use the files, helpers, route patterns,
content rules, and constraints documented here.

---

## 1. Purpose

CoinTrace AI has a public SEO layer designed to rank for long-tail keywords
around:

- AI crypto analysis
- crypto market intelligence
- AI token analysis
- crypto narratives
- AI crypto agents
- Bitcoin AI analysis
- Ethereum AI analysis

The SEO layer is separate from the internal product app.

Public SEO pages live at root-level marketing routes such as
`/ai-crypto-analysis` and `/crypto-market-intelligence`.

The logged-in or product-style app lives under `/app` and uses the app shell.
The `/app` area is intentionally marked `noindex` by `src/app/app/layout.tsx`.

The public pages explain the product honestly. They must not promise guaranteed
profits, personalized recommendations, financial advice, automated certainty, or
risk-free trading.

---

## 2. SEO File Map

Core SEO helpers:

- `src/lib/seo.ts`

SEO page content:

- `src/lib/seo-page-content.ts`

Shared public SEO components:

- `src/components/seo/JsonLd.tsx`
- `src/components/seo/SeoLandingPage.tsx`
- `src/components/seo/LegalPage.tsx`

Global metadata and root layout:

- `src/app/layout.tsx`

Homepage SEO and homepage JSON-LD:

- `src/app/page.tsx`

Crawler files:

- `src/app/sitemap.ts`
- `src/app/robots.ts`

Landing page route files:

- `src/app/ai-crypto-analysis/page.tsx`
- `src/app/crypto-market-intelligence/page.tsx`
- `src/app/ai-token-analysis/page.tsx`
- `src/app/crypto-narratives/page.tsx`
- `src/app/ai-crypto-agents/page.tsx`
- `src/app/bitcoin-ai-analysis/page.tsx`
- `src/app/ethereum-ai-analysis/page.tsx`

Trust and legal route files:

- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`
- `src/app/risk-disclaimer/page.tsx`
- `src/app/about/page.tsx`

Landing navigation:

- `src/components/landing/Header.tsx`
- `src/components/landing/Footer.tsx`

Favicon/app icons currently referenced by metadata:

- `src/app/favicon.ico`
- `src/app/icon.png`
- `src/app/apple-icon.png`

---

## 3. Canonical Site Constants

All canonical site-level constants live in `src/lib/seo.ts`.

Current values:

- `SITE_URL = "https://cointraceai.com"`
- `SITE_NAME = "CoinTrace AI"`
- `DEFAULT_OG_IMAGE = "/landing/hero-ai-crypto.jpg"`
- `defaultDescription = "CoinTrace AI helps crypto teams and researchers interpret market data, token moves, news, narratives, and AI-generated research in one intelligence workspace."`

Use these constants instead of duplicating the same values in new files.

`absoluteUrl(path)` converts relative paths into absolute URLs using
`SITE_URL`. It returns the input unchanged if it already starts with `http`.

---

## 4. Metadata System

Use `createSeoMetadata()` from `src/lib/seo.ts` for public SEO and trust pages.

The helper accepts:

- `title`
- `description`
- `path`
- optional `keywords`

It returns a Next.js `Metadata` object containing:

- page title
- meta description
- keywords
- canonical URL via `alternates.canonical`
- Open Graph metadata
- Twitter card metadata
- index/follow robots metadata

Important behavior:

- Canonical URL is the provided relative `path`, for example
  `/ai-crypto-analysis`.
- Open Graph `url` is absolute, generated with `absoluteUrl(path)`.
- Open Graph image uses `DEFAULT_OG_IMAGE`.
- Twitter card is `summary_large_image`.
- Public pages are `index: true` and `follow: true`.

Do not hand-roll metadata for new SEO pages unless there is a specific reason.
The existing pattern is to import `createSeoMetadata()` and export:

```ts
export const metadata = createSeoMetadata({
  title: "...",
  description: "...",
  path: content.path,
  keywords: ["..."],
});
```

---

## 5. Global Root Metadata

`src/app/layout.tsx` defines site-wide default metadata.

It imports:

- `defaultDescription`
- `SITE_NAME`
- `SITE_URL`

It sets:

- `metadataBase: new URL(SITE_URL)`
- default title: `CoinTrace AI — AI Crypto Market Intelligence`
- title template: `%s · CoinTrace AI`
- global description: `defaultDescription`
- application name: `CoinTrace AI`
- generator: `Next.js`
- global keywords for AI crypto analysis and market intelligence topics
- authors/creator/publisher as `CoinTrace AI`
- category: `finance`
- canonical `/`
- default Open Graph metadata
- default Twitter metadata
- index/follow robots metadata for public routes
- favicon metadata for `/favicon.ico`, `/icon.png`, and `/apple-icon.png`

It also sets viewport/theme behavior:

- light theme color: `#ffffff`
- dark theme color: `#0b0b0f`
- width: `device-width`
- initial scale: `1`
- color scheme: `light dark`

Do not remove the icon metadata unless the icon files and Next.js icon behavior
are intentionally redesigned.

---

## 6. Homepage SEO

The homepage is `src/app/page.tsx`.

It exports page-level metadata:

- title: `CoinTrace AI — AI Crypto Market Intelligence`
- description: `Research crypto markets with AI-assisted market briefs, token analysis, narrative detection, news context, and risk-aware explanations.`
- canonical: `/`
- Open Graph type: `website`
- Open Graph URL: `SITE_URL`
- Open Graph image: `/landing/hero-ai-crypto.jpg`
- Twitter card: `summary_large_image`
- robots: index/follow

The homepage renders three JSON-LD objects:

- `Organization`
- `WebSite`
- `SoftwareApplication`

These are created with:

- `createOrganizationJsonLd()`
- `createWebsiteJsonLd()`
- `createSoftwareApplicationJsonLd()`

The homepage renders JSON-LD through:

- `src/components/seo/JsonLd.tsx`

Do not replace this with raw inline script blocks unless the shared JSON-LD
component is intentionally removed.

---

## 7. JSON-LD System

JSON-LD type definitions and builders live in `src/lib/seo.ts`.

Types:

- `JsonLdObject`
- `FaqItem`

Builders:

- `createWebsiteJsonLd()`
- `createSoftwareApplicationJsonLd()`
- `createOrganizationJsonLd()`
- `createFaqJsonLd(faqs)`

`createWebsiteJsonLd()` returns:

- `@context: "https://schema.org"`
- `@type: "WebSite"`
- site name
- site URL
- default description
- publisher organization
- `SearchAction`

The `SearchAction` currently points to:

- `https://cointraceai.com/app/ask?q={search_term_string}`

This route should only be kept if the app supports or intentionally accepts the
`q` query parameter. If the app search behavior changes, update the schema.

`createSoftwareApplicationJsonLd()` returns:

- `@type: "SoftwareApplication"`
- application category: `FinanceApplication`
- operating system: `Web`
- offer price: `0`
- currency: `USD`
- availability: `OnlineOnly`

This does not mean all future product features are free. It reflects the current
schema choice and should be revisited if pricing changes.

`createOrganizationJsonLd()` returns:

- `@type: "Organization"`
- name
- URL
- logo at `/landing/logo-coin-trace.png`
- default description

`createFaqJsonLd(faqs)` maps each FAQ item to Schema.org `FAQPage` structure.

---

## 8. JSON-LD Rendering Component

`src/components/seo/JsonLd.tsx` is the only shared JSON-LD renderer.

It accepts either:

- a single `JsonLdObject`
- an array of `JsonLdObject`

It renders:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
/>
```

Future agents should use this component for JSON-LD unless there is a strong
reason to change the global rendering approach.

---

## 9. Public SEO Landing Page System

The seven long-tail SEO pages use one shared component:

- `src/components/seo/SeoLandingPage.tsx`

All page copy lives in:

- `src/lib/seo-page-content.ts`

The content object is:

```ts
export type SeoLandingPageContent = {
  eyebrow: string;
  title: string;
  description: string;
  path: string;
  primaryKeyword: string;
  sections: {
    title: string;
    paragraphs: string[];
  }[];
  useCases: string[];
  internalLinks: {
    href: string;
    label: string;
    description: string;
  }[];
  faqs: FaqItem[];
};
```

The shared component renders:

- `FAQPage` JSON-LD using `createFaqJsonLd(content.faqs)`
- `MobileWaitlistProvider`
- public landing `Header`
- hero section with eyebrow, H1, description, and CTA buttons
- primary CTA to `/app`
- secondary CTA to `/risk-disclaimer`
- content sections from `content.sections`
- "How teams use it" use case block
- visible FAQ accordion using `<details>`
- sticky sidebar with primary keyword and no-financial-advice disclaimer
- related internal links
- public landing `Footer`

The landing page component intentionally uses the existing visual system:

- `bg-background`
- `bg-gradient-hero`
- `container mx-auto px-6`
- rounded cards
- `border-border/60`
- `bg-card`
- `shadow-soft`
- `text-muted-foreground`
- `Button` variants from `src/components/ui/button`

Do not create a new design system for SEO pages. Reuse the current landing
system.

---

## 10. SEO Landing Route Map

Each SEO route file is intentionally small. It imports content, creates metadata,
and renders `SeoLandingPage`.

Current routes:

| Route | Content Key | Primary Keyword |
|---|---|---|
| `/ai-crypto-analysis` | `ai-crypto-analysis` | AI crypto analysis |
| `/crypto-market-intelligence` | `crypto-market-intelligence` | crypto market intelligence |
| `/ai-token-analysis` | `ai-token-analysis` | AI token analysis |
| `/crypto-narratives` | `crypto-narratives` | crypto narratives |
| `/ai-crypto-agents` | `ai-crypto-agents` | AI crypto agents |
| `/bitcoin-ai-analysis` | `bitcoin-ai-analysis` | Bitcoin AI analysis |
| `/ethereum-ai-analysis` | `ethereum-ai-analysis` | Ethereum AI analysis |

The route file pattern is:

```tsx
import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { seoLandingPages } from "@/lib/seo-page-content";
import { createSeoMetadata } from "@/lib/seo";

const content = seoLandingPages["route-key"];

export const metadata = createSeoMetadata({
  title: "...",
  description: "...",
  path: content.path,
  keywords: ["..."],
});

export default function PageName() {
  return <SeoLandingPage content={content} />;
}
```

Do not put full page copy into the route files. Keep route files thin.

---

## 11. Landing Page Content Rules

All long-tail SEO page content lives in `seoLandingPages` inside
`src/lib/seo-page-content.ts`.

Each page must include:

- one `eyebrow`
- one `title`, rendered as the H1 by `SeoLandingPage`
- one `description`
- exact `path`
- `primaryKeyword`
- multiple content sections with H2 headings and paragraphs
- use cases
- internal links
- FAQs

Current content intentionally follows these rules:

- 800+ words per SEO landing page
- product-focused explanation
- practical research guidance
- clear no-financial-advice language
- no guaranteed profit language
- no fake claims about performance or user outcomes
- no claims that AI predictions are certain
- no statements that CoinTrace AI replaces professional advice
- no statements that users should buy, sell, hold, short, or trade any asset

If adding or editing a page, preserve this tone.

Forbidden SEO copy:

- "guaranteed profits"
- "risk-free"
- "certain prediction"
- "always accurate"
- "buy now"
- "sell now"
- "hold this token"
- "financial advice"
- "personalized investment recommendation"
- fabricated user numbers, security certifications, exchange integrations, or
  historical performance stats

The product can be described as:

- AI-assisted crypto market research
- crypto market intelligence
- market briefings
- token analysis
- narrative detection
- risk-aware explanation
- research workflow support
- a tool for organizing context and asking better questions

The product must not be described as:

- a guaranteed trading signal service
- an autonomous profit system
- a substitute for independent research
- a provider of financial advice

---

## 12. Shared Product Internal Links

`src/lib/seo-page-content.ts` defines `productLinks`.

Current shared links:

- `/app` — "Market intelligence app"
- `/app/ask` — "Ask AI"
- `/risk-disclaimer` — "Risk disclaimer"

These links are included in each SEO landing page's `internalLinks` array using
spread syntax:

```ts
internalLinks: [
  ...productLinks,
  // page-specific links
]
```

Page-specific links connect related SEO pages and relevant app routes, such as:

- `/crypto-market-intelligence`
- `/ai-token-analysis`
- `/crypto-narratives`
- `/ai-crypto-agents`
- `/bitcoin-ai-analysis`
- `/ethereum-ai-analysis`
- `/app/narratives`
- `/app/token/BTC`
- `/app/token/ETH`

When adding a new SEO page, include at least a few relevant internal links and
do not create orphan pages.

---

## 13. Trust and Legal Page System

Trust/legal pages use one shared component:

- `src/components/seo/LegalPage.tsx`

All trust/legal page content lives in:

- `legalPages` inside `src/lib/seo-page-content.ts`

The content object is:

```ts
export type LegalPageContent = {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  sections: {
    title: string;
    paragraphs: string[];
  }[];
};
```

Current trust/legal pages:

| Route | Content Key | Purpose |
|---|---|---|
| `/privacy` | `privacy` | Privacy Policy |
| `/terms` | `terms` | Terms of Service |
| `/risk-disclaimer` | `risk-disclaimer` | Crypto and AI risk disclaimer |
| `/about` | `about` | Product/company explanation and trust context |

The shared `LegalPage` component renders:

- `MobileWaitlistProvider`
- public landing `Header`
- hero section with eyebrow, H1, description, and last updated date
- legal content card
- H2 sections
- bottom note linking to `/about`
- public landing `Footer`

Trust/legal route files also use `createSeoMetadata()`.

---

## 14. Public Navigation

The public landing header is:

- `src/components/landing/Header.tsx`

Current header links:

- `/` via logo
- `/#features`
- `/#analytics`
- `/#samples`
- `/crypto-market-intelligence` labeled "SEO Guides"
- `/#pricing`
- `/app` for Sign in
- `AppCta` for "Go to app"

The public landing footer is:

- `src/components/landing/Footer.tsx`

Current footer trust links:

- `/privacy`
- `/terms`
- `/risk-disclaimer`
- `/about`

The footer also states:

`Trading involves risk. Not financial advice.`

Keep this disclaimer or equivalent risk-aware wording visible on the public
site.

---

## 15. Sitemap

Sitemap is implemented with Next.js App Router metadata route:

- `src/app/sitemap.ts`

It imports `SITE_URL` from `src/lib/seo.ts`.

It defines a `publicRoutes` array and maps it to
`MetadataRoute.Sitemap`.

Current sitemap public routes:

- `/`
- `/ai-crypto-analysis`
- `/crypto-market-intelligence`
- `/ai-token-analysis`
- `/crypto-narratives`
- `/ai-crypto-agents`
- `/bitcoin-ai-analysis`
- `/ethereum-ai-analysis`
- `/about`
- `/privacy`
- `/terms`
- `/risk-disclaimer`

Current priorities and frequencies:

| Route Type | Change Frequency | Priority |
|---|---:|---:|
| `/` | daily | 1 |
| main SEO pages | monthly | 0.85-0.9 |
| `/about` | yearly | 0.6 |
| `/risk-disclaimer` | yearly | 0.5 |
| `/privacy`, `/terms` | yearly | 0.4 |

The sitemap intentionally does not include fragment URLs like `/#features`.

The sitemap intentionally does not include `/app` routes because `/app` is
marked `noindex` at the app layout level.

If a new public SEO page is added, add it to `publicRoutes`.

---

## 16. Robots

Robots is implemented with Next.js App Router metadata route:

- `src/app/robots.ts`

It imports `SITE_URL` from `src/lib/seo.ts`.

Current behavior:

- allow `/`
- disallow `/api/`
- sitemap: `https://cointraceai.com/sitemap.xml`
- host: `https://cointraceai.com`

Do not block the public SEO pages.

Do not rely only on `robots.txt` for app/private route indexing. `/app` uses
metadata-level `noindex` in `src/app/app/layout.tsx`.

---

## 17. Product App Indexing

The product app layout is:

- `src/app/app/layout.tsx`

It sets:

```ts
export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};
```

This means `/app` and nested app routes inherit noindex behavior unless a nested
route overrides it.

Current product routes include:

- `/app`
- `/app/ask`
- `/app/monitoring`
- `/app/narratives`
- `/app/token/[symbol]`

Do not add `/app` routes to the sitemap unless the indexing strategy is changed
intentionally.

---

## 18. Favicon and Icon Metadata

Global icon metadata is in `src/app/layout.tsx`.

Current icon metadata:

```ts
icons: {
  icon: [
    { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    { url: "/icon.png", type: "image/png", sizes: "512x512" },
  ],
  shortcut: "/favicon.ico",
  apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
}
```

Current icon files:

- `src/app/favicon.ico`
- `src/app/icon.png`
- `src/app/apple-icon.png`

There is also a script:

- `scripts/generate-favicons.mjs`

Do not change favicon metadata without checking the icon files and script.

---

## 19. How to Add a New SEO Landing Page

Use this exact flow:

1. Add a new content entry in `seoLandingPages` in
   `src/lib/seo-page-content.ts`.
2. Include `eyebrow`, `title`, `description`, `path`, `primaryKeyword`,
   `sections`, `useCases`, `internalLinks`, and `faqs`.
3. Keep content honest, risk-aware, product-focused, and at least 800 words if
   it is a long-tail SEO landing page.
4. Create a route file at `src/app/<slug>/page.tsx`.
5. Import `SeoLandingPage`, `seoLandingPages`, and `createSeoMetadata`.
6. Set `const content = seoLandingPages["<slug>"]`.
7. Export metadata through `createSeoMetadata()`.
8. Render `<SeoLandingPage content={content} />`.
9. Add the route to `publicRoutes` in `src/app/sitemap.ts`.
10. Add internal links from related pages when useful.
11. Run verification commands.

Do not create a separate component for each SEO page unless there is a strong
design reason.

---

## 20. How to Add a New Trust or Legal Page

Use this flow:

1. Add a new content entry in `legalPages` in `src/lib/seo-page-content.ts`.
2. Include `eyebrow`, `title`, `description`, `updatedAt`, and `sections`.
3. Create a route file at `src/app/<slug>/page.tsx`.
4. Import `LegalPage`, `legalPages`, and `createSeoMetadata`.
5. Export metadata through `createSeoMetadata()`.
6. Render `<LegalPage content={content} />`.
7. Add the route to footer navigation if it is a core trust page.
8. Add the route to `publicRoutes` in `src/app/sitemap.ts` if it should be
   indexed.

---

## 21. Verification Checklist

After SEO changes, run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Known current behavior:

- The project may show existing lint warnings in unrelated AI/dashboard files.
- Build should still complete successfully.

Manual local checks:

- Open `/sitemap.xml`.
- Confirm public SEO routes are listed.
- Confirm `/app` routes are not listed unless indexing strategy changes.
- Open `/robots.txt`.
- Confirm `/api/` is disallowed.
- Open each public SEO route.
- Confirm each page has exactly one visible H1.
- Confirm FAQ content is visible.
- Confirm page source includes `application/ld+json`.
- Confirm canonical URL is correct in the rendered head.
- Confirm Open Graph and Twitter metadata are present.
- Confirm footer links go to `/privacy`, `/terms`, `/risk-disclaimer`, and
  `/about`.

Deployment checks:

- Visit `https://cointraceai.com/sitemap.xml`.
- Visit `https://cointraceai.com/robots.txt`.
- Test homepage structured data with Google's Rich Results Test.
- Test one SEO landing page with FAQ schema using Google's Rich Results Test.
- Submit `https://cointraceai.com/sitemap.xml` in Google Search Console after
  deployment.

---

## 22. Important Constraints for Future Agents

Do not invent a second SEO architecture.

Do not hardcode `https://cointraceai.com` in new SEO files if `SITE_URL` can be
used.

Do not put long page copy inside route files.

Do not add public SEO pages without sitemap entries.

Do not index `/api/`.

Do not add `/app` routes to the sitemap while `/app` is `noindex`.

Do not remove legal/trust links from the footer without replacing them with an
equivalent trust navigation path.

Do not remove no-financial-advice and risk-aware language.

Do not make claims about guaranteed profits, certain predictions, trading
signals, certifications, exchange coverage, asset coverage, or user numbers
unless those claims are already implemented and verifiable in the codebase.

Do not introduce a different UI style for SEO pages. Reuse the existing landing
layout, Tailwind tokens, `Header`, `Footer`, `MobileWaitlistProvider`, and
shared UI components.

Do not use Playwright for SEO verification. This project explicitly avoids
Playwright.

---

## 23. Current Deployment Context

The SEO architecture is designed for the production domain:

- `https://cointraceai.com`

The project has been deployed to Vercel production with the domain aliased to
`https://cointraceai.com`.

If the production domain changes, update:

- `SITE_URL` in `src/lib/seo.ts`
- any Vercel/domain configuration outside the codebase
- Google Search Console sitemap submission

---

## 24. Quick Mental Model

Think of the SEO architecture as four layers:

1. `src/lib/seo.ts` defines canonical site constants, metadata helpers, and
   JSON-LD builders.
2. `src/lib/seo-page-content.ts` stores all public SEO and legal page content.
3. `src/components/seo/*` renders shared SEO page layouts and JSON-LD.
4. `src/app/*/page.tsx`, `sitemap.ts`, and `robots.ts` expose the pages and
   crawler rules through Next.js App Router.

If a future agent understands those four layers, they should not need to invent
anything new.
