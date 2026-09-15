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

interface HeaderProps { user: DashboardUser; notifications: NotificationItem[]; unreadNotifications: number; unreadMessages: number; onMenuClick: () => void; onChatToggle: () => void; chatOpen: boolean; className?: string; }
export function Header({ user, notifications, unreadNotifications, unreadMessages, onMenuClick, onChatToggle, chatOpen, className }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false); const greeting = getGreeting();
  const iconButton = "relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-all hover:border-border hover:bg-white/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";
  return <header className={cn("sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border/80 bg-background/85 px-3 backdrop-blur-2xl sm:gap-3 sm:px-6", className)}>
    <button type="button" onClick={onMenuClick} className={cn(iconButton, "lg:hidden")} aria-label="Abrir menu"><Menu className="h-5 w-5" /></button>
    <div className="min-w-0 shrink-0"><p className="truncate text-sm font-semibold text-foreground sm:text-base">{greeting}, {user.firstName}</p><p className="hidden text-[11px] text-muted-foreground sm:block">Seu painel de carreira</p></div>
    <div className="mx-auto hidden min-w-0 flex-1 justify-center md:flex"><UniversalSearch className="w-full max-w-lg" /></div>
    <div className="ml-auto flex items-center gap-1 sm:gap-1.5"><div className="md:hidden"><UniversalSearch compact /></div><div className="hidden sm:block"><CopilotStatus /></div>
      <div className="relative"><button type="button" onClick={() => setNotifOpen((v) => !v)} className={iconButton} aria-label={unreadNotifications > 0 ? `Notificações, ${unreadNotifications} não lidas` : "Notificações"} aria-expanded={notifOpen}><Bell className="h-[18px] w-[18px]" />{unreadNotifications > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />}</button><NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} notifications={notifications} /></div>
      <Link href="/dashboard/mensagens" className={iconButton} aria-label={unreadMessages > 0 ? `Mensagens, ${unreadMessages} não lidas` : "Mensagens"}><MessageSquare className="h-[18px] w-[18px]" />{unreadMessages > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">{unreadMessages > 9 ? "9+" : unreadMessages}</span>}</Link>
      <button type="button" onClick={onChatToggle} className={cn(iconButton, chatOpen && "border-primary/20 bg-primary/15 text-primary")} aria-label={chatOpen ? `Fechar ${AUTH_BRAND.assistantName}` : `Abrir ${AUTH_BRAND.assistantName}`} aria-pressed={chatOpen}><PanelRightOpen className={cn("h-[18px] w-[18px] transition-transform", chatOpen && "rotate-180")} /></button>
      <Link href="/dashboard/configuracoes" className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-400 text-xs font-bold text-white shadow-md shadow-primary/20 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60" aria-label="Abrir perfil">{user.initials}</Link>
    </div>
  </header>;
}
