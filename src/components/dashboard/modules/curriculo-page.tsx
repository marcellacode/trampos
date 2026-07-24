"use client";

import {
  EntityCrudSection,
  ModuleCrudShell,
} from "@/components/crud/module-crud-page";
import {
  useCertificates,
  useCreateCertificate,
  useCreateExperience,
  useCreateLanguage,
  useCreateSkill,
  useDeleteCertificate,
  useDeleteExperience,
  useDeleteLanguage,
  useDeleteSkill,
  useExperiences,
  useLanguages,
  useSkills,
  useUpdateCertificate,
  useUpdateExperience,
  useUpdateLanguage,
} from "@/lib/crud/hooks";
import { CURRICULO_MODULE } from "@/lib/crud/modules";

export function CurriculoModulePage() {
  const experiencesQuery = useExperiences();
  const createExperience = useCreateExperience();
  const updateExperience = useUpdateExperience();
  const deleteExperience = useDeleteExperience();

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

  const [experiences, skills, languages, certificates] = CURRICULO_MODULE.entities;

  return (
    <ModuleCrudShell config={CURRICULO_MODULE}>
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
    </ModuleCrudShell>
  );
}
