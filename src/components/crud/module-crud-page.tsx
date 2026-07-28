"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CrudPanel } from "@/components/crud/crud-panel";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import type { CrudEntityConfig, CrudModuleConfig } from "@/lib/crud/types";

interface EntityCrudSectionProps {
  config: CrudEntityConfig;
  items: object[];
  isLoading?: boolean;
  isMutating?: boolean;
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
  onUpdate: (id: string, payload: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function EntityCrudSection(props: EntityCrudSectionProps) {
  return <CrudPanel {...props} />;
}

interface ModuleCrudShellProps {
  config: CrudModuleConfig;
  children: React.ReactNode;
}

export function ModuleCrudShell({ config, children }: ModuleCrudShellProps) {
  const { shell } = useDashboardShell();

  return (
    <DashboardLayout
      user={shell.user}
      notifications={shell.notifications}
      unreadNotifications={shell.unreadNotifications}
      unreadMessages={shell.unreadMessages}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {config.title}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            {config.description}
          </p>
        </div>
        {children}
      </div>
    </DashboardLayout>
  );
}
