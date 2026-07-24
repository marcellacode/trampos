"use client";

import {
  EntityCrudSection,
  ModuleCrudShell,
} from "@/components/crud/module-crud-page";
import {
  useCreateTimelineEvent,
  useDeleteTimelineEvent,
  useTimelineEvents,
  useUpdateTimelineEvent,
} from "@/lib/crud/hooks";
import { AGENDA_MODULE, ENTREVISTAS_MODULE } from "@/lib/crud/modules";

export function AgendaModulePage() {
  const timelineQuery = useTimelineEvents();
  const createEvent = useCreateTimelineEvent();
  const updateEvent = useUpdateTimelineEvent();
  const deleteEvent = useDeleteTimelineEvent();
  const [timeline] = AGENDA_MODULE.entities;

  return (
    <ModuleCrudShell config={AGENDA_MODULE}>
      <EntityCrudSection
        config={timeline}
        items={timelineQuery.data ?? []}
        isLoading={timelineQuery.isLoading}
        isMutating={createEvent.isPending || updateEvent.isPending}
        onCreate={async (payload) => {
          await createEvent.mutateAsync({
            title: String(payload.title ?? ""),
            description: String(payload.description ?? ""),
            href: String(payload.href ?? "/dashboard"),
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
    </ModuleCrudShell>
  );
}

export function EntrevistasModulePage() {
  const interviewsQuery = useTimelineEvents("interview_invite");
  const createEvent = useCreateTimelineEvent();
  const updateEvent = useUpdateTimelineEvent();
  const deleteEvent = useDeleteTimelineEvent();
  const [interviews] = ENTREVISTAS_MODULE.entities;

  return (
    <ModuleCrudShell config={ENTREVISTAS_MODULE}>
      <EntityCrudSection
        config={interviews}
        items={interviewsQuery.data ?? []}
        isLoading={interviewsQuery.isLoading}
        isMutating={createEvent.isPending || updateEvent.isPending}
        onCreate={async (payload) => {
          await createEvent.mutateAsync({
            title: String(payload.title ?? ""),
            description: String(payload.description ?? ""),
            href: String(payload.href ?? "/dashboard/entrevistas"),
            event_kind: "interview_invite",
          });
        }}
        onUpdate={async (id, payload) => {
          await updateEvent.mutateAsync({ id, input: payload });
        }}
        onDelete={async (id) => {
          await deleteEvent.mutateAsync(id);
        }}
      />
    </ModuleCrudShell>
  );
}
