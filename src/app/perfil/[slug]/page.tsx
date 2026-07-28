import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  BookOpen,
  Briefcase,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  Languages,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ProfileHeroRow } from "@/components/follows/profile-hero-row";
import { fetchFollowStatusForUser } from "@/lib/supabase/queries/follows";
import { fetchPublicProfileBySlug } from "@/lib/supabase/queries/public-profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PublicProfile } from "@/lib/supabase/queries/public-profile";

interface PublicProfilePageProps {
  params: Promise<{ slug: string }>;
}

async function resolveProfile(slug: string): Promise<{
  profile: PublicProfile;
  isOwnerPreview: boolean;
  isOwner: boolean;
  isAuthenticated: boolean;
  followStatus: { isFollowing: boolean; followerCount: number; followingCount: number };
} | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await fetchPublicProfileBySlug(supabase, slug);
  if (!profile) return null;

  const isOwner = user?.id === profile.id;
  if (!profile.isPublic && !isOwner) return null;

  const followStatus = await fetchFollowStatusForUser(
    supabase,
    user?.id ?? null,
    profile.id
  );

  return {
    profile,
    isOwnerPreview: isOwner && !profile.isPublic,
    isOwner,
    isAuthenticated: Boolean(user),
    followStatus: {
      isFollowing: followStatus.isFollowing,
      followerCount: followStatus.followerCount,
      followingCount: followStatus.followingCount ?? 0,
    },
  };
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveProfile(slug);

  if (!resolved) {
    return { title: "Perfil não encontrado — Jobera" };
  }

  const { profile } = resolved;
  const title = `${profile.fullName} — Jobera`;
  const description =
    profile.summary.slice(0, 160) ||
    `${profile.headline || profile.currentRole}${profile.location ? ` · ${profile.location}` : ""}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
    },
  };
}

export default async function PublicProfileRoute({
  params,
}: PublicProfilePageProps) {
  const { slug } = await params;
  const resolved = await resolveProfile(slug);

  if (!resolved) notFound();

  const { profile, isOwnerPreview, isOwner, isAuthenticated, followStatus } = resolved;

  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo />
          {isAuthenticated ? (
            <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
              Ir para o dashboard
            </Button>
          ) : (
            <Button variant="outline" size="sm" render={<Link href="/login" />}>
              Entrar na Jobera
            </Button>
          )}
        </div>
      </header>

      {isOwnerPreview && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-center text-sm text-amber-100">
          Pré-visualização — seu perfil ainda não está público.{" "}
          <Link
            href="/dashboard/curriculo"
            className="font-medium text-amber-50 underline underline-offset-2"
          >
            Alterar visibilidade
          </Link>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-0 sm:px-6">
        <ProfileHero
          profile={profile}
          followStatus={followStatus}
          isAuthenticated={isAuthenticated}
          isOwner={isOwner}
        />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-6">
            {profile.summary ? <SummarySection summary={profile.summary} /> : null}
            {profile.experiences.length > 0 ? (
              <ExperiencesSection experiences={profile.experiences} />
            ) : null}
            {profile.education.length > 0 ? (
              <EducationSection education={profile.education} />
            ) : null}
            {profile.projects.length > 0 ? (
              <ProjectsSection projects={profile.projects} />
            ) : null}
            {profile.certificates.length > 0 ? (
              <CertificatesSection certificates={profile.certificates} />
            ) : null}
            {profile.courses.length > 0 ? (
              <CoursesSection courses={profile.courses} />
            ) : null}
          </div>
          <aside className="space-y-6">
            {profile.skills.length > 0 ? (
              <SkillsSection skills={profile.skills} />
            ) : null}
            {profile.languages.length > 0 ? (
              <LanguagesSection languages={profile.languages} />
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  );
}

function ProfileHero({
  profile,
  followStatus,
  isAuthenticated,
  isOwner,
}: {
  profile: PublicProfile;
  followStatus: {
    isFollowing: boolean;
    followerCount: number;
    followingCount: number;
  };
  isAuthenticated: boolean;
  isOwner: boolean;
}) {
  const websiteHref = profile.websiteUrl?.startsWith("http")
    ? profile.websiteUrl
    : profile.websiteUrl
      ? `https://${profile.websiteUrl}`
      : null;

  return (
    <section aria-label="Cabeçalho do perfil">
      <div className="relative -mx-4 h-36 overflow-hidden rounded-b-2xl bg-gradient-to-r from-primary/40 via-primary/20 to-indigo-500/30 sm:-mx-6 sm:h-44" />

      <ProfileHeroRow
        avatar={
          profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt=""
              className="h-28 w-28 rounded-2xl border-4 border-background object-cover shadow-lg sm:h-32 sm:w-32"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-background bg-gradient-to-br from-primary to-primary/70 text-3xl font-semibold text-primary-foreground shadow-lg sm:h-32 sm:w-32">
              {profile.avatarInitials}
            </div>
          )
        }
        nameBlock={
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {profile.fullName}
            </h1>
            <p className="mt-1 text-base text-foreground/90">
              {profile.headline || profile.currentRole}
            </p>
            {profile.seniority ? (
              <p className="mt-0.5 text-sm text-primary">{profile.seniority}</p>
            ) : null}
          </>
        }
        profileId={profile.id}
        profileSlug={profile.slug}
        location={profile.location}
        websiteUrl={profile.websiteUrl}
        websiteHref={websiteHref}
        initialIsFollowing={followStatus.isFollowing}
        initialFollowerCount={followStatus.followerCount}
        initialFollowingCount={followStatus.followingCount}
        isAuthenticated={isAuthenticated}
        isOwner={isOwner}
      />
    </section>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function SummarySection({ summary }: { summary: string }) {
  return (
    <SectionCard title="Sobre" icon={Briefcase}>
      <p className="text-sm leading-relaxed text-foreground/90">{summary}</p>
    </SectionCard>
  );
}

