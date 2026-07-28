"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { DASHBOARD_HOME } from "@/lib/auth/redirect";
import { resetPasswordSchema, type ResetPasswordSchema } from "@/lib/auth/schema";
import { updatePassword } from "@/lib/auth/providers";
import type { AuthStatus } from "@/types/auth";

export function useResetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = useCallback(
    async (values: ResetPasswordSchema) => {
      setRootError(null);
      setStatus("loading");

      const { error } = await updatePassword({ password: values.password });

      if (error) {
        setStatus("error");
        setRootError(error);
        return;
      }

      setStatus("success");
      await new Promise((resolve) => setTimeout(resolve, 700));
      router.push(DASHBOARD_HOME);
      router.refresh();
    },
    [router]
  );

  const clearRootError = useCallback(() => {
    setRootError(null);
    if (status === "error") setStatus("idle");
  }, [status]);

  return {
    form,
    status,
    rootError,
    clearRootError,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: status === "loading" || status === "success",
  };
}
