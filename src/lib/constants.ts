export const NAV_LINKS = [
  { label: "Vagas", href: "#vagas" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Para candidatos", href: "#recursos" },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Defina seu objetivo",
    description: "Cargo, faixa salarial, modalidade e preferências.",
    icon: "Target" as const,
  },
  {
    step: 2,
    title: "Importe seu perfil",
    description: "Currículo, LinkedIn ou GitHub para montar seu perfil.",
    icon: "Brain" as const,
  },
  {
    step: 3,
    title: "Receba vagas compatíveis",
    description: "Monitoramento contínuo com score de compatibilidade.",
    icon: "Search" as const,
  },
  {
    step: 4,
    title: "Adapte o currículo",
    description: "Versão personalizada para cada vaga que você escolher.",
    icon: "FileText" as const,
  },
  {
    step: 5,
    title: "Candidate-se",
    description: "Prepare a candidatura e conclua no site da empresa.",
    icon: "Send" as const,
  },
  {
    step: 6,
    title: "Prepare entrevistas",
    description: "Simulador com perguntas baseadas na vaga.",
    icon: "Calendar" as const,
  },
  {
    step: 7,
    title: "Acompanhe tudo",
    description: "Timeline, status e próximos passos em um painel.",
    icon: "Trophy" as const,
  },
] as const;

export const FEATURES = [
  {
    title: "Discovery de vagas",
    description:
      "Vagas de múltiplas fontes reunidas com filtros e busca inteligente.",
    icon: "Sparkles" as const,
  },
  {
    title: "Currículo por vaga",
    description:
      "Gere versões do currículo destacando as skills mais relevantes.",
    icon: "FileText" as const,
  },
  {
    title: "Simulador de entrevista",
    description:
      "Pratique com perguntas contextualizadas e receba feedback.",
    icon: "MessageSquare" as const,
  },
  {
    title: "Score de compatibilidade",
    description:
      "Veja o quanto seu perfil combina com cada oportunidade.",
    icon: "TrendingUp" as const,
  },
  {
    title: "Candidatura organizada",
    description:
      "Acompanhe status, prazos e histórico sem planilhas.",
    icon: "Zap" as const,
  },
  {
    title: "Painel de carreira",
    description:
      "KPIs, timeline e recomendações em uma visão única.",
    icon: "LayoutDashboard" as const,
  },
] as const;

export const COMPARISON_FEATURES = [
  { label: "Feed profissional", indeed: false, linkedin: true, jobera: true },
  { label: "Perfis públicos", indeed: false, linkedin: true, jobera: true },
  { label: "Seguir empresas e profissionais", indeed: false, linkedin: true, jobera: true },
  { label: "Vagas internas na plataforma", indeed: false, linkedin: false, jobera: true },
  { label: "Apply interno vs externo", indeed: true, linkedin: false, jobera: true },
  { label: "Currículo adaptado por vaga", indeed: false, linkedin: false, jobera: true },
  { label: "Score de compatibilidade", indeed: false, linkedin: false, jobera: true },
  { label: "Simulador de entrevista", indeed: false, linkedin: false, jobera: true },
  { label: "Timeline de candidaturas", indeed: false, linkedin: true, jobera: true },
  { label: "Monitoramento de vagas", indeed: false, linkedin: true, jobera: true },
  { label: "Múltiplas fontes de vagas", indeed: true, linkedin: false, jobera: true },
] as const;

export type TestimonialItem = {
  name: string;
  role: string;
  company: string;
  avatar: string;
  text: string;
};

export const TESTIMONIALS: TestimonialItem[] = [];

export const FAQ_ITEMS = [
  {
    question: "Como funciona o score de compatibilidade?",
    answer:
      "Analisamos seu perfil (experiências, skills e objetivos) e comparamos com os requisitos de cada vaga. O resultado é um percentual que indica o quão alinhado você está com a oportunidade.",
  },
  {
    question: "A plataforma envia candidaturas automaticamente?",
    answer:
      "Depende da vaga. Em vagas internas (Candidatura Jobera), você envia currículo e carta direto na plataforma. Em vagas externas, a IA prepara os materiais e você conclui no site da empresa — mantendo controle total.",
  },
  {
    question: "Meu currículo é adaptado para cada vaga?",
    answer:
      "Sim. Para vagas selecionadas, geramos uma versão do currículo destacando experiências e skills mais relevantes para aquela oportunidade.",
  },
  {
    question: "De onde vêm as vagas?",
    answer:
      "Agregamos oportunidades de fontes externas (Adzuna, Remotive, RemoteOK, entre outras) e do catálogo interno, atualizadas periodicamente.",
  },
  {
    question: "É seguro compartilhar meus dados?",
    answer:
      "Utilizamos criptografia e seguimos a LGPD. Seu perfil público é opt-in: você escolhe o que exibir e pode exportar ou excluir seus dados a qualquer momento. Dados não são compartilhados com terceiros sem consentimento.",
  },
  {
    question: "Funciona para qualquer área?",
    answer:
      "Sim. O perfil e os filtros se adaptam à sua área — tecnologia, marketing, finanças, design, vendas e outras.",
  },
  {
    question: "Como funciona o simulador de entrevistas?",
    answer:
      "Com base na vaga e empresa, geramos perguntas técnicas e comportamentais. Você responde e recebe feedback para melhorar.",
  },
  {
    question: "Existe plano gratuito?",
    answer:
      "Sim. O plano gratuito inclui perfil, monitoramento de vagas e recursos básicos de candidatura.",
  },
] as const;

export const DASHBOARD_NAV = [
  { label: "Dashboard", icon: "LayoutDashboard" as const, active: true },
  { label: "Vagas", icon: "Briefcase" as const },
  { label: "Currículo", icon: "FileText" as const },
  { label: "Entrevistas", icon: "Video" as const },
  { label: "Agenda", icon: "Calendar" as const },
] as const;

export const FOOTER_LINKS = {
  produto: [
    { label: "Como funciona", href: "#como-funciona" },
    { label: "Recursos", href: "#recursos" },
    { label: "FAQ", href: "#faq" },
  ],
  empresa: [
    { label: "Sobre", href: "#" },
    { label: "Contato", href: "#contato" },
  ],
  legal: [
    { label: "Termos de Uso", href: "#" },
    { label: "Privacidade", href: "#" },
  ],
} as const;
