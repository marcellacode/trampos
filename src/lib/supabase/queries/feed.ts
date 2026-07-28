import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreatePostInput,
  FeedCursor,
  FeedPage,
  FeedPost,
  PostVisibility,
} from "@/types/feed";
import { fromExtendedTable } from "@/lib/supabase/extended-client";
import { formatRelativeTime } from "@/lib/supabase/utils";

const FEED_PAGE_SIZE = 20;

const POST_SELECT = `
  id,
  author_user_id,
  author_company_id,
  content,
  media_urls,
  job_id,
  visibility,
  created_at,
  updated_at,
  author_profile:profiles!posts_author_user_id_fkey (
    id,
    full_name,
    avatar_url,
    avatar_initials,
    slug,
    headline
  ),
  author_company:companies!posts_author_company_id_fkey (
    id,
    name,
    logo,
    brand_color,
    slug
  ),
  job:jobs!posts_job_id_fkey (
    id,
    slug,
    title,
    location,
    salary_display,
    remote,
    companies!jobs_company_id_fkey (
      name,
      logo,
      brand_color
    )
  )
`;

interface DbProfileAuthor {
  id: string;
  full_name: string;
  avatar_url: string | null;
  avatar_initials: string;
  slug: string | null;
  headline: string;
}

interface DbCompanyAuthor {
  id: string;
  name: string;
  logo: string | null;
  brand_color: string;
  slug: string;
}

interface DbJobCompany {
  name: string;
  logo: string | null;
  brand_color: string;
}

interface DbJobPreview {
  id: string;
  slug: string;
  title: string;
  location: string;
  salary_display: string;
  remote: boolean;
  companies: DbJobCompany | DbJobCompany[] | null;
}

interface DbFeedPostRow {
  id: string;
  author_user_id: string | null;
  author_company_id: string | null;
  content: string;
  media_urls: unknown;
  job_id: string | null;
  visibility: PostVisibility;
  created_at: string;
  updated_at: string;
  author_profile: DbProfileAuthor | DbProfileAuthor[] | null;
  author_company: DbCompanyAuthor | DbCompanyAuthor[] | null;
  job: DbJobPreview | DbJobPreview[] | null;
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapFeedPost(row: DbFeedPostRow): FeedPost {
  const profile = unwrapOne(row.author_profile);
  const company = unwrapOne(row.author_company);
  const job = unwrapOne(row.job);
  const jobCompany = job ? unwrapOne(job.companies) : null;

  const mediaUrls = Array.isArray(row.media_urls)
    ? row.media_urls.filter((item): item is string => typeof item === "string")
    : [];

  return {
    id: row.id,
    content: row.content,
    mediaUrls,
    visibility: row.visibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    authorUser: profile
      ? {
          id: profile.id,
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url,
          avatarInitials: profile.avatar_initials,
          slug: profile.slug,
          headline: profile.headline,
        }
      : null,
    authorCompany: company
      ? {
          id: company.id,
          name: company.name,
          logo: company.logo,
          brandColor: company.brand_color,
          slug: company.slug,
        }
      : null,
    job: job
      ? {
          id: job.id,
          slug: job.slug,
          title: job.title,
          location: job.location,
          salaryDisplay: job.salary_display,
          remote: job.remote,
          companyName: jobCompany?.name ?? "",
          companyLogo: jobCompany?.logo ?? null,
          companyColor: jobCompany?.brand_color ?? "#4F7CFF",
        }
      : null,
    likeCount: 0,
    commentCount: 0,
  };
}

export function encodeFeedCursor(cursor: FeedCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export function decodeFeedCursor(value: string | null | undefined): FeedCursor | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as FeedCursor;
    if (parsed?.createdAt && parsed?.id) return parsed;
    return null;
  } catch {
    return null;
  }
}

export async function fetchFeedPosts(
  supabase: SupabaseClient,
  options: { cursor?: FeedCursor | null; limit?: number } = {}
): Promise<FeedPage> {
  const limit = options.limit ?? FEED_PAGE_SIZE;

  let query = fromExtendedTable(supabase, "posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (options.cursor) {
    const { createdAt, id } = options.cursor;
    query = query.or(
      `created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as DbFeedPostRow[];
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const posts = pageRows.map(mapFeedPost);

  const last = pageRows.at(-1);
  const nextCursor =
    hasMore && last ? { createdAt: last.created_at, id: last.id } : null;

  return { posts, nextCursor };
}

export async function createFeedPost(
  supabase: SupabaseClient,
  userId: string,
  input: CreatePostInput
): Promise<FeedPost> {
  const content = input.content.trim();
  const jobId = input.jobId ?? null;

  if (!content && !jobId) {
    throw new Error("Escreva algo ou compartilhe uma vaga.");
  }

  if (input.authorCompanyId) {
    const { data, error } = await fromExtendedTable(supabase, "posts")
      .insert({
        author_company_id: input.authorCompanyId,
        content,
        job_id: jobId,
        visibility: input.visibility ?? "public",
        media_urls: input.mediaUrls ?? [],
      })
      .select(POST_SELECT)
      .single();

    if (error) throw error;
    return mapFeedPost(data as DbFeedPostRow);
  }

  const { data, error } = await fromExtendedTable(supabase, "posts")
    .insert({
      author_user_id: userId,
      content,
      job_id: jobId,
      visibility: input.visibility ?? "public",
      media_urls: input.mediaUrls ?? [],
    })
    .select(POST_SELECT)
    .single();

  if (error) throw error;
  return mapFeedPost(data as DbFeedPostRow);
}

export async function deleteFeedPost(
  supabase: SupabaseClient,
  postId: string
): Promise<void> {
  const { error } = await fromExtendedTable(supabase, "posts").delete().eq("id", postId);
  if (error) throw error;
}

export function formatPostTimestamp(iso: string): string {
  return formatRelativeTime(iso);
}

export { FEED_PAGE_SIZE };
