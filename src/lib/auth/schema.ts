import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu e-mail")
    .email("Digite um e-mail válido para continuar"),
  password: z
    .string()
    .min(1, "Informe sua senha")
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
  rememberMe: z.boolean(),
});

export type LoginSchema = z.infer<typeof loginSchema>;
