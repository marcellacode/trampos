"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AUTH_BRAND } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        className
      )}
      aria-label={`${AUTH_BRAND.fullName} - Página inicial`}
    >
      <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/35">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>
      {showText && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          {AUTH_BRAND.name}
          <span className="text-primary">{AUTH_BRAND.suffix}</span>
        </span>
      )}
    </Link>
  );
}
