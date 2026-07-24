"use client";

import {
  EntityCrudSection,
  ModuleCrudShell,
} from "@/components/crud/module-crud-page";
import {
  useAddFavoriteCompany,
  useCreateJobApplication,
  useDeleteJobApplication,
  useFavoriteCompanies,
  useJobApplications,
  useRemoveFavoriteCompany,
  useUpdateFavoriteCompany,
  useUpdateJobApplication,
} from "@/lib/crud/hooks";
import { EMPRESAS_MODULE } from "@/lib/crud/modules";

export function EmpresasModulePage() {
  const applicationsQuery = useJobApplications();
  const createApplication = useCreateJobApplication();
  const updateApplication = useUpdateJobApplication();
  const deleteApplication = useDeleteJobApplication();

  const favoritesQuery = useFavoriteCompanies();
  const addFavorite = useAddFavoriteCompany();
  const updateFavorite = useUpdateFavoriteCompany();
  const removeFavorite = useRemoveFavoriteCompany();

  const [applications, favorites] = EMPRESAS_MODULE.entities;

  return (
    <ModuleCrudShell config={EMPRESAS_MODULE}>
      <EntityCrudSection
        config={applications}
        items={applicationsQuery.data ?? []}
        isLoading={applicationsQuery.isLoading}
        isMutating={createApplication.isPending || updateApplication.isPending}
        onCreate={async (payload) => {
          await createApplication.mutateAsync({
            role_title: String(payload.role_title ?? ""),
            company_id: String(payload.company_id ?? ""),
            job_id: payload.job_id ? String(payload.job_id) : null,
            status: String(payload.status ?? "interested"),
            status_label: String(payload.status_label ?? ""),
          });
        }}
        onUpdate={async (id, payload) => {
          await updateApplication.mutateAsync({ id, input: payload });
        }}
        onDelete={async (id) => {
          await deleteApplication.mutateAsync(id);
        }}
      />

      <EntityCrudSection
        config={favorites}
        items={favoritesQuery.data ?? []}
        isLoading={favoritesQuery.isLoading}
        isMutating={addFavorite.isPending || updateFavorite.isPending}
        onCreate={async (payload) => {
          await addFavorite.mutateAsync({
            companyId: String(payload.company_id ?? ""),
            compatibility: Number(payload.compatibility ?? 80),
          });
        }}
        onUpdate={async (id, payload) => {
          await updateFavorite.mutateAsync({
            companyId: id,
            compatibility: Number(payload.compatibility ?? 80),
          });
        }}
        onDelete={async (id) => {
          await removeFavorite.mutateAsync(id);
        }}
      />
    </ModuleCrudShell>
  );
}
