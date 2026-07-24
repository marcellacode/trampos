"use client";

import {
  EntityCrudSection,
  ModuleCrudShell,
} from "@/components/crud/module-crud-page";
import {
  useCreateNotification,
  useCreateOauthConnection,
  useCreateResumeUpload,
  useDeleteNotification,
  useDeleteOauthConnection,
  useDeleteResumeUpload,
  useNotifications,
  useOauthConnections,
  useResumeUploads,
  useUpdateNotification,
  useUpdateOauthConnection,
  useUpdateResumeUpload,
} from "@/lib/crud/hooks";
import { CONFIGURACOES_MODULE, MERCADO_MODULE } from "@/lib/crud/modules";

export function ConfiguracoesModulePage() {
  const resumeQuery = useResumeUploads();
  const createResume = useCreateResumeUpload();
  const updateResume = useUpdateResumeUpload();
  const deleteResume = useDeleteResumeUpload();

  const oauthQuery = useOauthConnections();
  const createOauth = useCreateOauthConnection();
  const updateOauth = useUpdateOauthConnection();
  const deleteOauth = useDeleteOauthConnection();

  const [resumeUploads, oauth] = CONFIGURACOES_MODULE.entities;

  return (
    <ModuleCrudShell config={CONFIGURACOES_MODULE}>
      <EntityCrudSection
        config={resumeUploads}
        items={resumeQuery.data ?? []}
        isLoading={resumeQuery.isLoading}
        isMutating={createResume.isPending || updateResume.isPending}
        onCreate={async (payload) => {
          await createResume.mutateAsync({
            original_filename: String(payload.original_filename ?? ""),
            storage_url: payload.storage_url ? String(payload.storage_url) : null,
            status: String(payload.status ?? "pending"),
          });
        }}
        onUpdate={async (id, payload) => {
          await updateResume.mutateAsync({ id, input: payload });
        }}
        onDelete={async (id) => {
          await deleteResume.mutateAsync(id);
        }}
      />

      <EntityCrudSection
        config={oauth}
        items={oauthQuery.data ?? []}
        isLoading={oauthQuery.isLoading}
        isMutating={createOauth.isPending || updateOauth.isPending}
        onCreate={async (payload) => {
          await createOauth.mutateAsync({
            provider: String(payload.provider ?? ""),
            profile_url: payload.profile_url ? String(payload.profile_url) : null,
          });
        }}
        onUpdate={async (id, payload) => {
          await updateOauth.mutateAsync({ id, input: payload });
        }}
        onDelete={async (id) => {
          await deleteOauth.mutateAsync(id);
        }}
      />
    </ModuleCrudShell>
  );
}

export function MercadoModulePage() {
  const notificationsQuery = useNotifications();
  const createNotification = useCreateNotification();
  const updateNotification = useUpdateNotification();
  const deleteNotification = useDeleteNotification();
  const [notifications] = MERCADO_MODULE.entities;

  return (
    <ModuleCrudShell config={MERCADO_MODULE}>
      <EntityCrudSection
        config={notifications}
        items={notificationsQuery.data ?? []}
        isLoading={notificationsQuery.isLoading}
        isMutating={createNotification.isPending || updateNotification.isPending}
        onCreate={async (payload) => {
          await createNotification.mutateAsync({
            title: String(payload.title ?? ""),
            description: String(payload.description ?? ""),
            href: String(payload.href ?? "/dashboard/mercado"),
          });
        }}
        onUpdate={async (id, payload) => {
          await updateNotification.mutateAsync({ id, input: payload });
        }}
        onDelete={async (id) => {
          await deleteNotification.mutateAsync(id);
        }}
      />
    </ModuleCrudShell>
  );
}
