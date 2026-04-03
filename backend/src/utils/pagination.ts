import type { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export function parsePagination(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function buildPaginationMeta(params: {
  page: number;
  limit: number;
  total: number;
}): PaginationMeta {
  const { page, limit, total } = params;
  const total_pages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    total_pages,
    has_next: page < total_pages,
    has_prev: page > 1,
  };
}
