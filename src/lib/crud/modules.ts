import type { CrudModuleConfig } from "@/lib/crud/types";
import { crudRow } from "@/lib/crud/types";

export const CURRICULO_MODULE: CrudModuleConfig = {
  title: "Currículo",
  description:
    "Gerencie experiências, formação, habilidades, idiomas, certificados e cursos do seu perfil profissional.",
  entities: [
    {
      id: "experiences",
      title: "Experiências",
      description: "Histórico profissional exibido no seu perfil.",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) =>
        String(crudRow(item).role ?? crudRow(item).company ?? "experiência"),
      fields: [
        { key: "company", label: "Empresa", required: true },
        { key: "role", label: "Cargo", required: true },
        { key: "period_label", label: "Período", placeholder: "2022 — Atual" },
        { key: "description", label: "Descrição", type: "textarea" },
        { key: "sort_order", label: "Ordem", type: "number" },
      ],
      columns: [
        { key: "company", label: "Empresa" },
        { key: "role", label: "Cargo" },
        { key: "period_label", label: "Período" },
      ],
    },
    {
      id: "education",
      title: "Formação acadêmica",
      description: "Graduações, pós-graduações e estudos formais.",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) =>
        String(crudRow(item).degree ?? crudRow(item).institution ?? "formação"),
      fields: [
        { key: "institution", label: "Instituição", required: true },
        { key: "degree", label: "Grau", placeholder: "Bacharelado, Mestrado…" },
        { key: "field_of_study", label: "Área de estudo" },
        {
          key: "start_date",
          label: "Início",
          placeholder: "AAAA-MM-DD",
        },
        {
          key: "end_date",
          label: "Conclusão",
          placeholder: "AAAA-MM-DD",
        },
        { key: "is_current", label: "Em andamento", type: "checkbox" },
        { key: "description", label: "Descrição", type: "textarea" },
        { key: "sort_order", label: "Ordem", type: "number" },
      ],
      columns: [
        { key: "institution", label: "Instituição" },
        { key: "degree", label: "Grau" },
        { key: "field_of_study", label: "Área" },
        {
          key: "start_date",
          label: "Período",
          render: (_value, row) => {
            const start = row.start_date ? String(row.start_date).slice(0, 4) : "";
            const end = row.is_current
              ? "Atual"
              : row.end_date
                ? String(row.end_date).slice(0, 4)
                : "";
            return start && end ? `${start} — ${end}` : start || end || "—";
          },
        },
      ],
    },
    {
      id: "skills",
      title: "Habilidades",
      description: "Competências técnicas e comportamentais.",
      getItemId: (item) => String(crudRow(item).skill_name),
      getItemLabel: (item) => String(crudRow(item).skill_name),
      fields: [
        { key: "skill_name", label: "Habilidade", required: true },
        { key: "sort_order", label: "Ordem", type: "number" },
      ],
      columns: [{ key: "skill_name", label: "Habilidade" }],
    },
    {
      id: "languages",
      title: "Idiomas",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) => String(crudRow(item).name),
      fields: [
        { key: "name", label: "Idioma", required: true },
        { key: "level_label", label: "Nível", placeholder: "Avançado" },
        { key: "sort_order", label: "Ordem", type: "number" },
      ],
      columns: [
        { key: "name", label: "Idioma" },
        { key: "level_label", label: "Nível" },
      ],
    },
    {
      id: "certificates",
      title: "Certificados",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) => String(crudRow(item).name),
      fields: [
        { key: "name", label: "Certificado", required: true },
        { key: "issuer", label: "Emissor" },
        { key: "year_label", label: "Ano" },
        { key: "sort_order", label: "Ordem", type: "number" },
      ],
      columns: [
        { key: "name", label: "Certificado" },
        { key: "issuer", label: "Emissor" },
        { key: "year_label", label: "Ano" },
      ],
    },
    {
      id: "courses",
      title: "Cursos",
      description: "Cursos livres e complementares (distintos de certificados).",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) => String(crudRow(item).name),
      fields: [
        { key: "name", label: "Curso", required: true },
        { key: "provider", label: "Provedor / plataforma" },
        {
          key: "completion_date",
          label: "Conclusão",
          placeholder: "AAAA-MM-DD",
        },
        {
          key: "credential_url",
          label: "URL da credencial",
          placeholder: "https://…",
        },
        { key: "description", label: "Descrição", type: "textarea" },
        { key: "sort_order", label: "Ordem", type: "number" },
      ],
      columns: [
        { key: "name", label: "Curso" },
        { key: "provider", label: "Provedor" },
        {
          key: "completion_date",
          label: "Conclusão",
          render: (value) =>
            value ? String(value).slice(0, 4) : "—",
        },
      ],
    },
  ],
};

