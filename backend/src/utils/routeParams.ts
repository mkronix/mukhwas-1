/**
 * Express 5 types `req.params` values as `string | string[]`. Our routes use a single path segment per param.
 */
export function routeParam(value: string | string[] | undefined): string {
  if (value === undefined) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}
