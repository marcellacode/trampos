"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginSchema } from "@/lib/auth/schema";
import { signInWithPassword } from "@/lib/auth/providers";
import type { AuthStatus } from "@/types/auth";

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos. Use demo@jobera.app / demo123456.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }
  return message;
}

export function useAuthForm() {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = useCallback(
    async (values: LoginSchema) => {
      setRootError(null);
      setStatus("loading");

      const { error } = await signInWithPassword({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      if (error) {
        const friendly = mapAuthError(error);
        setStatus("error");
        setRootError(friendly);
        form.setError("password", { message: friendly });
        return;
      }

      setStatus("success");
      await new Promise((resolve) => setTimeout(resolve, 700));
      router.push("/dashboard");
      router.refresh();
    },
    [form, router]
  );

  const clearRootError = useCallback(() => {
    setRootError(null);
    if (status === "error") setStatus("idle");
  }, [status]);

  const setAuthError = useCallback((message: string) => {
    setStatus("error");
    setRootError(message);
  }, []);

  return {
    form,
    status,
    rootError,
    clearRootError,
    setAuthError,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: status === "loading" || status === "success",
  };
}
