export const NAV_LINKS = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Recursos", href: "#recursos" },
  { label: "Para Empresas", href: "#empresas" },
  { label: "Preços", href: "#precos" },
  { label: "Contato", href: "#contato" },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Conte seus objetivos",
    description: "Defina cargo, salário, modalidade e preferências.",
    icon: "Target" as const,
  },
  {
    step: 2,
    title: "Nossa IA entende seu perfil",
    description: "Análise profunda de skills, experiência e fit cultural.",
    icon: "Brain" as const,
  },
  {
    step: 3,
    title: "Ela procura milhares de vagas",
    description: "Monitoramento contínuo em centenas de fontes.",
    icon: "Search" as const,
  },
  {
    step: 4,
    title: "Personaliza seu currículo",
    description: "Adaptação automática para cada vaga específica.",
    icon: "FileText" as const,
  },
  {
    step: 5,
    title: "Se candidata",
    description: "Aplicação automática com sua aprovação.",
    icon: "Send" as const,
  },
  {
    step: 6,
    title: "Agenda entrevistas",
    description: "Coordena horários e envia lembretes.",
    icon: "Calendar" as const,
  },
  {
    step: 7,
    title: "Você recebe propostas",
    description: "Acompanhe ofertas e negocie com suporte da IA.",
    icon: "Trophy" as const,
  },
] as const;

export const FEATURES = [
  {
    title: "IA encontra vagas",
    description:
      "Monitora milhares de vagas diariamente e identifica as mais compatíveis com seu perfil.",
    icon: "Sparkles" as const,
  },
  {
    title: "Currículo Inteligente",
    description:
      "Adapta automaticamente seu currículo para cada vaga, destacando as skills certas.",
    icon: "FileText" as const,
  },
  {
    title: "Entrevistas IA",
    description:
      "Simula entrevistas reais e fornece feedback personalizado para você se preparar.",
    icon: "MessageSquare" as const,
  },
  {
    title: "Mercado em tempo real",
    description:
      "Insights sobre salários, demanda e tendências do mercado para sua área.",
    icon: "TrendingUp" as const,
  },
  {
    title: "Aplicação automática",
    description:
      "Envia candidaturas personalizadas enquanto você foca no que importa.",
    icon: "Zap" as const,
  },
  {
    title: "Dashboard de carreira",
    description:
      "Visualize todo o progresso, métricas e próximos passos em um só lugar.",
    icon: "LayoutDashboard" as const,
  },
] as const;

export const COMPARISON_FEATURES = [
  { label: "IA adapta currículo", indeed: false, linkedin: false, jobera: true },
  { label: "Aplicação automática", indeed: false, linkedin: false, jobera: true },
  { label: "Feedback inteligente", indeed: false, linkedin: false, jobera: true },
  { label: "Compatibilidade %", indeed: false, linkedin: false, jobera: true },
  { label: "Treino para entrevista", indeed: false, linkedin: false, jobera: true },
  { label: "Monitoramento diário", indeed: false, linkedin: true, jobera: true },
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
    question: "Como a IA encontra vagas compatíveis com meu perfil?",
    answer:
      "Nossa IA analisa seu currículo, experiências, skills e objetivos de carreira. Em seguida, monitora vagas em múltiplas fontes e calcula um score de compatibilidade para cada oportunidade.",
  },
  {
    question: "A IA realmente envia candidaturas por mim?",
    answer:
      "Sim, mas sempre com sua aprovação. A IA prepara candidaturas personalizadas e você decide quais enviar. Você mantém controle total sobre cada aplicação.",
  },
  {
    question: "Meu currículo é adaptado para cada vaga?",
    answer:
      "Exatamente. Para cada vaga selecionada, a IA reescreve seu currículo destacando as experiências e skills mais relevantes, aumentando significativamente suas chances.",
  },
  {
    question: "Quanto tempo leva para ver resultados?",
    answer:
      "A maioria dos usuários recebe as primeiras respostas em 7-14 dias. A IA trabalha 24/7, então quanto antes você começar, mais rápido verá oportunidades.",
  },
  {
    question: "É seguro compartilhar meus dados?",
    answer:
      "Absolutamente. Utilizamos criptografia de ponta a ponta e seguimos a LGPD. Seus dados nunca são compartilhados com terceiros sem seu consentimento explícito.",
  },
  {
    question: "Funciona para qualquer área de atuação?",
    answer:
      "Sim! Temos sucesso em tecnologia, marketing, finanças, design, vendas, engenharia e dezenas de outras áreas. A IA se adapta ao mercado específico de cada setor.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Sim, sem multas ou burocracia. Você pode cancelar sua assinatura a qualquer momento diretamente no dashboard, e continuará tendo acesso até o fim do período pago.",
  },
  {
    question: "Como funciona o treino para entrevistas?",
    answer:
      "Nossa IA simula entrevistas reais baseadas na vaga e empresa específica. Ela faz perguntas técnicas e comportamentais, avalia suas respostas e fornece feedback detalhado para melhorar.",
  },
  {
    question: "Qual a diferença para o LinkedIn ou Indeed?",
    answer:
      "LinkedIn e Indeed são plataformas de busca — você ainda precisa fazer todo o trabalho. Jobera é um agente autônomo que trabalha ativamente por você: busca, adapta, aplica e acompanha.",
  },
  {
    question: "Existe plano gratuito?",
    answer:
      "Sim! O plano gratuito inclui análise de perfil, monitoramento de vagas e 5 candidaturas por mês. Planos pagos desbloqueiam aplicações ilimitadas e recursos avançados.",
  },
] as const;

export const DASHBOARD_NAV = [
  { label: "Dashboard", icon: "LayoutDashboard" as const, active: true },
  { label: "Vagas", icon: "Briefcase" as const },
  { label: "IA", icon: "Sparkles" as const },
  { label: "Currículo", icon: "FileText" as const },
  { label: "Mercado", icon: "TrendingUp" as const },
  { label: "Entrevistas", icon: "Video" as const },
  { label: "Agenda", icon: "Calendar" as const },
] as const;

export const FOOTER_LINKS = {
  produto: [
    { label: "Como funciona", href: "#como-funciona" },
    { label: "Recursos", href: "#recursos" },
    { label: "Preços", href: "#precos" },
    { label: "Para Empresas", href: "#empresas" },
  ],
  empresa: [
    { label: "Sobre", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Carreiras", href: "#" },
    { label: "Contato", href: "#contato" },
  ],
  legal: [
    { label: "Termos de Uso", href: "#" },
    { label: "Privacidade", href: "#" },
    { label: "Cookies", href: "#" },
  ],
} as const;
