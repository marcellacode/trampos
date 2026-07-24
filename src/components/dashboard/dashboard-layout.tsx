"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { MiniChat } from "@/components/dashboard/mini-chat";
import type {
  ChatMessage,
  DashboardUser,
  NotificationItem,
} from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  user: DashboardUser;
  notifications: NotificationItem[];
  unreadNotifications: number;
  unreadMessages: number;
  chatMessages: ChatMessage[];
  children: ReactNode;
  className?: string;
}

export function DashboardLayout({
  user,
  notifications,
  unreadNotifications,
  unreadMessages,
  chatMessages,
  children,
  className,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    setChatOpen(mq.matches);
    function onChange(e: MediaQueryListEvent) {
      setChatOpen(e.matches);
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className={cn("min-h-screen bg-[#08090A] text-white", className)}>
      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[margin] duration-300 lg:ml-[260px]",
          chatOpen && "xl:mr-[340px]"
        )}
      >
        <Header
          user={user}
          notifications={notifications}
          unreadNotifications={unreadNotifications}
          unreadMessages={unreadMessages}
          onMenuClick={() => setSidebarOpen(true)}
          onChatToggle={() => setChatOpen((v) => !v)}
          chatOpen={chatOpen}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      <MiniChat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatMessages}
        userName={user.firstName}
        className="xl:fixed xl:inset-y-0 xl:right-0 xl:w-[340px]"
      />
    </div>
  );
}
