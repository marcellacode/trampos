"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { CrudEntityConfig, CrudFieldConfig } from "@/lib/crud/types";
import { buildPayload, getFieldValue } from "@/lib/crud/types";
import { cn } from "@/lib/utils";

interface CrudPanelProps {
  config: CrudEntityConfig;
  items: object[];
  isLoading?: boolean;
  isMutating?: boolean;
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
  onUpdate: (id: string, payload: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  className?: string;
}

function CrudField({
  field,
  value,
  onChange,
}: {
  field: CrudFieldConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `crud-${field.key}`;

  if (field.type === "textarea") {
    return (
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        rows={3}
        className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded-lg border border-input bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
      >
        <option value="">Selecione...</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={value === "true"}
          onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
        />
        {field.placeholder ?? "Ativo"}
      </label>
    );
  }

  return (
    <Input
      id={id}
      type={field.type === "number" ? "number" : "text"}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.placeholder}
      className="border-border bg-muted/40 text-foreground"
    />
  );
}

export function CrudPanel({
  config,
  items,
  isLoading,
  isMutating,
  onCreate,
  onUpdate,
  onDelete,
  className,
}: CrudPanelProps) {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const editingItem =
    editingId != null
      ? (items.find(
          (item) => config.getItemId(item) === editingId
        ) as Record<string, unknown> | undefined) ?? null
      : null;

  function openCreate() {
    const initial: Record<string, string> = {};
    for (const field of config.fields) {
      initial[field.key] =
        field.type === "checkbox" ? "false" : getFieldValue(null, field.key);
    }
    setValues(initial);
    setEditingId(null);
    setMode("create");
    setError(null);
  }

  function openEdit(item: object) {
    const record = item as Record<string, unknown>;
    const initial: Record<string, string> = {};
    for (const field of config.fields) {
      initial[field.key] = getFieldValue(record, field.key);
    }
    setValues(initial);
    setEditingId(config.getItemId(item));
    setMode("edit");
    setError(null);
  }

  function closeForm() {
    setMode("list");
    setEditingId(null);
    setValues({});
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      const payload = buildPayload(config.fields, values);

      if (mode === "create") {
        await onCreate(payload);
      } else if (mode === "edit" && editingId) {
        await onUpdate(editingId, payload);
      }

      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Deseja excluir este item?")) return;
    setError(null);

    try {
      await onDelete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6",
        className
      )}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{config.title}</h2>
          {config.description && (
            <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
          )}
        </div>
        {mode === "list" && (
          <Button
            type="button"
            size="sm"
            onClick={openCreate}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {mode !== "list" ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {config.fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={`crud-${field.key}`} className="text-muted-foreground">
                {field.label}
              </Label>
              <CrudField
                field={field}
                value={values[field.key] ?? ""}
                onChange={(value) =>
                  setValues((prev) => ({ ...prev, [field.key]: value }))
                }
              />
            </div>
          ))}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="submit"
              disabled={isMutating}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isMutating && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Criar" : "Salvar"}
            </Button>
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : isLoading ? (
        <div className="h-32 animate-pulse rounded-xl bg-muted/40" />
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          Nenhum registro ainda. Clique em Adicionar para criar o primeiro.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                {config.columns.map((column) => (
                  <th key={column.key} className="px-3 py-2 font-medium">
                    {column.label}
                  </th>
                ))}
                <th className="px-3 py-2 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const record = item as Record<string, unknown>;
                const id = config.getItemId(item);
                return (
                  <tr
                    key={id}
                    className="border-b border-white/[0.04] last:border-0"
                  >
                    {config.columns.map((column) => (
                      <td key={column.key} className="px-3 py-3 text-foreground/90">
                        {column.render
                          ? column.render(record[column.key], record)
                          : String(record[column.key] ?? "—")}
                      </td>
                    ))}
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => openEdit(item)}
                          aria-label={`Editar ${config.getItemLabel(item)}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => void handleDelete(id)}
                          aria-label={`Excluir ${config.getItemLabel(item)}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {mode === "edit" && editingItem && (
        <p className="sr-only">Editando {config.getItemLabel(editingItem)}</p>
      )}
    </section>
  );
}
