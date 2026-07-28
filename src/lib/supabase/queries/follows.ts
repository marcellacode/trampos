import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchBlockedUserIds } from "@/lib/supabase/queries/moderation";
import type {
  FollowCompanySummary,
  FollowersList,
  FollowingList,
  FollowStatus,
  FollowSuggestions,
  FollowUserSummary,
  ToggleFollowResult,
} from "@/types/follows";

interface DbFollowProfile {
  id: string;
  slug: string | null;
  full_name: string;
  headline: string;
  avatar_url: string | null;
  avatar_initials: string;
  location: string;
  follower_count: number;
  following_count: number;
}

interface DbFollowCompany {
  id: string;
  slug: string;
  name: string;
  logo: string;
  brand_color: string;
  segment: string;
}

interface DbFollowRow {
  followed_user_id: string | null;
  followed_company_id: string | null;
  follower_user_id: string;
  created_at: string;
}

function mapFollowUser(
  row: DbFollowProfile,
  isFollowing: boolean
): FollowUserSummary {
  return {
    id: row.id,
    slug: row.slug,
    fullName: row.full_name,
    headline: row.headline,
    avatarUrl: row.avatar_url,
    avatarInitials: row.avatar_initials || "?",
    location: row.location,
    isFollowing,
  };
}

export async function fetchFollowStatusForUser(
  supabase: SupabaseClient,
  viewerId: string | null,
  targetUserId: string
): Promise<FollowStatus> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("follower_count, following_count")
    .eq("id", targetUserId)
    .maybeSingle();

  if (error) throw error;

  let isFollowing = false;
  if (viewerId && viewerId !== targetUserId) {
    const { data: follow, error: followError } = await supabase.from("follows")
      .select("id")
      .eq("follower_user_id", viewerId)
      .eq("followed_user_id", targetUserId)
      .maybeSingle();

    if (followError) throw followError;
    isFollowing = Boolean(follow);
  }

  return {
    isFollowing,
    followerCount: profile?.follower_count ?? 0,
    followingCount: profile?.following_count ?? 0,
  };
}

export async function fetchFollowStatusForCompany(
  supabase: SupabaseClient,
  viewerId: string | null,
  companyId: string
): Promise<FollowStatus> {
  const { data: countData, error: countError } = await supabase.rpc(
    "get_company_follower_count",
    { target_company_id: companyId }
  );

  if (countError) throw countError;

  let isFollowing = false;
  if (viewerId) {
    const { data: follow, error: followError } = await supabase.from("follows")
      .select("id")
      .eq("follower_user_id", viewerId)
      .eq("followed_company_id", companyId)
      .maybeSingle();

    if (followError) throw followError;
    isFollowing = Boolean(follow);
  }

  return {
    isFollowing,
    followerCount: Number(countData ?? 0),
  };
}

export async function toggleFollowUser(
  supabase: SupabaseClient,
  followerId: string,
  followedUserId: string
): Promise<ToggleFollowResult> {
  if (followerId === followedUserId) {
    throw new Error("Você não pode seguir a si mesmo.");
  }

  const { data: existing, error: existingError } = await supabase.from("follows")
    .select("id")
    .eq("follower_user_id", followerId)
    .eq("followed_user_id", followedUserId)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    const { error } = await supabase.from("follows")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("follows").insert({
      follower_user_id: followerId,
      followed_user_id: followedUserId,
    });
    if (error) throw error;
  }

  const status = await fetchFollowStatusForUser(supabase, followerId, followedUserId);
  return {
    isFollowing: status.isFollowing,
    followerCount: status.followerCount,
  };
}

export async function toggleFollowCompany(
  supabase: SupabaseClient,
  followerId: string,
  companyId: string
): Promise<ToggleFollowResult> {
  const { data: existing, error: existingError } = await supabase.from("follows")
    .select("id")
    .eq("follower_user_id", followerId)
    .eq("followed_company_id", companyId)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    const { error } = await supabase.from("follows")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("follows").insert({
      follower_user_id: followerId,
      followed_company_id: companyId,
    });
    if (error) throw error;
  }

  const status = await fetchFollowStatusForCompany(supabase, followerId, companyId);
  return {
    isFollowing: status.isFollowing,
    followerCount: status.followerCount,
  };
}

