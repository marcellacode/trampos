"use client";

import Link from "next/link";
import { ExternalLink, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  useProfileVisibility,
  useUpdateProfileVisibility,
} from "@/lib/crud/hooks";
import type { ProfileVisibilitySettings } from "@/lib/supabase/queries/public-profile";

function SectionToggle({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        disabled={disabled}
        className="mt-0.5"
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="block text-sm text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}

function ProfileVisibilityForm({
  initial,
}: {
  initial: ProfileVisibilitySettings;
}) {
  const updateVisibility = useUpdateProfileVisibility();
  const [headline, setHeadline] = useState(initial.headline);
  const [location, setLocation] = useState(initial.location);
  const [websiteUrl, setWebsiteUrl] = useState(initial.websiteUrl ?? "");
  const [isPublic, setIsPublic] = useState(initial.isPublic);
  const [autoPostEnabled, setAutoPostEnabled] = useState(initial.autoPostEnabled);
  const [showExperiencesPublic, setShowExperiencesPublic] = useState(
    initial.showExperiencesPublic
  );
  const [showEducationPublic, setShowEducationPublic] = useState(
    initial.showEducationPublic
  );
  const [showCertificatesPublic, setShowCertificatesPublic] = useState(
    initial.showCertificatesPublic
  );
  const [showProjectsPublic, setShowProjectsPublic] = useState(
    initial.showProjectsPublic
  );

  const isSaving = updateVisibility.isPending;
  const publicUrl = initial.slug ? `/perfil/${initial.slug}` : null;

  async function handleSave() {
    await updateVisibility.mutateAsync({
      headline,
      location,
      websiteUrl: websiteUrl.trim() || null,
      isPublic,
      autoPostEnabled,
      showExperiencesPublic,
      showEducationPublic,
      showCertificatesPublic,
      showProjectsPublic,
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Visibilidade do perfil
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Controle o que visitantes veem em seu perfil público e no feed.
          </p>
        </div>
        {publicUrl ? (
          <Button variant="outline" size="sm" render={<Link href={publicUrl} target="_blank" />}>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Ver perfil público
          </Button>
        ) : null}
      </div>

      <div className="mt-6 space-y-4">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <Checkbox
            checked={isPublic}
            onCheckedChange={(checked) => setIsPublic(checked === true)}
            disabled={isSaving}
            className="mt-0.5"
          />
          <span className="space-y-1">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              {isPublic ? (
                <Eye className="h-4 w-4 text-primary" aria-hidden="true" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
              Perfil público
            </span>
            <span className="block text-sm text-muted-foreground">
              Quando ativado, qualquer pessoa pode ver seu perfil em seu link público.
            </span>
          </span>
        </label>

        <SectionToggle
          label="Compartilhar conquistas automaticamente no feed"
          description="Publica no feed quando você conclui onboarding, adiciona certificação ou se candidata a vagas internas. Você pode excluir esses posts depois."
          checked={autoPostEnabled}
          onCheckedChange={setAutoPostEnabled}
          disabled={isSaving}
        />

        {isPublic ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Seções visíveis no perfil</p>
            <SectionToggle
              label="Experiências"
              description="Histórico profissional no perfil público."
              checked={showExperiencesPublic}
              onCheckedChange={setShowExperiencesPublic}
              disabled={isSaving}
            />
            <SectionToggle
              label="Educação e cursos"
              description="Formação acadêmica e cursos complementares."
              checked={showEducationPublic}
              onCheckedChange={setShowEducationPublic}
              disabled={isSaving}
            />
            <SectionToggle
              label="Certificados"
              description="Certificações profissionais."
              checked={showCertificatesPublic}
              onCheckedChange={setShowCertificatesPublic}
              disabled={isSaving}
            />
            <SectionToggle
              label="Projetos"
              description="Portfólio e projetos pessoais."
              checked={showProjectsPublic}
              onCheckedChange={setShowProjectsPublic}
              disabled={isSaving}
            />
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="profile-headline" className="text-sm font-medium text-foreground">
              Headline
            </label>
            <Input
              id="profile-headline"
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              placeholder="Ex.: Desenvolvedor Full Stack · React & Node"
              disabled={isSaving}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="profile-location" className="text-sm font-medium text-foreground">
              Localização
            </label>
            <Input
              id="profile-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Ex.: São Paulo, SP · Remoto"
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="profile-website" className="text-sm font-medium text-foreground">
            Site / portfólio
          </label>
          <Input
            id="profile-website"
            type="url"
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
            placeholder="https://seusite.com"
            disabled={isSaving}
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Salvando…
              </>
            ) : (
              "Salvar visibilidade"
            )}
          </Button>
          {updateVisibility.isSuccess ? (
            <span className="text-sm text-primary">Alterações salvas.</span>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function ProfileVisibilitySection() {
  const { data, isLoading } = useProfileVisibility();

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5 sm:p-6">
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Carregando configurações…
        </div>
      ) : data ? (
        <ProfileVisibilityForm
          key={`${data.slug ?? "no-slug"}-${data.isPublic}-${data.autoPostEnabled}-${data.headline}`}
          initial={data}
        />
      ) : null}
    </section>
  );
}
