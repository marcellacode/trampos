"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  EntityCrudSection,
  ModuleCrudShell,
} from "@/components/crud/module-crud-page";
import { AgendaEventCard } from "@/components/dashboard/agenda/agenda-event-card";
import { GuidedEmptyStateView } from "@/components/dashboard/guided-empty-state";
import { LoadingSkeletons } from "@/components/dashboard/loading-skeletons";
import { Button } from "@/components/ui/button";
import { useCareerContext } from "@/lib/career/hooks";
import { getAgendaGuidedEmptyState } from "@/lib/career/guided-empty-states";
import {
  useCreateTimelineEvent,
  useDeleteTimelineEvent,
  useTimelineEvents,
  useUpdateTimelineEvent,
} from "@/lib/crud/hooks";
import { AGENDA_MODULE } from "@/lib/crud/modules";
import { cn } from "@/lib/utils";

export function AgendaModulePage() {
  const { context, isLoading } = useCareerContext();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const timelineQuery = useTimelineEvents();
  const createEvent = useCreateTimelineEvent();
  const updateEvent = useUpdateTimelineEvent();
  const deleteEvent = useDeleteTimelineEvent();
  const [timeline] = AGENDA_MODULE.entities;

  const timelineItems = context?.upcomingEvents ?? [];

  return (
    <ModuleCrudShell config={AGENDA_MODULE}>
      {isLoading ? (
        <LoadingSkeletons />
      ) : timelineItems.length > 0 ? (
        <div className="space-y-3">
          {timelineItems.map((item) => (
            <AgendaEventCard key={item.id} item={item} />
          ))}
        </div>
      ) : context ? (
        <GuidedEmptyStateView {...getAgendaGuidedEmptyState(context)} />
      ) : null}

      <div className="rounded-2xl border border-border bg-card/50">
        <Button
          type="button"
          variant="ghost"
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
          aria-expanded={advancedOpen}
          onClick={() => setAdvancedOpen((open) => !open)}
        >
          Modo avançado — editar eventos manualmente
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              advancedOpen && "rotate-180"
            )}
            aria-hidden="true"
          />
        </Button>

        {advancedOpen ? (
          <div className="border-t border-border p-1">
            <EntityCrudSection
              config={timeline}
              items={timelineQuery.data ?? []}
              isLoading={timelineQuery.isLoading}
              isMutating={createEvent.isPending || updateEvent.isPending}
              onCreate={async (payload) => {
                await createEvent.mutateAsync({
                  title: String(payload.title ?? ""),
                  description: String(payload.description ?? ""),
                  href: String(payload.href ?? "/dashboard/agenda"),
                  event_kind: String(payload.event_kind ?? "job_found"),
                });
              }}
              onUpdate={async (id, payload) => {
                await updateEvent.mutateAsync({ id, input: payload });
              }}
              onDelete={async (id) => {
                await deleteEvent.mutateAsync(id);
              }}
            />
          </div>
        ) : null}
      </div>
    </ModuleCrudShell>
  );
}
