"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Monitor,
  MapPin,
  FileText,
  Settings,
  Tv,
  UtensilsCrossed,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/menu", label: "Menu Editor", icon: UtensilsCrossed },
  { href: "/locations", label: "Locations", icon: MapPin },
  { href: "/displays", label: "Displays", icon: Monitor },
  { href: "/requests", label: "Requests", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border/50 bg-sidebar flex flex-col grain">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-copper flex items-center justify-center">
              <Tv className="h-4 w-4 text-copper-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-foreground">
                PosezTech
              </h1>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Signage Control
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-150
                  ${
                    isActive
                      ? "bg-copper/10 text-copper border border-copper/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
                  }
                `}
              >
                <item.icon
                  className={`h-4 w-4 ${isActive ? "text-copper" : ""}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-border/50">
          <div className="flex items-center gap-2.5">
            <UserButton
              appearance={{
                elements: { avatarBox: "h-7 w-7" },
              }}
            />
            <span className="text-xs text-muted-foreground">Account</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
