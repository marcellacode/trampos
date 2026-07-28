"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AlertCircle, FileUp, Sparkles, GitBranch, Network } from "lucide-react";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { ImportCard } from "@/components/onboarding/import-card";
import { UploadArea } from "@/components/onboarding/upload-area";
import { AIProcessing } from "@/components/onboarding/ai-processing";
import { SummaryCards } from "@/components/onboarding/summary-cards";
import { ProfilePreview } from "@/components/onboarding/profile-preview";
import { ProfessionalDnaReveal } from "@/components/onboarding/professional-dna";
import { SuccessScreen } from "@/components/onboarding/success-screen";
import { GoalsStep } from "@/components/onboarding/steps/goals-step";
import { AvailabilityStep } from "@/components/onboarding/steps/availability-step";
import {
  EMPTY_PROFILE,
  ERROR_MESSAGES,
  ONBOARDING_TOTAL_STEPS,
  STEP_META,
} from "@/lib/onboarding/constants";
import { buildProfessionalDnaFromProfile } from "@/lib/onboarding/build-dna";
import {
  persistOnboardingProfile,
  processOnboardingComplete,
  resolveImport,
} from "@/lib/integrations/onboarding";
import { useProfile } from "@/lib/profile/hooks";
import type {
  AiSuggestion,
  AvailabilityOption,
  ContractType,
  ExtractedProfile,
  GoalChip,
  ImportMethod,
  OnboardingData,
  OnboardingError,
  OnboardingStep,
  WorkModel,
} from "@/types/onboarding";

const stepVariants = {
  initial: { opacity: 0, y: 24, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -16, filter: "blur(8px)" },
};

function getErrorMessage(error: unknown): OnboardingError {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { code: "offline", message: ERROR_MESSAGES.offline };
  }

  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: string }).code)
      : "unknown";

  if (code === "invalid_file" || code === "missing_file") {
    return { code: "invalid_file", message: ERROR_MESSAGES.invalid_file };
  }
  if (code === "linkedin_failed") {
    return { code: "linkedin_failed", message: ERROR_MESSAGES.linkedin_failed };
  }
  if (code === "github_failed") {
    return { code: "github_failed", message: ERROR_MESSAGES.github_failed };
  }
  if (code === "offline") {
    return { code: "offline", message: ERROR_MESSAGES.offline };
  }

  return { code: "unknown", message: ERROR_MESSAGES.unknown };
}

