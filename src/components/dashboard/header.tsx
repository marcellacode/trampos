"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Menu, MessageSquare, PanelRightOpen } from "lucide-react";
import { CopilotStatus } from "@/components/dashboard/copilot-status";
import { UniversalSearch } from "@/components/dashboard/universal-search";
import { NotificationCenter } from "@/components/dashboard/notification-center";
import { getGreeting } from "@/lib/dashboard/hooks";
import { AUTH_BRAND } from "@/lib/auth/constants";
import type { DashboardUser, NotificationItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user: DashboardUser;
  notifications: NotificationItem[];
  unreadNotifications: number;
  unreadMessages: number;
  onMenuClick: () => void;
  onChatToggle: () => void;
  chatOpen: boolean;
  className?: string;
}

export function Header({
  user,
  notifications,
  unreadNotifications,
  unreadMessages,
  onMenuClick,
  onChatToggle,
  chatOpen,
  className,
}: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const greeting = getGreeting();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-[#08090A]/80 px-4 backdrop-blur-xl sm:px-6",
        className
      )}
    >
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-white lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 shrink-0">
        <h1 className="truncate text-sm font-semibold text-white sm:text-base">
          {greeting}, {user.firstName}{" "}
          <span aria-hidden="true">👋</span>
        </h1>
      </div>

      <div className="mx-auto hidden min-w-0 flex-1 justify-center md:flex">
        <UniversalSearch className="w-full max-w-md" />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <div className="md:hidden">
          <UniversalSearch compact />
        </div>

        <CopilotStatus />

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Notificações"
            aria-expanded={notifOpen}
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadNotifications > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#4F7CFF] ring-2 ring-[#08090A]" />
            )}
          </button>
          <NotificationCenter
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
            notifications={notifications}
          />
        </div>

        <Link
          href="/dashboard/mensagens"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Mensagens"
        >
          <MessageSquare className="h-[18px] w-[18px]" />
          {unreadMessages > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#4F7CFF] px-1 text-[9px] font-semibold text-white">
              {unreadMessages}
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={onChatToggle}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
            chatOpen
              ? "bg-[#4F7CFF]/15 text-[#4F7CFF]"
              : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
          )}
          aria-label={AUTH_BRAND.assistantName}
          aria-pressed={chatOpen}
        >
          <PanelRightOpen className="h-[18px] w-[18px]" />
        </button>

        <Link
          href="/dashboard/configuracoes"
          className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#4F7CFF] to-[#8B5CF6] text-xs font-semibold text-white ring-2 ring-transparent transition-all hover:ring-[#4F7CFF]/40"
          aria-label="Perfil"
        >
          {user.initials}
        </Link>
      </div>
    </header>
  );
}
