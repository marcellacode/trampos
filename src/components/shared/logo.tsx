"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label="Trampos AI - Página inicial"
    >
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F7CFF]/10 ring-1 ring-[#4F7CFF]/30 transition-all group-hover:bg-[#4F7CFF]/20 group-hover:ring-[#4F7CFF]/50">
        <Sparkles className="h-4 w-4 text-[#4F7CFF]" aria-hidden="true" />
        <div className="absolute inset-0 rounded-lg bg-[#4F7CFF]/20 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      {showText && (
        <span className="text-base font-semibold tracking-tight text-white">
          Trampos <span className="text-[#4F7CFF]">AI</span>
        </span>
      )}
    </Link>
  );
}
