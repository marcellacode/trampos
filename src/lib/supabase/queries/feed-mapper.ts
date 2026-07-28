import type {
  FeedPost,
  PostSource,
  PostVisibility,
} from "@/types/feed";

export const POST_SELECT = `
  id,
  author_user_id,
  author_company_id,
  content,
  media_urls,
  job_id,
  shared_post_id,
  visibility,
  post_source,
  source_event_kind,
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
  ),
  shared_post:posts!posts_shared_post_id_fkey (
    id,
    author_user_id,
    author_company_id,
    content,
    media_urls,
    job_id,
    shared_post_id,
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
  )
`;

export interface DbProfileAuthor {
  id: string;
  full_name: string;
  avatar_url: string | null;
  avatar_initials: string;
  slug: string | null;
  headline: string;
}

export interface DbCompanyAuthor {
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

export interface DbFeedPostRow {
  id: string;
  author_user_id: string | null;
  author_company_id: string | null;
  content: string;
  media_urls: unknown;
  job_id: string | null;
  shared_post_id: string | null;
  visibility: PostVisibility;
  post_source?: PostSource | null;
  source_event_kind?: string | null;
  created_at: string;
  updated_at: string;
  author_profile: DbProfileAuthor | DbProfileAuthor[] | null;
  author_company: DbCompanyAuthor | DbCompanyAuthor[] | null;
  job: DbJobPreview | DbJobPreview[] | null;
  shared_post?: DbFeedPostRow | DbFeedPostRow[] | null;
}

export interface FeedPostEngagement {
  likeCount: number;
  commentCount: number;
  shareCount: number;
  likedByMe: boolean;
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapJob(job: DbJobPreview | null) {
  const jobCompany = job ? unwrapOne(job.companies) : null;
  if (!job) return null;

  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    location: job.location,
    salaryDisplay: job.salary_display,
    remote: job.remote,
    companyName: jobCompany?.name ?? "",
    companyLogo: jobCompany?.logo ?? null,
    companyColor: jobCompany?.brand_color ?? "#4F7CFF",
  };
}

export function mapFeedPostRow(
  row: DbFeedPostRow,
  engagement: FeedPostEngagement = {
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    likedByMe: false,
  },
  nested = false
): FeedPost {
  const profile = unwrapOne(row.author_profile);
  const company = unwrapOne(row.author_company);
  const job = unwrapOne(row.job);
  const sharedRow = nested ? null : unwrapOne(row.shared_post);

  const mediaUrls = Array.isArray(row.media_urls)
    ? row.media_urls.filter((item): item is string => typeof item === "string")
    : [];

  const sharedPost = sharedRow
    ? mapFeedPostRow(sharedRow, {
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        likedByMe: false,
      }, true)
    : null;

  return {
    id: row.id,
    content: row.content,
    mediaUrls,
    visibility: row.visibility,
    postSource: (row.post_source as PostSource) ?? "manual",
    sourceEventKind: row.source_event_kind ?? null,
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
    job: mapJob(job),
    sharedPost,
    likeCount: engagement.likeCount,
    commentCount: engagement.commentCount,
    shareCount: engagement.shareCount,
    likedByMe: engagement.likedByMe,
  };
}

export function getEngagementPostId(post: FeedPost): string {
  return post.sharedPost?.id ?? post.id;
}

export function applyEngagementToPost(
  post: FeedPost,
  engagementByPostId: Map<string, FeedPostEngagement>
): FeedPost {
  const targetId = getEngagementPostId(post);
  const engagement = engagementByPostId.get(targetId) ?? {
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    likedByMe: false,
  };

  const next: FeedPost = {
    ...post,
    likeCount: engagement.likeCount,
    commentCount: engagement.commentCount,
    shareCount: engagement.shareCount,
    likedByMe: engagement.likedByMe,
  };

  if (post.sharedPost) {
    next.sharedPost = {
      ...post.sharedPost,
      likeCount: engagement.likeCount,
      commentCount: engagement.commentCount,
      shareCount: engagement.shareCount,
      likedByMe: engagement.likedByMe,
    };
  }

  return next;
}

export function collectEngagementPostIds(posts: FeedPost[]): string[] {
  const ids = new Set<string>();
  for (const post of posts) {
    ids.add(getEngagementPostId(post));
  }
  return [...ids];
}
