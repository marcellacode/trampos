import type { ExtractedProfile } from "@/types/onboarding";

interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  public_repos: number;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export async function fetchGitHubProfile(
  username: string
): Promise<ExtractedProfile> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Jobera-App",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const userRes = await fetch(`https://api.github.com/users/${username}`, {
    headers,
    next: { revalidate: 3600 },
  });

  if (!userRes.ok) {
    throw Object.assign(new Error("github_failed"), { code: "github_failed" });
  }

  const user = (await userRes.json()) as GitHubUser;

  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
    { headers, next: { revalidate: 3600 } }
  );

  const repos = reposRes.ok ? ((await reposRes.json()) as GitHubRepo[]) : [];

  const languages = [
    ...new Set(repos.map((r) => r.language).filter(Boolean) as string[]),
  ];

  return {
    name: user.name || user.login,
    currentRole: user.company ? `Dev @ ${user.company}` : "Desenvolvedor(a)",
    summary: user.bio || `Perfil GitHub de @${user.login} com ${user.public_repos} repositórios públicos.`,
    avatarInitials: initials(user.name || user.login),
    seniority: user.public_repos >= 20 ? "Pleno/Sênior" : "Júnior/Pleno",
    skills: languages.slice(0, 12),
    experiences: user.company
      ? [
          {
            id: "gh-exp-0",
            company: user.company,
            role: "Desenvolvedor(a)",
            period: "Atual",
            description: user.bio || "Experiência inferida do perfil GitHub.",
          },
        ]
      : [],
    languages: [],
    projects: repos.slice(0, 6).map((repo, i) => ({
      id: `gh-proj-${i}`,
      name: repo.name,
      description: repo.description || "",
      tech: repo.language ? [repo.language] : [],
    })),
    certificates: [],
  };
}
