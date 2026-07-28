"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import type { AiSuggestion, ExtractedProfile } from "@/types/onboarding";
import { cn } from "@/lib/utils";

interface ProfilePreviewProps {
  profile: ExtractedProfile;
  suggestions: AiSuggestion[];
  appliedSuggestions: string[];
  onApplySuggestion: (suggestion: AiSuggestion) => void;
  className?: string;
}

export function ProfilePreview({
  profile,
  suggestions,
  appliedSuggestions,
  onApplySuggestion,
  className,
}: ProfilePreviewProps) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl space-y-8", className)}>
      <div className="space-y-3 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-primary"
        >
          IA montando seu perfil
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Seu copiloto de carreira
        </motion.h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.article
          initial={{ opacity: 0, x: -16, filter: "blur(6px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45 }}
          className="space-y-5 rounded-2xl border border-border bg-card/85 p-5 backdrop-blur-sm sm:p-7"
          aria-label="Pré-visualização do perfil"
        >
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-xl font-semibold text-foreground shadow-[0_0_32px_rgba(79,124,255,0.4)]">
              {profile.avatarInitials}
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-success ring-2 ring-card">
                <Check className="h-3 w-3 text-foreground" aria-hidden="true" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">{profile.currentRole}</p>
              <p className="mt-1 text-xs text-primary">{profile.seniority}</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[#C4C9D4]">
            {profile.summary}
          </p>

          <section aria-labelledby="skills-preview">
            <h4
              id="skills-preview"
              className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Competências
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-[#E5E7EB]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section aria-labelledby="exp-preview">
              <h4
                id="exp-preview"
                className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Experiências
              </h4>
              <ul className="space-y-2">
                {profile.experiences.map((exp) => (
                  <li
                    key={exp.id}
                    className="rounded-xl border border-border bg-muted/30 px-3 py-2.5"
                  >
                    <p className="text-sm font-medium text-foreground">{exp.role}</p>
                    <p className="text-xs text-muted-foreground">
                      {exp.company} · {exp.period}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="proj-preview">
              <h4
                id="proj-preview"
                className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Projetos
              </h4>
              <ul className="space-y-2">
                {profile.projects.map((project) => (
                  <li
                    key={project.id}
                    className="rounded-xl border border-border bg-muted/30 px-3 py-2.5"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {project.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.tech.join(" · ")}
                    </p>
                  </li>
                ))}
                {profile.projects.length === 0 && (
                  <li className="text-sm text-muted-foreground">Sem projetos ainda</li>
                )}
              </ul>
            </section>
          </div>

          <section aria-labelledby="lang-preview">
            <h4
              id="lang-preview"
              className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Idiomas
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.languages.map((lang) => (
                <span
                  key={lang.id}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-[#C4C9D4]"
                >
                  {lang.name} · {lang.level}
                </span>
              ))}
            </div>
          </section>
        </motion.article>

        <motion.aside
          initial={{ opacity: 0, x: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="space-y-4"
          aria-label="Sugestões da IA"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            IA sugere melhorias
          </div>

          {suggestions.map((suggestion, index) => {
            const applied = appliedSuggestions.includes(suggestion.id);

            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.08 }}
                className={cn(
                  "rounded-2xl border p-4 sm:p-5",
                  applied
                    ? "border-[#22C55E]/35 bg-success/8"
                    : "border-border bg-card/80"
                )}
              >
                <h4 className="text-sm font-semibold text-foreground">
                  {suggestion.title}
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {suggestion.description}
                </p>
                <motion.button
                  type="button"
                  whileHover={applied ? undefined : { scale: 1.02 }}
                  whileTap={applied ? undefined : { scale: 0.98 }}
                  disabled={applied}
                  onClick={() => onApplySuggestion(suggestion)}
                  className={cn(
                    "mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    applied
                      ? "bg-success/20 text-[#86EFAC] cursor-default"
                      : "bg-primary/15 text-[#A8C0FF] hover:bg-primary/25"
                  )}
                >
                  {applied ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Aplicado
                    </span>
                  ) : (
                    suggestion.actionLabel
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </motion.aside>
      </div>
    </div>
  );
}
