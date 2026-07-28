"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "@/lib/auth/schema";
import { resetPasswordForEmail } from "@/lib/auth/providers";
import type { AuthStatus } from "@/types/auth";

export function useForgotPasswordForm() {
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [rootError, setRootError] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const onSubmit = useCallback(
    async (values: ForgotPasswordSchema) => {
      setRootError(null);
      setStatus("loading");

      const { error } = await resetPasswordForEmail({ email: values.email });

      if (error) {
        setStatus("error");
        setRootError(error);
        return;
      }

      setSentEmail(values.email);
      setStatus("success");
    },
    []
  );

  const clearRootError = useCallback(() => {
    setRootError(null);
    if (status === "error") setStatus("idle");
  }, [status]);

  return {
    form,
    status,
    rootError,
    sentEmail,
    clearRootError,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: status === "loading",
  };
}
