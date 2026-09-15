"use client";

import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { AUTH_BRAND } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return <Link href="/" className={cn("inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40", className)} aria-label={`${AUTH_BRAND.fullName} - Página inicial`}><span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><BriefcaseBusiness className="h-4 w-4"/></span>{showText && <span className="text-lg font-bold tracking-tight">{AUTH_BRAND.name}<span className="text-primary">{AUTH_BRAND.suffix}</span></span>}</Link>;
}
