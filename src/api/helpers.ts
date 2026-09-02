import type { PaginationMeta } from "@/api/generated/model";

export const unwrapData = <T>(
  res?: { data?: T } | null,
): T | undefined => res?.data;

export const unwrapMeta = (
  res?: { data?: { meta?: PaginationMeta } } | null,
): PaginationMeta | undefined => res?.data?.meta;

export const unwrapPage = <T>(res?: {
  data?: { content?: T[]; meta?: PaginationMeta } | null;
} | null): { content: T[]; meta: PaginationMeta | undefined } => ({
  content: res?.data?.content ?? [],
  meta: res?.data?.meta,
});