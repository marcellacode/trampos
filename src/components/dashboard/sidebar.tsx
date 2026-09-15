"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronUp, Loader2, LogOut, Settings, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/shared/logo";
import { getDashboardNavSections } from "@/lib/dashboard/constants";
import { useCareerNavBadges } from "@/lib/career/hooks";
import { useCompanyMemberships } from "@/lib/crud/hooks";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { DashboardUser, NavItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface SidebarProps { user: DashboardUser; open?: boolean; onClose?: () => void; className?: string; }
function isNavItemActive(pathname: string, href: string): boolean { if (href === "/dashboard") return pathname === href; if (href === "/dashboard/empresa") return pathname === href; return pathname === href || pathname.startsWith(`${href}/`); }
function NavLink({ item, pathname, onClose }: { item: NavItem; pathname: string; onClose?: () => void; }) {
  const Icon = item.icon; const active = isNavItemActive(pathname, item.href);
  return <Link href={item.href} onClick={onClose} className={cn("group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60", active ? "bg-primary/12 text-primary shadow-[inset_3px_0_0_var(--primary)]" : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground")} aria-current={active ? "page" : undefined}><Icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} aria-hidden="true" /><span className="truncate">{item.label}</span>{item.badge ? <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{item.badge}</span> : null}</Link>;
}
export function Sidebar({ user, open = false, onClose, className }: SidebarProps) {
  const pathname = usePathname(); const router = useRouter(); const [profileOpen, setProfileOpen] = useState(false); const [signingOut, setSigningOut] = useState(false);
  const membershipsQuery = useCompanyMemberships(); const { badges } = useCareerNavBadges(); const hasCompanyMembership = (membershipsQuery.data?.length ?? 0) > 0; const navSections = getDashboardNavSections(hasCompanyMembership, badges);
  async function handleSignOut() { if (signingOut) return; setSigningOut(true); try { const supabase = createBrowserSupabaseClient(); await supabase.auth.signOut(); router.replace("/login"); router.refresh(); } finally { setSigningOut(false); } }
  const content = <div className="flex h-full flex-col bg-[#0b0b11]/98 backdrop-blur-2xl">
    <div className="flex h-16 items-center justify-between border-b border-border/80 px-4"><Logo />{onClose && <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden" aria-label="Fechar menu"><X className="h-4 w-4" /></button>}</div>
    <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Menu principal"><div className="space-y-6">{navSections.map((section) => <div key={section.id}><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">{section.label}</p><ul className="space-y-1" role="list">{section.items.map((item) => <li key={item.href}><NavLink item={item} pathname={pathname} onClose={onClose} /></li>)}</ul></div>)}</div></nav>
    <div className="relative border-t border-border/80 p-3">{profileOpen && <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-2xl"><Link href="/dashboard/configuracoes" onClick={() => { setProfileOpen(false); onClose?.(); }} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"><Settings className="h-4 w-4" aria-hidden="true" />Configurações</Link><button type="button" onClick={handleSignOut} disabled={signingOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-60">{signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}Sair</button></div>}
      <button type="button" onClick={() => setProfileOpen((v) => !v)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/[0.05]" aria-expanded={profileOpen}><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-400 text-xs font-bold text-white shadow-lg shadow-primary/20">{user.initials}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{user.name}</p><p className="truncate text-xs text-muted-foreground">{user.plan}</p></div><ChevronUp className={cn("h-4 w-4 text-muted-foreground transition-transform", profileOpen ? "rotate-0" : "rotate-180")} aria-hidden="true" /></button>
    </div></div>;
  return <><aside className={cn("fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-border/80 lg:block", className)}>{content}</aside>{open && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="Fechar menu" /><aside className="absolute inset-y-0 left-0 w-[min(86vw,280px)] border-r border-border shadow-2xl">{content}</aside></div>}</>;
}