function ExperiencesSection({
  experiences,
}: {
  experiences: PublicProfile["experiences"];
}) {
  return (
    <SectionCard title="Experiência" icon={Briefcase}>
      <ul className="space-y-4">
        {experiences.map((exp) => (
          <li
            key={exp.id}
            className="border-b border-border/60 pb-4 last:border-0 last:pb-0"
          >
            <h3 className="font-medium text-foreground">{exp.role}</h3>
            <p className="text-sm text-muted-foreground">
              {exp.company}
              {exp.period ? ` · ${exp.period}` : ""}
            </p>
            {exp.description ? (
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                {exp.description}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function ProjectsSection({
  projects,
}: {
  projects: PublicProfile["projects"];
}) {
  return (
    <SectionCard title="Projetos" icon={FolderKanban}>
      <ul className="space-y-4">
        {projects.map((project) => (
          <li
            key={project.id}
            className="border-b border-border/60 pb-4 last:border-0 last:pb-0"
          >
            <h3 className="font-medium text-foreground">{project.name}</h3>
            {project.description ? (
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                {project.description}
              </p>
            ) : null}
            {project.tech.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function CertificatesSection({
  certificates,
}: {
  certificates: PublicProfile["certificates"];
}) {
  return (
    <SectionCard title="Certificados" icon={Award}>
      <ul className="space-y-3">
        {certificates.map((cert) => (
          <li key={cert.id}>
            <h3 className="font-medium text-foreground">{cert.name}</h3>
            <p className="text-sm text-muted-foreground">
              {[cert.issuer, cert.year].filter(Boolean).join(" · ")}
            </p>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function EducationSection({
  education,
}: {
  education: PublicProfile["education"];
}) {
  return (
    <SectionCard title="Formação acadêmica" icon={GraduationCap}>
      <ul className="space-y-4">
        {education.map((item) => (
          <li
            key={item.id}
            className="border-b border-border/60 pb-4 last:border-0 last:pb-0"
          >
            <h3 className="font-medium text-foreground">
              {[item.degree, item.fieldOfStudy].filter(Boolean).join(" em ") ||
                item.institution}
            </h3>
            <p className="text-sm text-muted-foreground">
              {[item.institution, item.period].filter(Boolean).join(" · ")}
            </p>
            {item.description ? (
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                {item.description}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function CoursesSection({
  courses,
}: {
  courses: PublicProfile["courses"];
}) {
  return (
    <SectionCard title="Cursos" icon={BookOpen}>
      <ul className="space-y-4">
        {courses.map((course) => {
          const credentialHref = course.credentialUrl?.startsWith("http")
            ? course.credentialUrl
            : course.credentialUrl
              ? `https://${course.credentialUrl}`
              : null;
          const completionYear = course.completionDate
            ? course.completionDate.slice(0, 4)
            : "";

          return (
            <li
              key={course.id}
              className="border-b border-border/60 pb-4 last:border-0 last:pb-0"
            >
              <h3 className="font-medium text-foreground">{course.name}</h3>
              <p className="text-sm text-muted-foreground">
                {[course.provider, completionYear].filter(Boolean).join(" · ")}
              </p>
              {course.description ? (
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                  {course.description}
                </p>
              ) : null}
              {credentialHref ? (
                <a
                  href={credentialHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Ver credencial
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}

function SkillsSection({ skills }: { skills: string[] }) {
  return (
    <SectionCard title="Competências" icon={Briefcase}>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-foreground/90"
          >
            {skill}
          </span>
        ))}
      </div>
    </SectionCard>
  );
}

function LanguagesSection({
  languages,
}: {
  languages: PublicProfile["languages"];
}) {
  return (
    <SectionCard title="Idiomas" icon={Languages}>
      <ul className="space-y-2">
        {languages.map((language) => (
          <li
            key={language.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="font-medium text-foreground">{language.name}</span>
            <span className="text-muted-foreground">{language.level}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
