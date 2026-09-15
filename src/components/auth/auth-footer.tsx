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
  actionLabel = "Criar conta",
  actionHref = "/cadastro",
  className,
}: AuthFooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-border pt-5 text-center text-sm text-muted-foreground",
        className
      )}
    >
      <p>
        {prompt}{" "}
        <Link
          href={actionHref}
          className="rounded font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {actionLabel}
        </Link>
      </p>
    </footer>
  );
}
