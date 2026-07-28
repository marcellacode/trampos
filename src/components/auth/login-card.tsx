"use client";

import { Controller } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthFooter } from "@/components/auth/auth-footer";
import { SocialButtons } from "@/components/auth/social-buttons";
import { FloatingField } from "@/components/auth/floating-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuthForm } from "@/hooks/use-auth-form";
import { useRipple } from "@/hooks/use-ripple";
import { cn } from "@/lib/utils";

export function LoginCard() {
  const {
    form,
    status,
    rootError,
    clearRootError,
    setAuthError,
    onSubmit,
    isSubmitting,
  } = useAuthForm();
  const { ripples, addRipple } = useRipple();
  const {
    register,
    control,
    formState: { errors, isValid },
    watch,
  } = form;

  const email = watch("email");
  const password = watch("password");
  const emailRegister = register("email", {
    onChange: () => clearRootError(),
  });
  const passwordRegister = register("password", {
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
          <AuthHeader />

          <form
            onSubmit={onSubmit}
            className="space-y-4"
            noValidate
            aria-busy={isSubmitting}
          >
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

            <FloatingField
              label="Senha"
              icon={Lock}
              type="password"
              autoComplete="current-password"
              showPasswordToggle
              disabled={isSubmitting}
              error={
                errors.password?.message && !rootError
                  ? errors.password.message
                  : undefined
              }
              value={password}
              name={passwordRegister.name}
              ref={passwordRegister.ref}
              onChange={passwordRegister.onChange}
              onBlur={passwordRegister.onBlur}
            />

            <div className="flex items-center justify-between gap-3 pt-0.5">
              <div className="flex items-center gap-2.5">
                <Controller
                  name="rememberMe"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="remember-me"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      disabled={isSubmitting}
                      className="border-white/20"
                    />
                  )}
                />
                <Label
                  htmlFor="remember-me"
                  className="cursor-pointer text-sm font-normal text-muted-foreground"
                >
                  Continuar conectado
                </Label>
              </div>

              <Link
                href="/forgot-password"
                className="text-sm text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
              >
                Esqueci minha senha
              </Link>
            </div>

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
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
                    Entrando...
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
                    Bem-vindo
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    Entrar
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

          <SocialButtons disabled={isSubmitting} onError={setAuthError} />

          <AuthFooter />
        </div>
      </div>

      <AnimatePresence>
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-live="polite"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full bg-[#22C55E]/15 p-4 ring-1 ring-[#22C55E]/30"
            >
              <Check className="h-6 w-6 text-[#22C55E]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
