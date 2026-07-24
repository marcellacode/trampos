"use client";

import {
  EntityCrudSection,
  ModuleCrudShell,
} from "@/components/crud/module-crud-page";
import {
  useChatMessages,
  useDeleteChatMessage,
  useSendChatMessage,
  useUpdateChatMessage,
} from "@/lib/crud/hooks";
import { MENSAGENS_MODULE } from "@/lib/crud/modules";

export function MensagensModulePage() {
  const messagesQuery = useChatMessages("dashboard");
  const sendMessage = useSendChatMessage("dashboard");
  const updateMessage = useUpdateChatMessage("dashboard");
  const deleteMessage = useDeleteChatMessage("dashboard");
  const [messages] = MENSAGENS_MODULE.entities;

  return (
    <ModuleCrudShell config={MENSAGENS_MODULE}>
      <EntityCrudSection
        config={messages}
        items={messagesQuery.data ?? []}
        isLoading={messagesQuery.isLoading}
        isMutating={sendMessage.isPending || updateMessage.isPending}
        onCreate={async (payload) => {
          await sendMessage.mutateAsync({
            role: String(payload.role ?? "user"),
            content: String(payload.content ?? ""),
          });
        }}
        onUpdate={async (id, payload) => {
          await updateMessage.mutateAsync({
            id,
            content: String(payload.content ?? ""),
          });
        }}
        onDelete={async (id) => {
          await deleteMessage.mutateAsync(id);
        }}
      />
    </ModuleCrudShell>
  );
}

export function AssistenteModulePage() {
  const messagesQuery = useChatMessages("assistant");
  const sendMessage = useSendChatMessage("assistant");
  const updateMessage = useUpdateChatMessage("assistant");
  const deleteMessage = useDeleteChatMessage("assistant");
  const [messages] = MENSAGENS_MODULE.entities;

  return (
    <ModuleCrudShell
      config={{
        title: "Assistente IA",
        description: "Conversas com o assistente de carreira.",
        entities: [messages],
      }}
    >
      <EntityCrudSection
        config={messages}
        items={messagesQuery.data ?? []}
        isLoading={messagesQuery.isLoading}
        isMutating={sendMessage.isPending || updateMessage.isPending}
        onCreate={async (payload) => {
          await sendMessage.mutateAsync({
            role: String(payload.role ?? "user"),
            content: String(payload.content ?? ""),
          });
        }}
        onUpdate={async (id, payload) => {
          await updateMessage.mutateAsync({
            id,
            content: String(payload.content ?? ""),
          });
        }}
        onDelete={async (id) => {
          await deleteMessage.mutateAsync(id);
        }}
      />
    </ModuleCrudShell>
  );
}
