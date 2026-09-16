"use client";

import Link from "next/link";
import { AUTH_BRAND } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

export function CopilotMark({ className }: { className?: string }) {
  return (
    <span className={cn("jobera-copilot-mark", className)} aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="28" className="jobera-copilot-ring" />
        <circle cx="32" cy="32" r="21" className="jobera-copilot-core" />
        <path d="M14 32c0-13.2 8-23.7 18-25.8" className="jobera-copilot-orbit" />
        <path d="M50 32c0 13.2-8 23.7-18 25.8" className="jobera-copilot-orbit jobera-copilot-orbit--soft" />
        <path d="M21.8 30.2c1.9 2.9 5.6 2.9 7.5 0" className="jobera-copilot-eye jobera-copilot-eye--left" />
        <path d="M34.7 30.2c1.9 2.9 5.6 2.9 7.5 0" className="jobera-copilot-eye jobera-copilot-eye--right" />
        <path d="M24 40c4.6 3.5 11.4 3.5 16 0" className="jobera-copilot-smile" />
      </svg>
    </span>
  );
}

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40", className)}
      aria-label={`${AUTH_BRAND.fullName} - Página inicial`}
    >
      <CopilotMark />
      {showText && (
        <span className="text-[15px] font-black tracking-[0.22em] text-foreground">
          {AUTH_BRAND.fullName.toUpperCase()}
        </span>
      )}
    </Link>
  );
}
