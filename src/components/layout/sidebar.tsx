"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Coins,
  MessageSquareText,
  HelpCircle,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/brand/logo";

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/token/BTC", label: "Token", icon: Coins },
  { href: "/app/narratives", label: "Narratives", icon: MessageSquareText },
  { href: "/app/ask", label: "Ask", icon: HelpCircle },
  { href: "/app/monitoring", label: "Monitoring", icon: Activity },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-card">
      <Link
        href="/"
        className="flex h-14 items-center gap-2 border-b border-border px-4 transition-colors hover:bg-muted/40"
        aria-label="CoinTrace AI — home"
      >
        <Logo size={35} />
        <span className="font-semibold tracking-tight text-foreground">
          CoinTrace AI
        </span>
      </Link>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href === "/app" && pathname === "/app") ||
            (href.startsWith("/app/token") && pathname.startsWith("/app/token")) ||
            (href !== "/app" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <Separator className="bg-border" />
      <div className="p-3">
        <p className="text-xs text-muted-foreground">
          Market Intelligence Platform
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground/70">v1.0</p>
      </div>
    </aside>
  );
}