export async function fetchFollowedAuthorIds(
  supabase: SupabaseClient,
  userId: string
): Promise<{ userIds: string[]; companyIds: string[] }> {
  const { data, error } = await supabase.from("follows")
    .select("followed_user_id, followed_company_id")
    .eq("follower_user_id", userId);

  if (error) throw error;

  const userIds: string[] = [];
  const companyIds: string[] = [];

  for (const row of data ?? []) {
    if (row.followed_user_id) userIds.push(row.followed_user_id as string);
    if (row.followed_company_id) companyIds.push(row.followed_company_id as string);
  }

  return { userIds, companyIds };
}

export async function fetchFollowingList(
  supabase: SupabaseClient,
  userId: string
): Promise<FollowingList> {
  const { data: follows, error } = await supabase.from("follows")
    .select("followed_user_id, followed_company_id, created_at")
    .eq("follower_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (follows ?? []) as DbFollowRow[];
  const userIds = rows
    .map((row) => row.followed_user_id)
    .filter((id): id is string => Boolean(id));
  const companyIds = rows
    .map((row) => row.followed_company_id)
    .filter((id): id is string => Boolean(id));

  const users: FollowUserSummary[] = [];
  const companies: FollowCompanySummary[] = [];

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select(
        "id, slug, full_name, headline, avatar_url, avatar_initials, location"
      )
      .in("id", userIds);

    if (profilesError) throw profilesError;

    const profileMap = new Map(
      (profiles ?? []).map((profile) => [profile.id, profile as DbFollowProfile])
    );

    for (const id of userIds) {
      const profile = profileMap.get(id);
      if (!profile) continue;
      users.push(mapFollowUser(profile, true));
    }
  }

  if (companyIds.length > 0) {
    const { data: companyRows, error: companiesError } = await supabase
      .from("companies")
      .select("id, slug, name, logo, brand_color, segment")
      .in("id", companyIds);

    if (companiesError) throw companiesError;

    const companyMap = new Map(
      (companyRows ?? []).map((company) => [company.id, company as DbFollowCompany])
    );

    for (const id of companyIds) {
      const company = companyMap.get(id);
      if (!company) continue;

      const { data: countData, error: countError } = await supabase.rpc(
        "get_company_follower_count",
        { target_company_id: company.id }
      );
      if (countError) throw countError;

      companies.push({
        id: company.id,
        slug: company.slug,
        name: company.name,
        logo: company.logo,
        brandColor: company.brand_color,
        segment: company.segment,
        isFollowing: true,
        followerCount: Number(countData ?? 0),
      });
    }
  }

  return { users, companies };
}

export async function fetchFollowersList(
  supabase: SupabaseClient,
  userId: string,
  viewerId: string
): Promise<FollowersList> {
  const { data: follows, error } = await supabase.from("follows")
    .select("follower_user_id, created_at")
    .eq("followed_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (follows ?? []) as DbFollowRow[];
  const followerIds = rows.map((row) => row.follower_user_id);

  if (followerIds.length === 0) {
    return { users: [] };
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, slug, full_name, headline, avatar_url, avatar_initials, location")
    .in("id", followerIds);

  if (profilesError) throw profilesError;

  const { data: myFollows, error: myFollowsError } = await supabase.from("follows")
    .select("followed_user_id")
    .eq("follower_user_id", viewerId)
    .in("followed_user_id", followerIds);

  if (myFollowsError) throw myFollowsError;

  const followingSet = new Set(
    ((myFollows ?? []) as Pick<DbFollowRow, "followed_user_id">[])
      .map((row) => row.followed_user_id)
      .filter((id): id is string => Boolean(id))
  );

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile as DbFollowProfile])
  );

  const users = followerIds
    .map((id: string) => profileMap.get(id))
    .filter((profile): profile is DbFollowProfile => Boolean(profile))
    .map((profile) => mapFollowUser(profile, followingSet.has(profile.id)));

  return { users };
}

