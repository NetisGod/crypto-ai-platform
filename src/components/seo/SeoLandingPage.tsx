import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { MobileWaitlistProvider } from "@/components/landing/MobileWaitlist";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { createFaqJsonLd, type FaqItem } from "@/lib/seo";

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

export function SeoLandingPage({ content }: { content: SeoLandingPageContent }) {
  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={createFaqJsonLd(content.faqs)} />
      <MobileWaitlistProvider>
        <Header />
        <main>
          <section className="relative overflow-hidden bg-gradient-hero py-20 sm:py-28">
            <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
            <div className="container relative mx-auto px-6">
              <div className="max-w-4xl">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                  {content.eyebrow}
                </p>
                <h1 className="mt-4 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
                  {content.title}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                  {content.description}
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Button variant="hero" size="lg" asChild>
                    <Link href="/app">
                      Open CoinTrace AI
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/risk-disclaimer">Read risk disclaimer</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 sm:py-24">
            <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <article className="space-y-12">
                {content.sections.map((section) => (
                  <section key={section.title} className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {section.title}
                    </h2>
                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-base leading-8 text-muted-foreground"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </section>
                ))}

                <section className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-soft backdrop-blur sm:p-8">
                  <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                    How teams use it
                  </p>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {content.useCases.map((item) => (
                      <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-3">
                    {content.faqs.map((faq) => (
                      <details
                        key={faq.question}
                        className="group rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur"
                      >
                        <summary className="cursor-pointer list-none text-base font-semibold text-foreground">
                          {faq.question}
                        </summary>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              </article>

              <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-soft backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    Topic
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {content.primaryKeyword}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    CoinTrace AI is a research and intelligence product. It does
                    not provide financial advice or guarantee market outcomes.
                  </p>
                </div>
                <div className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-soft backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    Related pages
                  </p>
                  <div className="mt-4 space-y-3">
                    {content.internalLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block rounded-2xl border border-border/50 bg-background/50 p-4 transition-colors hover:border-accent/40 hover:bg-background"
                      >
                        <span className="text-sm font-semibold text-foreground">
                          {link.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                          {link.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </main>
        <Footer />
      </MobileWaitlistProvider>
    </div>
  );
}
