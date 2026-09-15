"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signUpSchema, type SignUpSchema } from "@/lib/auth/schema";
import { signUpWithPassword } from "@/lib/auth/providers";
import type { AuthStatus } from "@/types/auth";

function mapSignUpError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "Este e-mail já está cadastrado. Entre com sua senha ou recupere o acesso.";
  }
  if (lower.includes("password")) {
    return "A senha não atende aos requisitos de segurança.";
  }
  if (lower.includes("failed to fetch") || lower.includes("network")) {
    return "Não foi possível conectar ao serviço de autenticação. Tente novamente.";
  }
  return "Não foi possível criar sua conta. Confira os dados e tente novamente.";
}

export function useSignUpForm() {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [rootError, setRootError] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = useCallback(async (values: SignUpSchema) => {
    setRootError(null);
    setStatus("loading");

    const { error, confirmationRequired } = await signUpWithPassword({
      fullName: values.fullName,
      email: values.email,
      password: values.password,
    });

    if (error) {
      setStatus("error");
      setRootError(mapSignUpError(error));
      return;
    }

    setStatus("success");
    if (confirmationRequired) {
      setConfirmationEmail(values.email);
      return;
    }

    router.replace("/onboarding");
    router.refresh();
  }, [router]);

  const clearRootError = useCallback(() => {
    setRootError(null);
    setStatus((current) => current === "error" ? "idle" : current);
  }, []);

  const setAuthError = useCallback((message: string) => {
    setStatus("error");
    setRootError(message);
  }, []);

  return {
    form,
    status,
    rootError,
    confirmationEmail,
    clearRootError,
    setRootError: setAuthError,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: status === "loading",
  };
}
