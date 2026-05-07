"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  UtensilsCrossed,
  MessageSquare,
  Link2,
  LayoutDashboard,
  Pizza,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList, exact: false },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed, exact: false },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare, exact: false },
  { href: "/admin/ledger", label: "Ledger", icon: Link2, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <Pizza className="h-5 w-5 text-primary" aria-hidden />
        <span className="font-semibold tracking-tight text-foreground">
          Pizza<span className="text-primary">3.14</span>
        </span>
        <span className="ml-auto rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ADMIN
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Admin navigation">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname.startsWith(href) && href !== "/admin";
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer links */}
      <div className="border-t border-border px-2 py-3">
        <Link
          href="/kitchen"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <UtensilsCrossed className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Kitchen View
        </Link>
      </div>
    </aside>
  );
}
