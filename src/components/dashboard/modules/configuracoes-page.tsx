"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  EntityCrudSection,
  ModuleCrudShell,
} from "@/components/crud/module-crud-page";
import { PrivacyDataSection } from "@/components/dashboard/privacy-data-section";
import { Button } from "@/components/ui/button";
import {
  useCreateOauthConnection,
  useCreateResumeUpload,
  useDeleteOauthConnection,
  useDeleteResumeUpload,
  useOauthConnections,
  useResumeUploads,
  useUpdateOauthConnection,
  useUpdateResumeUpload,
} from "@/lib/crud/hooks";
import { CONFIGURACOES_MODULE } from "@/lib/crud/modules";
import { cn } from "@/lib/utils";

export function ConfiguracoesModulePage() {
  const [advancedOpen, setAdvancedOpen] = useState(false);

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
      <PrivacyDataSection />

      <div className="rounded-2xl border border-border bg-card/50">
        <Button
          type="button"
          variant="ghost"
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
          aria-expanded={advancedOpen}
          onClick={() => setAdvancedOpen((open) => !open)}
        >
          Avançado — uploads e integrações OAuth
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              advancedOpen && "rotate-180"
            )}
            aria-hidden="true"
          />
        </Button>

        {advancedOpen ? (
          <div className="space-y-6 border-t border-border p-4">
            <EntityCrudSection
              config={resumeUploads}
              items={resumeQuery.data ?? []}
              isLoading={resumeQuery.isLoading}
              isMutating={createResume.isPending || updateResume.isPending}
              onCreate={async (payload) => {
                await createResume.mutateAsync({
                  original_filename: String(payload.original_filename ?? ""),
                  storage_url: payload.storage_url
                    ? String(payload.storage_url)
                    : null,
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
                  profile_url: payload.profile_url
                    ? String(payload.profile_url)
                    : null,
                });
              }}
              onUpdate={async (id, payload) => {
                await updateOauth.mutateAsync({ id, input: payload });
              }}
              onDelete={async (id) => {
                await deleteOauth.mutateAsync(id);
              }}
            />
          </div>
        ) : null}
      </div>
    </ModuleCrudShell>
  );
}
