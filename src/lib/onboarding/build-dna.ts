import type {
  ExtractedProfile,
  GoalChip,
  ProfessionalDna,
  SalaryRange,
} from "@/types/onboarding";

const UNDEFINED_SALARY: SalaryRange = {
  currency: "BRL",
  min: 0,
  max: 0,
  label: "Brasil",
};

const UNDEFINED_SALARY_USD: SalaryRange = {
  currency: "USD",
  min: 0,
  max: 0,
  label: "Internacional",
};

export function buildProfessionalDnaFromProfile(
  profile: ExtractedProfile,
  _goalChips: GoalChip[] = []
): ProfessionalDna {
  const strengths =
    profile.skills.length > 0
      ? profile.skills.slice(0, 5).map((skill) => `Competência em ${skill}`)
      : profile.experiences.length > 0
        ? profile.experiences
            .slice(0, 3)
            .map((exp) => `Experiência em ${exp.role}`)
        : ["Complete seu perfil para gerar insights personalizados"];

  return {
    predominantProfile: profile.currentRole || "Perfil em construção",
    strengths,
    compatibility: [],
    salary: {
      current: {
        brazil: UNDEFINED_SALARY,
        international: UNDEFINED_SALARY_USD,
      },
      withSkills: {
        skillsLabel: "novas competências",
        brazil: UNDEFINED_SALARY,
        international: UNDEFINED_SALARY_USD,
      },
    },
  };
}
