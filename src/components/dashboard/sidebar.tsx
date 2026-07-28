"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronUp, LogOut, Settings, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/shared/logo";
import { DASHBOARD_NAV_ITEMS } from "@/lib/dashboard/constants";
import type { DashboardUser } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: DashboardUser;
  open?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ user, open = false, onClose, className }: SidebarProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  const content = (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <Logo />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3" aria-label="Menu principal">
        <ul className="space-y-0.5" role="list">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 rounded px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative border-t border-border p-3">
        {profileOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-1 overflow-hidden rounded border border-border bg-card shadow-md">
            <Link
              href="/dashboard/configuracoes"
              onClick={() => {
                setProfileOpen(false);
                onClose?.();
              }}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Configurações
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sair
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded px-2 py-2 text-left hover:bg-muted"
          aria-expanded={profileOpen}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.plan}</p>
          </div>
          <ChevronUp
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              profileOpen ? "rotate-0" : "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-[240px] border-r border-border lg:block",
          className
        )}
      >
        {content}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
            aria-label="Fechar menu"
          />
          <aside className="absolute inset-y-0 left-0 w-[260px] border-r border-border shadow-lg">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
