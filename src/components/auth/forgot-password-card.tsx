"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthFooter } from "@/components/auth/auth-footer";
import { FloatingField } from "@/components/auth/floating-field";
import { useForgotPasswordForm } from "@/hooks/use-forgot-password-form";
import { useRipple } from "@/hooks/use-ripple";
import { cn } from "@/lib/utils";

export function ForgotPasswordCard() {
  const {
    form,
    status,
    rootError,
    sentEmail,
    clearRootError,
    onSubmit,
    isSubmitting,
  } = useForgotPasswordForm();
  const { ripples, addRipple } = useRipple();
  const {
    register,
    formState: { errors, isValid },
    watch,
  } = form;

  const email = watch("email");
  const emailRegister = register("email", {
    onChange: () => clearRootError(),
  });

  if (status === "success" && sentEmail) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[460px]"
      >
        <div className="relative overflow-hidden rounded-[1.25rem] border border-border bg-card/85 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#22C55E]/15 ring-1 ring-[#22C55E]/30">
              <Check className="h-6 w-6 text-[#22C55E]" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">
                Verifique seu e-mail
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Enviamos um link de recuperação para{" "}
                <span className="font-medium text-foreground">{sentEmail}</span>.
                Siga as instruções para redefinir sua senha.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex text-sm font-medium text-primary hover:text-primary/80"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[460px]"
    >
      <div className="absolute -inset-px rounded-[1.35rem] bg-gradient-to-b from-white/15 via-white/5 to-transparent opacity-80" />
      <div className="absolute -inset-8 rounded-[2rem] bg-primary/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-[1.25rem] border border-border bg-card/85 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/[0.07] via-transparent to-transparent" />

        <div className="relative space-y-6">
          <AuthHeader
            title="Recuperar senha"
            description="Informe seu e-mail e enviaremos um link para redefinir sua senha."
          />

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FloatingField
              label="E-mail"
              icon={Mail}
              type="email"
              autoComplete="email"
              inputMode="email"
              disabled={isSubmitting}
              error={errors.email?.message}
              value={email}
              name={emailRegister.name}
              ref={emailRegister.ref}
              onChange={emailRegister.onChange}
              onBlur={emailRegister.onBlur}
            />

            <AnimatePresence mode="wait">
              {rootError ? (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  className="rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-3 text-sm text-red-300"
                >
                  {rootError}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <motion.button
              type="submit"
              whileHover={!isSubmitting && isValid ? { scale: 1.015 } : undefined}
              whileTap={!isSubmitting && isValid ? { scale: 0.985 } : undefined}
              onClick={addRipple}
              disabled={isSubmitting || !isValid}
              className={cn(
                "relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl text-sm font-semibold text-foreground transition-all",
                "bg-primary shadow-[0_0_24px_rgba(79,124,255,0.35)]",
                "hover:bg-[#5B86FF] hover:shadow-[0_0_32px_rgba(79,124,255,0.45)]",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              )}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Enviando...
                </span>
              ) : (
                "Enviar link de recuperação"
              )}

              {ripples.map((ripple) => (
                <span
                  key={ripple.id}
                  className="pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-white/20"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    animationDuration: "600ms",
                  }}
                />
              ))}
            </motion.button>
          </form>

          <AuthFooter
            prompt="Lembrou a senha?"
            actionLabel="Voltar para o login"
            actionHref="/login"
          />
        </div>
      </div>
    </motion.div>
  );
}
