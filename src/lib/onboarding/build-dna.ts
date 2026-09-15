import type { ExtractedProfile, GoalChip, ProfessionalDna, SalaryRange } from "@/types/onboarding";

const UNDEFINED_SALARY: SalaryRange = { currency: "BRL", min: 0, max: 0, label: "Brasil" };
const UNDEFINED_SALARY_USD: SalaryRange = { currency: "USD", min: 0, max: 0, label: "Internacional" };

type Domain = { label: string; terms: string[] };
const DOMAINS: Domain[] = [
  { label: "Desenvolvimento Full Stack", terms: ["javascript","typescript","react","next.js","nextjs","node","node.js","express","api rest","postgresql","mysql","prisma","full stack","fullstack"] },
  { label: "Desenvolvimento Front-end", terms: ["frontend","front-end","react","angular","vue","html","css","tailwind","bootstrap","ui/ux","figma"] },
  { label: "Desenvolvimento Back-end", terms: ["backend","back-end","node","node.js","express","python","java","c#","api","api rest","postgresql","mysql","sql","prisma"] },
  { label: "Infraestrutura e Suporte de TI", terms: ["suporte técnico","hardware","software","manutenção","computadores","impressoras","periféricos","anydesk","teamviewer","ativos de ti","inventário","infraestrutura","help desk","service desk","redes"] },
  { label: "Dados e Banco de Dados", terms: ["sql","postgresql","mysql","power bi","data","dados","banco de dados","python","excel"] },
  { label: "Cibersegurança", terms: ["cibersegurança","cybersecurity","segurança da informação","security","soc","pentest"] },
  { label: "Design e Experiência Digital", terms: ["ui/ux","figma","photoshop","web design","design","ux","ui"] },
  { label: "Marketing e Conteúdo Digital", terms: ["seo","marketing","social media","conteúdo","copywriting","analytics"] },
];

function normalized(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

function inferPredominantProfile(profile: ExtractedProfile): string {
  const scores = new Map<string, number>(DOMAINS.map((d) => [d.label, 0]));
  const scoreText = (text: string, weight: number) => {
    const haystack = normalized(text);
    for (const domain of DOMAINS) {
      for (const term of domain.terms) if (haystack.includes(normalized(term))) scores.set(domain.label, (scores.get(domain.label) ?? 0) + weight);
    }
  };

  // Competências são o sinal mais forte do que a pessoa sabe fazer hoje.
  profile.skills.forEach((skill) => scoreText(skill, 5));
  // Projetos demonstram aplicação prática das competências.
  profile.projects.forEach((project) => { scoreText(project.name, 2); scoreText(project.description, 2); project.tech.forEach((tech) => scoreText(tech, 4)); });
  // Certificados e cursos importados do currículo demonstram formação complementar.
  profile.certificates.forEach((certificate) => { scoreText(certificate.name, 4); scoreText(certificate.issuer, 1); });
  // Resumo e cargo ajudam, mas não dominam o resultado.
  scoreText(profile.summary, 1.5);
  scoreText(profile.currentRole, 1);
  // Experiência profissional é evidência complementar, não a fonte principal.
  profile.experiences.forEach((experience) => { scoreText(experience.role, 1); scoreText(experience.description, 0.5); });

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  if (!ranked[0] || ranked[0][1] <= 0) return profile.currentRole || "Perfil multidisciplinar";

  const [first, second] = ranked;
  // Quando dois eixos são realmente fortes e próximos, representa o perfil como híbrido.
  if (second && second[1] >= first[1] * 0.78 && second[1] >= 8) return `${first[0]} · ${second[0]}`;
  return first[0];
}

export function buildProfessionalDnaFromProfile(profile: ExtractedProfile, _goalChips: GoalChip[] = []): ProfessionalDna {
  const strengths = profile.skills.length > 0
    ? profile.skills.slice(0, 5).map((skill) => `Competência em ${skill}`)
    : profile.certificates.length > 0
      ? profile.certificates.slice(0, 3).map((cert) => `Formação em ${cert.name}`)
      : profile.projects.length > 0
        ? profile.projects.slice(0, 3).map((project) => `Projeto: ${project.name}`)
        : ["Complete seu perfil para gerar insights personalizados"];

  return {
    predominantProfile: inferPredominantProfile(profile),
    strengths,
    compatibility: [],
    salary: {
      current: { brazil: UNDEFINED_SALARY, international: UNDEFINED_SALARY_USD },
      withSkills: { skillsLabel: "novas competências", brazil: UNDEFINED_SALARY, international: UNDEFINED_SALARY_USD },
    },
  };
}