export function OnboardingFlow() {
  const router = useRouter();
  const { data: savedProfile } = useProfile();
  const [step, setStep] = useState<OnboardingStep>("import");
  const [showUpload, setShowUpload] = useState(false);
  const [showGithubInput, setShowGithubInput] = useState(false);
  const [showLinkedinInput, setShowLinkedinInput] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
  const [error, setError] = useState<OnboardingError | null>(null);
  const [data, setData] = useState<OnboardingData>({
    importMethod: null,
    profile: EMPTY_PROFILE,
    goalText: "",
    goalChips: [],
    availability: null,
    workModels: [],
    contractTypes: [],
    appliedSuggestions: [],
    uploadedFileName: null,
  });

  const stepNumber = STEP_META[step].number;

  useEffect(() => {
    if (!savedProfile?.name) return;
    setData((prev) => ({
      ...prev,
      profile: savedProfile,
    }));
  }, [savedProfile]);

  const importMutation = useMutation({
    mutationFn: async ({
      method,
      file,
      githubUsername: ghUser,
      linkedinText: liText,
    }: {
      method: ImportMethod;
      file?: File | null;
      githubUsername?: string;
      linkedinText?: string;
    }) =>
      resolveImport(method, file, {
        githubUsername: ghUser,
        linkedinText: liText,
      }),
    onSuccess: (profile, variables) => {
      setData((prev) => ({
        ...prev,
        importMethod: variables.method,
        profile,
        uploadedFileName: variables.file?.name ?? prev.uploadedFileName,
      }));
      setError(null);
    },
    onError: (err, variables) => {
      const mapped = getErrorMessage(err);
      if (variables.method === "linkedin") {
        setError({
          code: "linkedin_failed",
          message: ERROR_MESSAGES.linkedin_failed,
        });
      } else if (variables.method === "github") {
        setError({
          code: "github_failed",
          message: ERROR_MESSAGES.github_failed,
        });
      } else {
        setError(mapped);
      }
      setShowUpload(variables.method === "resume");
      setStep("import");
    },
  });

  const persistMutation = useMutation({
    mutationFn: async (payload: OnboardingData) => {
      const result = await persistOnboardingProfile(payload);
      await processOnboardingComplete({
        event: "onboarding.completed",
        profileId: result.id,
        importMethod: payload.importMethod,
        goalText: payload.goalText,
      });
      return result;
    },
  });

  const sourceLabel = useMemo(() => {
    switch (data.importMethod) {
      case "linkedin":
        return "seu LinkedIn";
      case "github":
        return "seu GitHub";
      case "resume":
        return "seu currículo";
      default:
        return "seu documento";
    }
  }, [data.importMethod]);

  const handleMethodSelect = (method: ImportMethod) => {
    setError(null);
    if (method === "resume") {
      setShowUpload(true);
      setShowGithubInput(false);
      setShowLinkedinInput(false);
      setData((prev) => ({ ...prev, importMethod: method }));
      return;
    }

    setShowUpload(false);

    if (method === "github") {
      setShowGithubInput(true);
      setShowLinkedinInput(false);
      setData((prev) => ({ ...prev, importMethod: method }));
      return;
    }

    if (method === "linkedin") {
      setShowLinkedinInput(true);
      setShowGithubInput(false);
      setData((prev) => ({ ...prev, importMethod: method }));
      return;
    }

    setShowGithubInput(false);
    setShowLinkedinInput(false);
    setData((prev) => ({ ...prev, importMethod: method }));

    if (method === "scratch") {
      importMutation.mutate(
        { method },
        {
          onSuccess: () => setStep("goals"),
        }
      );
      return;
    }

    setStep("processing");
    importMutation.mutate({ method });
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    setData((prev) => ({
      ...prev,
      importMethod: "resume",
      uploadedFileName: file.name,
    }));
    setStep("processing");
    importMutation.mutate({ method: "resume", file });
  };

  const handleProcessingComplete = useCallback(() => {
    setStep("summary");
  }, []);

  const updateProfile = (profile: ExtractedProfile) => {
    setData((prev) => ({ ...prev, profile }));
  };

  const handleApplySuggestion = (suggestion: AiSuggestion) => {
    setData((prev) => {
      if (prev.appliedSuggestions.includes(suggestion.id)) return prev;

      let profile = { ...prev.profile };

      if (suggestion.type === "skill") {
        profile = {
          ...profile,
          skills: Array.from(
            new Set([...profile.skills, suggestion.title.replace(/^Adicionar /i, "")])
          ),
        };
      }

      if (suggestion.type === "github" || suggestion.type === "project") {
        const extraProject = {
          id: `proj-auto-${suggestion.id}`,
          name: suggestion.title,
          description: suggestion.description,
          tech: profile.skills.slice(0, 3),
        };
        profile = {
          ...profile,
          projects: profile.projects.some((p) => p.id === extraProject.id)
            ? profile.projects
            : [...profile.projects, extraProject],
        };
      }

      return {
        ...prev,
        profile,
        appliedSuggestions: [...prev.appliedSuggestions, suggestion.id],
      };
    });
  };

  const professionalDna = useMemo(
    () => buildProfessionalDnaFromProfile(data.profile, data.goalChips),
    [data.profile, data.goalChips]
  );

  const finishOnboarding = async () => {
    await persistMutation.mutateAsync(data);
    setStep("success");
  };

  return (
    <OnboardingLayout
      step={stepNumber}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      hideProgress={step === "success"}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step + String(showUpload)}
          variants={stepVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 flex-col"
        >
          {step === "import" && !showUpload && !showGithubInput && !showLinkedinInput && (
            <div className="flex flex-1 flex-col justify-center gap-10 py-4">
              <div className="mx-auto max-w-2xl space-y-4 text-center">
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]"
                >
                  Vamos construir seu{" "}
                  <span className="text-gradient-primary">copiloto</span> de
                  carreira.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="text-base text-muted-foreground sm:text-lg"
                >
                  Quanto mais conhecermos você, melhores serão as oportunidades
                  encontradas.
                </motion.p>
              </div>

              <div className="space-y-4">
                <h2 className="text-center text-sm font-medium text-muted-foreground">
                  Como deseja começar?
                </h2>

                <div
                  className="grid gap-4 sm:grid-cols-2"
                  role="list"
                  aria-label="Formas de começar o onboarding"
                >
                  <ImportCard
                    index={0}
                    title="Colar perfil LinkedIn"
                    description="Cole o texto exportado do seu perfil — sem API paga."
                    icon={Network}
                    onClick={() => handleMethodSelect("linkedin")}
                    disabled={importMutation.isPending}
                  />
                  <ImportCard
                    index={1}
                    title="Importar GitHub"
                    description="Informe seu @username — usamos a API pública do GitHub."
                    icon={GitBranch}
                    onClick={() => handleMethodSelect("github")}
                    disabled={importMutation.isPending}
                  />
                  <ImportCard
                    index={2}
                    title="Enviar Currículo"
                    description="Arraste um PDF ou DOCX, ou clique para selecionar."
                    icon={FileUp}
                    onClick={() => handleMethodSelect("resume")}
                    featured
                    disabled={importMutation.isPending}
                  />
                  <ImportCard
                    index={3}
                    title="Começar do zero"
                    description="Para quem ainda não possui currículo. A IA guia cada passo."
                    icon={Sparkles}
                    onClick={() => handleMethodSelect("scratch")}
                    disabled={importMutation.isPending}
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="mx-auto flex max-w-lg items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error.message}</span>
                </motion.div>
              )}
            </div>
          )}

          {step === "import" && showGithubInput && (
            <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 py-8">
              <h2 className="text-center text-xl font-semibold text-foreground">
                Seu username no GitHub
              </h2>
              <input
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="ex: octocat"
                className="rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:border-primary/50"
              />
              <button
                type="button"
                disabled={!githubUsername.trim() || importMutation.isPending}
                onClick={() => {
                  setStep("processing");
                  importMutation.mutate(
                    { method: "github", githubUsername },
                    { onSuccess: () => setStep("summary") }
                  );
                }}
                className="rounded-xl bg-primary py-3 font-medium text-primary-foreground disabled:opacity-50"
              >
                Analisar perfil
              </button>
            </div>
          )}

          {step === "import" && showLinkedinInput && (
            <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 py-8">
              <h2 className="text-center text-xl font-semibold text-foreground">
                Cole o texto do seu perfil
              </h2>
              <textarea
                value={linkedinText}
                onChange={(e) => setLinkedinText(e.target.value)}
                placeholder="Cole aqui experiências, skills e resumo do LinkedIn..."
                rows={8}
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50"
              />
              <button
                type="button"
                disabled={linkedinText.trim().length < 50 || importMutation.isPending}
                onClick={() => {
                  setStep("processing");
                  importMutation.mutate(
                    { method: "linkedin", linkedinText },
                    { onSuccess: () => setStep("summary") }
                  );
                }}
                className="rounded-xl bg-primary py-3 font-medium text-primary-foreground disabled:opacity-50"
              >
                Analisar perfil
              </button>
            </div>
          )}

          {step === "import" && showUpload && (
            <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 py-8">
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  Enviar currículo
                </h2>
                <p className="text-sm text-muted-foreground">
                  Arraste um PDF ou DOCX. A IA extrai tudo em segundos.
                </p>
              </div>
              <UploadArea
                onFileSelect={handleFileSelect}
                onCancel={() => {
                  setShowUpload(false);
                  setError(null);
                }}
                error={error?.message}
                isUploading={importMutation.isPending}
              />
            </div>
          )}

          {step === "processing" && (
            <AIProcessing
              onComplete={handleProcessingComplete}
              fileName={data.uploadedFileName}
              sourceLabel={sourceLabel}
            />
          )}

          {step === "summary" && (
            <div className="flex flex-1 flex-col justify-center py-6">
              <SummaryCards
                profile={data.profile}
                onChange={updateProfile}
                onContinue={() => setStep("goals")}
              />
            </div>
          )}

          {step === "goals" && (
            <GoalsStep
              goalText={data.goalText}
              goalChips={data.goalChips}
              onTextChange={(goalText) =>
                setData((prev) => ({ ...prev, goalText }))
              }
              onChipsChange={(goalChips: GoalChip[]) =>
                setData((prev) => ({ ...prev, goalChips }))
              }
              onContinue={() => setStep("availability")}
            />
          )}

          {step === "availability" && (
            <AvailabilityStep
              availability={data.availability}
              workModels={data.workModels}
              contractTypes={data.contractTypes}
              onAvailabilityChange={(availability: AvailabilityOption) =>
                setData((prev) => ({ ...prev, availability }))
              }
              onWorkModelsChange={(workModels: WorkModel[]) =>
                setData((prev) => ({ ...prev, workModels }))
              }
              onContractTypesChange={(contractTypes: ContractType[]) =>
                setData((prev) => ({ ...prev, contractTypes }))
              }
              onContinue={() => setStep("profile")}
            />
          )}

          {step === "profile" && (
            <div className="flex flex-1 flex-col justify-center gap-8 py-6">
              <ProfilePreview
                profile={data.profile}
                suggestions={[]}
                appliedSuggestions={data.appliedSuggestions}
                onApplySuggestion={handleApplySuggestion}
              />
              <div className="flex justify-center pb-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("dna")}
                  className="inline-flex h-12 min-w-[220px] items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-[0_0_32px_rgba(79,124,255,0.35)] transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Ver meu DNA Profissional
                </motion.button>
              </div>
            </div>
          )}

          {step === "dna" && (
            <ProfessionalDnaReveal
              dna={professionalDna}
              onContinue={finishOnboarding}
              isLoading={persistMutation.isPending}
            />
          )}

          {step === "success" && (
            <SuccessScreen onEnterDashboard={() => router.push("/dashboard")} />
          )}
        </motion.div>
      </AnimatePresence>
    </OnboardingLayout>
  );
}