export const PORTFOLIO_MODULE: CrudModuleConfig = {
  title: "Portfólio",
  description: "Projetos destacados que reforçam sua candidatura.",
  entities: [
    {
      id: "projects",
      title: "Projetos",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) => String(crudRow(item).name),
      fields: [
        { key: "name", label: "Nome", required: true },
        { key: "description", label: "Descrição", type: "textarea" },
        { key: "sort_order", label: "Ordem", type: "number" },
      ],
      columns: [
        { key: "name", label: "Projeto" },
        {
          key: "description",
          label: "Descrição",
          render: (value) =>
            String(value ?? "").slice(0, 80) +
            (String(value ?? "").length > 80 ? "…" : ""),
        },
      ],
    },
  ],
};

export const OBJETIVOS_MODULE: CrudModuleConfig = {
  title: "Objetivos",
  description: "Metas de carreira e filtros inteligentes de descoberta.",
  entities: [
    {
      id: "goal-chips",
      title: "Metas",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) => String(crudRow(item).label),
      fields: [
        { key: "label", label: "Meta", required: true },
        {
          key: "category",
          label: "Categoria",
          type: "select",
          required: true,
          options: [
            { value: "role", label: "Cargo" },
            { value: "location", label: "Localização" },
            { value: "salary", label: "Salário" },
            { value: "other", label: "Outro" },
          ],
        },
        { key: "sort_order", label: "Ordem", type: "number" },
      ],
      columns: [
        { key: "label", label: "Meta" },
        { key: "category", label: "Categoria" },
      ],
    },
    {
      id: "smart-filters",
      title: "Filtros Inteligentes",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) => String(crudRow(item).label),
      fields: [
        { key: "label", label: "Filtro", required: true },
        { key: "is_active", label: "Ativo", type: "checkbox" },
        { key: "sort_order", label: "Ordem", type: "number" },
      ],
      columns: [
        { key: "label", label: "Filtro" },
        {
          key: "is_active",
          label: "Ativo",
          render: (value) => (value ? "Sim" : "Não"),
        },
      ],
    },
  ],
};

export const MENSAGENS_MODULE: CrudModuleConfig = {
  title: "Mensagens",
  description: "Histórico e envio de mensagens do copiloto.",
  entities: [
    {
      id: "messages",
      title: "Conversas",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) => String(crudRow(item).content).slice(0, 40),
      fields: [
        {
          key: "role",
          label: "Autor",
          type: "select",
          required: true,
          options: [
            { value: "user", label: "Você" },
            { value: "assistant", label: "Assistente" },
          ],
        },
        { key: "content", label: "Mensagem", type: "textarea", required: true },
      ],
      columns: [
        { key: "role", label: "Autor" },
        {
          key: "content",
          label: "Conteúdo",
          render: (value) =>
            String(value ?? "").slice(0, 100) +
            (String(value ?? "").length > 100 ? "…" : ""),
        },
        { key: "created_at", label: "Enviado em" },
      ],
    },
  ],
};

export const EMPRESAS_MODULE: CrudModuleConfig = {
  title: "Empresas Favoritas",
  description: "Empresas que você acompanha e candidaturas em andamento.",
  entities: [
    {
      id: "applications",
      title: "Candidaturas",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) => String(crudRow(item).role_title),
      fields: [
        { key: "role_title", label: "Cargo", required: true },
        { key: "company_id", label: "ID da empresa", required: true },
        { key: "job_id", label: "ID da vaga" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "interested", label: "Interessado" },
            { value: "applied", label: "Candidatado" },
            { value: "interview", label: "Entrevista" },
            { value: "offer", label: "Proposta" },
            { value: "rejected", label: "Recusado" },
          ],
        },
        { key: "status_label", label: "Rótulo do status" },
      ],
      columns: [
        { key: "role_title", label: "Cargo" },
        { key: "status", label: "Status" },
        { key: "status_label", label: "Rótulo" },
      ],
    },
    {
      id: "favorites",
      title: "Empresas favoritas",
      getItemId: (item) => String(crudRow(item).company_id),
      getItemLabel: (item) => String(crudRow(item).company_id),
      fields: [
        { key: "company_id", label: "ID da empresa", required: true },
        { key: "compatibility", label: "Compatibilidade (%)", type: "number" },
      ],
      columns: [
        { key: "company_id", label: "Empresa" },
        { key: "compatibility", label: "Compatibilidade" },
      ],
    },
  ],
};

