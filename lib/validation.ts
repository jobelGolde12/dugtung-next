import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export function parsePagination(searchParams: URLSearchParams) {
  return paginationSchema.parse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });
}

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export function parseIdParam(params: { id?: string }) {
  return idParamSchema.parse(params).id;
}

export const dataSchema = z.record(z.string(), z.unknown());
