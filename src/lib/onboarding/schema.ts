import { z } from "zod";

export const availabilitySchema = z.enum([
  "immediate",
  "15days",
  "30days",
  "45days",
  "other",
]);

export const workModelSchema = z.enum(["onsite", "hybrid", "remote", "any"]);

export const contractTypeSchema = z.enum([
  "clt",
  "pj",
  "freelancer",
  "international",
]);

export const goalChipSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  category: z.enum([
    "skill",
    "role",
    "location",
    "salary",
    "contract",
    "model",
  ]),
});

export const goalsStepSchema = z.object({
  goalText: z
    .string()
    .min(10, "Conte um pouco mais sobre o que você procura."),
  goalChips: z.array(goalChipSchema).min(1, "Adicione ao menos um objetivo."),
});

export const availabilityStepSchema = z.object({
  availability: availabilitySchema,
  workModels: z.array(workModelSchema).min(1, "Selecione ao menos um modelo."),
  contractTypes: z
    .array(contractTypeSchema)
    .min(1, "Selecione ao menos um tipo de contratação."),
});

export const resumeUploadSchema = z.object({
  file: z
    .custom<File>((value) => value instanceof File, "Arquivo obrigatório")
    .refine(
      (file) =>
        [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/msword",
        ].includes(file.type) ||
        /\.(pdf|docx?)$/i.test(file.name),
      "Envie um PDF ou DOCX válido."
    )
    .refine((file) => file.size <= 10 * 1024 * 1024, "Arquivo máximo de 10MB."),
});

export type GoalsStepValues = z.infer<typeof goalsStepSchema>;
export type AvailabilityStepValues = z.infer<typeof availabilityStepSchema>;
