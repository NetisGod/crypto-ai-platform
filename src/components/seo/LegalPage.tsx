import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { MobileWaitlistProvider } from "@/components/landing/MobileWaitlist";

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

export function LegalPage({ content }: { content: LegalPageContent }) {
  return (
    <div className="min-h-screen bg-background">
      <MobileWaitlistProvider>
        <Header />
        <main className="bg-gradient-hero">
          <section className="container mx-auto px-6 py-20 sm:py-28">
            <div className="mx-auto max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                {content.eyebrow}
              </p>
              <h1 className="mt-4 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
                {content.title}
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {content.description}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Last updated: {content.updatedAt}
              </p>
            </div>
          </section>

          <section className="bg-background/80 py-16">
            <div className="container mx-auto px-6">
              <article className="mx-auto max-w-3xl space-y-10 rounded-3xl border border-border/60 bg-card/70 p-6 shadow-soft backdrop-blur sm:p-10">
                {content.sections.map((section) => (
                  <section key={section.title} className="space-y-3">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      {section.title}
                    </h2>
                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-sm leading-7 text-muted-foreground"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </section>
                ))}
                <div className="rounded-2xl border border-border/60 bg-background/60 p-5 text-sm text-muted-foreground">
                  Questions about these terms can be sent through the contact
                  workflow on the{" "}
                  <Link href="/about" className="font-medium text-primary">
                    About page
                  </Link>
                  .
                </div>
              </article>
            </div>
          </section>
        </main>
        <Footer />
      </MobileWaitlistProvider>
    </div>
  );
}
