"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Lock, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthFooter } from "@/components/auth/auth-footer";
import { SocialButtons } from "@/components/auth/social-buttons";
import { FloatingField } from "@/components/auth/floating-field";
import { useSignUpForm } from "@/hooks/use-sign-up-form";
import { cn } from "@/lib/utils";

export function SignUpCard() {
  const { form, status, rootError, confirmationEmail, clearRootError, onSubmit, isSubmitting } = useSignUpForm();
  const { register, formState: { errors, isValid }, watch } = form;

  if (status === "success" && confirmationEmail) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-[460px]">
        <div className="relative overflow-hidden rounded-[1.25rem] border border-border bg-card/85 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#22C55E]/15 ring-1 ring-[#22C55E]/30">
              <Check className="h-6 w-6 text-[#22C55E]" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">Confirme seu e-mail</h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Sua conta foi criada. Enviamos um link de confirmação para <span className="font-medium text-foreground">{confirmationEmail}</span>.
              </p>
            </div>
            <Link href="/login" className="inline-flex text-sm font-medium text-primary hover:text-primary/80">Voltar para o login</Link>
          </div>
        </div>
      </motion.div>
    );
  }

  const fields = [
    { key: "fullName" as const, label: "Nome completo", icon: UserRound, type: "text", autoComplete: "name" },
    { key: "email" as const, label: "E-mail", icon: Mail, type: "email", autoComplete: "email" },
    { key: "password" as const, label: "Senha", icon: Lock, type: "password", autoComplete: "new-password", showPasswordToggle: true },
    { key: "confirmPassword" as const, label: "Confirmar senha", icon: Lock, type: "password", autoComplete: "new-password", showPasswordToggle: true },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative w-full max-w-[460px]">
      <div className="absolute -inset-px rounded-[1.35rem] bg-gradient-to-b from-white/15 via-white/5 to-transparent opacity-80" />
      <div className="absolute -inset-8 rounded-[2rem] bg-primary/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-[1.25rem] border border-border bg-card/85 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/[0.07] via-transparent to-transparent" />
        <div className="relative space-y-6">
          <AuthHeader title="Crie sua conta" description="Comece a organizar sua carreira com a inteligência da Jobera." />
          <form onSubmit={onSubmit} className="space-y-4" noValidate aria-busy={isSubmitting}>
            {fields.map(({ key, ...field }) => {
              const registration = register(key, { onChange: clearRootError });
              return <FloatingField key={key} {...field} disabled={isSubmitting} error={errors[key]?.message} value={watch(key)} name={registration.name} ref={registration.ref} onChange={registration.onChange} onBlur={registration.onBlur} />;
            })}
            <p className="px-1 text-xs leading-relaxed text-muted-foreground">Use ao menos 8 caracteres, incluindo uma letra e um número.</p>
            <AnimatePresence mode="wait">
              {rootError ? <motion.div role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-3 text-sm text-red-300">{rootError}</motion.div> : null}
            </AnimatePresence>
            <motion.button type="submit" whileHover={!isSubmitting && isValid ? { scale: 1.015 } : undefined} whileTap={!isSubmitting && isValid ? { scale: 0.985 } : undefined} disabled={isSubmitting || !isValid} className={cn("flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-foreground shadow-[0_0_24px_rgba(79,124,255,0.35)] transition-all hover:bg-[#5B86FF] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none")}>
              {isSubmitting ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Criando conta...</span> : "Criar conta"}
            </motion.button>
          </form>
          <SocialButtons disabled={isSubmitting} onError={() => undefined} />
          <p className="text-center text-xs leading-relaxed text-muted-foreground">Ao criar uma conta, você concorda com os <Link href="/termos" className="text-primary hover:text-primary/80">Termos de Uso</Link> e a <Link href="/privacidade" className="text-primary hover:text-primary/80">Política de Privacidade</Link>.</p>
          <AuthFooter prompt="Já possui conta?" actionLabel="Entrar" actionHref="/login" />
        </div>
      </div>
    </motion.div>
  );
}
