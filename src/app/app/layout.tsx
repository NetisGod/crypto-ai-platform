import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AppShell } from "@/components/theme/app-shell";

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

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AppShell>
        {/* Background layers: grid fade + soft colored blobs, both
           purely decorative and non-interactive. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-grid-fade"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl" />
        </div>

        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="relative flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </AppShell>
    </ThemeProvider>
  );
}