export const AGENDA_MODULE: CrudModuleConfig = {
  title: "Agenda",
  description: "Eventos da sua jornada de candidaturas.",
  entities: [
    {
      id: "timeline",
      title: "Eventos",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) => String(crudRow(item).title),
      fields: [
        { key: "title", label: "Título", required: true },
        { key: "description", label: "Descrição", type: "textarea" },
        { key: "href", label: "Link", placeholder: "/dashboard" },
        {
          key: "event_kind",
          label: "Tipo",
          type: "select",
          required: true,
          options: [
            { value: "job_found", label: "Vaga encontrada" },
            { value: "application_sent", label: "Candidatura enviada" },
            { value: "interview_invite", label: "Convite entrevista" },
            { value: "company_viewed", label: "Empresa visualizou" },
          ],
        },
      ],
      columns: [
        { key: "title", label: "Título" },
        { key: "event_kind", label: "Tipo" },
        { key: "created_at", label: "Data" },
      ],
    },
  ],
};

export const ENTREVISTAS_MODULE: CrudModuleConfig = {
  title: "Entrevistas",
  description: "Convites e preparação para entrevistas.",
  entities: [
    {
      id: "interviews",
      title: "Entrevistas agendadas",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) => String(crudRow(item).title),
      fields: [
        { key: "title", label: "Título", required: true },
        { key: "description", label: "Detalhes", type: "textarea" },
        { key: "href", label: "Link" },
      ],
      columns: [
        { key: "title", label: "Entrevista" },
        { key: "description", label: "Detalhes" },
        { key: "created_at", label: "Data" },
      ],
    },
  ],
};

export const CONFIGURACOES_MODULE: CrudModuleConfig = {
  title: "Configurações",
  description: "Perfil, integrações e uploads de currículo.",
  entities: [
    {
      id: "resume-uploads",
      title: "Uploads de currículo",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) => String(crudRow(item).original_filename),
      fields: [
        { key: "original_filename", label: "Arquivo", required: true },
        { key: "storage_url", label: "URL" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "pending", label: "Pendente" },
            { value: "processed", label: "Processado" },
            { value: "failed", label: "Falhou" },
          ],
        },
      ],
      columns: [
        { key: "original_filename", label: "Arquivo" },
        { key: "status", label: "Status" },
      ],
    },
    {
      id: "oauth",
      title: "Conexões OAuth",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) => String(crudRow(item).provider),
      fields: [
        {
          key: "provider",
          label: "Provedor",
          type: "select",
          required: true,
          options: [
            { value: "linkedin", label: "LinkedIn" },
            { value: "github", label: "GitHub" },
            { value: "google", label: "Google" },
          ],
        },
        { key: "profile_url", label: "URL do perfil" },
      ],
      columns: [
        { key: "provider", label: "Provedor" },
        { key: "profile_url", label: "Perfil" },
      ],
    },
  ],
};

export const ASSISTENTE_MODULE: CrudModuleConfig = {
  title: "Assistente IA",
  description: "Conversas com o assistente de carreira.",
  entities: MENSAGENS_MODULE.entities,
};

export const MERCADO_MODULE: CrudModuleConfig = {
  title: "Mercado",
  description: "Notificações e insights personalizados de mercado.",
  entities: [
    {
      id: "notifications",
      title: "Alertas de mercado",
      getItemId: (item) => String(crudRow(item).id),
      getItemLabel: (item) => String(crudRow(item).title),
      fields: [
        { key: "title", label: "Título", required: true },
        { key: "description", label: "Descrição", type: "textarea" },
        { key: "href", label: "Link" },
      ],
      columns: [
        { key: "title", label: "Alerta" },
        { key: "description", label: "Descrição" },
      ],
    },
  ],
};

export const VAGAS_CRUD_MODULE: CrudModuleConfig = {
  title: "Vagas ocultas",
  description: "Gerencie vagas que você ocultou na descoberta.",
  entities: [
    {
      id: "hidden-jobs",
      title: "Vagas ocultas",
      getItemId: (item) => String(crudRow(item).job_id),
      getItemLabel: (item) => String(crudRow(item).job_id),
      fields: [
        { key: "job_id", label: "ID da vaga", required: true },
        {
          key: "reason",
          label: "Motivo",
          type: "select",
          options: [
            { value: "not_relevant", label: "Não relevante" },
            { value: "already_applied", label: "Já candidatado" },
            { value: "salary", label: "Salário" },
            { value: "other", label: "Outro" },
          ],
        },
      ],
      columns: [
        { key: "job_id", label: "Vaga" },
        { key: "reason", label: "Motivo" },
        { key: "hidden_at", label: "Ocultada em" },
      ],
    },
  ],
};

export const MODULE_REGISTRY: Record<string, CrudModuleConfig> = {
  curriculo: CURRICULO_MODULE,
  portfolio: PORTFOLIO_MODULE,
  objetivos: OBJETIVOS_MODULE,
  mensagens: MENSAGENS_MODULE,
  empresas: EMPRESAS_MODULE,
  agenda: AGENDA_MODULE,
  entrevistas: ENTREVISTAS_MODULE,
  configuracoes: CONFIGURACOES_MODULE,
  assistente: ASSISTENTE_MODULE,
  mercado: MERCADO_MODULE,
};
