"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Menu principal">
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
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                    active
                      ? "bg-[#4F7CFF]/10 text-white"
                      : "text-[#9CA3AF] hover:bg-white/[0.04] hover:text-white"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-y-1 left-0 w-[3px] rounded-full bg-[#4F7CFF]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      active ? "text-[#4F7CFF]" : "text-[#9CA3AF] group-hover:text-white"
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-[#9CA3AF]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative border-t border-white/[0.06] p-3">
        {profileOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl border border-white/[0.08] bg-[#16191C] shadow-2xl"
          >
            <Link
              href="/dashboard/configuracoes"
              onClick={() => {
                setProfileOpen(false);
                onClose?.();
              }}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#9CA3AF] transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Configurações
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#9CA3AF] transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sair
            </Link>
          </motion.div>
        )}

        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/[0.04]"
          aria-expanded={profileOpen}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4F7CFF] to-[#8B5CF6] text-xs font-semibold text-white">
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-[#9CA3AF]">Plano {user.plan}</p>
          </div>
          <ChevronUp
            className={cn(
              "h-4 w-4 text-[#9CA3AF] transition-transform",
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
      {/* Desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-white/[0.06] bg-[#0C0D0F] lg:flex lg:flex-col",
          className
        )}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Fechar menu"
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-white/[0.06] bg-[#0C0D0F]"
          >
            {content}
          </motion.aside>
        </div>
      )}
    </>
  );
}
