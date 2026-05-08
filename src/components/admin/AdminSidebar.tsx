"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Pizza,
  MessageSquare,
  Settings,
  ChefHat,
} from "lucide-react";

const NAV = [
  { href: "/admin/overview", label: "Overview",  icon: LayoutDashboard },
  { href: "/admin/orders",   label: "Orders",    icon: ShoppingBag },
  { href: "/admin/menu",     label: "Menu",      icon: Pizza },
  { href: "/admin/feedback", label: "Feedback",  icon: MessageSquare },
  { href: "/admin/settings", label: "Settings",  icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 h-screen sticky top-0 bg-glass border-r border-ash flex flex-col">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-ash">
        <p className="text-[9px] font-mono uppercase tracking-[0.35em] text-smoke mb-1">
          Pizza3.14π
        </p>
        <p className="text-sm font-bold text-cream">Admin Console</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-ember/15 text-ember border-l-[3px] border-ember pl-[9px]"
                    : "text-smoke hover:text-cream hover:bg-ash/30 border-l-[3px] border-transparent pl-[9px]"
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Kitchen shortcut */}
      <div className="px-3 pb-4 border-t border-ash pt-4">
        <Link
          href="/kitchen"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-smoke hover:text-cream hover:bg-ash/30 transition-all"
        >
          <ChefHat className="w-4 h-4" aria-hidden />
          Kitchen View
        </Link>
      </div>
    </aside>
  );
}
