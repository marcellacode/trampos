"use client";

import {
  EntityCrudSection,
  ModuleCrudShell,
} from "@/components/crud/module-crud-page";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "@/lib/crud/hooks";
import { PORTFOLIO_MODULE } from "@/lib/crud/modules";

export function PortfolioModulePage() {
  const projectsQuery = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [projects] = PORTFOLIO_MODULE.entities;

  return (
    <ModuleCrudShell config={PORTFOLIO_MODULE}>
      <EntityCrudSection
        config={projects}
        items={projectsQuery.data ?? []}
        isLoading={projectsQuery.isLoading}
        isMutating={createProject.isPending || updateProject.isPending}
        onCreate={async (payload) => {
          await createProject.mutateAsync({
            name: String(payload.name ?? ""),
            description: String(payload.description ?? ""),
            sort_order: Number(payload.sort_order ?? 0),
          });
        }}
        onUpdate={async (id, payload) => {
          await updateProject.mutateAsync({ id, input: payload });
        }}
        onDelete={async (id) => {
          await deleteProject.mutateAsync(id);
        }}
      />
    </ModuleCrudShell>
  );
}
