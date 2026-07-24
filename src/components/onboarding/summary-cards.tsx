"use client";

import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import type { ExtractedProfile } from "@/types/onboarding";
import { cn } from "@/lib/utils";

interface ProfileFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}

function EditableField({
  label,
  value,
  onChange,
  multiline = false,
}: ProfileFieldProps) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <label className="group block space-y-1.5" htmlFor={id}>
      <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
        {label}
        <Pencil
          className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60 group-focus-within:opacity-60"
          aria-hidden="true"
        />
      </span>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#4F7CFF]/50 focus:ring-2 focus:ring-[#4F7CFF]/25"
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#4F7CFF]/50 focus:ring-2 focus:ring-[#4F7CFF]/25"
        />
      )}
    </label>
  );
}

interface SummaryCardsProps {
  profile: ExtractedProfile;
  onChange: (profile: ExtractedProfile) => void;
  onContinue: () => void;
  className?: string;
}

export function SummaryCards({
  profile,
  onChange,
  onContinue,
  className,
}: SummaryCardsProps) {
  const update = <K extends keyof ExtractedProfile>(
    key: K,
    value: ExtractedProfile[K]
  ) => onChange({ ...profile, [key]: value });

  return (
    <div className={cn("mx-auto w-full max-w-3xl space-y-8", className)}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3 text-center"
      >
        <p className="text-sm font-medium text-[#4F7CFF]">Encontramos</p>
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Seu perfil preliminar
        </h2>
        <p className="mx-auto max-w-lg text-sm text-[#9CA3AF] sm:text-base">
          Revise e edite qualquer campo. A IA já fez o trabalho pesado.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.1 }}
        className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#111315]/80 p-5 backdrop-blur-sm sm:p-7"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <EditableField
            label="Nome"
            value={profile.name}
            onChange={(v) => {
              const initials =
                v
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase() ?? "")
                  .join("") || "?";
              onChange({ ...profile, name: v, avatarInitials: initials });
            }}
          />
          <EditableField
            label="Cargo atual"
            value={profile.currentRole}
            onChange={(v) => update("currentRole", v)}
          />
        </div>

        <EditableField
          label="Resumo"
          value={profile.summary}
          onChange={(v) => update("summary", v)}
          multiline
        />

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
            Competências
          </p>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Competências">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                role="listitem"
                className="rounded-full border border-[#4F7CFF]/25 bg-[#4F7CFF]/10 px-3 py-1 text-xs font-medium text-[#A8C0FF]"
              >
                {skill}
              </span>
            ))}
          </div>
          <input
            type="text"
            aria-label="Editar competências separadas por vírgula"
            value={profile.skills.join(", ")}
            onChange={(e) =>
              update(
                "skills",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#4F7CFF]/50 focus:ring-2 focus:ring-[#4F7CFF]/25"
            placeholder="React, TypeScript, Next.js..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Experiências ({profile.experiences.length})
            </p>
            <ul className="space-y-2">
              {profile.experiences.map((exp) => (
                <li
                  key={exp.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <p className="text-sm font-medium text-white">{exp.role}</p>
                  <p className="text-xs text-[#9CA3AF]">
                    {exp.company} · {exp.period}
                  </p>
                </li>
              ))}
              {profile.experiences.length === 0 && (
                <li className="text-sm text-[#9CA3AF]">Nenhuma experiência detectada</li>
              )}
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Idiomas · Projetos · Certificados
            </p>
            <ul className="space-y-1.5 text-sm text-[#C4C9D4]">
              <li>
                Idiomas:{" "}
                {profile.languages.map((l) => l.name).join(", ") || "—"}
              </li>
              <li>Projetos: {profile.projects.length}</li>
              <li>Certificados: {profile.certificates.length}</li>
              <li>Senioridade: {profile.seniority || "—"}</li>
            </ul>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-xl bg-[#4F7CFF] px-8 text-sm font-semibold text-white shadow-[0_0_32px_rgba(79,124,255,0.35)] transition-colors hover:bg-[#638BFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090A]"
        >
          Continuar
        </motion.button>
      </motion.div>
    </div>
  );
}
