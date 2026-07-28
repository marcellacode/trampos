import { chatCompletion } from "@/lib/ai/groq";
import { isGroqConfigured } from "@/lib/ai/env";
import type { ExtractedProfile } from "@/types/onboarding";

export interface TailoredApplication {
  resumeText: string;
  coverLetter: string;
}

export async function tailorResumeForJob(
  profile: ExtractedProfile,
  job: {
    role: string;
    company: string;
    description?: string;
    stack?: string[];
  }
): Promise<TailoredApplication> {
  const baseResume = buildBaseResumeText(profile);

  if (!isGroqConfigured()) {
    return {
      resumeText: baseResume,
      coverLetter: `Prezados,\n\nTenho interesse na vaga de ${job.role} na ${job.company}.\n\nAtenciosamente,\n${profile.name}`,
    };
  }

  const raw = await chatCompletion(
    [
      {
        role: "system",
        content: `Adapte currículo e carta para uma vaga específica.
Retorne JSON: { "resumeText": string, "coverLetter": string }
PT-BR. Não invente informações.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          profile: {
            name: profile.name,
            role: profile.currentRole,
            summary: profile.summary,
            skills: profile.skills,
            experiences: profile.experiences.slice(0, 5),
          },
          job,
        }),
      },
    ],
    { jsonMode: true, temperature: 0.3, maxTokens: 2048 }
  );

  const parsed = JSON.parse(raw) as TailoredApplication;
  return {
    resumeText: parsed.resumeText || baseResume,
    coverLetter: parsed.coverLetter || "",
  };
}

function buildBaseResumeText(profile: ExtractedProfile): string {
  return [
    `# ${profile.name}`,
    profile.currentRole ? `**${profile.currentRole}**` : "",
    profile.summary,
    "",
    "## Experiências",
    ...profile.experiences.map(
      (exp) => `- **${exp.role}** @ ${exp.company} (${exp.period})\n  ${exp.description}`
    ),
    "",
    "## Skills",
    profile.skills.join(" · "),
  ]
    .filter(Boolean)
    .join("\n");
}
