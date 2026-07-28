"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { AuthHeader } from "@/components/auth/auth-header";
import { FloatingField } from "@/components/auth/floating-field";
import { useResetPasswordForm } from "@/hooks/use-reset-password-form";
import { useRipple } from "@/hooks/use-ripple";
import { cn } from "@/lib/utils";

export function ResetPasswordCard() {
  const {
    form,
    status,
    rootError,
    clearRootError,
    onSubmit,
    isSubmitting,
  } = useResetPasswordForm();
  const { ripples, addRipple } = useRipple();
  const {
    register,
    formState: { errors, isValid },
    watch,
  } = form;

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const passwordRegister = register("password", {
    onChange: () => clearRootError(),
  });
  const confirmPasswordRegister = register("confirmPassword", {
    onChange: () => clearRootError(),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={
        status === "success"
          ? { opacity: 0, y: -8, scale: 1.02 }
          : { opacity: 1, y: 0, scale: 1 }
      }
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[460px]"
    >
      <div className="absolute -inset-px rounded-[1.35rem] bg-gradient-to-b from-white/15 via-white/5 to-transparent opacity-80" />
      <div className="absolute -inset-8 rounded-[2rem] bg-primary/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-[1.25rem] border border-border bg-card/85 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/[0.07] via-transparent to-transparent" />

        <div className="relative space-y-6">
          <AuthHeader
            title="Nova senha"
            description="Escolha uma senha segura para acessar sua conta."
          />

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FloatingField
              label="Nova senha"
              icon={Lock}
              type="password"
              autoComplete="new-password"
              showPasswordToggle
              disabled={isSubmitting}
              error={errors.password?.message}
              value={password}
              name={passwordRegister.name}
              ref={passwordRegister.ref}
              onChange={passwordRegister.onChange}
              onBlur={passwordRegister.onBlur}
            />

            <FloatingField
              label="Confirmar senha"
              icon={Lock}
              type="password"
              autoComplete="new-password"
              showPasswordToggle
              disabled={isSubmitting}
              error={errors.confirmPassword?.message}
              value={confirmPassword}
              name={confirmPasswordRegister.name}
              ref={confirmPasswordRegister.ref}
              onChange={confirmPasswordRegister.onChange}
              onBlur={confirmPasswordRegister.onBlur}
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
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
                status === "success" && "bg-[#22C55E] shadow-[0_0_24px_rgba(34,197,94,0.35)]"
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {status === "loading" ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="inline-flex items-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Salvando...
                  </motion.span>
                ) : status === "success" ? (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="inline-flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Senha atualizada
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    Redefinir senha
                  </motion.span>
                )}
              </AnimatePresence>

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

          <p className="border-t border-border pt-5 text-center text-sm text-muted-foreground">
            Link inválido ou expirado?{" "}
            <Link href="/forgot-password" className="font-medium text-primary hover:text-primary/80">
              Solicitar novo link
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
