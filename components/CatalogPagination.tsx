import Link from "next/link";
import { catalogPageSize } from "@/lib/catalog-pagination";
import type { LocaleCode } from "@/types/site";

export function CatalogPagination({ locale, base, page, total, category }: {
  locale: LocaleCode;
  base: "products" | "articles";
  page: number;
  total: number;
  category?: string;
}) {
  const pages = Math.ceil(total / catalogPageSize);
  if (pages <= 1) return null;

  const href = (number: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (number > 1) params.set("page", String(number));
    const query = params.toString();
    return `/${locale}/${base}${query ? `?${query}` : ""}`;
  };
  const zh = locale === "zh";

  return (
    <nav className="catalog-pagination" aria-label={zh ? "列表分页" : "Catalog pages"}>
      {page > 1 ? <Link href={href(page - 1)} rel="prev">{zh ? "← 上一页" : "← Previous"}</Link> : null}
      {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
        <Link aria-current={number === page ? "page" : undefined} href={href(number)} key={number}>{number}</Link>
      ))}
      {page < pages ? <Link href={href(page + 1)} rel="next">{zh ? "下一页 →" : "Next →"}</Link> : null}
    </nav>
  );
}
