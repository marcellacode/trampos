"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/app/actions/ai";
import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import {
  fetchFollowersList,
  fetchFollowingList,
  fetchFollowStatusForCompany,
  fetchFollowStatusForUser,
  fetchFollowSuggestions,
  toggleFollowCompany,
  toggleFollowUser,
} from "@/lib/supabase/queries/follows";
import type {
  FollowersList,
  FollowingList,
  FollowStatus,
  FollowSuggestions,
  FollowTargetType,
  ToggleFollowResult,
} from "@/types/follows";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export async function getFollowStatusAction(input: {
  targetType: FollowTargetType;
  targetId: string;
}): Promise<ActionResult<FollowStatus>> {
  try {
    const { supabase, user } = await requireAuth();

    const status =
      input.targetType === "user"
        ? await fetchFollowStatusForUser(supabase, user.id, input.targetId)
        : await fetchFollowStatusForCompany(supabase, user.id, input.targetId);

    return { success: true, data: status };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function toggleFollowAction(input: {
  targetType: FollowTargetType;
  targetId: string;
  revalidateSlug?: string;
}): Promise<ActionResult<ToggleFollowResult>> {
  try {
    const { supabase, user } = await requireAuth();

    const result =
      input.targetType === "user"
        ? await toggleFollowUser(supabase, user.id, input.targetId)
        : await toggleFollowCompany(supabase, user.id, input.targetId);

    if (input.revalidateSlug) {
      revalidatePath(
        input.targetType === "user"
          ? `/perfil/${input.revalidateSlug}`
          : `/empresa/${input.revalidateSlug}`
      );
    }

    revalidatePath("/dashboard/rede");
    revalidatePath("/dashboard/feed");

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function listFollowingAction(): Promise<ActionResult<FollowingList>> {
  try {
    const { supabase, user } = await requireAuth();
    const list = await fetchFollowingList(supabase, user.id);
    return { success: true, data: list };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function listFollowersAction(): Promise<ActionResult<FollowersList>> {
  try {
    const { supabase, user } = await requireAuth();
    const list = await fetchFollowersList(supabase, user.id, user.id);
    return { success: true, data: list };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function listFollowSuggestionsAction(): Promise<
  ActionResult<FollowSuggestions>
> {
  try {
    const { supabase, user } = await requireAuth();
    const suggestions = await fetchFollowSuggestions(supabase, user.id);
    return { success: true, data: suggestions };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
