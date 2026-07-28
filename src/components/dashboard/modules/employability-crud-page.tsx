"use client";

import {
  EntityCrudSection,
  ModuleCrudShell,
} from "@/components/crud/module-crud-page";
import {
  useCreateEmployabilitySkill,
  useCreateDailyMission,
  useDailyMissions,
  useDeleteDailyMission,
  useDeleteEmployabilitySkill,
  useEmployabilitySkills,
  useUpdateDailyMission,
  useUpdateEmployabilitySkill,
  useCompleteDailyMission,
} from "@/lib/crud/hooks";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { CrudModuleConfig } from "@/lib/crud/types";
import { crudRow } from "@/lib/crud/types";

const EMPREGABILIDADE_CRUD: CrudModuleConfig = {
  title: "Empregabilidade",
  description: "Gerencie missões diárias e competências de empregabilidade.",
  entities: [
    {
      id: "missions",
      title: "Missões diárias",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) => String(crudRow(item).label),
      fields: [
        { key: "label", label: "Missão", required: true },
        { key: "uplift_percent", label: "Ganho (%)", type: "number" as const },
        { key: "href", label: "Link" },
      ],
      columns: [
        { key: "label", label: "Missão" },
        { key: "uplift_percent", label: "Ganho" },
        {
          key: "is_completed",
          label: "Concluída",
          render: (value: unknown) => (value ? "Sim" : "Não"),
        },
      ],
    },
    {
      id: "skills",
      title: "Competências",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) => String(crudRow(item).label),
      fields: [
        { key: "label", label: "Competência", required: true },
        { key: "score", label: "Score", type: "number" as const },
        { key: "uplift_percent", label: "Ganho (%)", type: "number" as const },
        { key: "explanation", label: "Explicação", type: "textarea" as const },
      ],
      columns: [
        { key: "label", label: "Competência" },
        { key: "score", label: "Score" },
        { key: "uplift_percent", label: "Ganho" },
      ],
    },
  ],
};

export function EmployabilityCrudSection() {
  const missionsQuery = useDailyMissions();
  const createMission = useCreateDailyMission();
  const updateMission = useUpdateDailyMission();
  const deleteMission = useDeleteDailyMission();
  const completeMission = useCompleteDailyMission();

  const skillsQuery = useEmployabilitySkills();
  const createSkill = useCreateEmployabilitySkill();
  const updateSkill = useUpdateEmployabilitySkill();
  const deleteSkill = useDeleteEmployabilitySkill();

  const [missions, skills] = EMPREGABILIDADE_CRUD.entities;

  return (
    <div className="space-y-6">
      <EntityCrudSection
        config={missions}
        items={missionsQuery.data ?? []}
        isLoading={missionsQuery.isLoading}
        isMutating={
          createMission.isPending ||
          updateMission.isPending ||
          completeMission.isPending
        }
        onCreate={async (payload) => {
          await createMission.mutateAsync({
            label: String(payload.label ?? ""),
            uplift_percent: Number(payload.uplift_percent ?? 0),
            href: String(payload.href ?? "/dashboard/empregabilidade"),
          });
        }}
        onUpdate={async (id, payload) => {
          await updateMission.mutateAsync({ id, input: payload });
        }}
        onDelete={async (id) => {
          await deleteMission.mutateAsync(id);
        }}
      />

      {(missionsQuery.data ?? []).some(
        (item) => !item.is_completed
      ) && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-3 text-sm text-muted-foreground">
            Concluir missões atualiza seu score de empregabilidade.
          </p>
          <div className="flex flex-wrap gap-2">
            {(missionsQuery.data ?? [])
              .filter((item) => !item.is_completed)
              .map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={completeMission.isPending}
                  onClick={() => void completeMission.mutateAsync(item.id)}
                >
                  <Check className="h-4 w-4" />
                  Concluir: {item.label}
                </Button>
              ))}
          </div>
        </div>
      )}

      <EntityCrudSection
        config={skills}
        items={skillsQuery.data ?? []}
        isLoading={skillsQuery.isLoading}
        isMutating={createSkill.isPending || updateSkill.isPending}
        onCreate={async (payload) => {
          await createSkill.mutateAsync({
            label: String(payload.label ?? ""),
            score: Number(payload.score ?? 0),
            uplift_percent: Number(payload.uplift_percent ?? 0),
            explanation: String(payload.explanation ?? ""),
          });
        }}
        onUpdate={async (id, payload) => {
          await updateSkill.mutateAsync({ id, input: payload });
        }}
        onDelete={async (id) => {
          await deleteSkill.mutateAsync(id);
        }}
      />
    </div>
  );
}

export function EmployabilityCrudPage() {
  return (
    <ModuleCrudShell config={EMPREGABILIDADE_CRUD}>
      <EmployabilityCrudSection />
    </ModuleCrudShell>
  );
}
