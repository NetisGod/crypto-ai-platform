"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Coins,
  MessageSquareText,
  HelpCircle,
  Activity,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/token/BTC", label: "Token", icon: Coins },
  { href: "/narratives", label: "Narratives", icon: MessageSquareText },
  { href: "/ask", label: "Ask", icon: HelpCircle },
  { href: "/monitoring", label: "Monitoring", icon: Activity },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <LineChart className="h-7 w-7 text-primary" />
        <span className="font-semibold tracking-tight text-foreground">
          Crypto AI
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href.startsWith("/token") && pathname.startsWith("/token"));
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
