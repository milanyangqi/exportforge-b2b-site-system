export const catalogPageSize = 24;

export function parseCatalogPage(raw: string | string[] | undefined, total: number) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(value);
  const maxPage = Math.max(1, Math.ceil(total / catalogPageSize));
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maxPage) : 1;
}
