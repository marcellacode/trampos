import { parseAdzunaJobId } from "@/lib/integrations/adzuna/mapper";
import type { JobRef } from "@/lib/external-jobs/types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isInternalJobRef(ref: string): boolean {
  return UUID_RE.test(ref);
}

export function isExternalJobRef(ref: string): boolean {
  return !isInternalJobRef(ref);
}

export function parseJobRef(ref: string): JobRef {
  if (isInternalJobRef(ref)) {
    return {
      ref,
      internalJobId: ref,
      isExternal: false,
    };
  }

  return {
    ref,
    externalKey: ref,
    isExternal: true,
  };
}

export function isAdzunaRef(ref: string): boolean {
  return parseAdzunaJobId(ref) !== null;
}
