"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthFooterProps {
  prompt?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function AuthFooter({
  prompt = "Não possui conta?",
  actionLabel = "Criar conta gratuitamente",
  actionHref = "/onboarding",
  className,
}: AuthFooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-white/8 pt-5 text-center text-sm text-[#9CA3AF]",
        className
      )}
    >
      <p>
        {prompt}{" "}
        <Link
          href={actionHref}
          className="font-medium text-[#4F7CFF] transition-colors hover:text-[#6B91FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111315] rounded"
        >
          {actionLabel}
        </Link>
      </p>
    </footer>
  );
}
