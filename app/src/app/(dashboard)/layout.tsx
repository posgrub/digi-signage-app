"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Monitor,
  MapPin,
  FileText,
  Settings,
  Tv,
  UtensilsCrossed,
  Megaphone,
  Image,
  Calendar,
  Ban,
  Palette,
} from "lucide-react";

// Admin sees everything
const adminNav = [
  {
    label: null,
    items: [{ href: "/clients", label: "Clients", icon: Users }],
  },
  {
    label: "Content",
    items: [
      { href: "/menu", label: "Menu Editor", icon: UtensilsCrossed },
      { href: "/menu/eighty-six", label: "86 Board", icon: Ban },
      { href: "/templates", label: "Board Design", icon: Palette },
      { href: "/promos", label: "Promos", icon: Megaphone },
      { href: "/media", label: "Media", icon: Image },
      { href: "/schedule", label: "Schedule", icon: Calendar },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/locations", label: "Locations", icon: MapPin },
      { href: "/displays", label: "Displays", icon: Monitor },
      { href: "/requests", label: "Requests", icon: FileText },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

// Client sees only their stuff
const clientNav = [
  {
    label: "My Restaurant",
    items: [
      { href: "/menu", label: "Menu Editor", icon: UtensilsCrossed },
      { href: "/menu/eighty-six", label: "86 Board", icon: Ban },
      { href: "/promos", label: "Promos & Specials", icon: Megaphone },
      { href: "/media", label: "Media Library", icon: Image },
    ],
  },
  {
    label: "Screens",
    items: [
      { href: "/displays", label: "My Displays", icon: Monitor },
      { href: "/schedule", label: "Schedule", icon: Calendar },
    ],
  },
  {
    label: "Support",
    items: [
      { href: "/requests", label: "Change Requests", icon: FileText },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  const isClient = user?.publicMetadata?.role === "client";
  const navSections = isClient ? clientNav : adminNav;
  const brandSubtext = isClient
    ? (user?.publicMetadata?.clientName as string) || "Client Portal"
    : "Signage Control";

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
                {brandSubtext}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {navSections.map((section, si) => (
            <div key={si}>
              {section.label && (
                <p className="px-3 mb-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 font-medium">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" &&
                      pathname.startsWith(item.href) &&
                      !(
                        item.href === "/menu" &&
                        pathname.startsWith("/menu/")
                      ));
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
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-border/50">
          <div className="flex items-center gap-2.5">
            <UserButton
              appearance={{
                elements: { avatarBox: "h-7 w-7" },
              }}
            />
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground block truncate">
                {user?.firstName || "Account"}
              </span>
              {isClient && (
                <span className="text-[10px] text-copper/60">Client</span>
              )}
            </div>
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
