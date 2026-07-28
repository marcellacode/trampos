"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  EntityCrudSection,
  ModuleCrudShell,
} from "@/components/crud/module-crud-page";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PortfolioSection } from "@/components/dashboard/modules/portfolio-page";
import { Button } from "@/components/ui/button";
import {
  useCertificates,
  useCourses,
  useCreateCertificate,
  useCreateCourse,
  useCreateEducation,
  useCreateExperience,
  useCreateLanguage,
  useCreateSkill,
  useDeleteCertificate,
  useDeleteCourse,
  useDeleteEducation,
  useDeleteExperience,
  useDeleteLanguage,
  useDeleteSkill,
  useEducation,
  useExperiences,
  useLanguages,
  useSkills,
  useUpdateCertificate,
  useUpdateCourse,
  useUpdateEducation,
  useUpdateExperience,
  useUpdateLanguage,
} from "@/lib/crud/hooks";
import { CURRICULO_MODULE } from "@/lib/crud/modules";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import { TailoredResumeVersions } from "@/components/dashboard/curriculo/tailored-resume-versions";
import { ProfileVisibilitySection } from "@/components/dashboard/curriculo/profile-visibility-section";
import { cn } from "@/lib/utils";

type CurriculoTab = "perfil" | "portfolio";

function parseOptionalDate(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  return raw ? raw : null;
}

