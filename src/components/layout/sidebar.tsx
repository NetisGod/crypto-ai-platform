"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Coins,
  MessageSquareText,
  HelpCircle,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: "Market",
    items: [
      { href: "/app", label: "Market Overview", icon: LayoutDashboard },
      { href: "/app/token/BTC", label: "AI Token Analysis", icon: Coins },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/app/narratives", label: "Narratives", icon: MessageSquareText },
      { href: "/app/ask", label: "Ask AI Why", icon: HelpCircle },
    ],
  },
  {
    label: "Ops",
    items: [{ href: "/app/monitoring", label: "Monitoring", icon: Activity }],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/app") return pathname === "/app";
  if (href.startsWith("/app/token")) return pathname.startsWith("/app/token");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-16 shrink-0 flex-col border-r border-border/60 bg-card/60 backdrop-blur-xl md:w-60">
      <Link
        href="/"
        className="group flex h-16 items-center justify-center gap-2.5 border-b border-border/60 transition-colors hover:bg-muted/40 md:justify-start md:px-5"
        aria-label="CoinTrace AI — home"
      >
        <Logo size={34} />
        <span className="hidden font-semibold tracking-tight text-foreground md:inline">
          CoinTrace AI
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-2 py-5 md:px-3">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="hidden px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70 md:block">
              {section.label}
            </p>
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    "justify-center md:justify-start",
                    active
                      ? "bg-gradient-to-r from-accent/20 via-accent/10 to-transparent text-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1.5 hidden h-6 w-0.5 rounded-full bg-gradient-primary md:block"
                    />
                  )}
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      active
                        ? "text-accent"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  <span className="hidden truncate md:inline">{label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-border/60 p-2 md:p-4">
        <p className="hidden text-[11px] text-muted-foreground/70 md:block">
          Market Intelligence Platform
        </p>
        <p className="mt-0.5 hidden text-[11px] text-muted-foreground/50 md:block">
          v1.0
        </p>
      </div>
    </aside>
  );
}
