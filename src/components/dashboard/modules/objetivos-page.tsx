"use client";

import {
  EntityCrudSection,
  ModuleCrudShell,
} from "@/components/crud/module-crud-page";
import {
  useCreateGoalChip,
  useCreateSmartFilter,
  useDeleteGoalChip,
  useDeleteSmartFilter,
  useGoalChips,
  useSmartFilters,
  useUpdateGoalChip,
  useUpdateSmartFilter,
} from "@/lib/crud/hooks";
import { OBJETIVOS_MODULE } from "@/lib/crud/modules";

export function ObjetivosModulePage() {
  const goalChipsQuery = useGoalChips();
  const createGoalChip = useCreateGoalChip();
  const updateGoalChip = useUpdateGoalChip();
  const deleteGoalChip = useDeleteGoalChip();

  const smartFiltersQuery = useSmartFilters();
  const createSmartFilter = useCreateSmartFilter();
  const updateSmartFilter = useUpdateSmartFilter();
  const deleteSmartFilter = useDeleteSmartFilter();

  const [goalChips, smartFilters] = OBJETIVOS_MODULE.entities;

  return (
    <ModuleCrudShell config={OBJETIVOS_MODULE}>
      <EntityCrudSection
        config={goalChips}
        items={goalChipsQuery.data ?? []}
        isLoading={goalChipsQuery.isLoading}
        isMutating={createGoalChip.isPending || updateGoalChip.isPending}
        onCreate={async (payload) => {
          await createGoalChip.mutateAsync({
            label: String(payload.label ?? ""),
            category: String(payload.category ?? "other"),
            sort_order: Number(payload.sort_order ?? 0),
          });
        }}
        onUpdate={async (id, payload) => {
          await updateGoalChip.mutateAsync({ id, input: payload });
        }}
        onDelete={async (id) => {
          await deleteGoalChip.mutateAsync(id);
        }}
      />

      <EntityCrudSection
        config={smartFilters}
        items={smartFiltersQuery.data ?? []}
        isLoading={smartFiltersQuery.isLoading}
        isMutating={createSmartFilter.isPending || updateSmartFilter.isPending}
        onCreate={async (payload) => {
          await createSmartFilter.mutateAsync({
            label: String(payload.label ?? ""),
            is_active: Boolean(payload.is_active),
            sort_order: Number(payload.sort_order ?? 0),
          });
        }}
        onUpdate={async (id, payload) => {
          await updateSmartFilter.mutateAsync({ id, input: payload });
        }}
        onDelete={async (id) => {
          await deleteSmartFilter.mutateAsync(id);
        }}
      />
    </ModuleCrudShell>
  );
}