function CurriculoContent() {
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "portfolio" ? "portfolio" : "perfil";
  const [activeTab, setActiveTab] = useState<CurriculoTab>(initialTab);

  const experiencesQuery = useExperiences();
  const createExperience = useCreateExperience();
  const updateExperience = useUpdateExperience();
  const deleteExperience = useDeleteExperience();

  const educationQuery = useEducation();
  const createEducation = useCreateEducation();
  const updateEducation = useUpdateEducation();
  const deleteEducation = useDeleteEducation();

  const skillsQuery = useSkills();
  const createSkill = useCreateSkill();
  const deleteSkill = useDeleteSkill();

  const languagesQuery = useLanguages();
  const createLanguage = useCreateLanguage();
  const updateLanguage = useUpdateLanguage();
  const deleteLanguage = useDeleteLanguage();

  const certificatesQuery = useCertificates();
  const createCertificate = useCreateCertificate();
  const updateCertificate = useUpdateCertificate();
  const deleteCertificate = useDeleteCertificate();

  const coursesQuery = useCourses();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const [experiences, education, skills, languages, certificates, courses] =
    CURRICULO_MODULE.entities;

  return (
    <ModuleCrudShell config={CURRICULO_MODULE}>
      <div
        className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1"
        role="tablist"
        aria-label="Seções do currículo"
      >
        <Button
          type="button"
          role="tab"
          aria-selected={activeTab === "perfil"}
          variant={activeTab === "perfil" ? "secondary" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => setActiveTab("perfil")}
        >
          Dados profissionais
        </Button>
        <Button
          type="button"
          role="tab"
          aria-selected={activeTab === "portfolio"}
          variant={activeTab === "portfolio" ? "secondary" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => setActiveTab("portfolio")}
        >
          Portfólio
        </Button>
      </div>

      <div role="tabpanel" className={cn(activeTab !== "perfil" && "hidden")}>
        <ProfileVisibilitySection />
        <TailoredResumeVersions />

        <EntityCrudSection
          config={experiences}
          items={experiencesQuery.data ?? []}
          isLoading={experiencesQuery.isLoading}
          isMutating={createExperience.isPending || updateExperience.isPending}
          onCreate={async (payload) => {
            await createExperience.mutateAsync({
              company: String(payload.company ?? ""),
              role: String(payload.role ?? ""),
              period_label: String(payload.period_label ?? ""),
              description: String(payload.description ?? ""),
              sort_order: Number(payload.sort_order ?? 0),
            });
          }}
          onUpdate={async (id, payload) => {
            await updateExperience.mutateAsync({ id, input: payload });
          }}
          onDelete={async (id) => {
            await deleteExperience.mutateAsync(id);
          }}
        />

        <EntityCrudSection
          config={education}
          items={educationQuery.data ?? []}
          isLoading={educationQuery.isLoading}
          isMutating={createEducation.isPending || updateEducation.isPending}
          onCreate={async (payload) => {
            await createEducation.mutateAsync({
              institution: String(payload.institution ?? ""),
              degree: String(payload.degree ?? ""),
              field_of_study: String(payload.field_of_study ?? ""),
              start_date: parseOptionalDate(payload.start_date),
              end_date: parseOptionalDate(payload.end_date),
              is_current: Boolean(payload.is_current),
              description: String(payload.description ?? ""),
              sort_order: Number(payload.sort_order ?? 0),
            });
          }}
          onUpdate={async (id, payload) => {
            await updateEducation.mutateAsync({ id, input: payload });
          }}
          onDelete={async (id) => {
            await deleteEducation.mutateAsync(id);
          }}
        />

        <EntityCrudSection
          config={skills}
          items={skillsQuery.data ?? []}
          isLoading={skillsQuery.isLoading}
          isMutating={createSkill.isPending}
          onCreate={async (payload) => {
            await createSkill.mutateAsync({
              skillName: String(payload.skill_name ?? ""),
              sortOrder: Number(payload.sort_order ?? 0),
            });
          }}
          onUpdate={async () => {}}
          onDelete={async (id) => {
            await deleteSkill.mutateAsync(id);
          }}
        />

        <EntityCrudSection
          config={languages}
          items={languagesQuery.data ?? []}
          isLoading={languagesQuery.isLoading}
          isMutating={createLanguage.isPending || updateLanguage.isPending}
          onCreate={async (payload) => {
            await createLanguage.mutateAsync({
              name: String(payload.name ?? ""),
              level_label: String(payload.level_label ?? ""),
              sort_order: Number(payload.sort_order ?? 0),
            });
          }}
          onUpdate={async (id, payload) => {
            await updateLanguage.mutateAsync({ id, input: payload });
          }}
          onDelete={async (id) => {
            await deleteLanguage.mutateAsync(id);
          }}
        />

        <EntityCrudSection
          config={certificates}
          items={certificatesQuery.data ?? []}
          isLoading={certificatesQuery.isLoading}
          isMutating={createCertificate.isPending || updateCertificate.isPending}
          onCreate={async (payload) => {
            await createCertificate.mutateAsync({
              name: String(payload.name ?? ""),
              issuer: String(payload.issuer ?? ""),
              year_label: String(payload.year_label ?? ""),
              sort_order: Number(payload.sort_order ?? 0),
            });
          }}
          onUpdate={async (id, payload) => {
            await updateCertificate.mutateAsync({ id, input: payload });
          }}
          onDelete={async (id) => {
            await deleteCertificate.mutateAsync(id);
          }}
        />

        <EntityCrudSection
          config={courses}
          items={coursesQuery.data ?? []}
          isLoading={coursesQuery.isLoading}
          isMutating={createCourse.isPending || updateCourse.isPending}
          onCreate={async (payload) => {
            await createCourse.mutateAsync({
              name: String(payload.name ?? ""),
              provider: String(payload.provider ?? ""),
              completion_date: parseOptionalDate(payload.completion_date),
              credential_url: parseOptionalDate(payload.credential_url),
              description: String(payload.description ?? ""),
              sort_order: Number(payload.sort_order ?? 0),
            });
          }}
          onUpdate={async (id, payload) => {
            await updateCourse.mutateAsync({ id, input: payload });
          }}
          onDelete={async (id) => {
            await deleteCourse.mutateAsync(id);
          }}
        />
      </div>

      <div role="tabpanel" className={cn(activeTab !== "portfolio" && "hidden")}>
        <PortfolioSection />
      </div>
    </ModuleCrudShell>
  );
}

export function CurriculoModulePage() {
  return (
    <Suspense fallback={null}>
      <CurriculoContent />
    </Suspense>
  );
}