export async function fetchFollowSuggestions(
  supabase: SupabaseClient,
  userId: string,
  limit = 12
): Promise<FollowSuggestions> {
  const { data: myProfile, error: profileError } = await supabase
    .from("profiles")
    .select("location")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw profileError;

  const { data: mySkills, error: skillsError } = await supabase
    .from("profile_skills")
    .select("skill_name")
    .eq("user_id", userId);

  if (skillsError) throw skillsError;

  const skillNames = (mySkills ?? []).map((skill) => skill.skill_name);
  const myLocation = myProfile?.location?.trim() ?? "";

  const { data: myFollows, error: followsError } = await supabase.from("follows")
    .select("followed_user_id")
    .eq("follower_user_id", userId);

  if (followsError) throw followsError;

  const blockedIds = new Set(await fetchBlockedUserIds(supabase, userId));

  const { data: myCompanyFollows, error: companyFollowsError } = await supabase.from("follows")
    .select("followed_company_id")
    .eq("follower_user_id", userId);

  if (companyFollowsError) throw companyFollowsError;

  const followedCompanyIds = new Set(
    ((myCompanyFollows ?? []) as Pick<DbFollowRow, "followed_company_id">[])
      .map((row) => row.followed_company_id)
      .filter((id): id is string => Boolean(id))
  );

  const excludeIds = new Set<string>([
    userId,
    ...blockedIds,
    ...((myFollows ?? []) as Pick<DbFollowRow, "followed_user_id">[])
      .map((row) => row.followed_user_id)
      .filter((id): id is string => Boolean(id)),
  ]);

  let candidateIds: string[] = [];

  if (skillNames.length > 0) {
    const { data: skillMatches, error: skillMatchError } = await supabase
      .from("profile_skills")
      .select("user_id")
      .in("skill_name", skillNames)
      .neq("user_id", userId)
      .limit(50);

    if (skillMatchError) throw skillMatchError;
    candidateIds.push(
      ...((skillMatches ?? []).map((row) => row.user_id as string))
    );
  }

  if (myLocation) {
    const { data: locationMatches, error: locationError } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_public", true)
      .eq("location", myLocation)
      .neq("id", userId)
      .limit(30);

    if (locationError) throw locationError;
    candidateIds.push(...((locationMatches ?? []).map((row) => row.id as string)));
  }

  if (candidateIds.length === 0) {
    const { data: fallback, error: fallbackError } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_public", true)
      .neq("id", userId)
      .order("follower_count", { ascending: false })
      .limit(limit);

    if (fallbackError) throw fallbackError;
    candidateIds = (fallback ?? []).map((row) => row.id as string);
  }

  const uniqueIds = [...new Set(candidateIds)]
    .filter((id) => !excludeIds.has(id))
    .slice(0, limit);

  const { data: verifiedCompanies, error: companiesError } = await supabase
    .from("companies")
    .select("id, slug, name, logo, brand_color, segment")
    .eq("is_claimed", true)
    .limit(6);

  if (companiesError) throw companiesError;

  const companies: FollowCompanySummary[] = [];

  for (const company of verifiedCompanies ?? []) {
    if (followedCompanyIds.has(company.id)) continue;

    const { data: countData, error: countError } = await supabase.rpc(
      "get_company_follower_count",
      { target_company_id: company.id }
    );
    if (countError) throw countError;

    companies.push({
      id: company.id,
      slug: company.slug,
      name: company.name,
      logo: company.logo,
      brandColor: company.brand_color,
      segment: company.segment,
      isFollowing: false,
      followerCount: Number(countData ?? 0),
    });
  }

  if (uniqueIds.length === 0) {
    return { users: [], companies };
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select(
      "id, slug, full_name, headline, avatar_url, avatar_initials, location"
    )
    .in("id", uniqueIds)
    .eq("is_public", true);

  if (profilesError) throw profilesError;

  return {
    users: (profiles ?? [])
      .filter((profile) => !blockedIds.has(profile.id))
      .map((profile) => mapFollowUser(profile as DbFollowProfile, false)),
    companies,
  };
}
