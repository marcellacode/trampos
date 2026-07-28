"use client";

import type { QueryClient } from "@tanstack/react-query";
import { crudKeys } from "@/lib/crud/query-keys";
import { feedKeys } from "@/lib/feed/hooks";
import { followKeys } from "@/lib/follows/hooks";
import { careerKeys } from "@/lib/career/query-keys";

export function invalidateCareerQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  void queryClient.invalidateQueries({ queryKey: careerKeys.all });
  void queryClient.invalidateQueries({ queryKey: crudKeys.applications });
  void queryClient.invalidateQueries({ queryKey: crudKeys.timeline() });
  void queryClient.invalidateQueries({ queryKey: crudKeys.notifications });
  void queryClient.invalidateQueries({ queryKey: feedKeys.all });
  void queryClient.invalidateQueries({ queryKey: followKeys.all });
  void queryClient.invalidateQueries({ queryKey: ["discovery"] });
  void queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
}
