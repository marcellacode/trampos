"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SocialImportCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const provider = params.get("provider");
    router.replace(
      provider === "github" || provider === "linkedin"
        ? `/onboarding?import=${provider}`
        : "/onboarding"
    );
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Preparando análise do seu perfil...
    </div>
  );
}
