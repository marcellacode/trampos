import type { ReactNode } from "react";

export type CrudFieldType = "text" | "textarea" | "number" | "select" | "checkbox";

export interface CrudFieldOption {
  value: string;
  label: string;
}

export interface CrudFieldConfig {
  key: string;
  label: string;
  type?: CrudFieldType;
  placeholder?: string;
  required?: boolean;
  options?: CrudFieldOption[];
}

export interface CrudColumnConfig {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
}

export interface CrudEntityConfig {
  id: string;
  title: string;
  description?: string;
  fields: CrudFieldConfig[];
  columns: CrudColumnConfig[];
  getItemId: (item: object) => string;
  getItemLabel: (item: object) => string;
}

export interface CrudModuleConfig {
  title: string;
  description: string;
  entities: CrudEntityConfig[];
}

export function crudRow(item: object): Record<string, unknown> {
  return item as Record<string, unknown>;
}

export function getFieldValue(
  item: Record<string, unknown> | null,
  key: string
): string {
  if (!item) return "";
  const value = item[key];
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

export function asCrudItems<T extends object>(
  items: T[] | undefined
): Record<string, unknown>[] {
  return (items ?? []) as unknown as Record<string, unknown>[];
}

export function buildPayload(
  fields: CrudFieldConfig[],
  values: Record<string, string>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    const raw = values[field.key]?.trim() ?? "";
    if (!raw && field.type !== "checkbox") {
      if (field.required) payload[field.key] = "";
      continue;
    }

    switch (field.type) {
      case "number":
        payload[field.key] = raw ? Number(raw) : 0;
        break;
      case "checkbox":
        payload[field.key] = raw === "true";
        break;
      default:
        payload[field.key] = raw;
    }
  }

  return payload;
}
